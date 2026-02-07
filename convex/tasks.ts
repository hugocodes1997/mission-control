import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== ACTIVITY FEED ====================

export const listActivities = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(args.limit || 50);
    
    if (args.type) {
      activities = activities.filter((a) => a.type === args.type);
    }
    
    return activities;
  },
});

export const addActivity = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.object({
      tool: v.optional(v.string()),
      status: v.optional(v.string()),
      duration: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// ==================== SCHEDULED TASKS / CALENDAR ====================

export const listScheduledTasks = query({
  args: {
    status: v.optional(v.string()),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db
      .query("scheduledTasks")
      .order("asc")
      .collect();

    if (args.status) {
      tasks = tasks.filter((t) => t.status === args.status);
    }
    if (args.from) {
      tasks = tasks.filter((t) => t.nextRunAt >= args.from!);
    }
    if (args.to) {
      tasks = tasks.filter((t) => t.nextRunAt <= args.to!);
    }

    return tasks;
  },
});

export const addScheduledTask = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    scheduleType: v.string(),
    scheduleExpr: v.optional(v.string()),
    nextRunAt: v.number(),
    payload: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledTasks", {
      ...args,
      status: "active",
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    id: v.id("scheduledTasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteTask = mutation({
  args: {
    id: v.id("scheduledTasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// ==================== GLOBAL SEARCH ====================

export const searchContent = query({
  args: {
    query: v.string(),
    contentType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("searchIndex")
      .withSearchIndex("content_search", (q) =>
        q.search("content", args.query).eq(
          "contentType",
          args.contentType || "memory"
        )
      )
      .take(args.limit || 20);

    return results;
  },
});

export const addSearchableContent = mutation({
  args: {
    contentType: v.string(),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("searchIndex", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// ==================== STATS ====================

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();
    const tasks = await ctx.db.query("scheduledTasks").collect();
    const searchItems = await ctx.db.query("searchIndex").collect();

    const activeTasks = tasks.filter((t) => t.status === "active").length;
    const today = new Date().setHours(0, 0, 0, 0);
    const todaysActivities = activities.filter(
      (a) => a.timestamp >= today
    ).length;

    return {
      totalActivities: activities.length,
      todaysActivities,
      totalTasks: tasks.length,
      activeTasks,
      totalSearchItems: searchItems.length,
    };
  },
});
