import { parse } from "path";

/**
 * Seed script for Mission Control Dashboard
 * Run this after setting up Convex to populate initial data
 */

// Sample activities to seed
const sampleActivities = [
  {
    actionType: "task_complete",
    description: "Completed setup of Mission Control dashboard",
    status: "success",
    source: "agent",
  },
  {
    actionType: "file_update",
    description: "Updated MEMORY.md with new project notes",
    status: "success",
    source: "user",
    metadata: { filePath: "MEMORY.md" },
  },
  {
    actionType: "cron_run",
    description: "Daily heartbeat check completed",
    status: "success",
    source: "system",
  },
  {
    actionType: "search_query",
    description: "Searched for 'business leads' in workspace",
    status: "success",
    source: "user",
  },
];

// Sample calendar events to seed
const sampleEvents = [
  {
    title: "Daily Standup",
    description: "Team daily check-in",
    startTime: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
    endTime: Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
    type: "meeting",
    recurrence: "daily",
  },
  {
    title: "Weekly Review",
    description: "Review weekly progress and goals",
    startTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
    type: "meeting",
    recurrence: "weekly",
  },
  {
    title: "Heartbeat Check",
    description: "Automated system heartbeat",
    startTime: Date.now() + 60 * 60 * 1000, // 1 hour from now
    type: "cron",
    recurrence: "0 */6 * * *", // Every 6 hours
    metadata: {
      cronExpression: "0 */6 * * *",
      command: "check heartbeat",
    },
  },
];

// Sample tasks to seed
const sampleTasks = [
  {
    title: "Set up Convex project",
    description: "Initialize Convex backend for Mission Control",
    priority: "high",
    status: "completed",
  },
  {
    title: "Build Activity Feed component",
    description: "Create real-time activity feed UI",
    priority: "high",
    status: "completed",
  },
  {
    title: "Build Calendar View",
    description: "Create weekly calendar view with navigation",
    priority: "medium",
    status: "in_progress",
  },
  {
    title: "Implement Global Search",
    description: "Add search functionality across workspace files",
    priority: "medium",
    status: "pending",
  },
  {
    title: "Index workspace files",
    description: "Index all markdown and CSV files for search",
    priority: "low",
    status: "pending",
  },
];

export { sampleActivities, sampleEvents, sampleTasks };
