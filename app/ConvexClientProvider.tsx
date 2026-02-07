"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  const client = useMemo(() => {
    if (!convexUrl) {
      // Return null if no URL - will show fallback UI
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900 p-8 rounded-lg max-w-md text-center">
          <h1 className="text-xl font-bold text-white mb-4">⚠️ Convex Not Configured</h1>
          <p className="text-gray-400 mb-4">
            Please set up your Convex deployment and add NEXT_PUBLIC_CONVEX_URL to your .env.local file.
          </p>
          <code className="text-sm bg-slate-800 px-3 py-2 rounded block text-gray-300">
            NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
          </code>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
