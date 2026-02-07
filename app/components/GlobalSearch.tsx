"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useCallback } from "react";

interface SearchResult {
  _id: string;
  content: string;
  title: string;
  filePath: string;
  fileType: string;
  sourceType: string;
  lineNumber?: number;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("");
  const [selectedResult, setSelectedResult] = useState<any>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchResults = useQuery(
    api.search.search,
    debouncedQuery.length >= 2
      ? {
          query: debouncedQuery,
          limit: 20,
          fileTypeFilter: fileTypeFilter || undefined,
          sourceTypeFilter: sourceTypeFilter || undefined,
        }
      : "skip"
  );

  const stats = useQuery(api.search.getSearchStats);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexMessage, setIndexMessage] = useState<string | null>(null);

  const triggerReindex = async () => {
    setIsIndexing(true);
    setIndexMessage(null);
    
    try {
      const response = await fetch("/api/index", { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        setIndexMessage(`Indexed ${data.count} files`);
      } else {
        setIndexMessage("Reindex failed");
      }
    } catch (error) {
      setIndexMessage("Error: " + (error as Error).message);
    } finally {
      setIsIndexing(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-500/30 text-yellow-200">{part}</mark>
      ) : (
        part
      )
    );
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "markdown": return "📝";
      case "csv": return "📊";
      case "json": return "🔧";
      case "txt": return "📄";
      default: return "📄";
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case "memory": return "bg-purple-600";
      case "business_lead": return "bg-blue-600";
      case "paper_trading": return "bg-green-600";
      case "task": return "bg-orange-600";
      case "calendar": return "bg-pink-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6 h-full">
      <h2 className="text-xl font-bold text-white mb-4">Global Search</h2>

      {/* Search Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-800 rounded text-xs">
          <div>
            <span className="text-gray-400">Total Indexed:</span>
            <span className="text-white font-bold ml-2">{stats.totalIndexed}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-400">Last Index:</span>
              <span className="text-white ml-2">
                {stats.lastIndexTime 
                  ? new Date(stats.lastIndexTime).toLocaleTimeString()
                  : "Never"}
              </span>
            </div>
            <button
              onClick={triggerReindex}
              disabled={isIndexing}
              className="px-2 py-1 bg-blue-600/30 text-blue-400 rounded hover:bg-blue-600/50 disabled:opacity-50 text-xs"
            >
              {isIndexing ? "🔄 Indexing..." : "🔄 Reindex"}
            </button>
          </div>
        </div>
      )}
      
      {indexMessage && (
        <div className="mb-4 p-2 bg-green-600/20 text-green-400 rounded text-sm text-center">
          {indexMessage}
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across workspace files, memory, tasks..."
          className="w-full bg-slate-800 text-white px-4 py-3 pl-10 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select
          value={fileTypeFilter}
          onChange={(e) => setFileTypeFilter(e.target.value)}
          className="bg-slate-800 text-white text-sm rounded px-3 py-2 border border-slate-700"
        >
          <option value="">All File Types</option>
          <option value="markdown">Markdown</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="txt">Text</option>
        </select>

        <select
          value={sourceTypeFilter}
          onChange={(e) => setSourceTypeFilter(e.target.value)}
          className="bg-slate-800 text-white text-sm rounded px-3 py-2 border border-slate-700"
        >
          <option value="">All Sources</option>
          <option value="memory">Memory</option>
          <option value="business_lead">Business Leads</option>
          <option value="paper_trading">Paper Trading</option>
          <option value="task">Tasks</option>
          <option value="calendar">Calendar</option>
        </select>
      </div>

      {/* Search Results */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {query.length < 2 ? (
          <div className="text-gray-500 text-center py-8">
            Type at least 2 characters to search
          </div>
        ) : searchResults === undefined ? (
          <div className="text-gray-500 text-center py-8">Searching...</div>
        ) : searchResults.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No results found</div>
        ) : (
          searchResults.map((result: SearchResult) => (
            <div
              key={result._id}
              onClick={() => setSelectedResult(result)}
              className="bg-slate-800 rounded p-3 cursor-pointer hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{getFileTypeIcon(result.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-white truncate">
                      {highlightMatch(result.title, debouncedQuery)}
                    </span>
                    <span className={`text-xs text-white px-2 py-0.5 rounded ${getSourceTypeColor(result.sourceType)}`}>
                      {result.sourceType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {highlightMatch(result.content.substring(0, 150) + "...", debouncedQuery)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{result.filePath}</span>
                    {result.lineNumber && <span>Line {result.lineNumber}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Result Modal */}
      {selectedResult && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedResult(null)}
        >
          <div 
            className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedResult.title}</h3>
                <p className="text-sm text-gray-400">{selectedResult.filePath}</p>
              </div>
              <button 
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {selectedResult.content}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <span className={`text-xs text-white px-2 py-1 rounded ${getSourceTypeColor(selectedResult.sourceType)}`}>
                {selectedResult.sourceType}
              </span>
              <span className="text-xs text-gray-400 px-2 py-1 bg-slate-800 rounded">
                {selectedResult.fileType}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
