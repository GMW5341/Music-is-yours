"use client";

import { useState, useCallback } from "react";
import { Genre, GENRE_INFO } from "@/types/music";
import { ReferenceTrackInput } from "@/lib/reference-analyzer";
import {
  startBatchIngest,
  getAdminStats,
  adminAddTrack,
  AdminIngestJob,
  AdminStats,
  COMMERCIAL_SONG_CATALOG,
  IngestResult,
} from "@/lib/admin-pipeline";
import { getKnowledgeGraph } from "@/lib/knowledge-plane";

const ALL_GENRES = Object.entries(GENRE_INFO) as [Genre, typeof GENRE_INFO[Genre]][];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [lastJob, setLastJob] = useState<AdminIngestJob | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [customGenre, setCustomGenre] = useState<Genre>("pop");
  const [customBpm, setCustomBpm] = useState("");
  const [customKey, setCustomKey] = useState("C");
  const [customScale, setCustomScale] = useState("major");
  const [recentAdds, setRecentAdds] = useState<IngestResult[]>([]);
  const [tab, setTab] = useState<"overview" | "ingest" | "custom" | "knowledge">("overview");

  const refreshStats = useCallback(() => {
    setStats(getAdminStats());
  }, []);

  // 시중 노래 일괄 인제스트
  const handleBatchIngest = useCallback(async () => {
    setIsIngesting(true);
    await new Promise((r) => setTimeout(r, 500));

    const job = startBatchIngest();
    setLastJob(job);
    setIsIngesting(false);
    refreshStats();
  }, [refreshStats]);

  // 커스텀 트랙 추가
  const handleAddCustom = useCallback(() => {
    if (!customTitle.trim() || !customArtist.trim()) return;

    const result = adminAddTrack({
      title: customTitle.trim(),
      artist: customArtist.trim(),
      genre: customGenre,
      bpm: customBpm ? parseInt(customBpm) : undefined,
      key: customKey as ReferenceTrackInput["key"],
      scale: customScale as ReferenceTrackInput["scale"],
    });

    setRecentAdds((prev) => [result, ...prev.slice(0, 19)]);
    setCustomTitle("");
    setCustomArtist("");
    setCustomBpm("");
    refreshStats();
  }, [customTitle, customArtist, customGenre, customBpm, customKey, customScale, refreshStats]);

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">관리자 대시보드</h1>
          <p className="text-xs text-gray-500 mt-1">AI 모델 학습 데이터 관리 및 지식 그래프 모니터링</p>
        </div>
        <button onClick={refreshStats} className="glass-button text-xs">
          🔄 통계 새로고침
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-dark-200 w-fit">
        {(["overview", "ingest", "custom", "knowledge"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (!stats) refreshStats(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-primary-500/20 text-primary-300" : "text-gray-500 hover:text-white"
            }`}
          >
            {t === "overview" ? "📊 개요" : t === "ingest" ? "📥 일괄 인제스트" : t === "custom" ? "➕ 개별 추가" : "🧠 지식 그래프"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          {!stats ? (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-500 mb-4">통계를 로드하려면 새로고침하세요</p>
              <button onClick={refreshStats} className="glass-button text-sm">📊 통계 로드</button>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard label="총 지식 객체" value={stats.totalKnowledgeObjects} icon="📚" />
                <MetricCard label="평균 신뢰도" value={`${(stats.avgConfidence * 100).toFixed(0)}%`} icon="🎯" />
                <MetricCard label="모델 건강" value={`${(stats.modelHealth.overallScore * 100).toFixed(0)}%`} icon="💚" />
                <MetricCard label="장르 커버리지" value={`${(stats.modelHealth.genreCoverage * 100).toFixed(0)}%`} icon="🌍" />
              </div>

              {/* Model Health */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4">모델 건강 상태</h3>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">전체 건강도</span>
                    <span className="text-white">{(stats.modelHealth.overallScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-dark-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stats.modelHealth.overallScore > 0.7 ? "bg-green-500" :
                        stats.modelHealth.overallScore > 0.4 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${stats.modelHealth.overallScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">장르당 최소 샘플</span>
                    <div className="text-white font-bold">{stats.modelHealth.minSamplesPerGenre}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">장르당 평균 샘플</span>
                    <div className="text-white font-bold">{stats.modelHealth.avgSamplesPerGenre}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">부족한 장르</span>
                    <div className="text-orange-400 font-bold">{stats.modelHealth.underrepresentedGenres.length}개</div>
                  </div>
                </div>

                {stats.modelHealth.recommendations.length > 0 && (
                  <div className="mt-4 space-y-1">
                    <span className="text-xs text-gray-500">권장 사항:</span>
                    {stats.modelHealth.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs text-yellow-400/80 flex items-center gap-2">
                        <span>⚠️</span>{rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Genre Breakdown */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4">장르별 데이터 분포</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {(Object.entries(stats.genreBreakdown) as [string, number][])
                    .sort((a, b) => b[1] - a[1])
                    .map(([genre, count]) => (
                      <div
                        key={genre}
                        className="p-2 rounded-lg text-center"
                        style={{ backgroundColor: GENRE_INFO[genre as Genre]?.color + "10" }}
                      >
                        <span className="text-lg">{GENRE_INFO[genre as Genre]?.icon}</span>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {GENRE_INFO[genre as Genre]?.labelKo || genre}
                        </div>
                        <div className="text-sm font-bold text-white">{count}</div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Batch Ingest Tab */}
      {tab === "ingest" && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-2">시중 노래 일괄 인제스트</h3>
            <p className="text-xs text-gray-500 mb-4">
              사전 정의된 {COMMERCIAL_SONG_CATALOG.length}개 상업 노래의 메타데이터를 분석하여
              지식 그래프에 추가합니다. AI 모델의 기본 수준을 높여줍니다.
            </p>

            <div className="mb-4 max-h-60 overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {COMMERCIAL_SONG_CATALOG.map((track, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded text-xs">
                    <span>{GENRE_INFO[track.genre]?.icon}</span>
                    <span className="text-gray-400 truncate">{track.title}</span>
                    <span className="text-gray-600">- {track.artist}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleBatchIngest}
              disabled={isIngesting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500
                text-white font-bold text-sm disabled:opacity-40 transition-all"
            >
              {isIngesting ? "인제스트 중..." : `📥 ${COMMERCIAL_SONG_CATALOG.length}곡 일괄 인제스트`}
            </button>
          </div>

          {/* Job Result */}
          {lastJob && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3">인제스트 결과</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{lastJob.processedTracks - lastJob.failedTracks}</div>
                  <div className="text-xs text-gray-500">성공</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{lastJob.failedTracks}</div>
                  <div className="text-xs text-gray-500">실패</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{lastJob.totalTracks}</div>
                  <div className="text-xs text-gray-500">전체</div>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1">
                {lastJob.results.map((result, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={result.status === "success" ? "text-green-500" : "text-red-500"}>
                      {result.status === "success" ? "✓" : "✕"}
                    </span>
                    <span className="text-gray-400">{result.title}</span>
                    <span className="text-gray-600">{result.artist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Add Tab */}
      {tab === "custom" && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">개별 트랙 추가</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="곡 제목"
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50"
            />
            <input
              type="text"
              value={customArtist}
              onChange={(e) => setCustomArtist(e.target.value)}
              placeholder="아티스트"
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <select
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value as Genre)}
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              {ALL_GENRES.map(([g, info]) => (
                <option key={g} value={g}>{info.icon} {info.labelKo}</option>
              ))}
            </select>
            <input
              type="number"
              value={customBpm}
              onChange={(e) => setCustomBpm(e.target.value)}
              placeholder="BPM"
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                placeholder-gray-600 focus:outline-none"
            />
            <select
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              value={customScale}
              onChange={(e) => setCustomScale(e.target.value)}
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              {["major", "minor", "dorian", "mixolydian", "pentatonic", "blues", "harmonic_minor", "melodic_minor"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddCustom}
            disabled={!customTitle.trim() || !customArtist.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500
              text-white font-bold text-sm disabled:opacity-40 transition-all"
          >
            ➕ 지식 그래프에 추가
          </button>

          {recentAdds.length > 0 && (
            <div className="mt-4 space-y-1">
              <h4 className="text-xs text-gray-500">최근 추가</h4>
              {recentAdds.map((result, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={result.status === "success" ? "text-green-500" : "text-red-500"}>
                    {result.status === "success" ? "✓" : "✕"}
                  </span>
                  <span className="text-gray-400">{result.title}</span>
                  <span className="text-gray-600">{result.artist}</span>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px]"
                    style={{ backgroundColor: GENRE_INFO[result.genre]?.color + "15", color: GENRE_INFO[result.genre]?.color }}
                  >
                    {GENRE_INFO[result.genre]?.labelKo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Knowledge Graph Tab */}
      {tab === "knowledge" && (
        <div className="space-y-6">
          {!stats ? (
            <div className="glass-card p-12 text-center">
              <button onClick={refreshStats} className="glass-button text-sm">📊 지식 그래프 로드</button>
            </div>
          ) : (
            <>
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4">장르별 지식 프로파일</h3>
                {stats.genreProfiles.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    데이터가 없습니다. 먼저 일괄 인제스트를 실행해주세요.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.genreProfiles.map((profile) => (
                      <div
                        key={profile.genre}
                        className="p-4 rounded-xl border border-white/5"
                        style={{ backgroundColor: GENRE_INFO[profile.genre]?.color + "05" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{GENRE_INFO[profile.genre]?.icon}</span>
                          <div>
                            <div className="text-sm font-bold text-white">
                              {GENRE_INFO[profile.genre]?.labelKo}
                            </div>
                            <div className="text-[10px] text-gray-500">{profile.sampleCount}곡 분석</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-gray-500">평균 BPM</span>
                            <div className="text-white font-medium">{Math.round(profile.avgBpm)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">BPM 범위</span>
                            <div className="text-white font-medium">{profile.bpmRange.min}~{profile.bpmRange.max}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">주요 키</span>
                            <div className="text-white font-medium">{profile.dominantKey} {profile.dominantScale}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">화성 복잡도</span>
                            <div className="text-white font-medium">{(profile.avgHarmonicComplexity * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">밝기</span>
                            <div className="text-white font-medium">{(profile.avgBrightness * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">따뜻함</span>
                            <div className="text-white font-medium">{(profile.avgWarmth * 100).toFixed(0)}%</div>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {profile.commonTags.slice(0, 5).map((tag) => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-dark-100 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
