#!/usr/bin/env node
/**
 * Workspace File Indexer
 * 
 * This script scans the workspace for indexable files and adds them to Convex.
 * Run with: npx tsx scripts/index-files.ts
 */

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../convex/_generated/api";
import * as fs from "fs/promises";
import * as path from "path";

const WORKSPACE_PATH = process.env.WORKSPACE_PATH || "/Users/hugoluna/.openclaw/workspace";

interface FileEntry {
  path: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
}

// Recursively scan directory for files
async function scanDirectory(dirPath: string, basePath: string = WORKSPACE_PATH): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const relativePath = path.relative(basePath, fullPath);
      
      // Skip hidden directories and common ignore patterns
      if (item.name.startsWith(".") || 
          item.name === "node_modules" || 
          item.name === ".next" ||
          item.name === "dist" ||
          item.name === "build") {
        continue;
      }
      
      if (item.isDirectory()) {
        const subEntries = await scanDirectory(fullPath, basePath);
        entries.push(...subEntries);
      } else {
        const stats = await fs.stat(fullPath);
        const ext = path.extname(item.name).toLowerCase();
        
        // Only index certain file types
        if ([".md", ".csv", ".txt", ".json"].includes(ext)) {
          entries.push({
            path: relativePath,
            name: item.name,
            type: ext.replace(".", ""),
            size: stats.size,
            modified: stats.mtime,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return entries;
}

// Read file content
async function readFileContent(filePath: string): Promise<string> {
  try {
    const fullPath = path.join(WORKSPACE_PATH, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return "";
  }
}

// Determine source type based on file path
function getSourceType(filePath: string): string {
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.includes("memory/") || lowerPath === "memory.md") {
    return "memory";
  } else if (lowerPath.includes("business_lead")) {
    return "business_lead";
  } else if (lowerPath.includes("paper_trading") || lowerPath.includes("trading")) {
    return "paper_trading";
  } else if (lowerPath.includes("task") || lowerPath.includes("todo")) {
    return "task";
  } else if (lowerPath.includes("calendar") || lowerPath.includes("schedule")) {
    return "calendar";
  } else if (lowerPath.includes("agent") || lowerPath.includes("soul") || lowerPath.includes("user")) {
    return "agent_config";
  }
  return "workspace";
}

// Index a single file
async function indexFile(file: FileEntry): Promise<void> {
  const content = await readFileContent(file.path);
  if (!content.trim()) return;
  
  const sourceType = getSourceType(file.path);
  
  // Split content into chunks for better searchability
  const lines = content.split("\n");
  const chunks: { content: string; lineStart: number; lineEnd: number }[] = [];
  
  // For markdown files, split by headers
  if (file.type === "md") {
    let currentChunk = { content: "", lineStart: 1, lineEnd: 1 };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // New header = new chunk
      if (line.startsWith("#") && currentChunk.content.trim()) {
        chunks.push({ ...currentChunk, lineEnd: i });
        currentChunk = { content: line + "\n", lineStart: i + 1, lineEnd: i + 1 };
      } else {
        currentChunk.content += line + "\n";
        currentChunk.lineEnd = i + 1;
      }
    }
    
    if (currentChunk.content.trim()) {
      chunks.push(currentChunk);
    }
  } else {
    // For other files, index as one chunk
    chunks.push({ content, lineStart: 1, lineEnd: lines.length });
  }
  
  // Add each chunk to the search index
  for (const chunk of chunks) {
    if (chunk.content.trim().length < 10) continue; // Skip very short chunks
    
    try {
      await fetchMutation(api.search.addToIndex, {
        content: chunk.content.substring(0, 10000), // Limit content length
        title: file.name,
        filePath: file.path,
        fileType: file.type,
        lineNumber: chunk.lineStart,
        context: chunk.content.substring(0, 200),
        sourceType,
      });
    } catch (error) {
      console.error(`Error indexing chunk from ${file.path}:`, error);
    }
  }
  
  console.log(`  ✓ Indexed ${file.path} (${chunks.length} chunks)`);
}

// Main indexer function
async function indexWorkspace(): Promise<void> {
  console.log("🚀 Starting workspace file indexing...\n");
  
  // Scan for files
  console.log("📁 Scanning workspace...");
  const files = await scanDirectory(WORKSPACE_PATH);
  console.log(`   Found ${files.length} indexable files\n`);
  
  // Get existing indexed files
  console.log("📊 Checking existing index...");
  const existingFiles = await fetchQuery(api.search.getIndexedFiles, {});
  const existingPaths = new Set(existingFiles.map((f: any) => f.filePath));
  console.log(`   ${existingFiles.length} files already indexed\n`);
  
  // Index new or modified files
  console.log("📝 Indexing files...");
  let indexed = 0;
  let skipped = 0;
  
  for (const file of files) {
    // Check if file needs reindexing (new or modified)
    const existing = existingFiles.find((f: any) => f.filePath === file.path);
    const needsReindex = !existing || new Date(existing.lastIndexed) < file.modified;
    
    if (needsReindex) {
      await indexFile(file);
      indexed++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✅ Indexing complete!`);
  console.log(`   Indexed: ${indexed} files`);
  console.log(`   Skipped: ${skipped} files (up to date)`);
  
  // Show stats
  const stats = await fetchQuery(api.search.getSearchStats, {});
  console.log(`\n📈 Search Index Stats:`);
  console.log(`   Total entries: ${stats.totalIndexed}`);
  console.log(`   By file type:`, stats.byFileType);
  console.log(`   By source:`, stats.bySourceType);
}

// Run indexer
indexWorkspace().catch(error => {
  console.error("❌ Indexing failed:", error);
  process.exit(1);
});
