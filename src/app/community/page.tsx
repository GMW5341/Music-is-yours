"use client";

import { useState, useEffect, useCallback } from "react";
import { GENRE_INFO } from "@/types/music";
import { useAuth } from "@/components/AuthProvider";
import {
  getCommunityPosts,
  toggleLike,
  incrementPlays,
  CommunityPost,
} from "@/lib/community-store";
import Link from "next/link";

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const refreshPosts = useCallback(() => {
    setPosts(getCommunityPosts(sortBy));
  }, [sortBy]);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const handleLike = (postId: string) => {
    if (!user) return;
    toggleLike(postId, user.id);
    refreshPosts();
  };

  const handlePlay = (postId: string) => {
    incrementPlays(postId);
    refreshPosts();
  };

  const genreInfo = (genre: string) => {
    const key = genre as keyof typeof GENRE_INFO;
    return GENRE_INFO[key] || { icon: "?", labelKo: genre, color: "#888" };
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">커뮤니티</h1>
        <Link
          href="/studio"
          className="text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
        >
          곡 만들러 가기
        </Link>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        스튜디오에서 만든 곡을 공유하면 여기에 올라옵니다
      </p>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSortBy("latest")}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            sortBy === "latest"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "glass-button text-gray-400"
          }`}
        >
          최신순
        </button>
        <button
          onClick={() => setSortBy("popular")}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            sortBy === "popular"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "glass-button text-gray-400"
          }`}
        >
          인기순
        </button>
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🎵</div>
          <h3 className="text-lg font-bold text-white mb-2">아직 공유된 곡이 없어요</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            스튜디오에서 곡을 만들고 공유 버튼을 눌러 커뮤니티에 첫 번째 곡을 올려보세요!
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            첫 곡 만들기
          </Link>
        </div>
      )}

      {/* Song Feed */}
      <div className="space-y-4">
        {posts.map((post) => {
          const info = genreInfo(post.genre);
          const isLiked = user ? post.likes.includes(user.id) : false;
          const timeDiff = Date.now() - new Date(post.createdAt).getTime();
          const timeAgo =
            timeDiff < 60000
              ? "방금 전"
              : timeDiff < 3600000
              ? `${Math.floor(timeDiff / 60000)}분 전`
              : timeDiff < 86400000
              ? `${Math.floor(timeDiff / 3600000)}시간 전`
              : `${Math.floor(timeDiff / 86400000)}일 전`;

          return (
            <div
              key={post.id}
              className="glass-card p-5 hover:border-primary-500/20 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Album Art */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: info.color + "15" }}
                >
                  {info.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white truncate">
                      {post.songTitle}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] flex-shrink-0"
                      style={{
                        backgroundColor: info.color + "20",
                        color: info.color,
                      }}
                    >
                      {info.labelKo}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 inline-flex items-center justify-center text-[8px] text-white font-bold">
                        {post.authorName.charAt(0)}
                      </span>
                      {post.authorName}
                    </span>
                    <span>{post.bpm} BPM</span>
                    <span>
                      {post.key} {post.scale}
                    </span>
                    <span>{post.trackCount}트랙</span>
                    <span>{timeAgo}</span>
                  </div>

                  {post.message && (
                    <p className="text-sm text-gray-400 mb-3">{post.message}</p>
                  )}

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={!isAuthenticated}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        isLiked
                          ? "text-pink-400"
                          : "text-gray-500 hover:text-pink-400"
                      } ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span>{isLiked ? "❤️" : "🤍"}</span>
                      <span>{post.likes.length}</span>
                    </button>
                    <button
                      onClick={() => handlePlay(post.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-400 transition-colors"
                    >
                      <span>▶️</span>
                      <span>{post.plays}</span>
                    </button>
                    {user && post.authorId === user.id && (
                      <span className="text-[10px] text-gray-600 px-2 py-0.5 rounded-full bg-white/5">
                        내 곡
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isAuthenticated && posts.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-3">
            좋아요를 누르거나 곡을 공유하려면 로그인하세요
          </p>
          <Link
            href="/auth"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      )}
    </div>
  );
}
