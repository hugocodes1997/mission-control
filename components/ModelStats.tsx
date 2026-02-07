"use client";

import { useState, useEffect } from "react";
import { 
  Cpu, 
  Zap, 
  TrendingUp, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Server
} from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  default: boolean;
}

interface UsageStats {
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  calls: number;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "moonshot/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "Moonshot",
    description: "Current default model. Strong reasoning and coding capabilities.",
    capabilities: ["reasoning", "coding", "long-context"],
    default: true,
  },
  {
    id: "anthropic/claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    description: "Most capable model for complex tasks and analysis.",
    capabilities: ["reasoning", "analysis", "coding", "writing"],
    default: false,
  },
  {
    id: "anthropic/claude-3-5-haiku-latest",
    name: "Claude Haiku",
    provider: "Anthropic",
    description: "Fast and cost-effective for simple tasks.",
    capabilities: ["speed", "simple-tasks"],
    default: false,
  },
];

export function ModelStats() {
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<any>(null);

  useEffect(() => {
    // Fetch current session stats
    fetchSessionStats();
  }, []);

  const fetchSessionStats = async () => {
    try {
      // In a real implementation, this would call your backend
      // For now, we'll show static info with a "live" indicator
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const totalCalls = 127; // Mock data - would come from your tracking
  const totalCost = 2.45; // Mock data
  const todayCalls = 23;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today's Calls</p>
              <p className="text-2xl font-bold text-white">{todayCalls}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-400/10">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Calls</p>
              <p className="text-2xl font-bold text-white">{totalCalls}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-400/10">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Est. Cost (24h)</p>
              <p className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-400/10">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Models</p>
              <p className="text-2xl font-bold text-white">{AVAILABLE_MODELS.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-400/10">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Models */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Available Models
            </h3>
            <span className="text-sm text-gray-500">
              Default: <span className="text-blue-400">Kimi K2.5</span>
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-800">
          {AVAILABLE_MODELS.map((model) => (
            <div
              key={model.id}
              className={`p-6 hover:bg-gray-800/50 transition-colors ${
                model.default ? "bg-blue-500/5" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">{model.name}</h4>
                    {model.default && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        Default
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {model.provider}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{model.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-500"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                <code className="text-xs text-gray-600 bg-gray-950 px-2 py-1 rounded">
                  {model.id}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Tracking Note */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">Provider Balances</h4>
            <p className="text-gray-400 text-sm">
              Real-time balance tracking requires API access to each provider's billing system. 
              Most providers (OpenAI, Anthropic, Moonshot) don't expose this via API. 
              Check your provider dashboards directly for current balances.
            </p>
            <div className="mt-4 flex gap-4">
              <a 
                href="https://platform.openai.com/usage" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                OpenAI Dashboard →
              </a>
              <a 
                href="https://console.anthropic.com/settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Anthropic Console →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* How to Switch Models */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-green-500/10">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">Switching Models</h4>
            <p className="text-gray-400 text-sm mb-3">
              You can switch models per-session using the model alias:
            </p>
            <code className="block bg-gray-950 px-4 py-3 rounded-lg text-sm text-gray-300 font-mono">
              /model haiku → Switch to Claude Haiku (fast)<br/>
              /model opus → Switch to Claude Opus 4.5 (powerful)<br/>
              /model kimi → Switch to Kimi K2.5 (default)
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
