import { NextRequest, NextResponse } from "next/server";
import { Song } from "@/types/music";
import { judgeSubmission, calculateFinalScore } from "@/lib/ai-judge";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { song: Song; judgeId?: string };

  if (!body.song) {
    return NextResponse.json({ error: "song is required" }, { status: 400 });
  }

  const results = judgeSubmission(body.song, body.judgeId);
  const finalScore = calculateFinalScore(results);

  return NextResponse.json({ results, finalScore });
}
