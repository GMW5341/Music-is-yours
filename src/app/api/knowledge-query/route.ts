import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeGraph } from "@/lib/knowledge-plane";
import { orchestrateComposition, composeWithKnowledge } from "@/lib/llm-bridge";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    query: string;
    userId?: string;
    compose?: boolean;
  };

  if (!body.query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const kg = getKnowledgeGraph();

  if (body.compose && body.userId) {
    const { song, context } = composeWithKnowledge(body.query, body.userId);
    return NextResponse.json({ song, context });
  }

  const result = kg.queryByNaturalLanguage(body.query);
  return NextResponse.json(result);
}
