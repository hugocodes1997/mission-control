import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WORKSPACE_PATH = "/Users/hugoluna/.openclaw/workspace";

interface FileEntry {
  path: string;
  name: string;
  type: string;
  content?: string;
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
      
      // Skip hidden directories and node_modules
      if (item.name.startsWith(".") || item.name === "node_modules" || item.name === ".next") {
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

// GET - List all indexable files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get("content") === "true";
    const filePath = searchParams.get("path");
    
    if (filePath) {
      // Return content of specific file
      const content = await readFileContent(filePath);
      return NextResponse.json({
        success: true,
        path: filePath,
        content,
      });
    }
    
    // Scan workspace for indexable files
    const files = await scanDirectory(WORKSPACE_PATH);
    
    // Optionally include content
    if (includeContent) {
      for (const file of files) {
        file.content = await readFileContent(file.path);
      }
    }
    
    return NextResponse.json({
      success: true,
      files: files.map(f => ({
        path: f.path,
        name: f.name,
        type: f.type,
        size: f.size,
        modified: f.modified.toISOString(),
        content: f.content,
      })),
      count: files.length,
    });
  } catch (error) {
    console.error("Error indexing files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to index files" },
      { status: 500 }
    );
  }
}

// POST - Trigger full reindex
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullReindex = body?.fullReindex === true;
    
    // Scan workspace
    const files = await scanDirectory(WORKSPACE_PATH);
    
    // Read content for all files
    const indexedFiles = [];
    for (const file of files) {
      const content = await readFileContent(file.path);
      
      // Determine source type based on path
      let sourceType = "workspace";
      if (file.path.includes("memory/")) {
        sourceType = "memory";
      } else if (file.path.toLowerCase().includes("business_lead")) {
        sourceType = "business_lead";
      } else if (file.path.toLowerCase().includes("paper_trading")) {
        sourceType = "paper_trading";
      } else if (file.path.toLowerCase().includes("task")) {
        sourceType = "task";
      } else if (file.path.toLowerCase().includes("calendar")) {
        sourceType = "calendar";
      }
      
      indexedFiles.push({
        path: file.path,
        name: file.name,
        type: file.type,
        sourceType,
        size: file.size,
        lineCount: content.split("\n").length,
        preview: content.substring(0, 200),
      });
    }
    
    return NextResponse.json({
      success: true,
      message: fullReindex ? "Full reindex completed" : "Index refreshed",
      files: indexedFiles,
      count: indexedFiles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error reindexing files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reindex files" },
      { status: 500 }
    );
  }
}
