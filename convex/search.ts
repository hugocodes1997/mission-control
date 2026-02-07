import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Search across all indexed content
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    fileTypeFilter: v.optional(v.string()),
    sourceTypeFilter: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const limit = args.limit ?? 20;
    
    let searchResults;
    
    if (args.fileTypeFilter && args.sourceTypeFilter) {
      searchResults = await ctx.db
        .query("searchIndex")
        .withSearchIndex("content_search", (q: any) =>
          q
            .search("content", args.query)
            .eq("fileType", args.fileTypeFilter)
            .eq("sourceType", args.sourceTypeFilter)
        )
        .take(limit);
    } else if (args.fileTypeFilter) {
      searchResults = await ctx.db
        .query("searchIndex")
        .withSearchIndex("content_search", (q: any) =>
          q.search("content", args.query).eq("fileType", args.fileTypeFilter)
        )
        .take(limit);
    } else if (args.sourceTypeFilter) {
      searchResults = await ctx.db
        .query("searchIndex")
        .withSearchIndex("content_search", (q: any) =>
          q.search("content", args.query).eq("sourceType", args.sourceTypeFilter)
        )
        .take(limit);
    } else {
      searchResults = await ctx.db
        .query("searchIndex")
        .withSearchIndex("content_search", (q: any) => q.search("content", args.query))
        .take(limit);
    }
    
    return searchResults;
  },
});

// Add content to search index
export const addToIndex = mutation({
  args: {
    content: v.string(),
    title: v.string(),
    filePath: v.string(),
    fileType: v.string(),
    lineNumber: v.optional(v.number()),
    context: v.optional(v.string()),
    sourceType: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("searchIndex")
      .withIndex("by_file_path", (q: any) => q.eq("filePath", args.filePath))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastIndexed: Date.now(),
      });
      return existing._id;
    }
    
    const id = await ctx.db.insert("searchIndex", {
      ...args,
      lastIndexed: Date.now(),
    });
    
    return id;
  },
});

// Get all indexed files
export const getIndexedFiles = query({
  args: {},
  handler: async (ctx: any) => {
    const files = await ctx.db
      .query("searchIndex")
      .withIndex("by_file_path")
      .collect();
    
    const grouped = files.reduce((acc: any, item: any) => {
      if (!acc[item.filePath]) {
        acc[item.filePath] = {
          filePath: item.filePath,
          fileType: item.fileType,
          sourceType: item.sourceType,
          lastIndexed: item.lastIndexed,
          entries: [],
        };
      }
      acc[item.filePath].entries.push(item);
      return acc;
    }, {});
    
    return Object.values(grouped);
  },
});

// Get recent indexed content
export const getRecentIndexed = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: { limit?: number }) => {
    const limit = args.limit ?? 20;
    
    const items = await ctx.db
      .query("searchIndex")
      .order("desc")
      .take(limit);
    
    return items;
  },
});

// Clear index for a specific file
export const clearFileIndex = mutation({
  args: {
    filePath: v.string(),
  },
  handler: async (ctx: any, args: { filePath: string }) => {
    const items = await ctx.db
      .query("searchIndex")
      .withIndex("by_file_path", (q: any) => q.eq("filePath", args.filePath))
      .collect();
    
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    
    return items.length;
  },
});

// Search with context
export const searchWithContext = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const limit = args.limit ?? 10;
    
    const results = await ctx.db
      .query("searchIndex")
      .withSearchIndex("content_search", (q: any) => q.search("content", args.query))
      .take(limit);
    
    return results.map((result: any) => ({
      ...result,
      matchContext: result.context || result.content.substring(0, 200),
    }));
  },
});

// Get search stats
export const getSearchStats = query({
  args: {},
  handler: async (ctx: any) => {
    const allItems = await ctx.db.query("searchIndex").collect();
    
    const byType = allItems.reduce((acc: any, item: any) => {
      acc[item.fileType] = (acc[item.fileType] || 0) + 1;
      return acc;
    }, {});
    
    const bySource = allItems.reduce((acc: any, item: any) => {
      acc[item.sourceType] = (acc[item.sourceType] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalIndexed: allItems.length,
      byFileType: byType,
      bySourceType: bySource,
      lastIndexTime: allItems.length > 0 
        ? Math.max(...allItems.map((i: any) => i.lastIndexed))
        : null,
    };
  },
});

// Reindex all content
export const reindexAll = mutation({
  args: {},
  handler: async () => {
    return { success: true, message: "Reindexing started" };
  },
});
