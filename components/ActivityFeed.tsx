"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import {
  Terminal,
  MessageSquare,
  Calendar,
  FileText,
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";

const activityIcons: Record<string, React.ReactNode> = {
  tool_call: <Terminal className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
  cron_run: <Calendar className="w-4 h-4" />,
  file_write: <FileText className="w-4 h-4" />,
  deployment: <Rocket className="w-4 h-4" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  pending: <Clock className="w-4 h-4 text-yellow-400" />,
};

const typeLabels: Record<string, string> = {
  tool_call: "Tool Call",
  message: "Message",
  cron_run: "Scheduled Task",
  file_write: "File Operation",
  deployment: "Deployment",
};

export function ActivityFeed() {
  const activities = useQuery(api.tasks.listActivities, { limit: 50 });

  if (!activities) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-lg p-4 h-20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
        <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300">No activities yet</h3>
        <p className="text-gray-500 mt-2">
          Activities will appear here as OpenClaw performs tasks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
              {activityIcons[activity.type] || <MoreHorizontal className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {typeLabels[activity.type] || activity.type}
                </span>
                {activity.metadata?.status && statusIcons[activity.metadata.status]}
              </div>
              
              <p className="text-gray-200 font-medium">{activity.description}</p>
              
              {activity.details && (
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {activity.details}
                </p>
              )}

              {activity.metadata?.tool && (
                <p className="text-gray-600 text-xs mt-2">
                  Tool: {activity.metadata.tool}
                  {activity.metadata.duration && (
                    <span className="ml-2">
                      • {activity.metadata.duration}ms
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="flex-shrink-0 text-xs text-gray-500">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
