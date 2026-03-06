// ============================================================================
// Subscription & Business Model Engine
// 프리미엄(Freemium) + 구독(Subscription) + 크레딧(Credit) 하이브리드 모델
//
// 수익 구조:
// 1. Freemium → Pro 구독 전환 (월/연)
// 2. 크레딧 팩 인앱결제 (작곡 횟수 충전)
// 3. AI 심사 프리미엄 (상세 피드백)
// 4. 프로듀서 도구 프리미엄 (고급 이펙트/마스터링)
// 5. 커뮤니티 부스트 (곡 노출 증가)
// 6. B2B API 라이선싱 (기업용)
// ============================================================================

export type SubscriptionTier = "free" | "starter" | "pro" | "studio";
export type BillingCycle = "monthly" | "yearly";

export interface PlanFeatures {
  compositionsPerMonth: number;   // -1 = 무제한
  maxTrackLayers: number;
  maxSongDuration: number;        // 초
  genresAvailable: number;        // -1 = 전체
  producerFeatures: string[];
  referenceTracks: number;        // 개인화용 레퍼런스 등록 수
  aiJudgeDetailed: boolean;
  communitySharing: boolean;
  exportFormats: string[];
  storageGB: number;
  priorityGeneration: boolean;
  customAITraining: boolean;      // 개인화 파인튜닝
  apiAccess: boolean;
  commercialLicense: boolean;
  collaborationSlots: number;
  adsRemoved: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  nameKo: string;
  tagline: string;
  monthlyPrice: number;           // KRW
  yearlyPrice: number;            // KRW (연간 총액)
  yearlyMonthly: number;          // KRW (연간 결제 시 월 환산)
  features: PlanFeatures;
  popular: boolean;
  color: string;
  icon: string;
  // 앱 스토어 Product ID
  iapIdMonthly?: string;
  iapIdYearly?: string;
}

export interface CreditPack {
  id: string;
  name: string;
  nameKo: string;
  credits: number;
  price: number;                  // KRW
  bonus: number;                  // 보너스 크레딧
  popular: boolean;
  iapId?: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  billingCycle?: BillingCycle;
  credits: number;
  expiresAt?: string;
  compositionsThisMonth: number;
  referenceTracksUsed: number;
}

// --- 구독 플랜 정의 ---

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    nameKo: "무료",
    tagline: "친구들이랑 부담 없이 즐기기",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyMonthly: 0,
    popular: false,
    color: "#6B7280",
    icon: "🎵",
    features: {
      compositionsPerMonth: 15,
      maxTrackLayers: 6,
      maxSongDuration: 60,
      genresAvailable: -1,
      producerFeatures: ["reverb_send", "eq_sculpt", "chord_progression"],
      referenceTracks: 3,
      aiJudgeDetailed: false,
      communitySharing: true,
      exportFormats: ["midi"],
      storageGB: 1,
      priorityGeneration: false,
      customAITraining: false,
      apiAccess: false,
      commercialLicense: false,
      collaborationSlots: 2,
      adsRemoved: false,
    },
  },
  {
    id: "starter",
    name: "Starter",
    nameKo: "스타터",
    tagline: "본격적인 음악 창작의 시작",
    monthlyPrice: 9900,
    yearlyPrice: 95000,
    yearlyMonthly: 7917,
    popular: false,
    color: "#3B82F6",
    icon: "🎶",
    iapIdMonthly: "com.musicisyours.starter.monthly",
    iapIdYearly: "com.musicisyours.starter.yearly",
    features: {
      compositionsPerMonth: 30,
      maxTrackLayers: 6,
      maxSongDuration: 120,
      genresAvailable: -1,
      producerFeatures: ["reverb_send", "eq_sculpt", "sidechain", "chord_progression", "auto_arrangement", "layering"],
      referenceTracks: 10,
      aiJudgeDetailed: true,
      communitySharing: true,
      exportFormats: ["midi", "wav"],
      storageGB: 5,
      priorityGeneration: false,
      customAITraining: false,
      apiAccess: false,
      commercialLicense: false,
      collaborationSlots: 3,
      adsRemoved: true,
    },
  },
  {
    id: "pro",
    name: "Pro",
    nameKo: "프로",
    tagline: "프로듀서 수준의 완벽한 도구",
    monthlyPrice: 24900,
    yearlyPrice: 239000,
    yearlyMonthly: 19917,
    popular: true,
    color: "#7C3AED",
    icon: "🎹",
    iapIdMonthly: "com.musicisyours.pro.monthly",
    iapIdYearly: "com.musicisyours.pro.yearly",
    features: {
      compositionsPerMonth: 100,
      maxTrackLayers: 12,
      maxSongDuration: 300,
      genresAvailable: -1,
      producerFeatures: ["all"],
      referenceTracks: 50,
      aiJudgeDetailed: true,
      communitySharing: true,
      exportFormats: ["midi", "wav", "mp3", "flac", "stems"],
      storageGB: 50,
      priorityGeneration: true,
      customAITraining: true,
      apiAccess: false,
      commercialLicense: true,
      collaborationSlots: 10,
      adsRemoved: true,
    },
  },
  {
    id: "studio",
    name: "Studio",
    nameKo: "스튜디오",
    tagline: "팀과 기업을 위한 올인원",
    monthlyPrice: 79900,
    yearlyPrice: 769000,
    yearlyMonthly: 64083,
    popular: false,
    color: "#F59E0B",
    icon: "🏢",
    iapIdMonthly: "com.musicisyours.studio.monthly",
    iapIdYearly: "com.musicisyours.studio.yearly",
    features: {
      compositionsPerMonth: -1,
      maxTrackLayers: 24,
      maxSongDuration: 600,
      genresAvailable: -1,
      producerFeatures: ["all"],
      referenceTracks: -1,
      aiJudgeDetailed: true,
      communitySharing: true,
      exportFormats: ["midi", "wav", "mp3", "flac", "stems", "project"],
      storageGB: 500,
      priorityGeneration: true,
      customAITraining: true,
      apiAccess: true,
      commercialLicense: true,
      collaborationSlots: -1,
      adsRemoved: true,
    },
  },
];

// --- 크레딧 팩 ---

export const CREDIT_PACKS: CreditPack[] = [
  { id: "credits-10", name: "10 Credits", nameKo: "10 크레딧", credits: 10, price: 3900, bonus: 0, popular: false, iapId: "com.musicisyours.credits.10" },
  { id: "credits-30", name: "30 Credits", nameKo: "30 크레딧", credits: 30, price: 9900, bonus: 3, popular: true, iapId: "com.musicisyours.credits.30" },
  { id: "credits-100", name: "100 Credits", nameKo: "100 크레딧", credits: 100, price: 29900, bonus: 15, popular: false, iapId: "com.musicisyours.credits.100" },
  { id: "credits-300", name: "300 Credits", nameKo: "300 크레딧", credits: 300, price: 79900, bonus: 60, popular: false, iapId: "com.musicisyours.credits.300" },
];

// --- 구독 상태 관리 (localStorage 기반 유저별 저장) ---

const SUB_STORAGE_PREFIX = "miy_sub_";

function getSubKey(userId: string): string {
  return SUB_STORAGE_PREFIX + userId;
}

function defaultSubscription(): UserSubscription {
  return {
    tier: "free",
    credits: 10,
    compositionsThisMonth: 0,
    referenceTracksUsed: 0,
  };
}

let currentUserId: string | null = null;
let currentSubscription: UserSubscription = defaultSubscription();

export function initSubscription(userId: string): void {
  currentUserId = userId;
  if (typeof window === "undefined") {
    currentSubscription = defaultSubscription();
    return;
  }
  const raw = localStorage.getItem(getSubKey(userId));
  if (raw) {
    try {
      currentSubscription = JSON.parse(raw) as UserSubscription;
    } catch {
      currentSubscription = defaultSubscription();
    }
  } else {
    currentSubscription = defaultSubscription();
    persistSubscription();
  }
}

function persistSubscription(): void {
  if (currentUserId && typeof window !== "undefined") {
    localStorage.setItem(getSubKey(currentUserId), JSON.stringify(currentSubscription));
  }
}

export function getUserSubscription(): UserSubscription {
  return currentSubscription;
}

export function getCurrentPlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === currentSubscription.tier) || SUBSCRIPTION_PLANS[0];
}

export function canCompose(): boolean {
  const plan = getCurrentPlan();
  if (plan.features.compositionsPerMonth === -1) return true;
  if (currentSubscription.compositionsThisMonth < plan.features.compositionsPerMonth) return true;
  return currentSubscription.credits > 0;
}

export function getRemainingCompositions(): { monthly: number; credits: number } {
  const plan = getCurrentPlan();
  const monthlyLeft = plan.features.compositionsPerMonth === -1
    ? Infinity
    : Math.max(0, plan.features.compositionsPerMonth - currentSubscription.compositionsThisMonth);
  return { monthly: monthlyLeft, credits: currentSubscription.credits };
}

export function useComposition(): boolean {
  if (!canCompose()) return false;

  const plan = getCurrentPlan();
  if (plan.features.compositionsPerMonth === -1 ||
      currentSubscription.compositionsThisMonth < plan.features.compositionsPerMonth) {
    currentSubscription.compositionsThisMonth++;
    persistSubscription();
    return true;
  }

  if (currentSubscription.credits > 0) {
    currentSubscription.credits--;
    persistSubscription();
    return true;
  }

  return false;
}

export function canAddReference(): boolean {
  const plan = getCurrentPlan();
  if (plan.features.referenceTracks === -1) return true;
  return currentSubscription.referenceTracksUsed < plan.features.referenceTracks;
}

export function simulateUpgrade(tier: SubscriptionTier, cycle: BillingCycle): void {
  currentSubscription = {
    ...currentSubscription,
    tier,
    billingCycle: cycle,
    expiresAt: new Date(Date.now() + (cycle === "yearly" ? 365 : 30) * 86400000).toISOString(),
  };
  persistSubscription();
}

export function simulateCreditPurchase(packId: string): void {
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (pack) {
    currentSubscription.credits += pack.credits + pack.bonus;
    persistSubscription();
  }
}

export function formatKRW(amount: number): string {
  if (amount === 0) return "무료";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}
