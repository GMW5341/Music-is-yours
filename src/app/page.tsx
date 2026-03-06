"use client";

import Link from "next/link";
import { GENRE_INFO, Genre } from "@/types/music";

const FEATURED_GENRES: Genre[] = ["pop", "hiphop", "edm", "jazz", "lofi", "rock", "kpop", "classical", "rnb", "indie"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="gradient-text">Music is Yours</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 mb-4">
            AI로 누구나 프로듀서가 되는 시대
          </p>
          <p className="text-base sm:text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            자연어로 간단히 설명하면 AI가 당신의 음악을 만들어줍니다.
            친구들과 공유하고, AI 심사위원에게 평가받으세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl
                bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-lg
                hover:from-primary-400 hover:to-accent-400 transition-all duration-300 neon-glow"
            >
              🎹 작곡 시작하기
            </Link>
            <Link
              href="/competition"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl
                glass-button text-white font-bold text-lg"
            >
              🏆 경쟁에 참여하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 gradient-text">
          주요 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="🎵"
            title="AI 작곡 스튜디오"
            description="자연어로 원하는 음악을 설명하면 AI가 멜로디, 화성, 리듬을 자동으로 생성합니다. 프로듀서 수준의 이펙트와 믹싱도 한마디면 OK."
          />
          <FeatureCard
            icon="🌐"
            title="공유 & 커뮤니티"
            description="연락처를 연동해 친구들과 음악을 공유하거나, 커뮤니티에 공개해 모든 참여자와 함께 즐기세요."
          />
          <FeatureCard
            icon="🏆"
            title="AI 심사위원 경쟁"
            description="4명의 AI 심사위원이 멜로디, 리듬, 프로덕션, 창의성을 평가합니다. 점수를 올려 랭킹에 도전하세요!"
          />
        </div>
      </section>

      {/* Genre Showcase */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 gradient-text">
          모든 장르를 커버합니다
        </h2>
        <p className="text-gray-500 text-center mb-10">
          팝부터 클래식까지, {Object.keys(GENRE_INFO).length}개 이상의 장르를 지원합니다
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {FEATURED_GENRES.map((genre) => {
            const info = GENRE_INFO[genre];
            return (
              <Link
                key={genre}
                href={`/studio?genre=${genre}`}
                className="genre-chip flex items-center gap-2"
                style={{ borderColor: info.color + "40", backgroundColor: info.color + "10" }}
              >
                <span>{info.icon}</span>
                <span style={{ color: info.color }}>{info.labelKo}</span>
              </Link>
            );
          })}
          <span className="genre-chip text-gray-500 cursor-default">
            +{Object.keys(GENRE_INFO).length - FEATURED_GENRES.length}개 더
          </span>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 gradient-text">
          이렇게 쉬워요
        </h2>
        <div className="space-y-8">
          <Step number={1} title="원하는 음악을 말로 설명하세요" example={'"신나는 K-Pop 스타일로, 밝고 에너지 넘치게 만들어줘"'} />
          <Step number={2} title="AI가 트랙을 생성합니다" example="멜로디, 베이스, 드럼, 패드가 자동으로 구성됩니다" />
          <Step number={3} title="프로듀서 기능으로 다듬으세요" example={'"리버브 좀 더 넣어줘", "사이드체인 걸어줘" - 자연어로 OK'} />
          <Step number={4} title="공유하고 경쟁하세요!" example="친구에게 보내거나 AI 심사위원에게 평가받으세요" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          <p>Music is Yours - AI 음악 창작 플랫폼</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="glass-card p-6 hover:border-primary-500/30 transition-all duration-300">
      <span className="text-4xl block mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, example }: { number: number; title: string; example: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-gray-500 text-sm italic">{example}</p>
      </div>
    </div>
  );
}
