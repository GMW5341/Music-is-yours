"use client";

import { useState } from "react";
import { Song, ShareTarget } from "@/types/music";
import { getContacts, shareSong, generateShareLink, searchContacts } from "@/lib/social";
import { addCommunityPost } from "@/lib/community-store";
import { useAuth } from "@/components/AuthProvider";

interface ShareModalProps {
  song: Song;
  onClose: () => void;
}

export default function ShareModal({ song, onClose }: ShareModalProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"contacts" | "community" | "link">("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [sharedTo, setSharedTo] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const contacts = searchQuery ? searchContacts(searchQuery) : getContacts();
  const shareLink = generateShareLink(song.id);

  const handleShare = (target: ShareTarget) => {
    shareSong(song, target, message);
    if (target.targetId) {
      setSharedTo((prev) => [...prev, target.targetId!]);
    }
  };

  const handleCommunityShare = () => {
    addCommunityPost({
      songTitle: song.title,
      genre: song.genre,
      bpm: song.bpm,
      key: song.key,
      scale: song.scale,
      trackCount: song.tracks.length,
      authorId: user?.id || "anonymous",
      authorName: user?.name || "Anonymous",
      message,
    });
    handleShare({ type: "community" });
    setSharedTo((prev) => [...prev, "community"]);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">음악 공유하기</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
          <span>🎵</span>
          <span className="text-white font-medium">{song.title}</span>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-dark-200">
          {(["contacts", "community", "link"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-primary-500/20 text-primary-300" : "text-gray-500 hover:text-white"
              }`}
            >
              {t === "contacts" ? "📱 연락처" : t === "community" ? "🌐 커뮤니티" : "🔗 링크"}
            </button>
          ))}
        </div>

        {/* Message input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지 추가 (선택사항)"
          className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
            placeholder-gray-600 focus:outline-none focus:border-primary-500/50 mb-4"
        />

        {/* Contacts Tab */}
        {tab === "contacts" && (
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 이메일, 전화번호로 검색"
              className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50 mb-3"
            />
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-100/50 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-sm">
                      {contact.avatar || contact.name[0]}
                    </div>
                    <div>
                      <div className="text-sm text-white">{contact.name}</div>
                      <div className="text-xs text-gray-500">
                        {contact.phone || contact.email}
                        {contact.isFriend && <span className="ml-1 text-primary-400">친구</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleShare({
                        type: "contact",
                        targetId: contact.id,
                        targetName: contact.name,
                      })
                    }
                    disabled={sharedTo.includes(contact.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                      sharedTo.includes(contact.id)
                        ? "bg-green-500/20 text-green-400 cursor-default"
                        : "bg-primary-500/20 text-primary-300 hover:bg-primary-500/30"
                    }`}
                  >
                    {sharedTo.includes(contact.id) ? "✓ 전송됨" : "보내기"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Tab */}
        {tab === "community" && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">
              커뮤니티에 공유하면 모든 참여자가 당신의 음악을 들을 수 있습니다
            </p>
            <button
              onClick={handleCommunityShare}
              disabled={sharedTo.includes("community")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                sharedTo.includes("community")
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-400 hover:to-accent-400"
              }`}
            >
              {sharedTo.includes("community") ? "✓ 커뮤니티에 공유됨" : "🌐 커뮤니티에 공유하기"}
            </button>
          </div>
        )}

        {/* Link Tab */}
        {tab === "link" && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">링크를 복사해서 어디서든 공유하세요</p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300"
              />
              <button
                onClick={handleCopyLink}
                className="glass-button text-sm whitespace-nowrap"
              >
                {copied ? "✓ 복사됨" : "📋 복사"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
