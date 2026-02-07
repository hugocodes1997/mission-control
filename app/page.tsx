"use client";

import { useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Calendar } from "@/components/Calendar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ModelStats } from "@/components/ModelStats";
import { Stats } from "@/components/Stats";
import { TabType } from "@/types";
import { Activity, CalendarDays, Search, Command, Cpu } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("activity");

  const tabs = [
    { id: "activity" as TabType, label: "Activity Feed", icon: Activity },
    { id: "calendar" as TabType, label: "Calendar", icon: CalendarDays },
    { id: "search" as TabType, label: "Global Search", icon: Search },
    { id: "models" as TabType, label: "Models", icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Command className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Mission Control</h1>
            </div>
            <div className="text-sm text-gray-400">
              OpenClaw Dashboard
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <Stats />

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-800">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTab === "activity" && <ActivityFeed />}
          {activeTab === "calendar" && <Calendar />}
          {activeTab === "search" && <GlobalSearch />}
          {activeTab === "models" && <ModelStats />}
        </div>
      </div>
    </div>
  );
}
