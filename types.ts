export type TabType = "activity" | "calendar" | "search";

export interface Activity {
  _id: string;
  type: string;
  description: string;
  details?: string;
  metadata?: {
    tool?: string;
    status?: string;
    duration?: number;
  };
  timestamp: number;
}

export interface ScheduledTask {
  _id: string;
  name: string;
  description: string;
  scheduleType: string;
  scheduleExpr?: string;
  nextRunAt: number;
  lastRunAt?: number;
  status: string;
  payload?: string;
}

export interface SearchResult {
  _id: string;
  contentType: string;
  title: string;
  content: string;
  tags: string[];
  source?: string;
  timestamp: number;
}

export interface StatsData {
  totalActivities: number;
  todaysActivities: number;
  totalTasks: number;
  activeTasks: number;
  totalSearchItems: number;
}
