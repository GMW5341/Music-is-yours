import { Genre, Key, Scale } from "@/types/music";
import { ReferenceTrackInput } from "./reference-analyzer";
import {
  getKnowledgeGraph,
  GenreKnowledgeProfile,
  UnifiedKnowledgeObject,
} from "./knowledge-plane";

// ============================================================================
// Admin Data Pipeline
// 관리자가 시중 노래들을 대량으로 인제스트하여
// 지식 그래프의 기본 모델 수준을 높이는 파이프라인
// ============================================================================

export interface AdminIngestJob {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  totalTracks: number;
  processedTracks: number;
  failedTracks: number;
  startedAt: string;
  completedAt?: string;
  results: IngestResult[];
}

export interface IngestResult {
  title: string;
  artist: string;
  genre: Genre;
  status: "success" | "failed";
  objectId?: string;
  error?: string;
}

export interface AdminStats {
  totalKnowledgeObjects: number;
  genreBreakdown: Record<string, number>;
  avgConfidence: number;
  genreProfiles: GenreKnowledgeProfile[];
  recentIngests: IngestResult[];
  modelHealth: ModelHealthStatus;
}

export interface ModelHealthStatus {
  overallScore: number;           // 0~1
  genreCoverage: number;          // 커버된 장르 비율
  minSamplesPerGenre: number;
  avgSamplesPerGenre: number;
  underrepresentedGenres: Genre[];
  recommendations: string[];
}

// --- 시중 노래 데이터 카탈로그 (사전 정의된 메타데이터) ---

export const COMMERCIAL_SONG_CATALOG: ReferenceTrackInput[] = [
  // K-Pop
  { title: "Dynamite", artist: "BTS", genre: "kpop", bpm: 114, key: "C#", scale: "major", duration: 199, tags: ["dance", "disco", "bright"] },
  { title: "How You Like That", artist: "BLACKPINK", genre: "kpop", bpm: 130, key: "D", scale: "minor", duration: 181, tags: ["edm", "trap", "powerful"] },
  { title: "Next Level", artist: "aespa", genre: "kpop", bpm: 108, key: "A", scale: "minor", duration: 224, tags: ["experimental", "hyperpop"] },
  { title: "Ditto", artist: "NewJeans", genre: "kpop", bpm: 100, key: "E", scale: "minor", duration: 186, tags: ["jersey_club", "retro", "dreamy"] },
  { title: "Super Shy", artist: "NewJeans", genre: "kpop", bpm: 120, key: "C", scale: "major", duration: 162, tags: ["uk_garage", "bright", "catchy"] },
  { title: "ANTIFRAGILE", artist: "LE SSERAFIM", genre: "kpop", bpm: 125, key: "A", scale: "minor", duration: 187, tags: ["electro", "powerful"] },
  { title: "Love Dive", artist: "IVE", genre: "kpop", bpm: 115, key: "F", scale: "major", duration: 178, tags: ["synth_pop", "elegant"] },
  { title: "Butter", artist: "BTS", genre: "kpop", bpm: 110, key: "D", scale: "major", duration: 165, tags: ["disco", "funk", "summer"] },

  // Pop
  { title: "Blinding Lights", artist: "The Weeknd", genre: "pop", bpm: 171, key: "F", scale: "minor", duration: 200, tags: ["synthwave", "retro", "driving"] },
  { title: "Shape of You", artist: "Ed Sheeran", genre: "pop", bpm: 96, key: "C#", scale: "minor", duration: 233, tags: ["tropical_house", "dancehall"] },
  { title: "Levitating", artist: "Dua Lipa", genre: "pop", bpm: 103, key: "B", scale: "minor", duration: 203, tags: ["disco", "dance", "retro"] },
  { title: "Anti-Hero", artist: "Taylor Swift", genre: "pop", bpm: 97, key: "E", scale: "major", duration: 201, tags: ["synth_pop", "introspective"] },
  { title: "As It Was", artist: "Harry Styles", genre: "pop", bpm: 174, key: "F", scale: "major", duration: 167, tags: ["synth_pop", "80s", "bittersweet"] },
  { title: "Flowers", artist: "Miley Cyrus", genre: "pop", bpm: 118, key: "A", scale: "minor", duration: 200, tags: ["disco", "empowerment"] },

  // Hip Hop
  { title: "HUMBLE.", artist: "Kendrick Lamar", genre: "hiphop", bpm: 150, key: "F#", scale: "minor", duration: 177, tags: ["trap", "aggressive"] },
  { title: "Sicko Mode", artist: "Travis Scott", genre: "hiphop", bpm: 155, key: "A", scale: "minor", duration: 312, tags: ["trap", "experimental", "switch"] },
  { title: "God's Plan", artist: "Drake", genre: "hiphop", bpm: 77, key: "B", scale: "major", duration: 198, tags: ["melodic", "ambient_trap"] },
  { title: "Daechwita", artist: "Agust D", genre: "hiphop", bpm: 130, key: "C", scale: "minor", duration: 237, tags: ["korean", "traditional", "aggressive"] },

  // R&B
  { title: "Blinding Lights", artist: "SZA", genre: "rnb", bpm: 89, key: "D", scale: "minor", duration: 258, tags: ["neo_soul", "ethereal"] },
  { title: "Snooze", artist: "SZA", genre: "rnb", bpm: 84, key: "C", scale: "major", duration: 202, tags: ["dreamy", "emotional"] },

  // EDM
  { title: "Titanium", artist: "David Guetta", genre: "edm", bpm: 126, key: "D", scale: "minor", duration: 245, tags: ["progressive_house", "vocal", "epic"] },
  { title: "Clarity", artist: "Zedd", genre: "edm", bpm: 128, key: "G", scale: "minor", duration: 271, tags: ["progressive_house", "emotional"] },
  { title: "Animals", artist: "Martin Garrix", genre: "edm", bpm: 128, key: "F#", scale: "minor", duration: 186, tags: ["big_room", "festival"] },
  { title: "Lean On", artist: "Major Lazer", genre: "edm", bpm: 98, key: "G#", scale: "minor", duration: 176, tags: ["moombahton", "tropical"] },

  // Rock
  { title: "Bohemian Rhapsody", artist: "Queen", genre: "rock", bpm: 72, key: "A#", scale: "major", duration: 354, tags: ["progressive", "operatic", "classic"] },
  { title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "rock", bpm: 117, key: "F", scale: "minor", duration: 301, tags: ["grunge", "raw", "iconic"] },
  { title: "Welcome to the Black Parade", artist: "MCR", genre: "rock", bpm: 97, key: "G", scale: "major", duration: 311, tags: ["emo", "theatrical", "epic"] },

  // Jazz
  { title: "So What", artist: "Miles Davis", genre: "jazz", bpm: 136, key: "D", scale: "dorian", duration: 562, tags: ["modal", "cool", "classic"] },
  { title: "Take Five", artist: "Dave Brubeck", genre: "jazz", bpm: 172, key: "D#", scale: "minor", duration: 324, tags: ["cool", "5/4_time", "classic"] },
  { title: "Fly Me to the Moon", artist: "Frank Sinatra", genre: "jazz", bpm: 120, key: "C", scale: "major", duration: 148, tags: ["swing", "vocal", "standard"] },

  // Lo-Fi
  { title: "Snowman", artist: "WYS", genre: "lofi", bpm: 75, key: "F", scale: "minor", duration: 120, tags: ["chill", "ambient", "study"] },
  { title: "Coffee", artist: "beabadoobee", genre: "lofi", bpm: 88, key: "C", scale: "major", duration: 180, tags: ["bedroom_pop", "acoustic"] },

  // Classical
  { title: "Clair de Lune", artist: "Debussy", genre: "classical", bpm: 66, key: "C#", scale: "major", duration: 300, tags: ["impressionist", "piano", "dreamy"] },
  { title: "Moonlight Sonata", artist: "Beethoven", genre: "classical", bpm: 60, key: "C#", scale: "minor", duration: 360, tags: ["romantic", "piano", "melancholic"] },

  // Electronic
  { title: "Midnight City", artist: "M83", genre: "electronic", bpm: 105, key: "A", scale: "minor", duration: 244, tags: ["synthwave", "driving", "nostalgic"] },
  { title: "Strobe", artist: "deadmau5", genre: "electronic", bpm: 128, key: "F#", scale: "minor", duration: 637, tags: ["progressive", "atmospheric", "build"] },

  // Blues
  { title: "The Thrill Is Gone", artist: "B.B. King", genre: "blues", bpm: 88, key: "B", scale: "minor", duration: 340, tags: ["electric", "classic", "emotional"] },

  // Ambient
  { title: "Weightless", artist: "Marconi Union", genre: "ambient", bpm: 60, key: "C", scale: "major", duration: 480, tags: ["relaxing", "therapeutic", "minimal"] },

  // Indie
  { title: "Electric Feel", artist: "MGMT", genre: "indie", bpm: 115, key: "A", scale: "minor", duration: 228, tags: ["psychedelic", "synth", "groove"] },
  { title: "Do I Wanna Know?", artist: "Arctic Monkeys", genre: "indie", bpm: 85, key: "G", scale: "minor", duration: 272, tags: ["dark", "groovy", "brooding"] },

  // Funk
  { title: "Superstition", artist: "Stevie Wonder", genre: "funk", bpm: 100, key: "D#", scale: "minor", duration: 244, tags: ["clavinet", "groovy", "classic"] },

  // Soul
  { title: "Ain't No Sunshine", artist: "Bill Withers", genre: "soul", bpm: 78, key: "A", scale: "minor", duration: 125, tags: ["classic", "melancholic", "minimal"] },

  // Latin
  { title: "Despacito", artist: "Luis Fonsi", genre: "latin", bpm: 89, key: "B", scale: "minor", duration: 229, tags: ["reggaeton", "summer", "catchy"] },

  // Metal
  { title: "Master of Puppets", artist: "Metallica", genre: "metal", bpm: 212, key: "E", scale: "minor", duration: 515, tags: ["thrash", "progressive", "classic"] },

  // Reggae
  { title: "Three Little Birds", artist: "Bob Marley", genre: "reggae", bpm: 74, key: "A", scale: "major", duration: 180, tags: ["positive", "classic", "relaxing"] },
];

// --- 파이프라인 실행 ---

const ingestJobs: Map<string, AdminIngestJob> = new Map();

export function startBatchIngest(tracks?: ReferenceTrackInput[]): AdminIngestJob {
  const tracksToIngest = tracks || COMMERCIAL_SONG_CATALOG;
  const jobId = `job-${Date.now()}`;

  const job: AdminIngestJob = {
    id: jobId,
    status: "processing",
    totalTracks: tracksToIngest.length,
    processedTracks: 0,
    failedTracks: 0,
    startedAt: new Date().toISOString(),
    results: [],
  };

  ingestJobs.set(jobId, job);

  const kg = getKnowledgeGraph();

  for (const track of tracksToIngest) {
    try {
      const obj = kg.ingestTrack(track);
      job.results.push({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        status: "success",
        objectId: obj.id,
      });
      job.processedTracks++;
    } catch (e) {
      job.results.push({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        status: "failed",
        error: e instanceof Error ? e.message : "Unknown error",
      });
      job.failedTracks++;
      job.processedTracks++;
    }
  }

  job.status = job.failedTracks === 0 ? "completed" : "completed";
  job.completedAt = new Date().toISOString();

  return job;
}

export function getIngestJob(jobId: string): AdminIngestJob | undefined {
  return ingestJobs.get(jobId);
}

export function getAllIngestJobs(): AdminIngestJob[] {
  return Array.from(ingestJobs.values());
}

// --- 관리자 통계 ---

export function getAdminStats(): AdminStats {
  const kg = getKnowledgeGraph();
  const allObjects = kg.getAllObjects();

  // 장르별 분포
  const genreBreakdown: Record<string, number> = {};
  allObjects.forEach((obj) => {
    genreBreakdown[obj.musicDNA.genre] = (genreBreakdown[obj.musicDNA.genre] || 0) + 1;
  });

  // 평균 신뢰도
  const avgConfidence = allObjects.length > 0
    ? allObjects.reduce((s, o) => s + o.musicDNA.confidence, 0) / allObjects.length
    : 0;

  // 장르 프로파일
  const genreProfiles: GenreKnowledgeProfile[] = [];
  const allGenres: Genre[] = ["pop", "rock", "hiphop", "rnb", "jazz", "classical", "electronic", "edm",
    "house", "techno", "trance", "dubstep", "ambient", "lofi", "country", "folk", "blues", "soul",
    "funk", "reggae", "latin", "kpop", "jpop", "metal", "punk", "indie", "alternative", "gospel",
    "soundtrack", "newage", "world"];

  allGenres.forEach((genre) => {
    const profile = kg.getGenreProfile(genre);
    if (profile) genreProfiles.push(profile);
  });

  // 모델 건강 상태
  const coveredGenres = Object.keys(genreBreakdown).length;
  const genreCoverage = coveredGenres / allGenres.length;
  const counts = Object.values(genreBreakdown);
  const minSamples = counts.length > 0 ? Math.min(...counts) : 0;
  const avgSamples = counts.length > 0 ? counts.reduce((s, c) => s + c, 0) / counts.length : 0;

  const underrepresented = allGenres.filter((g) => (genreBreakdown[g] || 0) < 2);

  const recommendations: string[] = [];
  if (genreCoverage < 0.5) recommendations.push("더 다양한 장르의 노래를 추가해주세요");
  if (minSamples < 3) recommendations.push(`샘플이 부족한 장르가 있습니다: ${underrepresented.slice(0, 5).join(", ")}`);
  if (allObjects.length < 20) recommendations.push("전체 데이터량이 부족합니다. 최소 50곡 이상을 권장합니다");
  if (avgConfidence < 0.7) recommendations.push("분석 신뢰도가 낮습니다. 메타데이터를 더 정확하게 입력해주세요");

  const overallScore = Math.min(1,
    genreCoverage * 0.3 +
    Math.min(allObjects.length / 50, 1) * 0.3 +
    avgConfidence * 0.2 +
    (minSamples >= 3 ? 0.2 : minSamples / 3 * 0.2)
  );

  const recentJobs = Array.from(ingestJobs.values());
  const recentIngests = recentJobs
    .flatMap((j) => j.results)
    .slice(-20);

  return {
    totalKnowledgeObjects: allObjects.length,
    genreBreakdown,
    avgConfidence,
    genreProfiles,
    recentIngests,
    modelHealth: {
      overallScore,
      genreCoverage,
      minSamplesPerGenre: minSamples,
      avgSamplesPerGenre: Math.round(avgSamples * 10) / 10,
      underrepresentedGenres: underrepresented as Genre[],
      recommendations,
    },
  };
}

// --- 관리자: 커스텀 트랙 추가 ---

export function adminAddTrack(input: ReferenceTrackInput): IngestResult {
  const kg = getKnowledgeGraph();
  try {
    const obj = kg.ingestTrack(input);
    return { title: input.title, artist: input.artist, genre: input.genre, status: "success", objectId: obj.id };
  } catch (e) {
    return { title: input.title, artist: input.artist, genre: input.genre, status: "failed", error: e instanceof Error ? e.message : "Unknown error" };
  }
}
