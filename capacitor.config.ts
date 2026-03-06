import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.musicisyours.app",
  appName: "Music is Yours",
  webDir: "out",
  server: {
    // 개발 시에는 로컬 서버 사용, 프로덕션에서는 번들된 파일 사용
    // url: "http://localhost:3000",
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0a0a14",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a14",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Music is Yours",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0a0a14",
  },
};

export default config;
