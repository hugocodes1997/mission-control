"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Search, FileText, MessageSquare, Calendar, Folder, X, Tag } from "lucide-react";

const contentTypeIcons: Record<string, React.ReactNode> = {
  memory: <MessageSquare className="w-4 h-4" />,
  task: <Calendar className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  conversation: <MessageSquare className="w-4 h-4" />,
};

const contentTypeLabels: Record<string, string> = {
  memory: "Memory",
  task: "Task",
  document: "Document",
  conversation: "Conversation",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const results = useQuery(
    api.tasks.searchContent,
    query.length >= 2
      ? { query, contentType: selectedType || undefined, limit: 20 }
      : "skip"
  );

  const contentTypes = ["memory", "task", "document", "conversation"];

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search memories, tasks, documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Filter by:</span>
        <button
          onClick={() => setSelectedType(null)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            selectedType === null
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          All
        </button>
        {contentTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              selectedType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {contentTypeIcons[type]}
            {contentTypeLabels[type]}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {query.length < 2 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300">Start searching</h3>
            <p className="text-gray-500 mt-2">
              Type at least 2 characters to search through your OpenClaw data
            </p>
          </div>
        ) : results === undefined ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-lg p-4 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No results found</h3>
            <p className="text-gray-500 mt-2">
              Try different keywords or check your filters
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            {results.map((result) => (
              <div
                key={result._id}
                className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                    {contentTypeIcons[result.contentType] || <Folder className="w-4 h-4" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                        {contentTypeLabels[result.contentType] || result.contentType}
                      </span>
                      {result.source && (
                        <span className="text-xs text-gray-600 truncate">
                          {result.source}
                        </span>
                      )}
                    </div>

                    <h4 className="text-white font-medium">{result.title}</h4>
                    
                    <p className="text-gray-400 text-sm mt-1 line-clamp-3">
                      {result.content}
                    </p>

                    {result.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Tag className="w-3 h-3 text-gray-600" />
                        <div className="flex gap-1 flex-wrap">
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {formatDistanceToNow(result.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
