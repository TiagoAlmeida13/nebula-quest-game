import Game from "./components/Game";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0d0221] px-6 py-12 text-[#f4f1ff]">
      <div className="text-center">
        <h1 className="font-mono text-3xl font-bold tracking-wide text-[#ff2e97]">
          NEBULA QUEST
        </h1>
        <p className="mt-2 text-sm text-[#f4f1ff]/60">
          Setas para mover e pular · Colete os 3 cristais · Evite o inimigo roxo
        </p>
      </div>

      <Game />
    </main>
  );
}