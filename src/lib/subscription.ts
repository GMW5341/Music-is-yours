// ============================================================================
// Subscription & Business Model Engine
// 프리미엄(Freemium) + 구독(Subscription) + 크레딧(Credit) 하이브리드 모델
//
// 핵심 제한: 작곡 시간(분) 기반
// - 곡 개수가 아닌 총 작곡 시간으로 사용량 측정
// - 크레딧 = 추가 작곡 시간 (1크레딧 = 1분)
// - 경쟁 보상으로 크레딧/시간 획득 가능
// ============================================================================

export type SubscriptionTier = "free" | "starter" | "pro" | "studio";
export type BillingCycle = "monthly" | "yearly";

export interface PlanFeatures {
  minutesPerMonth: number;        // -1 = 무제한, 월 작곡 시간(분)
  maxTrackLayers: number;
  maxSongDuration: number;        // 초 (1곡 최대 길이)
  genresAvailable: number;        // -1 = 전체
  producerFeatures: string[];
  referenceTracks: number;
  aiJudgeDetailed: boolean;
  communitySharing: boolean;
  exportFormats: string[];
  storageGB: number;
  priorityGeneration: boolean;
  customAITraining: boolean;
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
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyMonthly: number;
  features: PlanFeatures;
  popular: boolean;
  color: string;
  icon: string;
  iapIdMonthly?: string;
  iapIdYearly?: string;
}

export interface CreditPack {
  id: string;
  name: string;
  nameKo: string;
  minutes: number;                // 구매 시간(분)
  bonus: number;                  // 보너스 시간(분)
  price: number;                  // KRW
  popular: boolean;
  iapId?: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  billingCycle?: BillingCycle;
  credits: number;                // 크레딧 = 보너스 분 (1크레딧 = 1분)
  expiresAt?: string;
  minutesUsedThisMonth: number;   // 이번 달 사용한 시간(분)
  referenceTracksUsed: number;
}

// --- 경쟁 보상 ---

export interface CompetitionReward {
  minScore: number;
  label: string;
  labelKo: string;
  creditReward: number;           // 보너스 크레딧(분)
  badge: string;
}

export const COMPETITION_REWARDS: CompetitionReward[] = [
  { minScore: 90, label: "Legendary", labelKo: "전설", creditReward: 30, badge: "👑" },
  { minScore: 80, label: "Master", labelKo: "마스터", creditReward: 15, badge: "🌟" },
  { minScore: 70, label: "Expert", labelKo: "전문가", creditReward: 8, badge: "🔥" },
  { minScore: 60, label: "Skilled", labelKo: "숙련", creditReward: 4, badge: "✨" },
  { minScore: 50, label: "Rising", labelKo: "신예", creditReward: 2, badge: "🎵" },
];

export function getRewardForScore(score: number): CompetitionReward | null {
  return COMPETITION_REWARDS.find((r) => score >= r.minScore) || null;
}

export function claimCompetitionReward(score: number): CompetitionReward | null {
  const reward = getRewardForScore(score);
  if (!reward) return null;
  currentSubscription.credits += reward.creditReward;
  persistSubscription();
  return reward;
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
      minutesPerMonth: 30,          // 30분 = 60초짜리 30곡 또는 2분짜리 15곡
      maxTrackLayers: 6,
      maxSongDuration: 60,           // 1분
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
      minutesPerMonth: 120,          // 2시간
      maxTrackLayers: 8,
      maxSongDuration: 180,          // 3분
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
      minutesPerMonth: 600,          // 10시간
      maxTrackLayers: 12,
      maxSongDuration: 300,          // 5분
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
      minutesPerMonth: -1,            // 무제한
      maxTrackLayers: 24,
      maxSongDuration: 600,           // 10분
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

// --- 크레딧 팩 (시간 기반) ---

export const CREDIT_PACKS: CreditPack[] = [
  { id: "min-10", name: "10 Minutes", nameKo: "10분", minutes: 10, price: 2900, bonus: 0, popular: false, iapId: "com.musicisyours.min.10" },
  { id: "min-30", name: "30 Minutes", nameKo: "30분", minutes: 30, price: 7900, bonus: 3, popular: true, iapId: "com.musicisyours.min.30" },
  { id: "min-60", name: "1 Hour", nameKo: "1시간", minutes: 60, price: 13900, bonus: 10, popular: false, iapId: "com.musicisyours.min.60" },
  { id: "min-180", name: "3 Hours", nameKo: "3시간", minutes: 180, price: 35900, bonus: 30, popular: false, iapId: "com.musicisyours.min.180" },
];

// --- 구독 상태 관리 (localStorage 기반) ---

const SUB_STORAGE_PREFIX = "miy_sub_";

function getSubKey(userId: string): string {
  return SUB_STORAGE_PREFIX + userId;
}

function defaultSubscription(): UserSubscription {
  return {
    tier: "free",
    credits: 10,                     // 가입 보너스 10분
    minutesUsedThisMonth: 0,
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
      const parsed = JSON.parse(raw) as UserSubscription;
      // Migration: old format had compositionsThisMonth instead of minutesUsedThisMonth
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (parsed as any).compositionsThisMonth === "number" && parsed.minutesUsedThisMonth === undefined) {
        parsed.minutesUsedThisMonth = 0;
      }
      currentSubscription = parsed;
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

// --- 작곡 시간 기반 사용량 체크 ---

export function canCompose(durationSeconds: number): boolean {
  const durationMinutes = durationSeconds / 60;
  const plan = getCurrentPlan();
  if (plan.features.minutesPerMonth === -1) return true;

  const monthlyLeft = plan.features.minutesPerMonth - currentSubscription.minutesUsedThisMonth;
  if (monthlyLeft >= durationMinutes) return true;

  // 크레딧으로 초과분 커버 가능?
  const deficit = durationMinutes - Math.max(0, monthlyLeft);
  return currentSubscription.credits >= deficit;
}

export function getRemainingMinutes(): { monthly: number; credits: number } {
  const plan = getCurrentPlan();
  const monthlyLeft = plan.features.minutesPerMonth === -1
    ? Infinity
    : Math.max(0, plan.features.minutesPerMonth - currentSubscription.minutesUsedThisMonth);
  return { monthly: monthlyLeft, credits: currentSubscription.credits };
}

export function useMinutes(durationSeconds: number): boolean {
  const durationMinutes = durationSeconds / 60;
  if (!canCompose(durationSeconds)) return false;

  const plan = getCurrentPlan();
  if (plan.features.minutesPerMonth === -1) {
    // 무제한이라도 기록은 남김
    currentSubscription.minutesUsedThisMonth += durationMinutes;
    persistSubscription();
    return true;
  }

  const monthlyLeft = plan.features.minutesPerMonth - currentSubscription.minutesUsedThisMonth;

  if (monthlyLeft >= durationMinutes) {
    // 월 할당량으로 충분
    currentSubscription.minutesUsedThisMonth += durationMinutes;
  } else {
    // 월 할당량 초과분은 크레딧에서 차감
    const deficit = durationMinutes - Math.max(0, monthlyLeft);
    currentSubscription.minutesUsedThisMonth = plan.features.minutesPerMonth;
    currentSubscription.credits = Math.max(0, currentSubscription.credits - Math.ceil(deficit));
  }

  persistSubscription();
  return true;
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
    currentSubscription.credits += pack.minutes + pack.bonus;
    persistSubscription();
  }
}

export function formatKRW(amount: number): string {
  if (amount === 0) return "무료";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function formatMinutes(mins: number): string {
  if (mins === Infinity) return "무제한";
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainder = Math.round(mins % 60);
    return remainder > 0 ? `${hours}시간 ${remainder}분` : `${hours}시간`;
  }
  return `${Math.round(mins)}분`;
}
