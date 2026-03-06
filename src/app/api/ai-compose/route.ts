import { NextRequest, NextResponse } from "next/server";
import { ComposeRequest } from "@/types/music";
import { composeFromRequest, parseNaturalLanguagePrompt } from "@/lib/ai-composer";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<ComposeRequest>;

  if (!body.prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const parsed = parseNaturalLanguagePrompt(body.prompt);
  const composeRequest: ComposeRequest = {
    prompt: body.prompt,
    genre: body.genre || parsed.genre || "pop",
    mood: body.mood || parsed.mood,
    bpm: body.bpm || parsed.bpm,
    key: body.key || parsed.key,
    scale: body.scale || parsed.scale,
    duration: body.duration || 30,
  };

  const song = composeFromRequest(composeRequest);

  return NextResponse.json({ song });
}
