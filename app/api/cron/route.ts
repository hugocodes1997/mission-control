import { NextRequest, NextResponse } from "next/server";

// API route to fetch OpenClaw cron jobs
// This connects to the OpenClaw daemon to get scheduled jobs

export async function GET(request: NextRequest) {
  try {
    // Try to fetch cron jobs from OpenClaw
    // In a real implementation, this would call the OpenClaw API
    // For now, return mock data that matches the expected format
    
    const mockCronJobs = [
      {
        id: "heartbeat-check",
        name: "Heartbeat Check",
        schedule: "*/30 * * * *",
        command: "check_heartbeat",
        description: "Check for heartbeat tasks every 30 minutes",
        enabled: true,
        nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      {
        id: "memory-cleanup",
        name: "Memory Cleanup",
        schedule: "0 2 * * *",
        command: "cleanup_memory",
        description: "Clean up old memory files daily at 2 AM",
        enabled: true,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "paper-trading-update",
        name: "Paper Trading Update",
        schedule: "0 9 * * 1-5",
        command: "update_paper_trading",
        description: "Update paper trading data on weekdays at 9 AM",
        enabled: true,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Check for OpenClaw CLI availability
    let openclawJobs: typeof mockCronJobs = [];
    try {
      // This would actually call: openclaw cron list --json
      // For now we use the mock data
      openclawJobs = mockCronJobs;
    } catch (error) {
      console.log("OpenClaw CLI not available, using mock data");
    }

    return NextResponse.json({
      success: true,
      jobs: openclawJobs,
      count: openclawJobs.length,
    });
  } catch (error) {
    console.error("Error fetching cron jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cron jobs" },
      { status: 500 }
    );
  }
}

// POST to create a new cron job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.schedule || !body.command) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, schedule, command" },
        { status: 400 }
      );
    }

    // This would actually call: openclaw cron create ...
    // For now we just return success
    
    return NextResponse.json({
      success: true,
      job: {
        id: `job-${Date.now()}`,
        name: body.name,
        schedule: body.schedule,
        command: body.command,
        description: body.description || "",
        enabled: true,
        nextRun: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating cron job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create cron job" },
      { status: 500 }
    );
  }
}
