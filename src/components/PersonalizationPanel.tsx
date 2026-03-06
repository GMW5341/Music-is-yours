"use client";

import { useState } from "react";
import { getUserProfile } from "@/lib/user-fine-tuning";
import { ReferenceAnalysisSummary } from "@/lib/user-fine-tuning";

interface PersonalizationPanelProps {
  userId: string;
  summary: ReferenceAnalysisSummary | null;
  onFeedback: (rating: number, liked: string[], disliked: string[]) => void;
  onClose: () => void;
}

const LIKE_OPTIONS = [
  "더 밝게", "더 따뜻하게", "베이스 강하게", "리듬 복잡하게",
  "리버브 더", "스테레오 넓게", "더 신나게", "멜로디 다양하게",
];

const DISLIKE_OPTIONS = [
  "너무 단조로워", "리버브 과함", "너무 시끄러워", "너무 어두워",
  "밋밋해", "리듬 단순해", "베이스 약해", "고음 거슬려",
];

export default function PersonalizationPanel({ userId, summary, onFeedback, onClose }: PersonalizationPanelProps) {
  const [rating, setRating] = useState(3);
  const [selectedLikes, setSelectedLikes] = useState<string[]>([]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const profile = getUserProfile(userId);
  const pref = profile.preferenceVector;

  const handleSubmit = () => {
    onFeedback(rating, selectedLikes, selectedDislikes);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setSelectedLikes([]);
    setSelectedDislikes([]);
  };

  const toggleLike = (item: string) => {
    setSelectedLikes((prev) => prev.includes(item) ? prev.filter((l) => l !== item) : [...prev, item]);
  };

  const toggleDislike = (item: string) => {
    setSelectedDislikes((prev) => prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]);
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          🧬 개인화 프로파일
          <span className="text-[10px] text-gray-500 font-normal">
            피드백을 줄수록 AI가 당신의 취향에 맞춰집니다
          </span>
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 현재 선호도 시각화 */}
        <div>
          <h4 className="text-xs text-gray-500 mb-3">현재 학습된 선호도</h4>

          <div className="space-y-2">
            <PrefBar label="밝기" value={pref.brightnessPreference} leftLabel="어두움" rightLabel="밝음" />
            <PrefBar label="따뜻함" value={pref.warmthPreference} leftLabel="차가움" rightLabel="따뜻함" />
            <PrefBar label="깊이" value={pref.depthPreference} leftLabel="얕음" rightLabel="깊음" />
            <PrefBar label="리듬 복잡도" value={pref.rhythmComplexity} leftLabel="단순" rightLabel="복잡" />
            <PrefBar label="화성 복잡도" value={pref.harmonicComplexity} leftLabel="단순" rightLabel="복잡" />
            <PrefBar label="반복 선호" value={pref.repetitionPreference} leftLabel="다양" rightLabel="반복" />
            <PrefBar label="리버브" value={pref.reverbAmount} leftLabel="드라이" rightLabel="웻" />
            <PrefBar label="스테레오" value={pref.stereoWidth} leftLabel="좁음" rightLabel="넓음" />
            <PrefBar label="압축" value={pref.compressionAmount} leftLabel="투명" rightLabel="강함" />
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="text-gray-500">모델 상태:</span>
            <span className={`px-2 py-0.5 rounded-full ${
              profile.tuningState.maturityLevel === "expert" ? "bg-green-500/20 text-green-400" :
              profile.tuningState.maturityLevel === "personalized" ? "bg-blue-500/20 text-blue-400" :
              profile.tuningState.maturityLevel === "calibrated" ? "bg-yellow-500/20 text-yellow-400" :
              profile.tuningState.maturityLevel === "learning" ? "bg-orange-500/20 text-orange-400" :
              "bg-gray-500/20 text-gray-400"
            }`}>
              {profile.tuningState.maturityLevel}
            </span>
            <span className="text-gray-600">
              수렴도: {(profile.tuningState.convergenceScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="mt-2 text-[10px] text-gray-600">
            레퍼런스: {profile.tuningState.totalReferences}곡 /
            작곡: {profile.tuningState.totalCompositions}회 /
            피드백: {profile.tuningState.totalFeedbacks}회
          </div>
        </div>

        {/* 피드백 폼 */}
        <div>
          <h4 className="text-xs text-gray-500 mb-3">피드백으로 파인튜닝</h4>

          {/* 별점 */}
          <div className="mb-4">
            <span className="text-xs text-gray-400 block mb-2">지금 생성된 곡은 어떤가요?</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-all ${star <= rating ? "opacity-100" : "opacity-30"}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* 좋아요 옵션 */}
          <div className="mb-4">
            <span className="text-xs text-gray-400 block mb-2">다음에 더 했으면 좋겠어요:</span>
            <div className="flex flex-wrap gap-1.5">
              {LIKE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleLike(opt)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedLikes.includes(opt)
                      ? "bg-green-500/20 border-green-500/40 text-green-300"
                      : "bg-dark-100 border-white/5 text-gray-500 hover:border-green-500/20"
                  }`}
                >
                  {selectedLikes.includes(opt) ? "✓ " : "+ "}{opt}
                </button>
              ))}
            </div>
          </div>

          {/* 싫어요 옵션 */}
          <div className="mb-4">
            <span className="text-xs text-gray-400 block mb-2">이건 덜 했으면 좋겠어요:</span>
            <div className="flex flex-wrap gap-1.5">
              {DISLIKE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleDislike(opt)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedDislikes.includes(opt)
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : "bg-dark-100 border-white/5 text-gray-500 hover:border-red-500/20"
                  }`}
                >
                  {selectedDislikes.includes(opt) ? "✓ " : "- "}{opt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitted}
            className={`w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              submitted
                ? "bg-green-500/20 text-green-400"
                : "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
            }`}
          >
            {submitted ? "✓ 피드백 반영 완료!" : "📝 피드백 제출 & 모델 업데이트"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PrefBar({ label, value, leftLabel, rightLabel }: {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-20 text-right">{label}</span>
      <span className="text-[8px] text-gray-600 w-10 text-right">{leftLabel}</span>
      <div className="flex-1 h-2 bg-dark-200 rounded-full relative overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-400 transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
        <div
          className="absolute top-0 w-1 h-full bg-white/50 rounded-full"
          style={{ left: `${value * 100}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <span className="text-[8px] text-gray-600 w-10">{rightLabel}</span>
      <span className="text-[10px] text-gray-400 w-8 text-right">{(value * 100).toFixed(0)}</span>
    </div>
  );
}
