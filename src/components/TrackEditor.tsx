"use client";

import { useState } from "react";
import { Song, TrackLayer, Effect } from "@/types/music";

interface TrackEditorProps {
  song: Song;
  onSongUpdate: (song: Song) => void;
}

const TRACK_TYPE_ICONS: Record<TrackLayer["type"], string> = {
  melody: "🎵",
  harmony: "🎶",
  bass: "🎸",
  drums: "🥁",
  pad: "🌊",
  fx: "✨",
  vocal: "🎤",
};

const EFFECT_LABELS: Record<Effect["type"], string> = {
  reverb: "리버브",
  delay: "딜레이",
  chorus: "코러스",
  distortion: "디스토션",
  compressor: "컴프레서",
  eq: "이퀄라이저",
  filter: "필터",
  phaser: "페이저",
  flanger: "플랜저",
  bitcrusher: "비트크러셔",
  autopan: "오토팬",
  tremolo: "트레몰로",
};

export default function TrackEditor({ song, onSongUpdate }: TrackEditorProps) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  const updateTrack = (trackId: string, updates: Partial<TrackLayer>) => {
    const updatedSong = {
      ...song,
      tracks: song.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
      updatedAt: new Date().toISOString(),
    };
    onSongUpdate(updatedSong);
  };

  const toggleEffect = (trackId: string, effectIndex: number) => {
    const track = song.tracks.find((t) => t.id === trackId);
    if (!track) return;

    const newEffects = [...track.effects];
    newEffects[effectIndex] = { ...newEffects[effectIndex], enabled: !newEffects[effectIndex].enabled };
    updateTrack(trackId, { effects: newEffects });
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
        🎚️ 트랙 에디터
      </h3>

      <div className="space-y-2">
        {song.tracks.map((track) => (
          <div key={track.id}>
            {/* Track Row */}
            <div className="track-row">
              {/* Track Icon & Name */}
              <span className="text-lg">{TRACK_TYPE_ICONS[track.type]}</span>
              <div className="min-w-[140px]">
                <div className="text-sm font-medium text-white truncate">{track.name}</div>
                <div className="text-[10px] text-gray-500">{track.notes.length} notes</div>
              </div>

              {/* Mute/Solo */}
              <button
                onClick={() => updateTrack(track.id, { muted: !track.muted })}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  track.muted ? "bg-red-500/20 text-red-400" : "bg-dark-200 text-gray-500"
                }`}
              >
                M
              </button>
              <button
                onClick={() => updateTrack(track.id, { solo: !track.solo })}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  track.solo ? "bg-yellow-500/20 text-yellow-400" : "bg-dark-200 text-gray-500"
                }`}
              >
                S
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                <span className="text-[10px] text-gray-500">VOL</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={track.volume * 100}
                  onChange={(e) => updateTrack(track.id, { volume: parseInt(e.target.value) / 100 })}
                  className="slider-track flex-1"
                />
                <span className="text-[10px] text-gray-400 w-8 text-right">
                  {Math.round(track.volume * 100)}
                </span>
              </div>

              {/* Pan */}
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-[10px] text-gray-500">PAN</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={track.pan * 100}
                  onChange={(e) => updateTrack(track.id, { pan: parseInt(e.target.value) / 100 })}
                  className="slider-track flex-1"
                />
                <span className="text-[10px] text-gray-400 w-6 text-right">
                  {track.pan === 0 ? "C" : track.pan > 0 ? `R${Math.round(track.pan * 100)}` : `L${Math.round(Math.abs(track.pan) * 100)}`}
                </span>
              </div>

              {/* Effects count */}
              <button
                onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                className="glass-button text-xs flex items-center gap-1 px-2 py-1"
              >
                <span>FX</span>
                <span className="text-primary-400">{track.effects.filter((e) => e.enabled).length}</span>
              </button>

              {/* Mini waveform visualization */}
              <div className="flex items-end gap-px h-8 min-w-[60px]">
                {Array.from({ length: 16 }).map((_, i) => {
                  const height = track.muted
                    ? 2
                    : Math.max(4, Math.random() * 32 * track.volume);
                  return (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-primary-600 to-primary-400 transition-all"
                      style={{
                        height: `${height}px`,
                        opacity: track.muted ? 0.2 : 0.6 + Math.random() * 0.4,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Expanded Effects Panel */}
            {expandedTrack === track.id && (
              <div className="ml-8 mt-2 p-3 rounded-xl bg-dark-200/50 border border-white/5 space-y-2">
                <div className="text-xs text-gray-500 mb-2">이펙트 체인</div>
                {track.effects.length === 0 ? (
                  <div className="text-xs text-gray-600">이펙트가 없습니다</div>
                ) : (
                  track.effects.map((effect, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <button
                        onClick={() => toggleEffect(track.id, i)}
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                          effect.enabled
                            ? "bg-primary-500/20 text-primary-400"
                            : "bg-dark-100 text-gray-600"
                        }`}
                      >
                        {effect.enabled ? "●" : "○"}
                      </button>
                      <span className={effect.enabled ? "text-white" : "text-gray-600"}>
                        {EFFECT_LABELS[effect.type]}
                      </span>
                      <div className="flex gap-2 text-gray-500">
                        {Object.entries(effect.params).map(([key, val]) => (
                          <span key={key}>
                            {key}: {typeof val === "number" ? val.toFixed(2) : val}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
