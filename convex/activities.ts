import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// Query to get recent activities with pagination
export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
    actionType: v.optional(v.string()),
  },
  handler: async (ctx: any, args: { limit?: number; cursor?: number; actionType?: string }) => {
    const limit = args.limit ?? 50;
    
    let queryBuilder = ctx.db.query("activities").order("desc");
    
    if (args.actionType) {
      queryBuilder = queryBuilder.withIndex("by_action_type", (q: any) =>
        q.eq("actionType", args.actionType)
      );
    } else {
      queryBuilder = queryBuilder.withIndex("by_timestamp");
    }
    
    if (args.cursor) {
      queryBuilder = queryBuilder.filter((q: any) => q.lt(q.field("timestamp"), args.cursor));
    }
    
    const activities = await queryBuilder.take(limit);
    return activities;
  },
});

// Query to get activities by time range
export const getActivitiesByTimeRange = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx: any, args: { startTime: number; endTime: number }) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp", (q: any) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .order("desc")
      .collect();
    
    return activities;
  },
});

// Mutation to log a new activity
export const logActivity = mutation({
  args: {
    actionType: v.string(),
    description: v.string(),
    status: v.string(),
    metadata: v.optional(
      v.object({
        filePath: v.optional(v.string()),
        taskId: v.optional(v.string()),
        duration: v.optional(v.number()),
        error: v.optional(v.string()),
      })
    ),
    source: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const activityId = await ctx.db.insert("activities", {
      timestamp: Date.now(),
      actionType: args.actionType,
      description: args.description,
      status: args.status,
      metadata: args.metadata,
      source: args.source ?? "agent",
    });
    
    return activityId;
  },
});

// Internal mutation for system logging
export const logSystemActivity = internalMutation({
  args: {
    actionType: v.string(),
    description: v.string(),
    status: v.string(),
    metadata: v.optional(
      v.object({
        filePath: v.optional(v.string()),
        taskId: v.optional(v.string()),
        duration: v.optional(v.number()),
        error: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.insert("activities", {
      timestamp: Date.now(),
      actionType: args.actionType,
      description: args.description,
      status: args.status,
      metadata: args.metadata,
      source: "system",
    });
  },
});

// Get activity stats
export const getActivityStats = query({
  args: {},
  handler: async (ctx: any) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    const recentActivities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp", (q: any) => q.gte("timestamp", oneDayAgo))
      .collect();
    
    const successCount = recentActivities.filter((a: any) => a.status === "success").length;
    const failedCount = recentActivities.filter((a: any) => a.status === "failed").length;
    
    return {
      total24h: recentActivities.length,
      success24h: successCount,
      failed24h: failedCount,
      lastActivity: recentActivities[0] ?? null,
    };
  },
});
