import { NextRequest, NextResponse } from "next/server";
import { ReferenceTrackInput, analyzeReferenceTrack } from "@/lib/reference-analyzer";
import { addReferenceTrack, getReferenceAnalysisSummary } from "@/lib/user-fine-tuning";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    userId: string;
    track: ReferenceTrackInput;
  };

  if (!body.track || !body.userId) {
    return NextResponse.json({ error: "userId and track are required" }, { status: 400 });
  }

  const dna = addReferenceTrack(body.userId, body.track);
  const summary = getReferenceAnalysisSummary(body.userId);

  return NextResponse.json({ dna, summary });
}
