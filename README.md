# Mission Control Dashboard

A comprehensive workspace monitoring and management dashboard built with Next.js, Convex, and Tailwind CSS.

## Features

### 1. Activity Feed
- Real-time log of all OpenClaw actions
- Fields: timestamp, actionType, description, status, metadata
- Shows last 50 activities with pagination
- Filter by action type (tool calls, file edits, messages, etc.)
- Filter by status (success, failed, pending)
- Auto-refresh every 10 seconds with live indicator
- Manual refresh button
- Shows 24h activity stats

### 2. Calendar View
- Weekly view showing scheduled tasks
- Pulls from OpenClaw cron jobs via API
- Shows: job name, schedule, next run time, status
- Navigate between weeks with prev/next buttons
- Click events to see details in modal
- List view alternative for compact display
- Displays cron jobs section with recurrence info
- Color-coded by event type (cron, meeting, task, reminder)

### 3. Global Search
- Search input with instant results
- Indexes and searches across:
  - All .md files in ~/.openclaw/workspace/
  - All .csv files (BUSINESS_LEADS.csv, etc.)
  - MEMORY.md and memory/*.md
  - Scheduled tasks
- Shows context snippets for matches
- Filter by file type (markdown, csv, json, txt)
- Filter by source type (memory, business_lead, paper_trading, task, calendar)
- Highlighted search matches
- One-click reindex button
- Search stats display

## Tech Stack
- **Next.js 14+** with App Router
- **Convex** for database and real-time sync
- **Tailwind CSS** for styling
- **TypeScript** throughout

## Project Structure

```
mission-control/
├── app/
│   ├── api/
│   │   ├── cron/route.ts      # Cron jobs API endpoint
│   │   └── index/route.ts     # File indexer API endpoint
│   ├── components/
│   │   ├── ActivityFeed.tsx   # Activity feed component
│   │   ├── CalendarView.tsx   # Calendar view component
│   │   ├── GlobalSearch.tsx   # Global search component
│   │   ├── DashboardStats.tsx # Dashboard statistics
│   │   ├── Header.tsx         # Navigation header
│   │   └── Layout.tsx         # Page layout wrapper
│   ├── page.tsx               # Main dashboard page
│   └── layout.tsx             # Root layout
├── convex/
│   ├── schema.ts              # Database schema
│   ├── activities.ts          # Activity feed queries/mutations
│   ├── tasks.ts               # Task management queries/mutations
│   ├── calendar.ts            # Calendar queries/mutations
│   └── search.ts              # Search index queries/mutations
├── scripts/
│   └── index-files.ts         # Workspace file indexer script
└── package.json
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd ~/.openclaw/workspace/mission-control
npm install
```

### 2. Configure Convex
1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Create a new project or use an existing one
3. Copy your deployment URL
4. Update `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 3. Deploy Convex Schema
```bash
npx convex dev
```

### 4. Index Workspace Files
```bash
npm run index
# or
npx tsx scripts/index-files.ts
```

### 5. Start Development Server
```bash
npm run dev
```

The dashboard will be available at http://localhost:3000

## API Endpoints

### GET /api/cron
Returns list of OpenClaw cron jobs

### POST /api/cron
Create a new cron job

### GET /api/index?content=true
Returns list of indexable files with optional content

### POST /api/index
Triggers full reindex of workspace files

## Usage

### Logging Activities
Use the Convex mutation to log activities:
```typescript
import { api } from "./convex/_generated/api";

// In a component
const logActivity = useMutation(api.activities.logActivity);

await logActivity({
  actionType: "task_complete",
  description: "Completed task XYZ",
  status: "success",
  source: "agent",
  metadata: { taskId: "123" }
});
```

### Adding to Search Index
```typescript
const addToIndex = useMutation(api.search.addToIndex);

await addToIndex({
  content: "File content here",
  title: "My File",
  filePath: "path/to/file.md",
  fileType: "markdown",
  sourceType: "memory"
});
```

### Creating Calendar Events
```typescript
const createEvent = useMutation(api.calendar.createEvent);

await createEvent({
  title: "Daily Backup",
  description: "Run daily backup task",
  startTime: Date.now() + 3600000,
  type: "cron",
  recurrence: "0 2 * * *",
  metadata: {
    cronExpression: "0 2 * * *",
    command: "backup"
  }
});
```

## Customization

### Adding New Action Types
Edit `ActivityFeed.tsx` and add to `ACTION_TYPE_OPTIONS`:
```typescript
const ACTION_TYPE_OPTIONS = [
  // ... existing options
  { value: "custom_action", label: "Custom Action" },
];
```

### Adding New Event Types
Edit `CalendarView.tsx` and update the type colors:
```typescript
const typeColors: Record<string, string> = {
  cron: "bg-blue-600",
  meeting: "bg-purple-600",
  task: "bg-green-600",
  reminder: "bg-yellow-600",
  custom: "bg-pink-600", // Add your type
};
```

### Adding New Source Types
Edit `GlobalSearch.tsx` and update `getSourceTypeColor`:
```typescript
const getSourceTypeColor = (type: string) => {
  switch (type) {
    // ... existing cases
    case "custom": return "bg-teal-600";
    default: return "bg-gray-600";
  }
};
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL |
| `WORKSPACE_PATH` | Path to workspace (default: ~/.openclaw/workspace) |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run index` - Index workspace files
- `npx convex dev` - Start Convex dev server

## Troubleshooting

### "Convex Not Configured" Error
Update `.env.local` with your actual Convex deployment URL.

### Search Not Finding Files
Run the indexer: `npm run index`

### Activities Not Showing
Check that Convex is connected and the schema is deployed.

## License
MIT
