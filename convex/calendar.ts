import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get calendar events for a date range
export const getEventsByDateRange = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx: any, args: { startTime: number; endTime: number }) => {
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start_time", (q: any) =>
        q.gte("startTime", args.startTime).lte("startTime", args.endTime)
      )
      .order("asc")
      .collect();
    
    return events;
  },
});

// Get events for a specific week
export const getWeekEvents = query({
  args: {
    weekStart: v.number(),
  },
  handler: async (ctx: any, args: { weekStart: number }) => {
    const weekEnd = args.weekStart + 7 * 24 * 60 * 60 * 1000;
    
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start_time", (q: any) =>
        q.gte("startTime", args.weekStart).lt("startTime", weekEnd)
      )
      .order("asc")
      .collect();
    
    return events;
  },
});

// Create a new calendar event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    type: v.string(),
    recurrence: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        cronExpression: v.optional(v.string()),
        command: v.optional(v.string()),
        jobId: v.optional(v.string()),
      })
    ),
    source: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const eventId = await ctx.db.insert("calendarEvents", {
      ...args,
      status: "scheduled",
    });
    
    return eventId;
  },
});

// Update event status
export const updateEventStatus = mutation({
  args: {
    eventId: v.id("calendarEvents"),
    status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.eventId, {
      status: args.status,
    });
  },
});

// Get all cron jobs
export const getCronJobs = query({
  args: {},
  handler: async (ctx: any) => {
    const cronEvents = await ctx.db
      .query("calendarEvents")
      .withIndex("by_type", (q: any) => q.eq("type", "cron"))
      .collect();
    
    return cronEvents;
  },
});

// Import cron jobs from system
export const importCronJobs = mutation({
  args: {
    jobs: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        cronExpression: v.string(),
        command: v.string(),
      })
    ),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    const ids = [];
    
    for (const job of args.jobs) {
      const nextRun = now + 60 * 60 * 1000;
      
      const id = await ctx.db.insert("calendarEvents", {
        title: job.title,
        description: job.description,
        startTime: nextRun,
        endTime: nextRun + 5 * 60 * 1000,
        type: "cron",
        recurrence: job.cronExpression,
        status: "scheduled",
        source: "cron_job",
        metadata: {
          cronExpression: job.cronExpression,
          command: job.command,
        },
      });
      
      ids.push(id);
    }
    
    return ids;
  },
});

// Get upcoming events
export const getUpcomingEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: { limit?: number }) => {
    const now = Date.now();
    const limit = args.limit ?? 10;
    
    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_start_time", (q: any) => q.gte("startTime", now))
      .order("asc")
      .take(limit);
    
    return events;
  },
});

// Delete event
export const deleteEvent = mutation({
  args: {
    eventId: v.id("calendarEvents"),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.eventId);
  },
});
