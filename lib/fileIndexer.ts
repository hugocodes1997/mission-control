"use client";

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

/**
 * Utility to index workspace files into Convex search
 * This can be called from a script or component to index files
 */

export interface FileToIndex {
  content: string;
  title: string;
  filePath: string;
  fileType: string;
  sourceType: string;
}

export function useFileIndexer() {
  const addToIndex = useMutation(api.search.addToIndex);

  const indexFile = async (file: FileToIndex) => {
    // Split content into chunks if it's too large
    const chunks = chunkContent(file.content, 1000);
    
    for (let i = 0; i < chunks.length; i++) {
      await addToIndex({
        content: chunks[i],
        title: file.title + (chunks.length > 1 ? ` (part ${i + 1})` : ""),
        filePath: file.filePath,
        fileType: file.fileType,
        sourceType: file.sourceType,
        context: i > 0 ? chunks[i - 1].slice(-100) : undefined,
      });
    }
  };

  return { indexFile };
}

function chunkContent(content: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const lines = content.split("\n");
  let currentChunk = "";

  for (const line of lines) {
    if (currentChunk.length + line.length > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// Predefined file paths to index from the workspace
export const WORKSPACE_FILES = [
  { path: "MEMORY.md", type: "markdown", sourceType: "memory" },
  { path: "BUSINESS_LEADS.csv", type: "csv", sourceType: "business_lead" },
  { path: "PAPER_TRADING.md", type: "markdown", sourceType: "paper_trading" },
  { path: "AGENTS.md", type: "markdown", sourceType: "memory" },
  { path: "TOOLS.md", type: "markdown", sourceType: "memory" },
  { path: "USER.md", type: "markdown", sourceType: "memory" },
];
