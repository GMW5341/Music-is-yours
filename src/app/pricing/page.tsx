"use client";

import { useState } from "react";
import {
  SUBSCRIPTION_PLANS,
  CREDIT_PACKS,
  SubscriptionTier,
  BillingCycle,
  formatKRW,
  getUserSubscription,
  simulateUpgrade,
  simulateCreditPurchase,
} from "@/lib/subscription";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(getUserSubscription().tier);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleUpgrade = (tierId: SubscriptionTier) => {
    simulateUpgrade(tierId, billingCycle);
    setCurrentTier(tierId);
    setShowConfirm(null);
  };

  const handleBuyCredits = (packId: string) => {
    simulateCreditPurchase(packId);
    setShowConfirm(null);
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
          당신의 음악, 더 크게
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          무료로 시작하고, 필요할 때 업그레이드하세요.
          모든 플랜은 웹과 앱에서 동일하게 사용 가능합니다.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            billingCycle === "monthly"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "text-gray-500 hover:text-white"
          }`}
        >
          월간 결제
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
            billingCycle === "yearly"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "text-gray-500 hover:text-white"
          }`}
        >
          연간 결제
          <span className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            ~20% 할인
          </span>
        </button>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = currentTier === plan.id;
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyMonthly;

          return (
            <div
              key={plan.id}
              className={`glass-card p-5 relative flex flex-col ${
                plan.popular ? "border-primary-500/40 neon-glow" : ""
              } ${isCurrentPlan ? "ring-2 ring-green-500/40" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-primary-500 text-white font-bold">
                  MOST POPULAR
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-3 text-[10px] px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  현재 플랜
                </div>
              )}

              <div className="text-center mb-4">
                <span className="text-3xl">{plan.icon}</span>
                <h3 className="text-lg font-bold text-white mt-2">{plan.nameKo}</h3>
                <p className="text-[11px] text-gray-500">{plan.tagline}</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold" style={{ color: plan.color }}>
                  {formatKRW(price)}
                </div>
                {price > 0 && <div className="text-[10px] text-gray-600">/ 월</div>}
                {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                  <div className="text-[10px] text-gray-600 mt-1">
                    연 {formatKRW(plan.yearlyPrice)}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 space-y-2 mb-4">
                <Feature
                  text={plan.features.compositionsPerMonth === -1 ? "무제한 작곡" : `월 ${plan.features.compositionsPerMonth}곡 작곡`}
                  included
                />
                <Feature
                  text={`최대 ${plan.features.maxTrackLayers}트랙 레이어`}
                  included
                />
                <Feature
                  text={plan.features.genresAvailable === -1 ? "전체 31개 장르" : `${plan.features.genresAvailable}개 장르`}
                  included
                />
                <Feature
                  text={`곡 길이 ${plan.features.maxSongDuration}초`}
                  included
                />
                <Feature
                  text={plan.features.referenceTracks === -1 ? "무제한 레퍼런스" : `레퍼런스 ${plan.features.referenceTracks}곡`}
                  included
                />
                <Feature
                  text="AI 심사 상세 피드백"
                  included={plan.features.aiJudgeDetailed}
                />
                <Feature
                  text="개인화 AI 파인튜닝"
                  included={plan.features.customAITraining}
                />
                <Feature
                  text="상업적 이용 라이선스"
                  included={plan.features.commercialLicense}
                />
                <Feature
                  text="우선 생성 큐"
                  included={plan.features.priorityGeneration}
                />
                <Feature
                  text="API 접근"
                  included={plan.features.apiAccess}
                />
              </div>

              <button
                onClick={() => isCurrentPlan ? null : setShowConfirm(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isCurrentPlan
                    ? "bg-green-500/10 text-green-400 cursor-default"
                    : plan.popular
                      ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-400 hover:to-accent-400"
                      : "glass-button text-white"
                }`}
              >
                {isCurrentPlan ? "현재 사용 중" : plan.monthlyPrice === 0 ? "무료 시작" : "업그레이드"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Credit Packs */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-white text-center mb-2">크레딧 충전</h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          월간 한도를 넘겼을 때 크레딧으로 추가 작곡하세요. 1크레딧 = 1곡.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`glass-card p-4 text-center ${pack.popular ? "border-primary-500/30" : ""}`}
            >
              {pack.popular && (
                <div className="text-[9px] text-primary-300 font-bold mb-1">BEST VALUE</div>
              )}
              <div className="text-2xl font-bold text-white">{pack.credits}</div>
              <div className="text-xs text-gray-500">크레딧</div>
              {pack.bonus > 0 && (
                <div className="text-[10px] text-green-400 mt-1">+{pack.bonus} 보너스</div>
              )}
              <div className="text-sm font-bold text-primary-300 mt-2">{formatKRW(pack.price)}</div>
              <div className="text-[10px] text-gray-600">
                개당 {formatKRW(Math.round(pack.price / (pack.credits + pack.bonus)))}
              </div>
              <button
                onClick={() => handleBuyCredits(pack.id)}
                className="w-full mt-3 py-2 rounded-lg glass-button text-xs font-medium"
              >
                구매
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* B2B Section */}
      <div className="glass-card p-8 text-center mb-16">
        <h2 className="text-xl font-bold text-white mb-2">기업/스튜디오용 맞춤 솔루션</h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto mb-4">
          게임 사운드트랙, 광고 음악, 콘텐츠 제작사를 위한 B2B API 라이선싱.
          대량 생성, 전용 모델 학습, SLA 보장, 온프레미스 배포 가능.
        </p>
        <button className="glass-button text-sm font-bold px-6 py-3">
          영업팀 문의하기
        </button>
      </div>

      {/* Business Model Summary */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-sm font-bold text-white mb-4">수익 모델 구조</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RevenueCard
            title="구독 수익 (SaaS)"
            percent="60%"
            desc="Free → Starter → Pro → Studio 전환율 최적화. 연간 결제 유도로 LTV 극대화."
          />
          <RevenueCard
            title="크레딧 인앱결제"
            percent="25%"
            desc="Free 사용자의 월 한도 초과 시 크레딧 구매. 경쟁 시즌/이벤트 시 수요 급증."
          />
          <RevenueCard
            title="B2B API & 라이선싱"
            percent="15%"
            desc="게임사/광고사/콘텐츠 기업의 대량 음악 생성 API. 전용 모델 학습 프리미엄."
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-white mb-2">플랜 변경 확인</h3>
            <p className="text-sm text-gray-400 mb-4">
              {SUBSCRIPTION_PLANS.find((p) => p.id === showConfirm)?.nameKo} 플랜으로 변경하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2 rounded-xl glass-button text-sm"
              >
                취소
              </button>
              <button
                onClick={() => handleUpgrade(showConfirm as SubscriptionTier)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-sm"
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Feature({ text, included }: { text: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={included ? "text-green-400" : "text-gray-700"}>
        {included ? "✓" : "—"}
      </span>
      <span className={included ? "text-gray-300" : "text-gray-700"}>{text}</span>
    </div>
  );
}

function RevenueCard({ title, percent, desc }: { title: string; percent: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-dark-100/50 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white">{title}</span>
        <span className="text-lg font-bold gradient-text">{percent}</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
