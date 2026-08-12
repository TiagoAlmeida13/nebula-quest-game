import Phaser from "phaser";

// Todas as texturas do jogo são desenhadas em runtime com Graphics
// (nenhum asset de imagem é carregado). Isso mantém o preload() da cena
// enxuto: ele só chama essas funções, que recebem a scene e desenham.

export function createTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  color: number,
) {
  const gfx = scene.add.graphics();
  gfx.fillStyle(color, 1);
  gfx.fillRect(0, 0, w, h);
  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

export function createStarTexture(scene: Phaser.Scene) {
  const gfx = scene.add.graphics();
  gfx.fillStyle(0x0d0221, 1);
  gfx.fillRect(0, 0, 100, 100);
  gfx.fillStyle(0xffffff, 0.8);
  for (let i = 0; i < 14; i++) {
    const x = Phaser.Math.Between(0, 100);
    const y = Phaser.Math.Between(0, 100);
    const s = Phaser.Math.Between(1, 2);
    gfx.fillRect(x, y, s, s);
  }
  gfx.generateTexture("stars", 100, 100);
  gfx.destroy();
}

export function createShipTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  color: number,
) {
  const gfx = scene.add.graphics();
  gfx.fillStyle(color, 1);
  gfx.beginPath();
  gfx.moveTo(w * 0.1, h * 0.9);
  gfx.lineTo(w * 0.42, h * 0.55);
  gfx.lineTo(w * 0.42, h * 0.85);
  gfx.closePath();
  gfx.fillPath();
  gfx.beginPath();
  gfx.moveTo(w * 0.9, h * 0.9);
  gfx.lineTo(w * 0.58, h * 0.55);
  gfx.lineTo(w * 0.58, h * 0.85);
  gfx.closePath();
  gfx.fillPath();
  gfx.beginPath();
  gfx.moveTo(w * 0.5, 0);
  gfx.lineTo(w * 0.62, h * 0.35);
  gfx.lineTo(w * 0.58, h * 0.95);
  gfx.lineTo(w * 0.42, h * 0.95);
  gfx.lineTo(w * 0.38, h * 0.35);
  gfx.closePath();
  gfx.fillPath();
  gfx.fillStyle(0x9be8ff, 0.95);
  gfx.fillEllipse(w * 0.5, h * 0.32, w * 0.16, h * 0.22);
  gfx.fillStyle(0xffe45e, 1);
  gfx.fillCircle(w * 0.32, h * 0.92, 4);
  gfx.fillCircle(w * 0.68, h * 0.92, 4);
  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

export function createEnemyShipTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  color: number,
) {
  const gfx = scene.add.graphics();
  gfx.fillStyle(color, 1);
  gfx.beginPath();
  gfx.moveTo(w * 0.5, h);
  gfx.lineTo(w * 0.62, h * 0.6);
  gfx.lineTo(w * 0.58, 0);
  gfx.lineTo(w * 0.42, 0);
  gfx.lineTo(w * 0.38, h * 0.6);
  gfx.closePath();
  gfx.fillPath();
  gfx.beginPath();
  gfx.moveTo(w * 0.05, h * 0.15);
  gfx.lineTo(w * 0.4, h * 0.45);
  gfx.lineTo(w * 0.4, h * 0.15);
  gfx.closePath();
  gfx.fillPath();
  gfx.beginPath();
  gfx.moveTo(w * 0.95, h * 0.15);
  gfx.lineTo(w * 0.6, h * 0.45);
  gfx.lineTo(w * 0.6, h * 0.15);
  gfx.closePath();
  gfx.fillPath();
  gfx.fillStyle(0xffffff, 0.85);
  gfx.fillEllipse(w * 0.5, h * 0.65, w * 0.14, h * 0.18);
  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

export function createBossTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  color: number,
) {
  const gfx = scene.add.graphics();

  gfx.fillStyle(color, 1);
  gfx.beginPath();
  gfx.moveTo(w * 0.5, h);
  gfx.lineTo(w * 0.85, h * 0.5);
  gfx.lineTo(w * 0.7, 0);
  gfx.lineTo(w * 0.3, 0);
  gfx.lineTo(w * 0.15, h * 0.5);
  gfx.closePath();
  gfx.fillPath();

  gfx.beginPath();
  gfx.moveTo(0, h * 0.35);
  gfx.lineTo(w * 0.3, h * 0.55);
  gfx.lineTo(w * 0.3, h * 0.15);
  gfx.closePath();
  gfx.fillPath();

  gfx.beginPath();
  gfx.moveTo(w, h * 0.35);
  gfx.lineTo(w * 0.7, h * 0.55);
  gfx.lineTo(w * 0.7, h * 0.15);
  gfx.closePath();
  gfx.fillPath();

  gfx.fillStyle(0xff2e97, 1);
  gfx.fillCircle(w * 0.5, h * 0.55, w * 0.13);
  gfx.fillStyle(0xffffff, 0.9);
  gfx.fillCircle(w * 0.5, h * 0.55, w * 0.05);

  gfx.generateTexture(key, w, h);
  gfx.destroy();
}
