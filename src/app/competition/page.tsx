"use client";

import { useState, useCallback } from "react";
import { Song, GENRE_INFO, JudgeResult, Genre } from "@/types/music";
import { getAIJudges, judgeSubmission, calculateFinalScore } from "@/lib/ai-judge";
import { composeFromRequest, parseNaturalLanguagePrompt } from "@/lib/ai-composer";
import AuthGuard from "@/components/AuthGuard";

type CompetitionTab = "submit" | "results" | "leaderboard";

interface LeaderboardEntry {
  rank: number;
  userName: string;
  songTitle: string;
  genre: Genre;
  finalScore: number;
}

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userName: "한별", songTitle: "서울의 밤", genre: "kpop", finalScore: 87 },
  { rank: 2, userName: "프로듀서K", songTitle: "Summer Wave", genre: "edm", finalScore: 82 },
  { rank: 3, userName: "DJ Luna", songTitle: "Midnight Dreams", genre: "lofi", finalScore: 78 },
  { rank: 4, userName: "록커짐", songTitle: "Thunder Road", genre: "rock", finalScore: 75 },
  { rank: 5, userName: "재즈매니아", songTitle: "Blue Note Cafe", genre: "jazz", finalScore: 71 },
];

export default function CompetitionPage() {
  return (
    <AuthGuard>
      <CompetitionContent />
    </AuthGuard>
  );
}

function CompetitionContent() {
  const [tab, setTab] = useState<CompetitionTab>("submit");
  const [prompt, setPrompt] = useState("");
  const [song, setSong] = useState<Song | null>(null);
  const [judgeResults, setJudgeResults] = useState<JudgeResult[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const judges = getAIJudges();

  const handleCompose = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsComposing(true);
    await new Promise((r) => setTimeout(r, 1500));

    const parsed = parseNaturalLanguagePrompt(prompt);
    const newSong = composeFromRequest({
      prompt,
      genre: parsed.genre || "pop",
      mood: parsed.mood,
      bpm: parsed.bpm,
      key: parsed.key,
      scale: parsed.scale,
      duration: 30,
    });
    setSong(newSong);
    setIsComposing(false);
    setJudgeResults([]);
    setFinalScore(null);
  }, [prompt]);

  const handleSubmitForJudging = useCallback(async () => {
    if (!song) return;
    setIsJudging(true);

    // Simulate sequential judging
    const results: JudgeResult[] = [];
    for (const judge of judges) {
      await new Promise((r) => setTimeout(r, 800));
      const [result] = judgeSubmission(song, judge.id);
      results.push(result);
      setJudgeResults([...results]);
    }

    const score = calculateFinalScore(results);
    setFinalScore(score);
    setIsJudging(false);
    setTab("results");
  }, [song, judges]);

  return (
    <div className="min-h-screen px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">AI 음악 경쟁</h1>
      <p className="text-gray-500 text-sm mb-6">
        음악을 만들고 AI 심사위원에게 평가받으세요!
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-dark-200 w-fit">
        {(["submit", "results", "leaderboard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-primary-500/20 text-primary-300" : "text-gray-500 hover:text-white"
            }`}
          >
            {t === "submit" ? "🎵 곡 제출" : t === "results" ? "📊 심사 결과" : "🏆 리더보드"}
          </button>
        ))}
      </div>

      {/* Submit Tab */}
      {tab === "submit" && (
        <div className="space-y-6">
          {/* AI Judges Introduction */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-gray-300 mb-4">AI 심사위원단</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {judges.map((judge) => (
                <div
                  key={judge.id}
                  className="p-4 rounded-xl bg-dark-100/50 border border-white/5 text-center"
                >
                  <div className="text-3xl mb-2">{judge.avatar}</div>
                  <div className="text-sm font-bold text-white">{judge.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                    {judge.personality}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {judge.expertise.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: GENRE_INFO[g].color + "15",
                          color: GENRE_INFO[g].color,
                        }}
                      >
                        {GENRE_INFO[g].labelKo}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compose for Competition */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">경쟁용 곡 만들기</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="심사위원에게 좋은 점수를 받을 수 있는 곡을 만들어보세요! 예: 감성적인 K-Pop 발라드, 피아노와 현악기 중심으로"
              className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-3 text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50 resize-none h-20 mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCompose}
                disabled={isComposing || !prompt.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500
                  text-white font-bold text-sm hover:from-primary-400 hover:to-accent-400
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isComposing ? "작곡 중..." : "🎵 작곡하기"}
              </button>
              {song && !isJudging && (
                <button
                  onClick={handleSubmitForJudging}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500
                    text-white font-bold text-sm hover:from-yellow-400 hover:to-orange-400 transition-all"
                >
                  🏆 심사 받기
                </button>
              )}
            </div>
          </div>

          {/* Song Preview */}
          {song && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: GENRE_INFO[song.genre].color + "15" }}
                >
                  {GENRE_INFO[song.genre].icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{song.title}</h4>
                  <div className="text-xs text-gray-500">
                    {GENRE_INFO[song.genre].labelKo} / {song.bpm} BPM / {song.key} {song.scale} / {song.tracks.length} 트랙
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Judging Animation */}
          {isJudging && (
            <div className="glass-card p-8 text-center">
              <div className="flex justify-center gap-4 mb-4">
                {judges.map((judge, i) => (
                  <div
                    key={judge.id}
                    className={`text-3xl transition-all duration-500 ${
                      i < judgeResults.length ? "opacity-100 scale-110" : "opacity-30 animate-pulse"
                    }`}
                  >
                    {judge.avatar}
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                {judgeResults.length < judges.length
                  ? `${judges[judgeResults.length]?.name}이(가) 심사 중...`
                  : "심사 완료!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {tab === "results" && (
        <div className="space-y-6">
          {finalScore !== null && (
            <div className="glass-card p-8 text-center">
              <div className="text-6xl font-bold gradient-text mb-2">{finalScore}</div>
              <div className="text-gray-400 text-sm">/ 100점</div>
              <div className="mt-4 text-lg">
                {finalScore >= 85 ? "🌟 놀라운 작품입니다!" :
                 finalScore >= 70 ? "👏 훌륭해요!" :
                 finalScore >= 50 ? "👍 좋은 시작이에요!" :
                 "💪 계속 도전하세요!"}
              </div>
            </div>
          )}

          {judgeResults.map((result, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{judges[i]?.avatar}</span>
                <div>
                  <div className="text-base font-bold text-white">{result.judgeName}</div>
                  <div className="text-xs text-gray-500">{result.judgePersonality}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-lg font-bold text-primary-300">
                    {result.totalScore}/{result.maxTotalScore}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {result.scores.map((score, j) => (
                  <div key={j}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">{score.categoryKo}</span>
                      <span className="text-white font-medium">
                        {score.score}/{score.maxScore}
                      </span>
                    </div>
                    <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400 transition-all duration-500"
                        style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{score.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-dark-100/50 text-sm text-gray-400">
                {result.overallFeedback}
              </div>
            </div>
          ))}

          {judgeResults.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-500">아직 심사 결과가 없습니다. 곡을 제출해주세요!</p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {tab === "leaderboard" && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-gray-300">이번 주 랭킹</h3>
          </div>
          <div className="divide-y divide-white/5">
            {SAMPLE_LEADERBOARD.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    entry.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                    entry.rank === 2 ? "bg-gray-400/20 text-gray-300" :
                    entry.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                    "bg-dark-100 text-gray-500"
                  }`}
                >
                  {entry.rank}
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: GENRE_INFO[entry.genre].color + "15" }}
                >
                  {GENRE_INFO[entry.genre].icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{entry.songTitle}</div>
                  <div className="text-xs text-gray-500">{entry.userName}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-300">{entry.finalScore}</div>
                  <div className="text-[10px] text-gray-600">/ 100</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
