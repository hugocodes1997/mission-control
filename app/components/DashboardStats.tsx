"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DashboardStats() {
  const activityStats = useQuery(api.activities.getActivityStats);
  const taskStats = useQuery(api.tasks.getTaskStats);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Activity Stats */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">24h Activities</div>
        <div className="text-2xl font-bold text-white">
          {activityStats?.total24h ?? "-"}
        </div>
        <div className="text-xs text-green-400 mt-1">
          {activityStats?.success24h ?? 0} successful
        </div>
      </div>

      {/* Task Stats */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Pending Tasks</div>
        <div className="text-2xl font-bold text-white">
          {taskStats?.pending ?? "-"}
        </div>
        <div className="text-xs text-orange-400 mt-1">
          {taskStats?.dueSoon ?? 0} due soon
        </div>
      </div>

      {/* Completed Stats */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Completed</div>
        <div className="text-2xl font-bold text-white">
          {taskStats?.completed ?? "-"}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {taskStats?.inProgress ?? 0} in progress
        </div>
      </div>

      {/* Urgent Stats */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Urgent</div>
        <div className="text-2xl font-bold text-red-400">
          {(taskStats?.urgent ?? 0) + (taskStats?.high ?? 0)}
        </div>
        <div className="text-xs text-red-400/70 mt-1">
          high priority tasks
        </div>
      </div>
    </div>
  );
}
