"use client";

import { useState } from "react";
import { GENRE_INFO } from "@/types/music";
import { SharedSong } from "@/lib/social";

// Sample community data
const SAMPLE_COMMUNITY_SONGS: (SharedSong & { song: { title: string; genre: keyof typeof GENRE_INFO; bpm: number; likes: number; plays: number } })[] = [
  {
    id: "s1",
    song: { title: "Midnight Dreams", genre: "lofi", bpm: 82, likes: 47, plays: 320 } as never,
    sharedBy: "DJ Luna",
    sharedTo: { type: "community" },
    sharedAt: "2026-03-05T14:30:00Z",
    message: "밤에 듣기 좋은 로파이 비트입니다",
  },
  {
    id: "s2",
    song: { title: "Summer Wave", genre: "edm", bpm: 128, likes: 89, plays: 560 } as never,
    sharedBy: "프로듀서K",
    sharedTo: { type: "community" },
    sharedAt: "2026-03-05T10:15:00Z",
    message: "여름 느낌의 EDM! 드롭이 포인트에요",
  },
  {
    id: "s3",
    song: { title: "서울의 밤", genre: "kpop", bpm: 125, likes: 124, plays: 890 } as never,
    sharedBy: "한별",
    sharedTo: { type: "community" },
    sharedAt: "2026-03-04T22:00:00Z",
    message: "K-Pop 스타일 도전! AI가 만들었다고 믿기 어려울 걸요",
  },
  {
    id: "s4",
    song: { title: "Blue Note Cafe", genre: "jazz", bpm: 108, likes: 35, plays: 210 } as never,
    sharedBy: "재즈매니아",
    sharedTo: { type: "community" },
    sharedAt: "2026-03-04T18:45:00Z",
    message: "재즈 카페 분위기로 만들어봤어요",
  },
  {
    id: "s5",
    song: { title: "Thunder Road", genre: "rock", bpm: 135, likes: 67, plays: 445 } as never,
    sharedBy: "록커짐",
    sharedTo: { type: "community" },
    sharedAt: "2026-03-04T15:20:00Z",
  },
];

export default function CommunityPage() {
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  const songs = [...SAMPLE_COMMUNITY_SONGS].sort((a, b) => {
    if (sortBy === "popular") return b.song.likes - a.song.likes;
    return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime();
  });

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">커뮤니티</h1>
      <p className="text-gray-500 text-sm mb-6">모든 참여자들이 공유한 음악을 들어보세요</p>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSortBy("latest")}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            sortBy === "latest" ? "bg-primary-500/20 text-primary-300 border border-primary-500/30" : "glass-button text-gray-400"
          }`}
        >
          최신순
        </button>
        <button
          onClick={() => setSortBy("popular")}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            sortBy === "popular" ? "bg-primary-500/20 text-primary-300 border border-primary-500/30" : "glass-button text-gray-400"
          }`}
        >
          인기순
        </button>
      </div>

      {/* Song Feed */}
      <div className="space-y-4">
        {songs.map((item) => {
          const genreInfo = GENRE_INFO[item.song.genre];
          return (
            <div key={item.id} className="glass-card p-5 hover:border-primary-500/20 transition-all">
              <div className="flex items-start gap-4">
                {/* Album Art Placeholder */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: genreInfo.color + "15" }}
                >
                  {genreInfo.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white truncate">{item.song.title}</h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] flex-shrink-0"
                      style={{ backgroundColor: genreInfo.color + "20", color: genreInfo.color }}
                    >
                      {genreInfo.labelKo}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span>{item.sharedBy}</span>
                    <span>{item.song.bpm} BPM</span>
                    <span>{new Date(item.sharedAt).toLocaleDateString("ko-KR")}</span>
                  </div>

                  {item.message && (
                    <p className="text-sm text-gray-400 mb-3">{item.message}</p>
                  )}

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-accent-400 transition-colors">
                      <span>❤️</span>
                      <span>{item.song.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-400 transition-colors">
                      <span>▶️</span>
                      <span>{item.song.plays}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
                      <span>💬</span>
                      <span>댓글</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
                      <span>📤</span>
                      <span>공유</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
