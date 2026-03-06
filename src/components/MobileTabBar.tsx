"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠", activeIcon: "🏠" },
  { href: "/studio", label: "작곡", icon: "🎹", activeIcon: "🎹" },
  { href: "/community", label: "커뮤니티", icon: "🌐", activeIcon: "🌐" },
  { href: "/competition", label: "경쟁", icon: "🏆", activeIcon: "🏆" },
  { href: "/pricing", label: "프리미엄", icon: "💎", activeIcon: "💎" },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
      bg-dark-200/95 backdrop-blur-xl border-t border-white/5
      safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname === tab.href + "/";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl
                transition-all duration-200 active:scale-95
                ${isActive
                  ? "text-primary-300"
                  : "text-gray-500"
                }`}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>
                {isActive ? tab.activeIcon : tab.icon}
              </span>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary-300" : "text-gray-600"}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-primary-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
