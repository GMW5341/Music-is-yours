import { v4 as uuidv4 } from "uuid";
import { Genre, Key, Scale } from "@/types/music";
import {
  MusicDNA,
  EmotionVector,
  ReferenceTrackInput,
  analyzeReferenceTrack,
  compareMusicDNA,
} from "./reference-analyzer";

// ============================================================================
// Multi-Modal Music Knowledge Plane
// 팔란티어 AIP 스타일: 다양한 비정형 데이터(오디오 스펙트럼, MIDI, 메타데이터,
// 감정 벡터 등)를 하나의 단일 지식 객체(Unified Knowledge Object)로 통합하고
// 자연어 쿼리로 접근 가능하게 하는 데이터 플레인
// ============================================================================

// --- 다중 모달 데이터 소스 정의 ---

export type ModalityType =
  | "audio_spectrum"      // FFT/스펙트로그램 데이터
  | "midi_sequence"       // MIDI 노트 데이터
  | "rhythm_pattern"      // 리듬 패턴 (그리드)
  | "harmonic_map"        // 화성 진행 맵
  | "emotion_space"       // 감정 벡터 공간
  | "timbre_fingerprint"  // 음색 지문 (MFCC)
  | "arrangement_graph"   // 편곡 구조 그래프
  | "production_params"   // 프로덕션 파라미터
  | "lyric_semantic"      // 가사 의미 벡터
  | "user_preference"     // 사용자 선호 데이터
  | "metadata";           // 텍스트 메타데이터

export interface DataModality {
  type: ModalityType;
  data: unknown;
  confidence: number;
  timestamp: string;
}

// --- 단일 지식 객체 (Unified Knowledge Object) ---

export interface UnifiedKnowledgeObject {
  id: string;
  musicDNA: MusicDNA;
  modalities: DataModality[];
  embeddings: number[];             // 256차원 통합 임베딩 벡터
  semanticTags: SemanticTag[];
  relationships: KnowledgeRelation[];
  createdAt: string;
  updatedAt: string;
}

export interface SemanticTag {
  tag: string;
  category: "genre" | "mood" | "instrument" | "technique" | "era" | "culture" | "tempo" | "custom";
  weight: number;
}

export interface KnowledgeRelation {
  targetId: string;
  relationType: "similar_genre" | "similar_mood" | "similar_production" | "same_artist" | "influenced_by" | "derived_from";
  strength: number;
}

// --- 지식 그래프 저장소 (Knowledge Graph Store) ---

class MusicKnowledgeGraph {
  private objects: Map<string, UnifiedKnowledgeObject> = new Map();
  private genreIndex: Map<Genre, string[]> = new Map();
  private tagIndex: Map<string, string[]> = new Map();
  private embeddingDim = 256;

  get size(): number {
    return this.objects.size;
  }

  getAllObjects(): UnifiedKnowledgeObject[] {
    return Array.from(this.objects.values());
  }

  getObjectsByGenre(genre: Genre): UnifiedKnowledgeObject[] {
    const ids = this.genreIndex.get(genre) || [];
    return ids.map((id) => this.objects.get(id)!).filter(Boolean);
  }

  getObjectById(id: string): UnifiedKnowledgeObject | undefined {
    return this.objects.get(id);
  }

  // 다중 모달 데이터를 하나의 지식 객체로 융합
  ingestTrack(input: ReferenceTrackInput): UnifiedKnowledgeObject {
    const musicDNA = analyzeReferenceTrack(input);
    const modalities = this.extractModalities(musicDNA);
    const embeddings = this.computeUnifiedEmbedding(musicDNA);
    const semanticTags = this.deriveSemanticTags(musicDNA, input);

    const obj: UnifiedKnowledgeObject = {
      id: uuidv4(),
      musicDNA,
      modalities,
      embeddings,
      semanticTags,
      relationships: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 기존 객체들과의 관계 계산
    obj.relationships = this.computeRelationships(obj);

    // 인덱스에 추가
    this.objects.set(obj.id, obj);
    this.indexObject(obj);

    return obj;
  }

  // 배치 인제스트 (관리자용)
  batchIngest(inputs: ReferenceTrackInput[]): UnifiedKnowledgeObject[] {
    return inputs.map((input) => this.ingestTrack(input));
  }

  // 자연어 쿼리로 지식 객체 검색 (LLM 추론 결합점)
  queryByNaturalLanguage(query: string): KnowledgeQueryResult {
    const parsedIntent = this.parseQueryIntent(query);
    const candidates = this.searchByIntent(parsedIntent);
    const rankedResults = this.rankResults(candidates, parsedIntent);

    return {
      query,
      intent: parsedIntent,
      results: rankedResults,
      synthesizedKnowledge: this.synthesizeKnowledge(rankedResults, parsedIntent),
      totalMatches: rankedResults.length,
    };
  }

  // 유사한 지식 객체 찾기 (임베딩 기반)
  findSimilar(objectId: string, limit: number = 5): SimilarityResult[] {
    const target = this.objects.get(objectId);
    if (!target) return [];

    const results: SimilarityResult[] = [];
    for (const [id, obj] of Array.from(this.objects.entries())) {
      if (id === objectId) continue;
      const similarity = this.computeCosineSimilarity(target.embeddings, obj.embeddings);
      const dnaSimilarity = compareMusicDNA(target.musicDNA, obj.musicDNA);
      results.push({
        object: obj,
        embeddingSimilarity: similarity,
        dnaSimilarity,
        combinedScore: similarity * 0.4 + dnaSimilarity * 0.6,
      });
    }

    return results.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, limit);
  }

  // 장르별 통계적 프로파일 추출
  getGenreProfile(genre: Genre): GenreKnowledgeProfile | null {
    const objects = this.getObjectsByGenre(genre);
    if (objects.length === 0) return null;

    const dnas = objects.map((o) => o.musicDNA);
    const avgBpm = dnas.reduce((s, d) => s + d.rhythm.bpm, 0) / dnas.length;
    const avgBrightness = dnas.reduce((s, d) => s + d.timbre.brightness, 0) / dnas.length;
    const avgWarmth = dnas.reduce((s, d) => s + d.timbre.warmth, 0) / dnas.length;
    const avgEnergy = dnas.reduce((s, d) => s + d.emotionVector.energy, 0) / dnas.length;
    const avgValence = dnas.reduce((s, d) => s + d.emotionVector.valence, 0) / dnas.length;
    const avgComplexity = dnas.reduce((s, d) => s + d.harmony.harmonicComplexity, 0) / dnas.length;

    // 가장 흔한 스케일 찾기
    const scaleCounts: Record<string, number> = {};
    dnas.forEach((d) => { scaleCounts[d.harmony.scale] = (scaleCounts[d.harmony.scale] || 0) + 1; });
    const dominantScale = Object.entries(scaleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Scale || "major";

    // 가장 흔한 키 찾기
    const keyCounts: Record<string, number> = {};
    dnas.forEach((d) => { keyCounts[d.harmony.key] = (keyCounts[d.harmony.key] || 0) + 1; });
    const dominantKey = Object.entries(keyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Key || "C";

    // 감정 벡터 평균
    const emotionKeys = Object.keys(dnas[0].emotionVector) as (keyof EmotionVector)[];
    const avgEmotion: EmotionVector = {} as EmotionVector;
    emotionKeys.forEach((key) => {
      (avgEmotion as unknown as Record<string, number>)[key] =
        dnas.reduce((s, d) => s + d.emotionVector[key], 0) / dnas.length;
    });

    return {
      genre,
      sampleCount: objects.length,
      avgBpm,
      bpmRange: { min: Math.min(...dnas.map((d) => d.rhythm.bpm)), max: Math.max(...dnas.map((d) => d.rhythm.bpm)) },
      dominantKey,
      dominantScale,
      avgBrightness,
      avgWarmth,
      avgEnergy,
      avgValence,
      avgHarmonicComplexity: avgComplexity,
      avgEmotionVector: avgEmotion,
      commonTags: this.getCommonTags(objects),
      productionProfile: {
        avgCompressionStyle: this.getMostCommon(dnas.map((d) => d.production.compressionStyle)),
        avgReverbSpace: this.getMostCommon(dnas.map((d) => d.production.reverbSpace)),
        avgStereoImage: this.getMostCommon(dnas.map((d) => d.production.stereoImage)),
      },
    };
  }

  // --- 내부 메서드 ---

  private extractModalities(dna: MusicDNA): DataModality[] {
    const ts = new Date().toISOString();
    return [
      { type: "audio_spectrum", data: dna.audioFeatures, confidence: dna.confidence, timestamp: ts },
      { type: "rhythm_pattern", data: dna.rhythm, confidence: dna.confidence, timestamp: ts },
      { type: "harmonic_map", data: dna.harmony, confidence: dna.confidence, timestamp: ts },
      { type: "timbre_fingerprint", data: { mfcc: dna.audioFeatures.mfcc, timbre: dna.timbre }, confidence: dna.confidence, timestamp: ts },
      { type: "emotion_space", data: dna.emotionVector, confidence: dna.confidence, timestamp: ts },
      { type: "arrangement_graph", data: dna.arrangement, confidence: dna.confidence, timestamp: ts },
      { type: "production_params", data: dna.production, confidence: dna.confidence, timestamp: ts },
      { type: "metadata", data: { title: dna.sourceTitle, artist: dna.sourceArtist, genre: dna.genre, tags: dna.tags }, confidence: 1.0, timestamp: ts },
    ];
  }

  private computeUnifiedEmbedding(dna: MusicDNA): number[] {
    // 모든 모달리티의 숫자값을 256차원 벡터로 압축 (실제: neural network encoder)
    const raw: number[] = [];

    // 리듬 특성
    raw.push(dna.rhythm.bpm / 200, dna.rhythm.swingAmount, dna.rhythm.rhythmDensity, dna.rhythm.syncopation);

    // 화성 특성
    const keyMap: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
    raw.push((keyMap[dna.harmony.key] || 0) / 12, dna.harmony.harmonicComplexity);

    // 멜로디 특성
    raw.push(dna.melody.rhythmicDensity, dna.melody.repetitionFactor, dna.melody.leapFrequency, dna.melody.ornamentationLevel);

    // 음색 특성
    raw.push(dna.timbre.brightness, dna.timbre.warmth, dna.timbre.roughness, dna.timbre.depth, dna.timbre.stereoWidth);

    // 오디오 특성
    raw.push(dna.audioFeatures.spectralCentroid, dna.audioFeatures.rmsEnergy, dna.audioFeatures.onsetStrength);
    raw.push(...dna.audioFeatures.chromagram);
    raw.push(...dna.audioFeatures.mfcc.map((v) => (v + 50) / 100));

    // 감정 벡터
    raw.push(...Object.values(dna.emotionVector));

    // 패딩 + 노이즈로 256차원 맞추기
    const embedding = new Array(this.embeddingDim).fill(0);
    for (let i = 0; i < Math.min(raw.length, this.embeddingDim); i++) {
      embedding[i] = raw[i];
    }
    // 나머지 차원은 기존 값들의 비선형 조합으로 채움
    for (let i = raw.length; i < this.embeddingDim; i++) {
      embedding[i] = Math.tanh(embedding[i % raw.length] * 0.5 + embedding[(i * 7) % raw.length] * 0.3);
    }

    // L2 정규화
    const mag = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    return mag > 0 ? embedding.map((v) => v / mag) : embedding;
  }

  private deriveSemanticTags(dna: MusicDNA, input: ReferenceTrackInput): SemanticTag[] {
    const tags: SemanticTag[] = [];

    tags.push({ tag: dna.genre, category: "genre", weight: 1.0 });

    // 무드 태그 자동 생성
    const ev = dna.emotionVector;
    if (ev.joy > 0.6) tags.push({ tag: "happy", category: "mood", weight: ev.joy });
    if (ev.sadness > 0.5) tags.push({ tag: "melancholic", category: "mood", weight: ev.sadness });
    if (ev.energy > 0.7) tags.push({ tag: "energetic", category: "mood", weight: ev.energy });
    if (ev.energy < 0.3) tags.push({ tag: "calm", category: "mood", weight: 1 - ev.energy });
    if (ev.nostalgia > 0.5) tags.push({ tag: "nostalgic", category: "mood", weight: ev.nostalgia });
    if (ev.ethereal > 0.6) tags.push({ tag: "dreamy", category: "mood", weight: ev.ethereal });
    if (ev.darkness > 0.6) tags.push({ tag: "dark", category: "mood", weight: ev.darkness });
    if (ev.tension > 0.6) tags.push({ tag: "intense", category: "mood", weight: ev.tension });

    // 템포 태그
    if (dna.rhythm.bpm > 140) tags.push({ tag: "fast", category: "tempo", weight: 0.9 });
    else if (dna.rhythm.bpm > 110) tags.push({ tag: "moderate", category: "tempo", weight: 0.7 });
    else tags.push({ tag: "slow", category: "tempo", weight: 0.8 });

    // 프로덕션 태그
    if (dna.timbre.brightness > 0.7) tags.push({ tag: "bright", category: "technique", weight: 0.8 });
    if (dna.timbre.warmth > 0.7) tags.push({ tag: "warm", category: "technique", weight: 0.8 });
    if (dna.production.compressionStyle === "crushed") tags.push({ tag: "heavy_compression", category: "technique", weight: 0.7 });

    // 사용자 태그
    input.tags?.forEach((t) => tags.push({ tag: t, category: "custom", weight: 0.6 }));

    return tags;
  }

  private computeRelationships(newObj: UnifiedKnowledgeObject): KnowledgeRelation[] {
    const relations: KnowledgeRelation[] = [];

    for (const [id, existing] of Array.from(this.objects.entries())) {
      const similarity = this.computeCosineSimilarity(newObj.embeddings, existing.embeddings);

      if (similarity > 0.8) {
        if (newObj.musicDNA.genre === existing.musicDNA.genre) {
          relations.push({ targetId: id, relationType: "similar_genre", strength: similarity });
        }

        const emotDist = this.emotionDistance(newObj.musicDNA.emotionVector, existing.musicDNA.emotionVector);
        if (emotDist < 0.3) {
          relations.push({ targetId: id, relationType: "similar_mood", strength: 1 - emotDist });
        }
      }

      if (newObj.musicDNA.sourceArtist === existing.musicDNA.sourceArtist) {
        relations.push({ targetId: id, relationType: "same_artist", strength: 1.0 });
      }
    }

    return relations.sort((a, b) => b.strength - a.strength).slice(0, 20);
  }

  private parseQueryIntent(query: string): QueryIntent {
    const lower = query.toLowerCase();
    const intent: QueryIntent = { genres: [], moods: [], techniques: [], constraints: {} };

    // 장르 감지
    const genreMap: Record<string, Genre> = {
      "팝": "pop", "록": "rock", "힙합": "hiphop", "재즈": "jazz", "클래식": "classical",
      "edm": "edm", "일렉": "electronic", "로파이": "lofi", "앰비언트": "ambient",
      "케이팝": "kpop", "k-pop": "kpop", "메탈": "metal", "소울": "soul", "펑크": "funk",
      "레게": "reggae", "블루스": "blues", "인디": "indie", "컨트리": "country",
      "pop": "pop", "rock": "rock", "hip hop": "hiphop", "jazz": "jazz",
    };
    for (const [kw, genre] of Object.entries(genreMap)) {
      if (lower.includes(kw)) intent.genres.push(genre);
    }

    // 분위기 감지
    const moodMap: Record<string, string> = {
      "신나": "energetic", "행복": "happy", "슬프": "melancholic", "차분": "calm",
      "몽환": "dreamy", "강렬": "intense", "편안": "calm", "우울": "melancholic",
      "어두": "dark", "밝": "bright", "파워풀": "intense", "그루비": "groovy",
      "서정": "lyrical", "감성": "emotional", "로맨틱": "romantic", "향수": "nostalgic",
      "happy": "happy", "sad": "melancholic", "chill": "calm", "dark": "dark",
      "energetic": "energetic", "dreamy": "dreamy",
    };
    for (const [kw, mood] of Object.entries(moodMap)) {
      if (lower.includes(kw)) intent.moods.push(mood);
    }

    // 기법 감지
    const techMap: Record<string, string> = {
      "사이드체인": "sidechain", "리버브": "reverb", "컴프레서": "compression",
      "따뜻": "warm", "차가": "bright", "넓": "wide_stereo",
      "두꺼": "thick", "깨끗": "clean", "거친": "distorted",
    };
    for (const [kw, tech] of Object.entries(techMap)) {
      if (lower.includes(kw)) intent.techniques.push(tech);
    }

    // BPM 제약
    const bpmMatch = lower.match(/(\d{2,3})\s*bpm/);
    if (bpmMatch) intent.constraints.bpm = parseInt(bpmMatch[1]);

    // 빠른/느린 제약
    if (lower.includes("빠른") || lower.includes("fast")) intent.constraints.tempoRange = "fast";
    if (lower.includes("느린") || lower.includes("slow")) intent.constraints.tempoRange = "slow";

    return intent;
  }

  private searchByIntent(intent: QueryIntent): UnifiedKnowledgeObject[] {
    let candidates = Array.from(this.objects.values());

    // 장르 필터
    if (intent.genres.length > 0) {
      const genreMatches = candidates.filter((o) => intent.genres.includes(o.musicDNA.genre));
      if (genreMatches.length > 0) candidates = genreMatches;
    }

    // BPM 필터
    if (intent.constraints.bpm) {
      const target = intent.constraints.bpm;
      candidates = candidates.filter((o) => Math.abs(o.musicDNA.rhythm.bpm - target) < 20);
    }

    if (intent.constraints.tempoRange === "fast") {
      candidates = candidates.filter((o) => o.musicDNA.rhythm.bpm > 120);
    } else if (intent.constraints.tempoRange === "slow") {
      candidates = candidates.filter((o) => o.musicDNA.rhythm.bpm < 90);
    }

    return candidates;
  }

  private rankResults(candidates: UnifiedKnowledgeObject[], intent: QueryIntent): KnowledgeSearchResult[] {
    return candidates
      .map((obj) => {
        let score = 0;
        let factors = 0;

        // 장르 매치
        if (intent.genres.includes(obj.musicDNA.genre)) { score += 2; }
        factors++;

        // 무드 매치
        const ev = obj.musicDNA.emotionVector;
        for (const mood of intent.moods) {
          if (mood === "energetic" && ev.energy > 0.6) score += 1;
          if (mood === "calm" && ev.energy < 0.4) score += 1;
          if (mood === "happy" && ev.joy > 0.5) score += 1;
          if (mood === "melancholic" && ev.sadness > 0.5) score += 1;
          if (mood === "dreamy" && ev.ethereal > 0.5) score += 1;
          if (mood === "dark" && ev.darkness > 0.5) score += 1;
          if (mood === "intense" && ev.tension > 0.5) score += 1;
          if (mood === "nostalgic" && ev.nostalgia > 0.5) score += 1;
          factors++;
        }

        // 기법 매치
        for (const tech of intent.techniques) {
          if (tech === "warm" && obj.musicDNA.timbre.warmth > 0.6) score += 1;
          if (tech === "bright" && obj.musicDNA.timbre.brightness > 0.6) score += 1;
          if (tech === "wide_stereo" && obj.musicDNA.timbre.stereoWidth > 0.7) score += 1;
          factors++;
        }

        const relevance = factors > 0 ? score / (factors + 1) : 0;

        return {
          object: obj,
          relevanceScore: relevance,
          matchedTags: obj.semanticTags
            .filter((t) => intent.genres.includes(t.tag as Genre) || intent.moods.includes(t.tag))
            .map((t) => t.tag),
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // 검색 결과들을 종합하여 작곡에 사용할 통합 지식 생성
  private synthesizeKnowledge(results: KnowledgeSearchResult[], intent: QueryIntent): SynthesizedKnowledge {
    if (results.length === 0) {
      return {
        suggestedBpm: 120,
        suggestedKey: "C",
        suggestedScale: "major",
        emotionTarget: { valence: 0.5, arousal: 0.5, dominance: 0.5, tension: 0.3, joy: 0.5, sadness: 0.2, energy: 0.5, nostalgia: 0.2, darkness: 0.2, ethereal: 0.2 },
        timbreTarget: { brightness: 0.5, warmth: 0.5, depth: 0.5 },
        arrangementHints: [],
        productionHints: [],
        confidence: 0,
      };
    }

    const topResults = results.slice(0, 5);
    const dnas = topResults.map((r) => r.object.musicDNA);
    const weights = topResults.map((r) => r.relevanceScore);
    const totalWeight = weights.reduce((s, w) => s + w, 0) || 1;

    const weightedAvg = (extractor: (d: MusicDNA) => number) =>
      dnas.reduce((s, d, i) => s + extractor(d) * weights[i], 0) / totalWeight;

    const suggestedBpm = intent.constraints.bpm || Math.round(weightedAvg((d) => d.rhythm.bpm));

    // 가장 가중치 높은 키/스케일
    const keyVotes: Record<string, number> = {};
    const scaleVotes: Record<string, number> = {};
    dnas.forEach((d, i) => {
      keyVotes[d.harmony.key] = (keyVotes[d.harmony.key] || 0) + weights[i];
      scaleVotes[d.harmony.scale] = (scaleVotes[d.harmony.scale] || 0) + weights[i];
    });
    const suggestedKey = Object.entries(keyVotes).sort((a, b) => b[1] - a[1])[0]?.[0] as Key || "C";
    const suggestedScale = Object.entries(scaleVotes).sort((a, b) => b[1] - a[1])[0]?.[0] as Scale || "major";

    // 감정 벡터 가중 평균
    const emotionKeys = Object.keys(dnas[0].emotionVector) as (keyof EmotionVector)[];
    const emotionTarget: EmotionVector = {} as EmotionVector;
    emotionKeys.forEach((key) => {
      (emotionTarget as unknown as Record<string, number>)[key] = weightedAvg((d) => d.emotionVector[key]);
    });

    // 편곡 힌트
    const arrangementHints: string[] = [];
    const commonSections = new Map<string, number>();
    dnas.forEach((d) => d.arrangement.sections.forEach((s) => {
      commonSections.set(s.type, (commonSections.get(s.type) || 0) + 1);
    }));
    const sortedSections = Array.from(commonSections.entries()).sort((a, b) => b[1] - a[1]);
    sortedSections.slice(0, 5).forEach(([section]) => arrangementHints.push(section));

    // 프로덕션 힌트
    const productionHints: string[] = [];
    const compStyles = dnas.map((d) => d.production.compressionStyle);
    productionHints.push(`compression: ${this.getMostCommon(compStyles)}`);
    const reverbSpaces = dnas.map((d) => d.production.reverbSpace);
    productionHints.push(`reverb: ${this.getMostCommon(reverbSpaces)}`);

    return {
      suggestedBpm,
      suggestedKey,
      suggestedScale,
      emotionTarget,
      timbreTarget: {
        brightness: weightedAvg((d) => d.timbre.brightness),
        warmth: weightedAvg((d) => d.timbre.warmth),
        depth: weightedAvg((d) => d.timbre.depth),
      },
      arrangementHints,
      productionHints,
      confidence: totalWeight / topResults.length,
    };
  }

  private computeCosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return magA > 0 && magB > 0 ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  }

  private emotionDistance(a: EmotionVector, b: EmotionVector): number {
    const keys = Object.keys(a) as (keyof EmotionVector)[];
    let sumSq = 0;
    keys.forEach((k) => { sumSq += (a[k] - b[k]) ** 2; });
    return Math.sqrt(sumSq / keys.length);
  }

  private indexObject(obj: UnifiedKnowledgeObject): void {
    const genre = obj.musicDNA.genre;
    if (!this.genreIndex.has(genre)) this.genreIndex.set(genre, []);
    this.genreIndex.get(genre)!.push(obj.id);

    obj.semanticTags.forEach((tag) => {
      if (!this.tagIndex.has(tag.tag)) this.tagIndex.set(tag.tag, []);
      this.tagIndex.get(tag.tag)!.push(obj.id);
    });
  }

  private getCommonTags(objects: UnifiedKnowledgeObject[]): string[] {
    const tagCount = new Map<string, number>();
    objects.forEach((o) => o.semanticTags.forEach((t) => {
      tagCount.set(t.tag, (tagCount.get(t.tag) || 0) + 1);
    }));
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private getMostCommon<T>(arr: T[]): T {
    const counts = new Map<T, number>();
    arr.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? arr[0];
  }
}

// --- 타입 정의 ---

export interface QueryIntent {
  genres: Genre[];
  moods: string[];
  techniques: string[];
  constraints: {
    bpm?: number;
    tempoRange?: "fast" | "slow";
    key?: Key;
  };
}

export interface KnowledgeSearchResult {
  object: UnifiedKnowledgeObject;
  relevanceScore: number;
  matchedTags: string[];
}

export interface KnowledgeQueryResult {
  query: string;
  intent: QueryIntent;
  results: KnowledgeSearchResult[];
  synthesizedKnowledge: SynthesizedKnowledge;
  totalMatches: number;
}

export interface SynthesizedKnowledge {
  suggestedBpm: number;
  suggestedKey: Key;
  suggestedScale: Scale;
  emotionTarget: EmotionVector;
  timbreTarget: { brightness: number; warmth: number; depth: number };
  arrangementHints: string[];
  productionHints: string[];
  confidence: number;
}

export interface SimilarityResult {
  object: UnifiedKnowledgeObject;
  embeddingSimilarity: number;
  dnaSimilarity: number;
  combinedScore: number;
}

export interface GenreKnowledgeProfile {
  genre: Genre;
  sampleCount: number;
  avgBpm: number;
  bpmRange: { min: number; max: number };
  dominantKey: Key;
  dominantScale: Scale;
  avgBrightness: number;
  avgWarmth: number;
  avgEnergy: number;
  avgValence: number;
  avgHarmonicComplexity: number;
  avgEmotionVector: EmotionVector;
  commonTags: string[];
  productionProfile: {
    avgCompressionStyle: string;
    avgReverbSpace: string;
    avgStereoImage: string;
  };
}

// --- 싱글톤 인스턴스 ---
let globalKnowledgeGraph: MusicKnowledgeGraph | null = null;

export function getKnowledgeGraph(): MusicKnowledgeGraph {
  if (!globalKnowledgeGraph) {
    globalKnowledgeGraph = new MusicKnowledgeGraph();
  }
  return globalKnowledgeGraph;
}
