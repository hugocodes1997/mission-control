"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useCallback } from "react";

interface Activity {
  _id: string;
  timestamp: number;
  actionType: string;
  description: string;
  status: string;
  source?: string;
  metadata?: {
    error?: string;
    filePath?: string;
    taskId?: string;
    duration?: number;
  };
}

const ACTION_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "task_complete", label: "Task Complete" },
  { value: "file_update", label: "File Update" },
  { value: "cron_run", label: "Cron Run" },
  { value: "search_query", label: "Search" },
  { value: "message_sent", label: "Message" },
  { value: "tool_call", label: "Tool Call" },
];

export function ActivityFeed() {
  const [filter, setFilter] = useState<string>("all");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Auto-refresh every 10 seconds
  const activities = useQuery(
    api.activities.getRecentActivities, 
    { limit: 50, cursor, actionType: actionTypeFilter === "all" ? undefined : actionTypeFilter }
  ) || [];
  
  const stats = useQuery(api.activities.getActivityStats);

  // Merge new activities with existing ones
  useEffect(() => {
    if (activities.length > 0) {
      if (cursor) {
        // Pagination: append new activities
        setAllActivities(prev => {
          const existingIds = new Set(prev.map(a => a._id));
          const newActivities = activities.filter((a: Activity) => !existingIds.has(a._id));
          return [...prev, ...newActivities];
        });
      } else {
        // Initial load or refresh: replace all
        setAllActivities(activities);
      }
    }
  }, [activities, cursor]);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCursor(undefined); // Reset cursor to get latest
      setLastRefresh(new Date());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const filteredActivities = filter === "all" 
    ? allActivities 
    : allActivities.filter((a: Activity) => a.status === filter);

  const loadMore = () => {
    if (allActivities.length > 0) {
      const lastActivity = allActivities[allActivities.length - 1];
      setCursor(lastActivity.timestamp);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-400";
      case "failed": return "text-red-400";
      case "pending": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case "task_complete": return "✓";
      case "file_update": return "📝";
      case "cron_run": return "⏰";
      case "search_query": return "🔍";
      default: return "•";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getActionTypeLabel = (type: string) => {
    const option = ACTION_TYPE_OPTIONS.find(o => o.value === type);
    return option ? option.label : type;
  };

  const manualRefresh = () => {
    setCursor(undefined);
    setLastRefresh(new Date());
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Activity Feed</h2>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${activities ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button 
            onClick={manualRefresh}
            className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
            title="Refresh now"
          >
            🔄
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-slate-700"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={actionTypeFilter}
          onChange={(e) => {
            setActionTypeFilter(e.target.value);
            setCursor(undefined);
            setAllActivities([]);
          }}
          className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-slate-700"
        >
          {ACTION_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-800 rounded">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total24h}</div>
            <div className="text-xs text-gray-400">24h Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.success24h}</div>
            <div className="text-xs text-gray-400">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.failed24h}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto mb-4">
        {filteredActivities.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No activities yet</div>
        ) : (
          filteredActivities.map((activity: Activity) => (
            <div 
              key={activity._id} 
              className="bg-slate-800 rounded p-3 hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{getActionTypeIcon(activity.actionType)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-white truncate">
                      {getActionTypeLabel(activity.actionType)}
                    </span>
                    <span className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                    {activity.source && (
                      <span className="text-xs text-gray-600 bg-slate-900 px-2 py-0.5 rounded">
                        {activity.source}
                      </span>
                    )}
                  </div>
                  {activity.metadata?.error && (
                    <div className="text-xs text-red-400 mt-1">
                      Error: {activity.metadata.error}
                    </div>
                  )}
                  {activity.metadata?.filePath && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      📁 {activity.metadata.filePath}
                    </div>
                  )}
                  {activity.metadata?.duration && (
                    <div className="text-xs text-gray-500 mt-1">
                      ⏱️ {activity.metadata.duration}ms
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {allActivities.length >= 50 && (
        <div className="flex justify-center pt-4 border-t border-slate-800">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 transition-colors"
          >
            Load More ({allActivities.length} loaded)
          </button>
        </div>
      )}
    </div>
  );
}
