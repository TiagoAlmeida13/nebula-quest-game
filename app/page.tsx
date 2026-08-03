import { Press_Start_2P } from "next/font/google";
import Game from "./components/Game";

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

export default function Home() {
  return (
    <main
      className={`${pixelFont.variable} flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0d0221] px-6 py-12 text-[#f4f1ff]`}
    >
      <div className="text-center">
        <h1
          className="font-[family-name:var(--font-pixel)] text-2xl tracking-wide text-[#ff2e97] md:text-3xl"
          style={{
            textShadow: "0 0 8px #ff2e97, 0 0 24px rgba(255, 46, 151, 0.5)",
          }}
        >
          NEBULA QUEST
        </h1>
        <p className="mt-4 text-sm text-[#f4f1ff]/60">
          Setas para voar · Tiro automático · Derrote 12 naves inimigas
        </p>
      </div>

      <Game />
    </main>
  );
}
