import { Song, AIJudge, JudgeResult, JudgeScore, Genre } from "@/types/music";

const AI_JUDGES: AIJudge[] = [
  {
    id: "judge-melody",
    name: "멜로디아",
    personality: "멜로디와 화성에 집중하는 감성적인 심사위원. 아름다운 선율과 감정 표현을 중시합니다.",
    avatar: "🎵",
    expertise: ["pop", "classical", "jazz", "rnb", "soul"],
    strictness: 0.7,
  },
  {
    id: "judge-rhythm",
    name: "비트마스터",
    personality: "리듬과 그루브에 집중하는 에너지 넘치는 심사위원. 비트감과 리듬 구성을 중시합니다.",
    avatar: "🥁",
    expertise: ["hiphop", "electronic", "edm", "funk", "house", "techno"],
    strictness: 0.8,
  },
  {
    id: "judge-production",
    name: "프로덕서 K",
    personality: "프로덕션 퀄리티와 사운드 디자인에 집중하는 꼼꼼한 심사위원. 믹싱과 마스터링 품질을 중시합니다.",
    avatar: "🎛️",
    expertise: ["electronic", "edm", "kpop", "pop", "alternative"],
    strictness: 0.85,
  },
  {
    id: "judge-creative",
    name: "아르테",
    personality: "창의성과 독창성에 집중하는 예술적인 심사위원. 새로운 시도와 독특한 표현을 높이 평가합니다.",
    avatar: "🎨",
    expertise: ["indie", "alternative", "ambient", "world", "folk"],
    strictness: 0.6,
  },
];

interface ScoreCategory {
  category: string;
  categoryKo: string;
  maxScore: number;
  evaluate: (song: Song, judge: AIJudge) => { score: number; feedback: string };
}

const SCORE_CATEGORIES: ScoreCategory[] = [
  {
    category: "melody",
    categoryKo: "멜로디 & 화성",
    maxScore: 25,
    evaluate: (song, judge) => {
      const melodyTrack = song.tracks.find((t) => t.type === "melody");
      if (!melodyTrack || melodyTrack.notes.length === 0) {
        return { score: 5, feedback: "멜로디 트랙이 없거나 비어있습니다." };
      }

      let score = 10;
      const noteCount = melodyTrack.notes.length;
      const pitchVariety = new Set(melodyTrack.notes.map((n) => n.pitch)).size;
      const pitchRatio = pitchVariety / Math.max(noteCount, 1);

      // Reward variety but not randomness
      if (pitchRatio > 0.3 && pitchRatio < 0.8) score += 5;
      else if (pitchRatio >= 0.2) score += 3;

      // Check for dynamics
      const velocityRange =
        Math.max(...melodyTrack.notes.map((n) => n.velocity)) -
        Math.min(...melodyTrack.notes.map((n) => n.velocity));
      if (velocityRange > 30) score += 4;
      else if (velocityRange > 15) score += 2;

      // Genre expertise bonus
      if (judge.expertise.includes(song.genre)) score += 3;

      // Duration variety
      const durationVariety = new Set(melodyTrack.notes.map((n) => Math.round(n.duration * 100))).size;
      if (durationVariety >= 3) score += 3;

      score = Math.min(Math.round(score * (1 - (judge.strictness - 0.5) * 0.3)), 25);

      const feedbacks = [
        score >= 20 ? "멜로디 라인이 매우 아름답고 기억에 남습니다!" :
        score >= 15 ? "멜로디가 안정적이며 좋은 흐름을 가지고 있습니다." :
        score >= 10 ? "멜로디에 조금 더 변화를 주면 좋겠습니다." :
        "멜로디의 다양성과 표현력이 부족합니다.",
      ];

      return { score: Math.max(score, 3), feedback: feedbacks[0] };
    },
  },
  {
    category: "rhythm",
    categoryKo: "리듬 & 그루브",
    maxScore: 25,
    evaluate: (song, judge) => {
      const drumTrack = song.tracks.find((t) => t.type === "drums");
      let score = 8;

      if (drumTrack && drumTrack.notes.length > 0) {
        score += 5;
        // Check rhythmic consistency
        const intervals: number[] = [];
        for (let i = 1; i < drumTrack.notes.length; i++) {
          intervals.push(drumTrack.notes[i].startTime - drumTrack.notes[i - 1].startTime);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const consistency = intervals.filter((i) => Math.abs(i - avgInterval) < avgInterval * 0.3).length / intervals.length;
        if (consistency > 0.5) score += 4;

        // BPM appropriateness for genre
        if (song.bpm >= 80 && song.bpm <= 150) score += 3;
      }

      const bassTrack = song.tracks.find((t) => t.type === "bass");
      if (bassTrack && bassTrack.notes.length > 0) score += 3;

      if (judge.expertise.includes(song.genre)) score += 2;

      score = Math.min(Math.round(score * (1 - (judge.strictness - 0.5) * 0.3)), 25);

      const feedback =
        score >= 20 ? "리듬이 매우 탄탄하고 그루브감이 살아있습니다!" :
        score >= 15 ? "안정적인 리듬 구성이 돋보입니다." :
        score >= 10 ? "리듬에 더 다양한 패턴을 시도해보세요." :
        "리듬 구성이 단조롭습니다. 변화가 필요합니다.";

      return { score: Math.max(score, 3), feedback };
    },
  },
  {
    category: "production",
    categoryKo: "프로덕션 퀄리티",
    maxScore: 25,
    evaluate: (song, judge) => {
      let score = 8;

      // Track count
      if (song.tracks.length >= 4) score += 4;
      else if (song.tracks.length >= 3) score += 2;

      // Effects usage
      const totalEffects = song.tracks.reduce((sum, t) => sum + t.effects.filter((e) => e.enabled).length, 0);
      if (totalEffects >= 6) score += 5;
      else if (totalEffects >= 3) score += 3;

      // Check for mixing basics (different volumes, panning)
      const hasMixing = song.tracks.some((t) => t.volume !== 0.7) || song.tracks.some((t) => t.pan !== 0);
      if (hasMixing) score += 3;

      // Check for compression
      const hasCompressor = song.tracks.some((t) => t.effects.some((e) => e.type === "compressor"));
      if (hasCompressor) score += 2;

      // Check for EQ
      const hasEQ = song.tracks.some((t) => t.effects.some((e) => e.type === "eq"));
      if (hasEQ) score += 2;

      if (judge.expertise.includes(song.genre)) score += 1;

      score = Math.min(Math.round(score * (1 - (judge.strictness - 0.5) * 0.3)), 25);

      const feedback =
        score >= 20 ? "프로덕션 퀄리티가 매우 훌륭합니다! 프로 수준의 믹싱이에요." :
        score >= 15 ? "사운드 구성이 안정적이고 잘 다듬어져 있습니다." :
        score >= 10 ? "이펙트와 믹싱을 더 활용하면 소리가 풍성해질 거예요." :
        "프로덕션 품질 향상이 필요합니다. EQ와 컴프레서를 활용해보세요.";

      return { score: Math.max(score, 3), feedback };
    },
  },
  {
    category: "creativity",
    categoryKo: "창의성 & 독창성",
    maxScore: 25,
    evaluate: (song, judge) => {
      let score = 10;

      // Tag diversity
      if (song.tags.length >= 3) score += 3;

      // Track variety
      const trackTypes = new Set(song.tracks.map((t) => t.type)).size;
      if (trackTypes >= 4) score += 4;
      else if (trackTypes >= 3) score += 2;

      // Instrument variety
      const instruments = new Set(song.tracks.map((t) => t.instrument)).size;
      if (instruments >= 4) score += 3;

      // Effects creativity
      const effectTypes = new Set(song.tracks.flatMap((t) => t.effects.map((e) => e.type))).size;
      if (effectTypes >= 4) score += 3;
      else if (effectTypes >= 2) score += 1;

      // Duration points
      if (song.duration >= 30) score += 2;

      if (judge.expertise.includes(song.genre)) score += 1;

      score = Math.min(Math.round(score * (1 - (judge.strictness - 0.5) * 0.3)), 25);

      const feedback =
        score >= 20 ? "매우 독창적이고 창의적인 곡입니다! 신선한 시도가 돋보여요." :
        score >= 15 ? "좋은 창의성을 보여주고 있습니다. 계속 실험해보세요!" :
        score >= 10 ? "조금 더 독특한 요소를 추가해보면 어떨까요?" :
        "좀 더 다양한 시도와 실험이 필요합니다.";

      return { score: Math.max(score, 3), feedback };
    },
  },
];

export function getAIJudges(): AIJudge[] {
  return AI_JUDGES;
}

export function judgeSubmission(song: Song, judgeId?: string): JudgeResult[] {
  const judges = judgeId ? AI_JUDGES.filter((j) => j.id === judgeId) : AI_JUDGES;

  return judges.map((judge) => {
    const scores: JudgeScore[] = SCORE_CATEGORIES.map((cat) => {
      const result = cat.evaluate(song, judge);
      return {
        category: cat.category,
        categoryKo: cat.categoryKo,
        score: result.score,
        maxScore: cat.maxScore,
        feedback: result.feedback,
      };
    });

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const maxTotalScore = scores.reduce((sum, s) => sum + s.maxScore, 0);

    const percentage = totalScore / maxTotalScore;
    const overallFeedback =
      percentage >= 0.85 ? `${judge.name}: 정말 놀라운 작품입니다! 프로페셔널한 완성도를 보여주고 있어요. 앞으로가 기대됩니다!` :
      percentage >= 0.7 ? `${judge.name}: 좋은 곡이에요! 몇 가지 부분만 보완하면 훌륭한 작품이 될 거예요.` :
      percentage >= 0.5 ? `${judge.name}: 가능성이 보이는 곡입니다. 몇 가지 개선점을 참고해서 더 발전시켜보세요!` :
      `${judge.name}: 기초적인 부분부터 차근차근 다져나가면 좋겠습니다. 포기하지 마세요!`;

    return {
      songId: song.id,
      totalScore,
      maxTotalScore,
      scores,
      overallFeedback,
      judgeName: judge.name,
      judgePersonality: judge.personality,
    };
  });
}

export function calculateFinalScore(results: JudgeResult[]): number {
  if (results.length === 0) return 0;
  const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
  const maxScore = results.reduce((sum, r) => sum + r.maxTotalScore, 0);
  return Math.round((totalScore / maxScore) * 100);
}
