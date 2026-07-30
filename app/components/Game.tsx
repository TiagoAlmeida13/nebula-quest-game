"use client";

import { useEffect, useRef } from "react";

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      const Phaser = (await import("phaser")).default;
      const { default: MainScene } = await import("../scenes/MainScene");

      if (destroyed || !containerRef.current) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 480,
        parent: containerRef.current,
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scene: [MainScene],
        backgroundColor: "#0d0221",
      });
    }

    init();

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="mx-auto w-fit" />;
}
