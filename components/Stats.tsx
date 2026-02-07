"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Activity, Clock, Search, Zap } from "lucide-react";

export function Stats() {
  const stats = useQuery(api.tasks.getStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 h-24" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Today's Activities",
      value: stats.todaysActivities,
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Total Activities",
      value: stats.totalActivities,
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Active Tasks",
      value: stats.activeTasks,
      icon: Clock,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Searchable Items",
      value: stats.totalSearchItems,
      icon: Search,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
