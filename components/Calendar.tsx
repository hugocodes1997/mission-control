"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  format,
  formatDistanceToNow,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Repeat,
  Calendar as CalendarIcon,
  Play,
  Pause,
  Trash2,
  Plus,
} from "lucide-react";

export function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const tasks = useQuery(api.tasks.listScheduledTasks, {
    from: startOfDay(weekStart).getTime(),
    to: endOfDay(weekEnd).getTime(),
  });

  const updateStatus = useMutation(api.tasks.updateTaskStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const getTasksForDay = (day: Date) => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      const taskDate = new Date(task.nextRunAt);
      return isSameDay(taskDate, day);
    });
  };

  const scheduleTypeIcons: Record<string, React.ReactNode> = {
    cron: <Repeat className="w-3 h-3" />,
    every: <Clock className="w-3 h-3" />,
    at: <CalendarIcon className="w-3 h-3" />,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-800 rounded-xl overflow-hidden border border-gray-800">
        {/* Day Headers */}
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="bg-gray-900 p-3 text-center text-sm font-medium text-gray-400"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`bg-gray-900 min-h-[120px] p-2 ${
                isToday ? "ring-2 ring-blue-500/30" : ""
              }`}
            >
              <div
                className={`text-sm font-medium mb-2 ${
                  isToday ? "text-blue-400" : "text-gray-500"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                      task.status === "active"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {scheduleTypeIcons[task.scheduleType]}
                      <span className="font-medium truncate">{task.name}</span>
                    </div>
                    <div className="text-gray-500 truncate">
                      {format(task.nextRunAt, "h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">All Scheduled Tasks</h3>
        {!tasks || tasks.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-300">No scheduled tasks</h4>
            <p className="text-gray-500 mt-2">
              Tasks will appear here when scheduled via cron or other triggers
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.status === "active" ? "bg-green-400" : "bg-gray-600"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{task.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                        {task.scheduleType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    {task.scheduleExpr && (
                      <p className="text-xs text-gray-600 mt-1">
                        {task.scheduleExpr}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Next: {formatDistanceToNow(task.nextRunAt, { addSuffix: true })}
                  </span>
                  <button
                    onClick={() =>
                      updateStatus({
                        id: task._id,
                        status: task.status === "active" ? "paused" : "active",
                      })
                    }
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title={task.status === "active" ? "Pause" : "Resume"}
                  >
                    {task.status === "active" ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteTask({ id: task._id })}
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
