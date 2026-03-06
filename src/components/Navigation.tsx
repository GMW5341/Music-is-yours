"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/studio", label: "스튜디오", icon: "🎹" },
  { href: "/community", label: "커뮤니티", icon: "🌐" },
  { href: "/competition", label: "경쟁", icon: "🏆" },
  { href: "/admin", label: "관리자", icon: "⚙️" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const tierColors: Record<string, string> = {
    free: "text-gray-400",
    starter: "text-blue-400",
    pro: "text-purple-400",
    studio: "text-yellow-400",
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-200/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="text-lg font-bold gradient-text">Music is Yours</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${pathname === item.href
                    ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-white">{user.name}</span>
                  <span className={`hidden sm:block text-xs ${tierColors[user.tier] || "text-gray-400"}`}>
                    {user.tier.toUpperCase()}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-200 border border-white/10 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className={`text-xs mt-1 ${tierColors[user.tier] || "text-gray-400"}`}>
                        {user.tier.toUpperCase()} Plan · {user.credits} credits
                      </p>
                    </div>
                    <Link
                      href="/pricing"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      요금제 업그레이드
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                        router.push("/");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                로그인
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden glass-button p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="메뉴 열기"
            >
              <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${pathname === item.href
                    ? "bg-primary-500/20 text-primary-300"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-400 hover:bg-white/5"
              >
                <span className="text-lg">🔐</span>
                <span>로그인 / 회원가입</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
