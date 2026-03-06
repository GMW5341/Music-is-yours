import { v4 as uuidv4 } from "uuid";
import {
  ComposeRequest,
  Genre,
  Key,
  Scale,
  Song,
  TrackLayer,
  NoteEvent,
  Effect,
  ProducerFeature,
} from "@/types/music";

// Natural language -> music parameter mapping
const MOOD_MAP: Record<string, { bpmRange: [number, number]; scaleHint: Scale; energy: number }> = {
  "신나는": { bpmRange: [120, 140], scaleHint: "major", energy: 0.9 },
  "행복한": { bpmRange: [110, 130], scaleHint: "major", energy: 0.7 },
  "슬픈": { bpmRange: [60, 80], scaleHint: "minor", energy: 0.3 },
  "차분한": { bpmRange: [70, 90], scaleHint: "dorian", energy: 0.3 },
  "몽환적인": { bpmRange: [80, 100], scaleHint: "mixolydian", energy: 0.4 },
  "강렬한": { bpmRange: [130, 160], scaleHint: "minor", energy: 1.0 },
  "로맨틱한": { bpmRange: [80, 100], scaleHint: "major", energy: 0.5 },
  "우울한": { bpmRange: [60, 75], scaleHint: "harmonic_minor", energy: 0.2 },
  "파워풀한": { bpmRange: [120, 150], scaleHint: "minor", energy: 0.95 },
  "편안한": { bpmRange: [70, 90], scaleHint: "pentatonic", energy: 0.3 },
  "그루비한": { bpmRange: [95, 115], scaleHint: "mixolydian", energy: 0.7 },
  "서정적인": { bpmRange: [70, 90], scaleHint: "major", energy: 0.4 },
  "dark": { bpmRange: [80, 120], scaleHint: "harmonic_minor", energy: 0.6 },
  "happy": { bpmRange: [110, 130], scaleHint: "major", energy: 0.7 },
  "sad": { bpmRange: [60, 80], scaleHint: "minor", energy: 0.3 },
  "energetic": { bpmRange: [120, 140], scaleHint: "major", energy: 0.9 },
  "chill": { bpmRange: [70, 90], scaleHint: "dorian", energy: 0.3 },
  "epic": { bpmRange: [100, 130], scaleHint: "minor", energy: 0.95 },
  "dreamy": { bpmRange: [80, 100], scaleHint: "mixolydian", energy: 0.4 },
  "groovy": { bpmRange: [95, 115], scaleHint: "mixolydian", energy: 0.7 },
};

const GENRE_DEFAULTS: Record<Genre, { bpm: number; key: Key; instruments: string[]; trackTypes: TrackLayer["type"][] }> = {
  pop: { bpm: 120, key: "C", instruments: ["synth_pad", "electric_piano", "bass_synth", "drum_machine"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  rock: { bpm: 130, key: "E", instruments: ["electric_guitar", "rhythm_guitar", "bass_guitar", "drum_kit"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  hiphop: { bpm: 90, key: "G", instruments: ["808_bass", "hi_hat", "synth_lead", "drum_machine"], trackTypes: ["melody", "bass", "drums", "fx"] },
  rnb: { bpm: 85, key: "Ab", instruments: ["electric_piano", "bass_synth", "pad", "drum_machine"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  jazz: { bpm: 110, key: "Bb", instruments: ["piano", "upright_bass", "saxophone", "brush_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  classical: { bpm: 80, key: "D", instruments: ["strings", "piano", "woodwinds", "brass"], trackTypes: ["melody", "harmony", "pad", "bass"] },
  electronic: { bpm: 128, key: "A", instruments: ["synth_lead", "synth_pad", "bass_synth", "drum_machine"], trackTypes: ["melody", "pad", "bass", "drums"] },
  edm: { bpm: 128, key: "F", instruments: ["supersaw", "pluck_synth", "sub_bass", "edm_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  house: { bpm: 124, key: "G", instruments: ["organ", "synth_stab", "deep_bass", "house_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  techno: { bpm: 130, key: "A", instruments: ["acid_synth", "dark_pad", "techno_bass", "techno_drums"], trackTypes: ["melody", "pad", "bass", "drums"] },
  trance: { bpm: 138, key: "C", instruments: ["trance_lead", "trance_pad", "trance_bass", "trance_drums"], trackTypes: ["melody", "pad", "bass", "drums"] },
  dubstep: { bpm: 140, key: "F", instruments: ["wobble_bass", "reese_bass", "synth_lead", "dubstep_drums"], trackTypes: ["melody", "bass", "drums", "fx"] },
  ambient: { bpm: 70, key: "D", instruments: ["ambient_pad", "texture", "glass_bell", "field_recording"], trackTypes: ["pad", "harmony", "melody", "fx"] },
  lofi: { bpm: 80, key: "F", instruments: ["lofi_piano", "lofi_guitar", "vinyl_bass", "lofi_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  country: { bpm: 110, key: "G", instruments: ["acoustic_guitar", "banjo", "bass_guitar", "country_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  folk: { bpm: 100, key: "C", instruments: ["acoustic_guitar", "mandolin", "upright_bass", "percussion"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  blues: { bpm: 85, key: "E", instruments: ["blues_guitar", "harmonica", "bass_guitar", "shuffle_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  soul: { bpm: 90, key: "Bb", instruments: ["electric_piano", "brass_section", "bass_guitar", "soul_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  funk: { bpm: 105, key: "E", instruments: ["clavinet", "wah_guitar", "slap_bass", "funk_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  reggae: { bpm: 80, key: "C", instruments: ["reggae_guitar", "organ", "bass_guitar", "reggae_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  latin: { bpm: 100, key: "A", instruments: ["nylon_guitar", "brass", "bass", "latin_percussion"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  kpop: { bpm: 125, key: "C", instruments: ["synth_lead", "synth_pad", "bass_synth", "kpop_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  jpop: { bpm: 118, key: "D", instruments: ["electric_piano", "synth_lead", "bass_synth", "jpop_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  metal: { bpm: 160, key: "E", instruments: ["distortion_guitar", "rhythm_guitar", "bass_guitar", "double_kick"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  punk: { bpm: 170, key: "A", instruments: ["power_chord_guitar", "punk_bass", "punk_drums", "shout_vocal"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  indie: { bpm: 115, key: "C", instruments: ["jangly_guitar", "synth_pad", "bass_guitar", "indie_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  alternative: { bpm: 120, key: "D", instruments: ["alt_guitar", "synth", "bass_guitar", "alt_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  gospel: { bpm: 95, key: "C", instruments: ["organ", "piano", "bass_guitar", "gospel_drums"], trackTypes: ["melody", "harmony", "bass", "drums"] },
  soundtrack: { bpm: 90, key: "D", instruments: ["orchestra_strings", "brass", "choir", "timpani"], trackTypes: ["melody", "harmony", "pad", "drums"] },
  newage: { bpm: 75, key: "C", instruments: ["crystal_pad", "harp", "flute", "nature_sounds"], trackTypes: ["melody", "harmony", "pad", "fx"] },
  world: { bpm: 100, key: "D", instruments: ["sitar", "tabla", "didgeridoo", "world_percussion"], trackTypes: ["melody", "harmony", "bass", "drums"] },
};

const SCALE_INTERVALS: Record<Scale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
};

const KEY_OFFSETS: Record<string, number> = {
  C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
};

export const PRODUCER_FEATURES: ProducerFeature[] = [
  {
    id: "sidechain",
    name: "Sidechain Compression",
    nameKo: "사이드체인 컴프레션",
    description: "Duck audio signals using another track's volume",
    descriptionKo: "킥 드럼에 맞춰 베이스나 패드를 자동으로 볼륨 다운",
    category: "mixing",
    naturalLanguageHints: ["사이드체인 걸어줘", "킥에 맞춰 펌핑 효과", "add sidechain", "pumping effect"],
  },
  {
    id: "reverb_send",
    name: "Reverb Send",
    nameKo: "리버브 센드",
    description: "Add spatial depth with reverb effect",
    descriptionKo: "공간감을 더해주는 리버브 효과 추가",
    category: "mixing",
    naturalLanguageHints: ["리버브 추가", "공간감 넣어줘", "더 넓게", "add reverb", "more spacious"],
  },
  {
    id: "eq_sculpt",
    name: "EQ Sculpting",
    nameKo: "이퀄라이저 조정",
    description: "Shape frequency balance of tracks",
    descriptionKo: "트랙의 주파수 밸런스를 조정",
    category: "mixing",
    naturalLanguageHints: ["이큐 조정", "저음 강조", "고음 깎아줘", "bass boost", "bright", "warm"],
  },
  {
    id: "auto_arrangement",
    name: "Auto Arrangement",
    nameKo: "자동 편곡",
    description: "Automatically arrange song sections (intro, verse, chorus, bridge, outro)",
    descriptionKo: "인트로, 벌스, 코러스, 브릿지, 아웃트로 자동 편곡",
    category: "arrangement",
    naturalLanguageHints: ["편곡해줘", "구성 만들어줘", "arrange", "song structure"],
  },
  {
    id: "chord_progression",
    name: "Chord Progression",
    nameKo: "코드 진행",
    description: "Generate chord progressions matching the mood",
    descriptionKo: "분위기에 맞는 코드 진행 생성",
    category: "composition",
    naturalLanguageHints: ["코드 진행", "화음", "chord", "harmony", "진행 바꿔줘"],
  },
  {
    id: "layering",
    name: "Sound Layering",
    nameKo: "사운드 레이어링",
    description: "Layer multiple sounds for richer texture",
    descriptionKo: "여러 사운드를 겹쳐서 풍성한 텍스처 생성",
    category: "sound_design",
    naturalLanguageHints: ["레이어링", "소리 겹쳐줘", "더 풍성하게", "layer", "thicker"],
  },
  {
    id: "stereo_width",
    name: "Stereo Width",
    nameKo: "스테레오 와이드닝",
    description: "Control stereo image width",
    descriptionKo: "스테레오 이미지의 넓이를 조절",
    category: "mixing",
    naturalLanguageHints: ["스테레오 넓혀줘", "와이드하게", "wider", "stereo spread"],
  },
  {
    id: "mastering",
    name: "AI Mastering",
    nameKo: "AI 마스터링",
    description: "Automatic mastering with limiter, EQ, and stereo enhancement",
    descriptionKo: "리미터, EQ, 스테레오 향상을 포함한 자동 마스터링",
    category: "mastering",
    naturalLanguageHints: ["마스터링", "마스터 해줘", "완성해줘", "master", "finalize"],
  },
  {
    id: "arpeggiator",
    name: "Arpeggiator",
    nameKo: "아르페지에이터",
    description: "Create arpeggiated patterns from chords",
    descriptionKo: "코드를 아르페지오 패턴으로 자동 분해",
    category: "composition",
    naturalLanguageHints: ["아르페지오", "분산화음", "arpeggio", "arp"],
  },
  {
    id: "vocal_chop",
    name: "Vocal Chop",
    nameKo: "보컬 찹",
    description: "Create rhythmic vocal chop patterns",
    descriptionKo: "보컬 샘플을 리듬감 있게 잘라서 패턴 생성",
    category: "sound_design",
    naturalLanguageHints: ["보컬 찹", "보컬 잘라줘", "vocal chop", "chop"],
  },
  {
    id: "automation",
    name: "Parameter Automation",
    nameKo: "파라미터 오토메이션",
    description: "Automate filter, volume, and effect parameters over time",
    descriptionKo: "필터, 볼륨, 이펙트 파라미터를 시간에 따라 자동 변화",
    category: "mixing",
    naturalLanguageHints: ["오토메이션", "자동 변화", "필터 스윕", "automation", "sweep"],
  },
  {
    id: "tempo_change",
    name: "Tempo Variation",
    nameKo: "템포 변화",
    description: "Add tempo changes for dynamic feel",
    descriptionKo: "곡 중간에 템포 변화를 추가하여 역동적인 느낌",
    category: "arrangement",
    naturalLanguageHints: ["템포 바꿔줘", "빨라지게", "느려지게", "tempo change", "speed up", "slow down"],
  },
];

function getScaleNotes(key: Key, scale: Scale, octave: number): number[] {
  const baseNote = KEY_OFFSETS[key] + octave * 12;
  return SCALE_INTERVALS[scale].map((interval) => baseNote + interval);
}

function generateMelody(key: Key, scale: Scale, bars: number, bpm: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const scaleNotes = [
    ...getScaleNotes(key, scale, 4),
    ...getScaleNotes(key, scale, 5),
  ];
  const beatDuration = 60 / bpm;
  let currentTime = 0;

  for (let bar = 0; bar < bars; bar++) {
    const notesPerBar = 4 + Math.floor(Math.random() * 4);
    for (let n = 0; n < notesPerBar; n++) {
      const pitch = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
      const durations = [0.25, 0.5, 0.75, 1];
      const duration = durations[Math.floor(Math.random() * durations.length)] * beatDuration;
      const velocity = 60 + Math.floor(Math.random() * 40);

      notes.push({ pitch, startTime: currentTime, duration, velocity });
      currentTime += duration;
    }
  }
  return notes;
}

function generateBassline(key: Key, scale: Scale, bars: number, bpm: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const scaleNotes = getScaleNotes(key, scale, 2);
  const beatDuration = 60 / bpm;

  for (let bar = 0; bar < bars; bar++) {
    const root = scaleNotes[0];
    const fifth = scaleNotes[4 % scaleNotes.length];

    notes.push({ pitch: root, startTime: bar * 4 * beatDuration, duration: beatDuration * 2, velocity: 80 });
    notes.push({ pitch: fifth, startTime: bar * 4 * beatDuration + beatDuration * 2, duration: beatDuration * 2, velocity: 75 });
  }
  return notes;
}

function generateDrumPattern(bars: number, bpm: number, genre: Genre): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const beatDuration = 60 / bpm;
  const kick = 36, snare = 38, hihat = 42, openHat = 46;

  for (let bar = 0; bar < bars; bar++) {
    const barStart = bar * 4 * beatDuration;
    // Basic 4/4 pattern
    for (let beat = 0; beat < 4; beat++) {
      const t = barStart + beat * beatDuration;
      // Hi-hat on every 8th note
      notes.push({ pitch: hihat, startTime: t, duration: 0.1, velocity: 70 });
      notes.push({ pitch: hihat, startTime: t + beatDuration * 0.5, duration: 0.1, velocity: 55 });
    }
    // Kick pattern
    notes.push({ pitch: kick, startTime: barStart, duration: 0.2, velocity: 100 });
    notes.push({ pitch: kick, startTime: barStart + beatDuration * 2.5, duration: 0.2, velocity: 90 });
    // Snare on 2 and 4
    notes.push({ pitch: snare, startTime: barStart + beatDuration, duration: 0.15, velocity: 95 });
    notes.push({ pitch: snare, startTime: barStart + beatDuration * 3, duration: 0.15, velocity: 95 });

    // Genre-specific additions
    if (genre === "hiphop" || genre === "rnb") {
      notes.push({ pitch: openHat, startTime: barStart + beatDuration * 1.75, duration: 0.2, velocity: 60 });
    }
  }
  return notes;
}

function generatePadNotes(key: Key, scale: Scale, bars: number, bpm: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const scaleNotes = getScaleNotes(key, scale, 3);
  const beatDuration = 60 / bpm;

  for (let bar = 0; bar < bars; bar++) {
    const root = scaleNotes[0];
    const third = scaleNotes[2 % scaleNotes.length];
    const fifth = scaleNotes[4 % scaleNotes.length];

    [root, third, fifth].forEach((pitch) => {
      notes.push({
        pitch,
        startTime: bar * 4 * beatDuration,
        duration: 4 * beatDuration,
        velocity: 50,
      });
    });
  }
  return notes;
}

function getDefaultEffects(trackType: TrackLayer["type"]): Effect[] {
  switch (trackType) {
    case "melody":
      return [
        { type: "reverb", params: { decay: 2.5, mix: 0.25 }, enabled: true },
        { type: "delay", params: { time: 0.375, feedback: 0.3, mix: 0.15 }, enabled: true },
      ];
    case "bass":
      return [
        { type: "compressor", params: { threshold: -20, ratio: 4, attack: 0.01, release: 0.1 }, enabled: true },
        { type: "eq", params: { lowGain: 3, midGain: -2, highGain: -4 }, enabled: true },
      ];
    case "drums":
      return [
        { type: "compressor", params: { threshold: -15, ratio: 3, attack: 0.005, release: 0.05 }, enabled: true },
      ];
    case "pad":
      return [
        { type: "reverb", params: { decay: 4.0, mix: 0.4 }, enabled: true },
        { type: "chorus", params: { rate: 0.5, depth: 0.7, mix: 0.3 }, enabled: true },
      ];
    default:
      return [{ type: "reverb", params: { decay: 2.0, mix: 0.2 }, enabled: true }];
  }
}

export function parseNaturalLanguagePrompt(prompt: string): Partial<ComposeRequest> {
  const result: Partial<ComposeRequest> = {};
  const lower = prompt.toLowerCase();

  // Detect genre from prompt
  const genreKeywords: Record<string, Genre> = {
    "팝": "pop", "록": "rock", "힙합": "hiphop", "알앤비": "rnb", "r&b": "rnb",
    "재즈": "jazz", "클래식": "classical", "일렉": "electronic", "edm": "edm",
    "하우스": "house", "테크노": "techno", "트랜스": "trance", "덥스텝": "dubstep",
    "앰비언트": "ambient", "로파이": "lofi", "lo-fi": "lofi", "컨트리": "country",
    "포크": "folk", "블루스": "blues", "소울": "soul", "펑크뮤직": "funk", "funk": "funk",
    "레게": "reggae", "라틴": "latin", "케이팝": "kpop", "k-pop": "kpop", "k팝": "kpop",
    "제이팝": "jpop", "j-pop": "jpop", "메탈": "metal", "punk": "punk", "펑크록": "punk",
    "인디": "indie", "얼터너티브": "alternative", "가스펠": "gospel", "사운드트랙": "soundtrack",
    "ost": "soundtrack", "뉴에이지": "newage", "월드뮤직": "world",
    "pop": "pop", "rock": "rock", "hip hop": "hiphop", "jazz": "jazz",
    "classical": "classical", "electronic": "electronic", "ambient": "ambient",
  };

  for (const [keyword, genre] of Object.entries(genreKeywords)) {
    if (lower.includes(keyword)) {
      result.genre = genre;
      break;
    }
  }

  // Detect mood
  for (const [mood, config] of Object.entries(MOOD_MAP)) {
    if (lower.includes(mood)) {
      result.mood = mood;
      result.bpm = config.bpmRange[0] + Math.floor(Math.random() * (config.bpmRange[1] - config.bpmRange[0]));
      result.scale = config.scaleHint;
      break;
    }
  }

  // Detect BPM from text
  const bpmMatch = lower.match(/(\d{2,3})\s*bpm/);
  if (bpmMatch) {
    result.bpm = parseInt(bpmMatch[1]);
  }

  // Detect key
  const keyMatch = lower.match(/\b([A-G][#b]?)\s*(메이저|마이너|major|minor)?\b/i);
  if (keyMatch) {
    result.key = keyMatch[1].replace("b", "#") as Key;
  }

  return result;
}

export function composeFromRequest(request: ComposeRequest): Song {
  const genre = request.genre || "pop";
  const defaults = GENRE_DEFAULTS[genre];
  const bpm = request.bpm || defaults.bpm;
  const key = request.key || defaults.key;
  const scale = request.scale || "major";
  const bars = Math.round((request.duration || 30) / (4 * 60 / bpm));
  const duration = request.duration || 30;

  const tracks: TrackLayer[] = defaults.trackTypes.map((type, i) => {
    let notes: NoteEvent[];
    switch (type) {
      case "melody":
        notes = generateMelody(key, scale, bars, bpm);
        break;
      case "bass":
        notes = generateBassline(key, scale, bars, bpm);
        break;
      case "drums":
        notes = generateDrumPattern(bars, bpm, genre);
        break;
      case "pad":
      case "harmony":
        notes = generatePadNotes(key, scale, bars, bpm);
        break;
      default:
        notes = generateMelody(key, scale, bars, bpm);
    }

    return {
      id: uuidv4(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${defaults.instruments[i]}`,
      type,
      instrument: defaults.instruments[i],
      volume: type === "drums" ? 0.8 : type === "bass" ? 0.75 : 0.7,
      pan: type === "melody" ? 0 : type === "harmony" ? 0.3 : type === "pad" ? -0.3 : 0,
      muted: false,
      solo: false,
      notes,
      effects: getDefaultEffects(type),
    };
  });

  return {
    id: uuidv4(),
    title: request.prompt.slice(0, 50),
    artist: "AI Composer",
    genre,
    bpm,
    key,
    scale,
    duration,
    tracks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false,
    likes: 0,
    plays: 0,
    tags: [genre, request.mood || ""].filter(Boolean),
  };
}

export function applyProducerFeature(song: Song, featureId: string, params?: Record<string, unknown>): Song {
  const updated = { ...song, updatedAt: new Date().toISOString() };

  switch (featureId) {
    case "sidechain": {
      const bassTrack = updated.tracks.find((t) => t.type === "bass");
      if (bassTrack) {
        bassTrack.effects.push({
          type: "compressor",
          params: { threshold: -30, ratio: 8, attack: 0.001, release: 0.15, sidechain: 1 },
          enabled: true,
        });
      }
      break;
    }
    case "reverb_send": {
      updated.tracks.forEach((track) => {
        if (track.type !== "drums" && track.type !== "bass") {
          const existingReverb = track.effects.find((e) => e.type === "reverb");
          if (existingReverb) {
            existingReverb.params.mix = Math.min(existingReverb.params.mix + 0.15, 0.8);
          } else {
            track.effects.push({ type: "reverb", params: { decay: 3.0, mix: 0.3 }, enabled: true });
          }
        }
      });
      break;
    }
    case "eq_sculpt": {
      updated.tracks.forEach((track) => {
        track.effects.push({
          type: "eq",
          params: {
            lowGain: track.type === "bass" ? 3 : -2,
            midGain: track.type === "melody" ? 2 : 0,
            highGain: track.type === "drums" ? 2 : 0,
          },
          enabled: true,
        });
      });
      break;
    }
    case "mastering": {
      updated.tracks.forEach((track) => {
        if (!track.effects.find((e) => e.type === "compressor")) {
          track.effects.push({
            type: "compressor",
            params: { threshold: -10, ratio: 2, attack: 0.02, release: 0.2 },
            enabled: true,
          });
        }
      });
      break;
    }
    case "stereo_width": {
      updated.tracks.forEach((track) => {
        if (track.type === "harmony" || track.type === "pad") {
          track.pan = track.pan > 0 ? 0.6 : -0.6;
          track.effects.push({
            type: "chorus",
            params: { rate: 0.3, depth: 0.5, mix: 0.25 },
            enabled: true,
          });
        }
      });
      break;
    }
  }

  return updated;
}

export function getTextSuggestions(currentPrompt: string): string[] {
  const lower = currentPrompt.toLowerCase();
  const suggestions: string[] = [];

  if (lower.length === 0) {
    return [
      "신나는 팝 음악 만들어줘",
      "차분한 로파이 힙합",
      "강렬한 EDM 드롭",
      "서정적인 피아노 발라드",
      "그루비한 펑크 비트",
      "몽환적인 앰비언트",
    ];
  }

  // Genre suggestions
  if (!Object.keys(GENRE_DEFAULTS).some((g) => lower.includes(g))) {
    suggestions.push("+ 팝 스타일로", "+ 힙합 비트로", "+ 재즈 느낌으로", "+ EDM 스타일로");
  }

  // Mood suggestions
  if (!Object.keys(MOOD_MAP).some((m) => lower.includes(m))) {
    suggestions.push("+ 신나는 느낌", "+ 차분한 분위기", "+ 강렬하게", "+ 몽환적으로");
  }

  // Producer feature suggestions
  suggestions.push(
    "+ 사이드체인 추가",
    "+ 리버브 더 넣어줘",
    "+ 스테레오 넓혀줘",
    "+ 마스터링 해줘",
  );

  return suggestions.slice(0, 6);
}
