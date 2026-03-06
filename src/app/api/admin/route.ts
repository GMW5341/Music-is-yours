import { NextRequest, NextResponse } from "next/server";
import { startBatchIngest, getAdminStats, adminAddTrack } from "@/lib/admin-pipeline";
import { ReferenceTrackInput } from "@/lib/reference-analyzer";

export async function GET() {
  const stats = getAdminStats();
  return NextResponse.json(stats);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    action: "batch_ingest" | "add_track";
    track?: ReferenceTrackInput;
  };

  switch (body.action) {
    case "batch_ingest": {
      const job = startBatchIngest();
      return NextResponse.json(job);
    }
    case "add_track": {
      if (!body.track) {
        return NextResponse.json({ error: "track is required" }, { status: 400 });
      }
      const result = adminAddTrack(body.track);
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
