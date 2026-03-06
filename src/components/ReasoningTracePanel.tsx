"use client";

import { LLMComposeContext } from "@/lib/llm-bridge";
import { GENRE_INFO, Genre } from "@/types/music";

interface ReasoningTracePanelProps {
  context: LLMComposeContext;
  onClose: () => void;
}

const PHASE_ICONS: Record<string, string> = {
  intent_parsing: "🧠",
  knowledge_query: "📚",
  personalization: "🧬",
  fusion: "⚡",
  generation: "🎵",
};

const PHASE_LABELS: Record<string, string> = {
  intent_parsing: "의도 분석",
  knowledge_query: "지식 그래프 검색",
  personalization: "개인화 블렌딩",
  fusion: "파라미터 융합",
  generation: "작곡 생성",
};

export default function ReasoningTracePanel({ context, onClose }: ReasoningTracePanelProps) {
  return (
    <div className="glass-card p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          🧠 AI 추론 과정
          <span className="text-[10px] text-gray-500 font-normal">
            자연어 → 지식 객체 → 개인화 → 작곡까지의 과정
          </span>
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>

      {/* Reasoning Steps */}
      <div className="space-y-3 mb-6">
        {context.reasoningTrace.map((step) => (
          <div key={step.step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-sm">
                {PHASE_ICONS[step.phase] || "📌"}
              </div>
              {step.step < context.reasoningTrace.length && (
                <div className="w-px h-full bg-primary-500/20 my-1" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="text-xs font-medium text-primary-300 mb-0.5">
                Step {step.step}: {PHASE_LABELS[step.phase] || step.phase}
              </div>
              <div className="text-xs text-gray-400">{step.descriptionKo}</div>
              {step.data && (
                <div className="mt-1 text-[10px] text-gray-600 bg-dark-100/50 rounded-lg p-2">
                  {Object.entries(step.data).map(([key, val]) => (
                    <span key={key} className="mr-3">
                      {key}: {typeof val === "object" ? JSON.stringify(val).slice(0, 60) : String(val)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Related References */}
      {context.relatedReferences.length > 0 && (
        <div className="border-t border-white/5 pt-4">
          <h4 className="text-xs text-gray-500 mb-3">참조된 레퍼런스 곡</h4>
          <div className="space-y-2">
            {context.relatedReferences.map((ref, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-dark-100/30">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: GENRE_INFO[ref.genre]?.color + "15" }}
                >
                  {GENRE_INFO[ref.genre]?.icon || "🎵"}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white">{ref.title}</div>
                  <div className="text-[10px] text-gray-500">{ref.artist}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-primary-400">
                    {(ref.relevanceScore * 100).toFixed(0)}% 관련
                  </div>
                  <div className="text-[10px] text-gray-600">{ref.matchReason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalization Info */}
      <div className="border-t border-white/5 pt-4 mt-4">
        <h4 className="text-xs text-gray-500 mb-3">개인화 파라미터</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoCard
            label="개인화 수준"
            value={`${(context.personalizedParams.personalizationLevel * 100).toFixed(0)}%`}
          />
          <InfoCard
            label="지식 신뢰도"
            value={`${(context.personalizedParams.knowledgeConfidence * 100).toFixed(0)}%`}
          />
          <InfoCard
            label="밝기 타겟"
            value={`${(context.personalizedParams.timbreTarget.brightness * 100).toFixed(0)}%`}
          />
          <InfoCard
            label="따뜻함 타겟"
            value={`${(context.personalizedParams.timbreTarget.warmth * 100).toFixed(0)}%`}
          />
        </div>
        <p className="text-[10px] text-gray-600 mt-2">
          근거: {context.personalizedParams.sourceDescription}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-dark-100/30 text-center">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="text-sm font-bold text-white mt-0.5">{value}</div>
    </div>
  );
}
