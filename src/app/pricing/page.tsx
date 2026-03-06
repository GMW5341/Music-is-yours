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
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(() => {
    try {
      return getUserSubscription().tier;
    } catch {
      return "free";
    }
  });
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [purchasedCredits, setPurchasedCredits] = useState<string | null>(null);

  const handleUpgrade = (tierId: SubscriptionTier) => {
    simulateUpgrade(tierId, billingCycle);
    setCurrentTier(tierId);
    setShowConfirm(null);
  };

  const handleBuyCredits = (packId: string) => {
    simulateCreditPurchase(packId);
    setPurchasedCredits(packId);
    setTimeout(() => setPurchasedCredits(null), 2000);
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
          무료로 충분히 즐기세요
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
          매달 15곡까지 무료로 만들 수 있어요. 더 많이 만들고 싶을 때만 업그레이드하면 됩니다.
        </p>
      </div>

      {/* Free tier highlight */}
      <div className="glass-card p-6 mb-10 border-green-500/20 bg-green-500/5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl">🎵</div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-white mb-1">무료 플랜으로 할 수 있는 것들</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center sm:justify-start text-sm text-gray-300">
              <span>매달 15곡 작곡</span>
              <span>모든 장르 사용</span>
              <span>6트랙 레이어</span>
              <span>60초 곡 길이</span>
              <span>커뮤니티 공유</span>
              <span>가입 시 보너스 10크레딧</span>
            </div>
          </div>
          {!isAuthenticated && (
            <Link
              href="/auth"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all whitespace-nowrap"
            >
              무료로 시작하기
            </Link>
          )}
        </div>
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
          const price =
            billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyMonthly;

          return (
            <div
              key={plan.id}
              className={`glass-card p-5 relative flex flex-col ${
                plan.popular ? "border-primary-500/40 neon-glow" : ""
              } ${isCurrentPlan ? "ring-2 ring-green-500/40" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-primary-500 text-white font-bold">
                  인기
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-3 text-[10px] px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  현재 플랜
                </div>
              )}

              <div className="text-center mb-4">
                <span className="text-3xl">{plan.icon}</span>
                <h3 className="text-lg font-bold text-white mt-2">
                  {plan.nameKo}
                </h3>
                <p className="text-[11px] text-gray-500">{plan.tagline}</p>
              </div>

              <div className="text-center mb-4">
                <div
                  className="text-2xl font-bold"
                  style={{ color: plan.color }}
                >
                  {formatKRW(price)}
                </div>
                {price > 0 && (
                  <div className="text-[10px] text-gray-600">/ 월</div>
                )}
                {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                  <div className="text-[10px] text-gray-600 mt-1">
                    연 {formatKRW(plan.yearlyPrice)}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 space-y-2 mb-4">
                <Feature
                  text={
                    plan.features.compositionsPerMonth === -1
                      ? "무제한 작곡"
                      : `월 ${plan.features.compositionsPerMonth}곡 작곡`
                  }
                  included
                  highlight={plan.id === "free"}
                />
                <Feature
                  text={`최대 ${plan.features.maxTrackLayers}트랙 레이어`}
                  included
                />
                <Feature
                  text={
                    plan.features.genresAvailable === -1
                      ? "전체 장르"
                      : `${plan.features.genresAvailable}개 장르`
                  }
                  included
                />
                <Feature
                  text={`곡 길이 ${plan.features.maxSongDuration}초`}
                  included
                />
                <Feature
                  text="AI 심사 상세 피드백"
                  included={plan.features.aiJudgeDetailed}
                />
                <Feature
                  text="고음질 내보내기 (WAV/FLAC)"
                  included={plan.features.exportFormats.length > 1}
                />
                <Feature
                  text="개인화 AI 튜닝"
                  included={plan.features.customAITraining}
                />
                <Feature
                  text="상업적 이용"
                  included={plan.features.commercialLicense}
                />
              </div>

              <button
                onClick={() =>
                  isCurrentPlan ? null : setShowConfirm(plan.id)
                }
                disabled={isCurrentPlan}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isCurrentPlan
                    ? "bg-green-500/10 text-green-400 cursor-default"
                    : plan.popular
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-400 hover:to-accent-400"
                    : "glass-button text-white"
                }`}
              >
                {isCurrentPlan
                  ? "현재 사용 중"
                  : plan.monthlyPrice === 0
                  ? "무료 시작"
                  : "업그레이드"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Credit Packs */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-white text-center mb-2">
          크레딧 충전
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          이번 달 곡을 다 만들었는데 더 하고 싶다면? 크레딧으로 추가 작곡하세요.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {CREDIT_PACKS.map((pack) => {
            const justPurchased = purchasedCredits === pack.id;
            return (
              <div
                key={pack.id}
                className={`glass-card p-4 text-center transition-all ${
                  pack.popular ? "border-primary-500/30" : ""
                } ${justPurchased ? "border-green-500/50 bg-green-500/5" : ""}`}
              >
                {pack.popular && !justPurchased && (
                  <div className="text-[9px] text-primary-300 font-bold mb-1">
                    BEST
                  </div>
                )}
                {justPurchased && (
                  <div className="text-[9px] text-green-400 font-bold mb-1">
                    충전 완료!
                  </div>
                )}
                <div className="text-2xl font-bold text-white">
                  {pack.credits}
                </div>
                <div className="text-xs text-gray-500">크레딧</div>
                {pack.bonus > 0 && (
                  <div className="text-[10px] text-green-400 mt-1">
                    +{pack.bonus} 보너스
                  </div>
                )}
                <div className="text-sm font-bold text-primary-300 mt-2">
                  {formatKRW(pack.price)}
                </div>
                <button
                  onClick={() => handleBuyCredits(pack.id)}
                  className="w-full mt-3 py-2 rounded-lg glass-button text-xs font-medium"
                >
                  충전
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-white text-center mb-6">자주 묻는 질문</h2>
        <div className="space-y-3">
          <FaqItem
            q="무료로 정말 충분히 쓸 수 있나요?"
            a="네! 매달 15곡을 만들 수 있고 모든 장르를 사용할 수 있어요. 친구들이랑 즐기기에 충분합니다. 가입하면 보너스 10크레딧도 드려요."
          />
          <FaqItem
            q="크레딧은 뭔가요?"
            a="이번 달 무료 작곡 횟수를 다 쓰면, 크레딧 1개로 곡 1개를 추가로 만들 수 있어요. 안 쓰면 계속 남아있습니다."
          />
          <FaqItem
            q="언제 업그레이드하면 좋나요?"
            a="음악을 더 진지하게 만들고 싶을 때요. Pro 플랜부터 곡 길이 5분, 12트랙, 고음질 내보내기, 상업적 이용이 가능합니다."
          />
          <FaqItem
            q="구독을 취소하면 어떻게 되나요?"
            a="무료 플랜으로 돌아갑니다. 이미 만든 곡은 그대로 유지되고 남은 크레딧도 사라지지 않아요."
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              플랜 변경 확인
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {
                SUBSCRIPTION_PLANS.find((p) => p.id === showConfirm)?.nameKo
              }{" "}
              플랜으로 변경하시겠습니까?
            </p>
            <p className="text-xs text-gray-600 mb-4">
              (데모 환경에서는 실제 결제가 발생하지 않습니다)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2 rounded-xl glass-button text-sm"
              >
                취소
              </button>
              <button
                onClick={() =>
                  handleUpgrade(showConfirm as SubscriptionTier)
                }
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

function Feature({
  text,
  included,
  highlight,
}: {
  text: string;
  included: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={included ? "text-green-400" : "text-gray-700"}>
        {included ? "✓" : "—"}
      </span>
      <span
        className={
          included
            ? highlight
              ? "text-green-300 font-medium"
              : "text-gray-300"
            : "text-gray-700"
        }
      >
        {text}
      </span>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-medium text-white">{q}</span>
        <span className="text-gray-500 ml-2">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}
