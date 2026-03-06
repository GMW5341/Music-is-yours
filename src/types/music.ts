export type Genre =
  | "pop"
  | "rock"
  | "hiphop"
  | "rnb"
  | "jazz"
  | "classical"
  | "electronic"
  | "edm"
  | "house"
  | "techno"
  | "trance"
  | "dubstep"
  | "ambient"
  | "lofi"
  | "country"
  | "folk"
  | "blues"
  | "soul"
  | "funk"
  | "reggae"
  | "latin"
  | "kpop"
  | "jpop"
  | "metal"
  | "punk"
  | "indie"
  | "alternative"
  | "gospel"
  | "soundtrack"
  | "newage"
  | "world";

export const GENRE_INFO: Record<Genre, { label: string; labelKo: string; color: string; icon: string }> = {
  pop: { label: "Pop", labelKo: "팝", color: "#FF6B9D", icon: "🎵" },
  rock: { label: "Rock", labelKo: "록", color: "#E74C3C", icon: "🎸" },
  hiphop: { label: "Hip Hop", labelKo: "힙합", color: "#F39C12", icon: "🎤" },
  rnb: { label: "R&B", labelKo: "알앤비", color: "#9B59B6", icon: "🎙️" },
  jazz: { label: "Jazz", labelKo: "재즈", color: "#1ABC9C", icon: "🎷" },
  classical: { label: "Classical", labelKo: "클래식", color: "#34495E", icon: "🎻" },
  electronic: { label: "Electronic", labelKo: "일렉트로닉", color: "#00D4FF", icon: "🎹" },
  edm: { label: "EDM", labelKo: "EDM", color: "#FF00FF", icon: "💿" },
  house: { label: "House", labelKo: "하우스", color: "#FF6600", icon: "🏠" },
  techno: { label: "Techno", labelKo: "테크노", color: "#333333", icon: "⚡" },
  trance: { label: "Trance", labelKo: "트랜스", color: "#7B68EE", icon: "🌀" },
  dubstep: { label: "Dubstep", labelKo: "덥스텝", color: "#8B0000", icon: "🔊" },
  ambient: { label: "Ambient", labelKo: "앰비언트", color: "#87CEEB", icon: "🌊" },
  lofi: { label: "Lo-Fi", labelKo: "로파이", color: "#DEB887", icon: "☕" },
  country: { label: "Country", labelKo: "컨트리", color: "#DAA520", icon: "🤠" },
  folk: { label: "Folk", labelKo: "포크", color: "#8FBC8F", icon: "🪕" },
  blues: { label: "Blues", labelKo: "블루스", color: "#4169E1", icon: "🎺" },
  soul: { label: "Soul", labelKo: "소울", color: "#CD853F", icon: "💜" },
  funk: { label: "Funk", labelKo: "펑크", color: "#FF4500", icon: "🕺" },
  reggae: { label: "Reggae", labelKo: "레게", color: "#228B22", icon: "🌴" },
  latin: { label: "Latin", labelKo: "라틴", color: "#FF1493", icon: "💃" },
  kpop: { label: "K-Pop", labelKo: "케이팝", color: "#FF69B4", icon: "🇰🇷" },
  jpop: { label: "J-Pop", labelKo: "제이팝", color: "#FF7F50", icon: "🇯🇵" },
  metal: { label: "Metal", labelKo: "메탈", color: "#2F4F4F", icon: "🤘" },
  punk: { label: "Punk", labelKo: "펑크", color: "#DC143C", icon: "💀" },
  indie: { label: "Indie", labelKo: "인디", color: "#DDA0DD", icon: "🌸" },
  alternative: { label: "Alternative", labelKo: "얼터너티브", color: "#708090", icon: "🔮" },
  gospel: { label: "Gospel", labelKo: "가스펠", color: "#FFD700", icon: "✝️" },
  soundtrack: { label: "Soundtrack", labelKo: "사운드트랙", color: "#4682B4", icon: "🎬" },
  newage: { label: "New Age", labelKo: "뉴에이지", color: "#E0FFFF", icon: "🧘" },
  world: { label: "World", labelKo: "월드뮤직", color: "#32CD32", icon: "🌍" },
};

export type Key = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";
export type Scale = "major" | "minor" | "dorian" | "mixolydian" | "pentatonic" | "blues" | "harmonic_minor" | "melodic_minor";

export interface TrackLayer {
  id: string;
  name: string;
  type: "melody" | "harmony" | "bass" | "drums" | "pad" | "fx" | "vocal";
  instrument: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  notes: NoteEvent[];
  effects: Effect[];
}

export interface NoteEvent {
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
}

export interface Effect {
  type: "reverb" | "delay" | "chorus" | "distortion" | "compressor" | "eq" | "filter" | "phaser" | "flanger" | "bitcrusher" | "autopan" | "tremolo";
  params: Record<string, number>;
  enabled: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  bpm: number;
  key: Key;
  scale: Scale;
  duration: number;
  tracks: TrackLayer[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  likes: number;
  plays: number;
  coverArt?: string;
  tags: string[];
}

export interface ComposeRequest {
  prompt: string;
  genre?: Genre;
  mood?: string;
  bpm?: number;
  key?: Key;
  scale?: Scale;
  duration?: number;
  referenceStyle?: string;
}

export interface ProducerFeature {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  category: "arrangement" | "mixing" | "mastering" | "sound_design" | "composition";
  naturalLanguageHints: string[];
}

export interface JudgeScore {
  category: string;
  categoryKo: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface JudgeResult {
  songId: string;
  totalScore: number;
  maxTotalScore: number;
  scores: JudgeScore[];
  overallFeedback: string;
  rank?: number;
  judgeName: string;
  judgePersonality: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  genre?: Genre;
  theme: string;
  startDate: string;
  endDate: string;
  submissions: CompetitionEntry[];
  judges: AIJudge[];
  status: "upcoming" | "active" | "judging" | "completed";
}

export interface CompetitionEntry {
  songId: string;
  userId: string;
  userName: string;
  submittedAt: string;
  judgeResults: JudgeResult[];
  finalScore?: number;
}

export interface AIJudge {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  expertise: Genre[];
  strictness: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  songs: string[];
  contacts: Contact[];
  competitions: string[];
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  isFriend: boolean;
}

export interface ShareTarget {
  type: "contact" | "community" | "link";
  targetId?: string;
  targetName?: string;
}
