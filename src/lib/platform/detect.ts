// ============================================================================
// Platform Detection & Native Bridge
// 웹, PWA, Capacitor(iOS/Android) 환경을 감지하고
// 각 플랫폼에 맞는 네이티브 기능을 추상화하는 유틸리티
// ============================================================================

export type Platform = "web" | "pwa" | "ios" | "android";
export type DeviceType = "mobile" | "tablet" | "desktop";

export interface PlatformInfo {
  platform: Platform;
  deviceType: DeviceType;
  isNative: boolean;
  isPWA: boolean;
  isCapacitor: boolean;
  hasTouchScreen: boolean;
  hasNotchOrIsland: boolean;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
  screenWidth: number;
  screenHeight: number;
}

export function detectPlatform(): PlatformInfo {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return {
      platform: "web",
      deviceType: "desktop",
      isNative: false,
      isPWA: false,
      isCapacitor: false,
      hasTouchScreen: false,
      hasNotchOrIsland: false,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      screenWidth: 1920,
      screenHeight: 1080,
    };
  }

  // Capacitor detection
  const win = window as unknown as Record<string, unknown>;
  const isCapacitor = !!win.Capacitor;
  const capacitorPlatform = isCapacitor
    ? (win.Capacitor as Record<string, unknown>)?.getPlatform?.() as string
    : null;

  // PWA detection
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as Record<string, unknown>).standalone === true;

  // Platform
  let platform: Platform = "web";
  if (isCapacitor && capacitorPlatform === "ios") platform = "ios";
  else if (isCapacitor && capacitorPlatform === "android") platform = "android";
  else if (isPWA) platform = "pwa";

  // Device type
  const width = window.innerWidth;
  let deviceType: DeviceType = "desktop";
  if (width < 768) deviceType = "mobile";
  else if (width < 1024) deviceType = "tablet";

  // Touch screen
  const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Notch detection (rough heuristic)
  const hasNotchOrIsland = platform === "ios" && window.screen.height >= 812;

  // Safe area insets
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaInsets = {
    top: parseInt(computedStyle.getPropertyValue("--sat") || "0") || (hasNotchOrIsland ? 47 : 0),
    bottom: parseInt(computedStyle.getPropertyValue("--sab") || "0") || (hasNotchOrIsland ? 34 : 0),
    left: parseInt(computedStyle.getPropertyValue("--sal") || "0") || 0,
    right: parseInt(computedStyle.getPropertyValue("--sar") || "0") || 0,
  };

  return {
    platform,
    deviceType,
    isNative: isCapacitor,
    isPWA,
    isCapacitor,
    hasTouchScreen,
    hasNotchOrIsland,
    safeAreaInsets,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  };
}

// ============================================================================
// Native Feature Bridge
// Capacitor 플러그인을 안전하게 호출하는 래퍼
// 웹에서는 폴백 동작 수행
// ============================================================================

export async function nativeHaptic(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch {
    // Web fallback: no haptics
  }
}

export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title, text, url });
    return true;
  } catch {
    // Web fallback: navigator.share or clipboard
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return true;
    }
    await navigator.clipboard?.writeText(url);
    return false;
  }
}

export async function nativeSetStatusBarStyle(): Promise<void> {
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a0a14" });
  } catch {
    // Web fallback: meta theme-color already set
  }
}

export async function localStorageGet(key: string): Promise<string | null> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return localStorage.getItem(key);
  }
}

export async function localStorageSet(key: string, value: string): Promise<void> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value });
  } catch {
    localStorage.setItem(key, value);
  }
}

export async function registerPushNotifications(): Promise<boolean> {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === "granted") {
      await PushNotifications.register();
      return true;
    }
    return false;
  } catch {
    // Web fallback: use Notification API
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }
}
