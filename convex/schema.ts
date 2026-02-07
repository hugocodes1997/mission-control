import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Activity Feed - tracks everything OpenClaw does
  activities: defineTable({
    type: v.string(), // 'tool_call', 'message', 'cron_run', 'file_write', 'deployment', etc.
    description: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.object({
      tool: v.optional(v.string()),
      status: v.optional(v.string()),
      duration: v.optional(v.number()),
    })),
    timestamp: v.number(), // unix ms
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"]),

  // Scheduled Tasks for Calendar view
  scheduledTasks: defineTable({
    name: v.string(),
    description: v.string(),
    scheduleType: v.string(), // 'cron', 'at', 'every'
    scheduleExpr: v.optional(v.string()), // cron expression or interval
    nextRunAt: v.number(), // unix ms
    lastRunAt: v.optional(v.number()),
    status: v.string(), // 'active', 'paused', 'completed'
    payload: v.optional(v.string()), // what the task does
  })
    .index("by_next_run", ["nextRunAt"])
    .index("by_status", ["status"]),

  // Searchable content - memories, tasks, documents
  searchIndex: defineTable({
    contentType: v.string(), // 'memory', 'task', 'document', 'conversation'
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()), // file path or source
    timestamp: v.number(),
  })
    .index("by_content_type", ["contentType"])
    .index("by_timestamp", ["timestamp"])
    .searchIndex("content_search", {
      searchField: "content",
      filterFields: ["contentType", "tags"],
    }),
});
