"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo, useEffect } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime?: number;
  type: string;
  recurrence?: string;
  status?: string;
  metadata?: {
    cronExpression?: string;
    command?: string;
    jobId?: string;
  };
}

export function CalendarView() {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const weekStartTimestamp = currentWeek.getTime();
  const events = useQuery(api.calendar.getWeekEvents, { weekStart: weekStartTimestamp }) || [];

  // Fetch cron jobs from API
  useEffect(() => {
    fetch("/api/cron")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCronJobs(data.jobs);
        }
      })
      .catch(err => console.error("Failed to fetch cron jobs:", err));
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(currentWeek);
      day.setDate(day.getDate() + i);
      return day;
    });
  }, [currentWeek]);

  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setCurrentWeek(newWeek);
  };

  const getEventsForDay = (day: Date) => {
    const startOfDay = new Date(day).setHours(0, 0, 0, 0);
    const endOfDay = new Date(day).setHours(23, 59, 59, 999);
    
    return events.filter((event: CalendarEvent) => {
      return event.startTime >= startOfDay && event.startTime <= endOfDay;
    });
  };

  const getEventStyle = (event: CalendarEvent) => {
    const date = new Date(event.startTime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const top = (hour + minute / 60) * 60; // 60px per hour
    
    const duration = event.endTime 
      ? (event.endTime - event.startTime) / (1000 * 60) // minutes
      : 60; // default 1 hour
    const height = (duration / 60) * 60;

    const typeColors: Record<string, string> = {
      cron: "bg-blue-600",
      meeting: "bg-purple-600",
      task: "bg-green-600",
      reminder: "bg-yellow-600",
    };

    return {
      top: `${top}px`,
      height: `${Math.max(height, 30)}px`,
      backgroundColor: typeColors[event.type] || "bg-gray-600",
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "calendar" ? "list" : "calendar")}
            className="px-3 py-2 bg-slate-800 rounded text-sm text-gray-300 hover:text-white"
          >
            {viewMode === "calendar" ? "📋 List" : "📅 Calendar"}
          </button>
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={() => navigateWeek(-1)}
              className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-white"
            >
              ←
            </button>
            <span className="text-white font-medium">
              {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
            </span>
            <button 
              onClick={() => navigateWeek(1)}
              className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-white"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded"></span> Cron</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-600 rounded"></span> Meeting</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-600 rounded"></span> Task</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-600 rounded"></span> Reminder</span>
      </div>

      {/* Cron Jobs Section */}
      {cronJobs.length > 0 && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Scheduled Cron Jobs ({cronJobs.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cronJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-slate-800 p-3 rounded border border-slate-700 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-white">{job.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${job.enabled ? 'bg-green-600/30 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
                    {job.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{job.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span className="font-mono bg-slate-900 px-2 py-0.5 rounded">{job.schedule}</span>
                  <span>Next: {new Date(job.nextRun).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === "calendar" ? (
        /* Calendar Grid */
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-center text-gray-500 text-sm">Time</div>
              {weekDays.map((day, i) => (
                <div 
                  key={i} 
                  className={`text-center p-2 rounded ${isToday(day) ? "bg-slate-700" : ""}`}
                >
                  <div className="text-gray-400 text-xs">{DAYS[i]}</div>
                  <div className={`font-bold ${isToday(day) ? "text-white" : "text-gray-300"}`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-8 gap-1 relative">
              {/* Time Labels */}
              <div className="space-y-0">
                {HOURS.map(hour => (
                  <div key={hour} className="h-[60px] text-xs text-gray-500 text-right pr-2 pt-1">
                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                
                return (
                  <div key={dayIndex} className="relative border-l border-slate-800">
                    {/* Hour grid lines */}
                    {HOURS.map(hour => (
                      <div key={hour} className="h-[60px] border-b border-slate-800/50"></div>
                    ))}
                    
                    {/* Events */}
                    {dayEvents.map((event: CalendarEvent) => (
                      <div
                        key={event._id}
                        onClick={() => setSelectedEvent(event)}
                        className="absolute left-1 right-1 rounded px-2 py-1 text-xs text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        style={getEventStyle(event)}
                        title={`${event.title} - ${formatTime(event.startTime)}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-white/70">{formatTime(event.startTime)}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No events this week</div>
          ) : (
            events.map((event: CalendarEvent) => (
              <div 
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className="flex items-center gap-4 p-3 bg-slate-800 rounded hover:bg-slate-750 cursor-pointer transition-colors"
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  event.type === "cron" ? "bg-blue-500" :
                  event.type === "meeting" ? "bg-purple-500" :
                  event.type === "task" ? "bg-green-500" : "bg-yellow-500"
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium text-white">{event.title}</div>
                  <div className="text-xs text-gray-400">{event.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{formatTime(event.startTime)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.startTime).toLocaleDateString()}
                  </div>
                </div>
                {event.recurrence && (
                  <span className="text-xs text-gray-500 bg-slate-900 px-2 py-0.5 rounded">
                    {event.recurrence}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Upcoming Events List */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Upcoming</h3>
        <div className="space-y-2">
          {events.slice(0, 5).map((event: CalendarEvent) => (
            <div 
              key={event._id} 
              onClick={() => setSelectedEvent(event)}
              className="flex items-center gap-3 bg-slate-800 p-2 rounded text-sm cursor-pointer hover:bg-slate-750 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${
                event.type === "cron" ? "bg-blue-500" :
                event.type === "meeting" ? "bg-purple-500" :
                event.type === "task" ? "bg-green-500" : "bg-yellow-500"
              }`}></span>
              <span className="text-white font-medium">{event.title}</span>
              <span className="text-gray-400">{formatTime(event.startTime)}</span>
              {event.recurrence && (
                <span className="text-xs text-gray-500 bg-slate-900 px-2 py-0.5 rounded">
                  {event.recurrence}
                </span>
              )}
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-gray-500 text-sm">No events scheduled this week</div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-slate-900 rounded-lg max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${
                  selectedEvent.type === "cron" ? "bg-blue-500" :
                  selectedEvent.type === "meeting" ? "bg-purple-500" :
                  selectedEvent.type === "task" ? "bg-green-500" : "bg-yellow-500"
                }`}></span>
                <h3 className="text-lg font-bold text-white">{selectedEvent.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Description</div>
                <p className="text-gray-300">{selectedEvent.description || "No description"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Start Time</div>
                  <p className="text-white">{new Date(selectedEvent.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">End Time</div>
                  <p className="text-white">
                    {selectedEvent.endTime 
                      ? new Date(selectedEvent.endTime).toLocaleString()
                      : "Not specified"
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Type</div>
                  <span className="text-white capitalize">{selectedEvent.type}</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    selectedEvent.status === 'completed' ? 'bg-green-600/30 text-green-400' :
                    selectedEvent.status === 'cancelled' ? 'bg-red-600/30 text-red-400' :
                    'bg-blue-600/30 text-blue-400'
                  }`}>
                    {selectedEvent.status || "scheduled"}
                  </span>
                </div>
              </div>

              {selectedEvent.recurrence && (
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Recurrence</div>
                  <code className="text-sm bg-slate-800 px-2 py-1 rounded text-gray-300">
                    {selectedEvent.recurrence}
                  </code>
                </div>
              )}

              {selectedEvent.metadata && (
                <div className="bg-slate-800/50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase mb-2">Metadata</div>
                  {selectedEvent.metadata.cronExpression && (
                    <div className="text-sm mb-1">
                      <span className="text-gray-400">Cron:</span>{" "}
                      <code className="text-gray-300">{selectedEvent.metadata.cronExpression}</code>
                    </div>
                  )}
                  {selectedEvent.metadata.command && (
                    <div className="text-sm">
                      <span className="text-gray-400">Command:</span>{" "}
                      <code className="text-gray-300">{selectedEvent.metadata.command}</code>
                    </div>
                  )}
                  {selectedEvent.metadata.jobId && (
                    <div className="text-sm">
                      <span className="text-gray-400">Job ID:</span>{" "}
                      <code className="text-gray-300">{selectedEvent.metadata.jobId}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
