"use client";

import { useState } from "react";
import { Genre, GENRE_INFO } from "@/types/music";
import { ReferenceTrackInput } from "@/lib/reference-analyzer";
import { ReferenceAnalysisSummary } from "@/lib/user-fine-tuning";

interface ReferencePanelProps {
  onAddReference: (input: ReferenceTrackInput) => void;
  summary: ReferenceAnalysisSummary | null;
  onClose: () => void;
}

const ALL_GENRES = Object.entries(GENRE_INFO) as [Genre, typeof GENRE_INFO[Genre]][];

export default function ReferencePanel({ onAddReference, summary, onClose }: ReferencePanelProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState<Genre>("pop");
  const [bpm, setBpm] = useState("");
  const [description, setDescription] = useState("");
  const [addedCount, setAddedCount] = useState(0);

  const handleSubmit = () => {
    if (!title.trim() || !artist.trim()) return;

    onAddReference({
      title: title.trim(),
      artist: artist.trim(),
      genre,
      bpm: bpm ? parseInt(bpm) : undefined,
      description: description || undefined,
      tags: [],
    });

    setAddedCount((c) => c + 1);
    setTitle("");
    setArtist("");
    setBpm("");
    setDescription("");
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          📎 레퍼런스 트랙 분석
          <span className="text-[10px] text-gray-500 font-normal">
            좋아하는 곡을 추가하면 AI가 음악적 DNA를 분석하여 작곡에 반영합니다
          </span>
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 폼 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="곡 제목"
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50"
            />
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="아티스트"
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                focus:outline-none focus:border-primary-500/50"
            >
              {ALL_GENRES.map(([g, info]) => (
                <option key={g} value={g}>{info.icon} {info.labelKo}</option>
              ))}
            </select>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="BPM (선택)"
              className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 곡의 어떤 점이 좋은지 설명 (선택)"
            className="w-full bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
              placeholder-gray-600 focus:outline-none focus:border-primary-500/50"
          />

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !artist.trim()}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500
              text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            🔬 레퍼런스 분석 & 추가 ({addedCount}곡 추가됨)
          </button>
        </div>

        {/* 분석 요약 */}
        <div>
          {summary ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">분석된 레퍼런스</span>
                <span className="text-sm font-bold text-primary-300">{summary.totalReferences}곡</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">모델 성숙도</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  summary.maturityLevel === "expert" ? "bg-green-500/20 text-green-400" :
                  summary.maturityLevel === "personalized" ? "bg-blue-500/20 text-blue-400" :
                  summary.maturityLevel === "calibrated" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-gray-500/20 text-gray-400"
                }`}>
                  {summary.maturityLevel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">일관성 점수</span>
                <span className="text-sm text-white">{(summary.consistencyScore * 100).toFixed(0)}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">평균 BPM</span>
                <span className="text-sm text-white">{summary.avgBpm}</span>
              </div>

              {/* 장르 분포 */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">장르 분포</span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(summary.genreDistribution).map(([g, count]) => (
                    <span
                      key={g}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: GENRE_INFO[g as Genre]?.color + "15",
                        color: GENRE_INFO[g as Genre]?.color,
                      }}
                    >
                      {GENRE_INFO[g as Genre]?.labelKo || g} x{count}
                    </span>
                  ))}
                </div>
              </div>

              {/* 감정 벡터 시각화 */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">감정 프로파일</span>
                <div className="space-y-1">
                  {Object.entries(summary.avgEmotionVector).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-14">{key}</span>
                      <div className="flex-1 h-1.5 bg-dark-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full"
                          style={{ width: `${Math.max(0, Math.min(1, value as number)) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 w-8 text-right">{((value as number) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-500 text-sm mb-2">아직 레퍼런스가 없습니다</p>
                <p className="text-gray-600 text-xs">
                  좋아하는 곡을 추가하면<br />AI가 음악적 DNA를 분석합니다
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DNA 분해 요소 미리보기 */}
      {summary && summary.decomposition && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <h4 className="text-xs text-gray-500 mb-3">분해된 음악적 요소 (DNA)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <DNACard label="리듬" count={summary.decomposition.rhythmPatterns.length} icon="🥁" />
            <DNACard label="화성" count={summary.decomposition.harmonyPatterns.length} icon="🎶" />
            <DNACard label="멜로디" count={summary.decomposition.melodyCharacteristics.length} icon="🎵" />
            <DNACard label="음색" count={summary.decomposition.timbreProfiles.length} icon="🎨" />
            <DNACard label="프로덕션" count={summary.decomposition.productionStyles.length} icon="🎛️" />
          </div>
        </div>
      )}
    </div>
  );
}

function DNACard({ label, count, icon }: { label: string; count: number; icon: string }) {
  return (
    <div className="p-2 rounded-lg bg-dark-100/50 border border-white/5 text-center">
      <span className="text-lg">{icon}</span>
      <div className="text-[10px] text-gray-400 mt-1">{label}</div>
      <div className="text-xs font-bold text-primary-300">{count}개 패턴</div>
    </div>
  );
}
