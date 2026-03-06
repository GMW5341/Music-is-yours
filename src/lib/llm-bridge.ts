import { ComposeRequest, Genre, Song } from "@/types/music";
import { MusicDNA, EmotionVector } from "./reference-analyzer";
import {
  getKnowledgeGraph,
  KnowledgeQueryResult,
  SynthesizedKnowledge,
} from "./knowledge-plane";
import {
  getPersonalizedParams,
  PersonalizedComposeParams,
  getReferenceAnalysisSummary,
  getUserProfile,
} from "./user-fine-tuning";
import { composeFromRequest } from "./ai-composer";

// ============================================================================
// LLM Reasoning Bridge
// 사용자의 자연어 입력을 받아 Knowledge Plane의 다중 모달 지식 객체를
// 조회/추론하고, 개인화 엔진과 결합하여 최종 작곡 파라미터를 생성하는
// 오케스트레이션 레이어
//
// 팔란티어 AIP 모델:
// [자연어 입력] → [LLM 추론] → [Knowledge Plane 쿼리] → [개인화 블렌딩]
//                                                      → [단일 지식 객체로 융합]
//                                                      → [작곡 엔진으로 전달]
// ============================================================================

export interface LLMComposeContext {
  // 사용자 입력
  userPrompt: string;
  userId: string;

  // LLM이 추론한 의도
  inferredIntent: InferredMusicalIntent;

  // Knowledge Plane에서 검색된 결과
  knowledgeResult: KnowledgeQueryResult;

  // 개인화 파라미터
  personalizedParams: PersonalizedComposeParams;

  // 최종 융합된 작곡 명령
  finalComposeRequest: ComposeRequest;

  // 추론 과정 설명 (사용자에게 보여줄 수 있는)
  reasoningTrace: ReasoningStep[];

  // 관련 레퍼런스 곡 정보
  relatedReferences: RelatedReference[];
}

export interface InferredMusicalIntent {
  primaryGoal: "create_new" | "similar_to" | "blend_styles" | "evolve_existing" | "experimental";
  targetGenres: Genre[];
  targetMoods: string[];
  technicalRequests: string[];
  referenceHints: string[];         // "~같은", "~느낌" 등에서 추출
  complexityLevel: "simple" | "moderate" | "complex" | "advanced";
  emotionKeywords: string[];
}

export interface ReasoningStep {
  step: number;
  phase: "intent_parsing" | "knowledge_query" | "personalization" | "fusion" | "generation";
  description: string;
  descriptionKo: string;
  data?: Record<string, unknown>;
}

export interface RelatedReference {
  title: string;
  artist: string;
  genre: Genre;
  relevanceScore: number;
  matchReason: string;
}

// ============================================================================
// LLM 의도 추론 엔진
// 실제 환경에서는 Claude API를 호출하여 자연어 이해를 수행
// ============================================================================

function inferMusicalIntent(prompt: string): InferredMusicalIntent {
  const lower = prompt.toLowerCase();

  // 목표 추론
  let primaryGoal: InferredMusicalIntent["primaryGoal"] = "create_new";
  if (lower.includes("같은") || lower.includes("스타일") || lower.includes("처럼") || lower.includes("similar") || lower.includes("like")) {
    primaryGoal = "similar_to";
  } else if (lower.includes("섞어") || lower.includes("믹스") || lower.includes("blend") || lower.includes("fusion")) {
    primaryGoal = "blend_styles";
  } else if (lower.includes("실험") || lower.includes("새로운") || lower.includes("독특") || lower.includes("experimental")) {
    primaryGoal = "experimental";
  }

  // 장르 추출
  const targetGenres: Genre[] = [];
  const genreMap: Record<string, Genre> = {
    "팝": "pop", "록": "rock", "힙합": "hiphop", "재즈": "jazz", "클래식": "classical",
    "edm": "edm", "일렉": "electronic", "로파이": "lofi", "앰비언트": "ambient",
    "케이팝": "kpop", "k-pop": "kpop", "메탈": "metal", "소울": "soul",
    "펑크": "funk", "레게": "reggae", "블루스": "blues", "인디": "indie",
    "pop": "pop", "rock": "rock", "hip hop": "hiphop", "jazz": "jazz",
    "electronic": "electronic", "r&b": "rnb", "알앤비": "rnb",
  };
  for (const [kw, genre] of Object.entries(genreMap)) {
    if (lower.includes(kw) && !targetGenres.includes(genre)) targetGenres.push(genre);
  }

  // 무드 추출
  const targetMoods: string[] = [];
  const moodKeywords: Record<string, string> = {
    "신나": "energetic", "행복": "happy", "슬프": "sad", "차분": "calm",
    "몽환": "dreamy", "강렬": "intense", "편안": "relaxing", "우울": "melancholic",
    "어두": "dark", "밝": "bright", "파워풀": "powerful", "그루비": "groovy",
    "감성": "emotional", "서정": "lyrical", "로맨틱": "romantic", "향수": "nostalgic",
    "웅장": "epic", "미니멀": "minimal", "복잡": "complex",
    "happy": "happy", "sad": "sad", "chill": "calm", "dark": "dark",
    "energetic": "energetic", "epic": "epic",
  };
  for (const [kw, mood] of Object.entries(moodKeywords)) {
    if (lower.includes(kw)) targetMoods.push(mood);
  }

  // 기술적 요청 추출
  const technicalRequests: string[] = [];
  const techKeywords = [
    "사이드체인", "리버브", "딜레이", "컴프레서", "이큐", "마스터링",
    "아르페지오", "보컬 찹", "오토메이션", "필터 스윕", "스테레오",
    "레이어링", "코드 진행", "편곡",
    "sidechain", "reverb", "delay", "compressor", "eq", "mastering",
  ];
  techKeywords.forEach((kw) => { if (lower.includes(kw)) technicalRequests.push(kw); });

  // 레퍼런스 힌트 추출
  const referenceHints: string[] = [];
  const refPatterns = [
    /(.+?)(?:같은|스타일|처럼|느낌)/g,
    /like\s+(.+?)(?:\s|$)/gi,
    /similar\s+to\s+(.+?)(?:\s|$)/gi,
  ];
  refPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      referenceHints.push(match[1].trim());
    }
  });

  // 복잡도 추론
  let complexityLevel: InferredMusicalIntent["complexityLevel"] = "moderate";
  if (technicalRequests.length >= 3 || targetGenres.length >= 2) complexityLevel = "advanced";
  else if (technicalRequests.length >= 1) complexityLevel = "complex";
  else if (prompt.length < 20) complexityLevel = "simple";

  // 감정 키워드
  const emotionKeywords = targetMoods.filter((m) =>
    ["happy", "sad", "energetic", "calm", "dark", "dreamy", "epic", "emotional", "nostalgic"].includes(m)
  );

  return {
    primaryGoal,
    targetGenres,
    targetMoods,
    technicalRequests,
    referenceHints,
    complexityLevel,
    emotionKeywords,
  };
}

// ============================================================================
// 메인 오케스트레이션 함수
// ============================================================================

export function orchestrateComposition(
  userPrompt: string,
  userId: string,
  explicitGenre?: Genre
): LLMComposeContext {
  const reasoningTrace: ReasoningStep[] = [];
  let stepNum = 1;

  // Phase 1: 의도 파싱
  const inferredIntent = inferMusicalIntent(userPrompt);
  reasoningTrace.push({
    step: stepNum++,
    phase: "intent_parsing",
    description: `Parsed intent: ${inferredIntent.primaryGoal}, genres: [${inferredIntent.targetGenres.join(",")}], moods: [${inferredIntent.targetMoods.join(",")}]`,
    descriptionKo: `의도 분석: ${inferredIntent.primaryGoal === "create_new" ? "새 곡 생성" : inferredIntent.primaryGoal === "similar_to" ? "유사곡 생성" : inferredIntent.primaryGoal === "blend_styles" ? "스타일 융합" : "실험적 생성"}, 장르: [${inferredIntent.targetGenres.join(",")}], 분위기: [${inferredIntent.targetMoods.join(",")}]`,
    data: { intent: inferredIntent },
  });

  // Phase 2: Knowledge Plane 쿼리
  const kg = getKnowledgeGraph();
  const knowledgeResult = kg.queryByNaturalLanguage(userPrompt);
  reasoningTrace.push({
    step: stepNum++,
    phase: "knowledge_query",
    description: `Knowledge graph queried: ${knowledgeResult.totalMatches} matches found, confidence: ${knowledgeResult.synthesizedKnowledge.confidence.toFixed(2)}`,
    descriptionKo: `지식 그래프 검색: ${knowledgeResult.totalMatches}건 매칭, 신뢰도: ${(knowledgeResult.synthesizedKnowledge.confidence * 100).toFixed(0)}%`,
    data: {
      totalMatches: knowledgeResult.totalMatches,
      suggestedBpm: knowledgeResult.synthesizedKnowledge.suggestedBpm,
      suggestedKey: knowledgeResult.synthesizedKnowledge.suggestedKey,
    },
  });

  // Phase 3: 개인화
  const genre = explicitGenre || inferredIntent.targetGenres[0];
  const composeReq: ComposeRequest = { prompt: userPrompt, genre };
  const personalizedParams = getPersonalizedParams(userId, composeReq);

  const profile = getUserProfile(userId);
  reasoningTrace.push({
    step: stepNum++,
    phase: "personalization",
    description: `Personalization level: ${(personalizedParams.personalizationLevel * 100).toFixed(0)}%, maturity: ${profile.tuningState.maturityLevel}`,
    descriptionKo: `개인화 수준: ${(personalizedParams.personalizationLevel * 100).toFixed(0)}%, 모델 성숙도: ${profile.tuningState.maturityLevel}, 근거: ${personalizedParams.sourceDescription}`,
    data: {
      personalizationLevel: personalizedParams.personalizationLevel,
      maturity: profile.tuningState.maturityLevel,
      totalReferences: profile.referenceDNAs.length,
    },
  });

  // Phase 4: 융합 (다중 모달 데이터 → 단일 작곡 명령)
  const finalRequest: ComposeRequest = {
    prompt: userPrompt,
    genre: personalizedParams.genre,
    bpm: personalizedParams.bpm,
    key: personalizedParams.key,
    scale: personalizedParams.scale,
    duration: 30,
    referenceStyle: inferredIntent.referenceHints.join(", "),
  };

  reasoningTrace.push({
    step: stepNum++,
    phase: "fusion",
    description: `Fused parameters: ${finalRequest.genre} @ ${finalRequest.bpm}bpm, key: ${finalRequest.key} ${finalRequest.scale}`,
    descriptionKo: `파라미터 융합 완료: ${finalRequest.genre} @ ${finalRequest.bpm}BPM, 키: ${finalRequest.key} ${finalRequest.scale}`,
    data: { finalRequest },
  });

  // Phase 5: 관련 레퍼런스 정보
  const relatedReferences: RelatedReference[] = knowledgeResult.results.slice(0, 5).map((r) => ({
    title: r.object.musicDNA.sourceTitle,
    artist: r.object.musicDNA.sourceArtist,
    genre: r.object.musicDNA.genre,
    relevanceScore: r.relevanceScore,
    matchReason: r.matchedTags.length > 0 ? `매칭 태그: ${r.matchedTags.join(", ")}` : "전체 유사도",
  }));

  reasoningTrace.push({
    step: stepNum++,
    phase: "generation",
    description: `Ready to generate with ${relatedReferences.length} reference influences`,
    descriptionKo: `${relatedReferences.length}개 레퍼런스 영향 반영하여 생성 준비 완료`,
  });

  return {
    userPrompt,
    userId,
    inferredIntent,
    knowledgeResult,
    personalizedParams,
    finalComposeRequest: finalRequest,
    reasoningTrace,
    relatedReferences,
  };
}

// 오케스트레이션 + 실제 작곡까지 수행
export function composeWithKnowledge(
  userPrompt: string,
  userId: string,
  explicitGenre?: Genre
): { song: Song; context: LLMComposeContext } {
  const context = orchestrateComposition(userPrompt, userId, explicitGenre);
  const song = composeFromRequest(context.finalComposeRequest);

  // 타이틀을 더 의미있게
  if (context.inferredIntent.targetMoods.length > 0) {
    song.title = `${context.inferredIntent.targetMoods[0]} ${song.genre} - ${userPrompt.slice(0, 30)}`;
  }

  // 감정 타겟에 따라 트랙 볼륨 미세 조정
  const emotion = context.personalizedParams.emotionTarget;
  song.tracks.forEach((track) => {
    if (track.type === "drums" && emotion.energy > 0.7) {
      track.volume = Math.min(track.volume + 0.1, 1);
    }
    if (track.type === "pad" && emotion.ethereal > 0.5) {
      track.volume = Math.min(track.volume + 0.1, 1);
    }
    if (track.type === "bass" && emotion.darkness > 0.5) {
      track.volume = Math.min(track.volume + 0.05, 1);
    }
  });

  // 음색 타겟에 따라 이펙트 조정
  const timbre = context.personalizedParams.timbreTarget;
  song.tracks.forEach((track) => {
    const reverb = track.effects.find((e) => e.type === "reverb");
    if (reverb && timbre.depth > 0.6) {
      reverb.params.mix = Math.min(reverb.params.mix + 0.1, 0.7);
      reverb.params.decay = Math.min((reverb.params.decay || 2) + 0.5, 5);
    }

    const eq = track.effects.find((e) => e.type === "eq");
    if (eq) {
      if (timbre.brightness > 0.6) eq.params.highGain = (eq.params.highGain || 0) + 2;
      if (timbre.warmth > 0.6) eq.params.lowGain = (eq.params.lowGain || 0) + 1;
    }
  });

  return { song, context };
}
