"use client";

import { useState, useCallback } from "react";
import { Song, Genre, GENRE_INFO, ComposeRequest } from "@/types/music";
import {
  composeFromRequest,
  parseNaturalLanguagePrompt,
  getTextSuggestions,
  applyProducerFeature,
  PRODUCER_FEATURES,
} from "@/lib/ai-composer";
import TrackEditor from "@/components/TrackEditor";
import ShareModal from "@/components/ShareModal";

const ALL_GENRES = Object.entries(GENRE_INFO) as [Genre, typeof GENRE_INFO[Genre]][];

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(getTextSuggestions(""));
  const [showGenres, setShowGenres] = useState(false);
  const [showProducerPanel, setShowProducerPanel] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [featureLog, setFeatureLog] = useState<string[]>([]);

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value);
    setSuggestions(getTextSuggestions(value));
  }, []);

  const handleCompose = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsComposing(true);
    // Simulate AI processing time
    await new Promise((r) => setTimeout(r, 1500));

    const parsed = parseNaturalLanguagePrompt(prompt);
    const request: ComposeRequest = {
      prompt,
      genre: selectedGenre || parsed.genre || "pop",
      mood: parsed.mood,
      bpm: parsed.bpm,
      key: parsed.key,
      scale: parsed.scale,
      duration: 30,
    };

    const newSong = composeFromRequest(request);
    setSong(newSong);
    setIsComposing(false);
    setFeatureLog([`"${prompt}" - 곡이 생성되었습니다.`]);
  }, [prompt, selectedGenre]);

  const handleApplyFeature = useCallback(
    (featureId: string) => {
      if (!song) return;
      const feature = PRODUCER_FEATURES.find((f) => f.id === featureId);
      if (!feature) return;

      const updated = applyProducerFeature(song, featureId);
      setSong(updated);
      setFeatureLog((prev) => [...prev, `${feature.nameKo} 적용 완료`]);
    },
    [song]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (suggestion.startsWith("+ ")) {
        setPrompt((prev) => prev + " " + suggestion.slice(2));
      } else {
        setPrompt(suggestion);
      }
      setSuggestions(getTextSuggestions(suggestion));
    },
    []
  );

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">AI 작곡 스튜디오</h1>

      {/* Prompt Input Area */}
      <div className="glass-card p-6 mb-6">
        <label className="block text-sm text-gray-400 mb-2">
          원하는 음악을 자연어로 설명하세요
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="예: 신나는 K-Pop 스타일로, 밝고 에너지 넘치는 댄스곡 만들어줘. 사이드체인 넣고 베이스 강하게!"
              className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-3 text-white
                placeholder-gray-600 focus:outline-none focus:border-primary-500/50 resize-none h-24"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCompose();
                }
              }}
            />
          </div>
          <button
            onClick={handleCompose}
            disabled={isComposing || !prompt.trim()}
            className="self-end px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500
              text-white font-bold hover:from-primary-400 hover:to-accent-400 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed neon-glow"
          >
            {isComposing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> 작곡 중...
              </span>
            ) : (
              "🎵 작곡하기"
            )}
          </button>
        </div>

        {/* Text Suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-dark-100 text-gray-400
                border border-white/5 hover:border-primary-500/30 hover:text-primary-300
                transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Selector */}
      <div className="glass-card p-4 mb-6">
        <button
          onClick={() => setShowGenres(!showGenres)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>🎼</span>
          <span>장르 선택</span>
          {selectedGenre && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: GENRE_INFO[selectedGenre].color + "20",
                color: GENRE_INFO[selectedGenre].color,
              }}
            >
              {GENRE_INFO[selectedGenre].icon} {GENRE_INFO[selectedGenre].labelKo}
            </span>
          )}
          <span className="ml-auto">{showGenres ? "▲" : "▼"}</span>
        </button>

        {showGenres && (
          <div className="flex flex-wrap gap-2 mt-4">
            {ALL_GENRES.map(([genre, info]) => (
              <button
                key={genre}
                onClick={() => {
                  setSelectedGenre(genre === selectedGenre ? null : genre);
                }}
                className={`genre-chip flex items-center gap-1.5 text-xs ${
                  selectedGenre === genre ? "ring-2 ring-offset-1 ring-offset-dark-200" : ""
                }`}
                style={{
                  borderColor: info.color + (selectedGenre === genre ? "80" : "30"),
                  backgroundColor: info.color + (selectedGenre === genre ? "25" : "08"),
                  color: selectedGenre === genre ? info.color : info.color + "CC",
                }}
              >
                <span>{info.icon}</span>
                <span>{info.labelKo}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composing Animation */}
      {isComposing && (
        <div className="glass-card p-12 mb-6 text-center">
          <div className="flex justify-center items-end gap-1 h-16 mb-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="waveform-bar w-2 bg-gradient-to-t from-primary-500 to-accent-400 rounded-full"
                style={{ animationDelay: `${i * 0.12}s`, height: "100%" }}
              />
            ))}
          </div>
          <p className="text-gray-400 animate-pulse">AI가 음악을 만들고 있습니다...</p>
        </div>
      )}

      {/* Song Result */}
      {song && !isComposing && (
        <>
          {/* Song Header */}
          <div className="glass-card p-6 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{song.title}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: GENRE_INFO[song.genre].color + "20",
                      color: GENRE_INFO[song.genre].color,
                    }}
                  >
                    {GENRE_INFO[song.genre].icon} {GENRE_INFO[song.genre].labelKo}
                  </span>
                  <span>{song.bpm} BPM</span>
                  <span>Key: {song.key} {song.scale}</span>
                  <span>{song.tracks.length} 트랙</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="glass-button text-sm flex items-center gap-1"
                >
                  📤 공유
                </button>
                <button
                  onClick={() => setShowProducerPanel(!showProducerPanel)}
                  className={`glass-button text-sm flex items-center gap-1 ${
                    showProducerPanel ? "border-primary-500/50 text-primary-300" : ""
                  }`}
                >
                  🎛️ 프로듀서 도구
                </button>
              </div>
            </div>
          </div>

          {/* Producer Feature Panel */}
          {showProducerPanel && (
            <div className="glass-card p-6 mb-4">
              <h3 className="text-sm font-bold text-gray-300 mb-4">
                프로듀서 도구 - 자연어로도 적용 가능합니다
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRODUCER_FEATURES.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => handleApplyFeature(feature.id)}
                    className="text-left p-3 rounded-xl bg-dark-100/50 border border-white/5
                      hover:border-primary-500/30 transition-all duration-200 group"
                  >
                    <div className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">
                      {feature.nameKo}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{feature.descriptionKo}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {feature.naturalLanguageHints.slice(0, 2).map((hint, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-200 text-gray-600">
                          &ldquo;{hint}&rdquo;
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feature Log */}
          {featureLog.length > 0 && (
            <div className="glass-card p-4 mb-4">
              <h4 className="text-xs text-gray-500 mb-2">작업 기록</h4>
              <div className="space-y-1">
                {featureLog.map((log, i) => (
                  <div key={i} className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Track Editor */}
          <TrackEditor song={song} onSongUpdate={setSong} />

          {/* Share Modal */}
          {showShareModal && (
            <ShareModal song={song} onClose={() => setShowShareModal(false)} />
          )}
        </>
      )}
    </div>
  );
}
