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

/** Clareia (factor > 0) ou escurece (factor < 0) uma cor 0xRRGGBB. */
function shade(color: number, factor: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const adjust = (c: number) =>
    factor >= 0
      ? Math.min(255, Math.round(c + (255 - c) * factor))
      : Math.max(0, Math.round(c + c * factor));
  return (adjust(r) << 16) | (adjust(g) << 8) | adjust(b);
}

/**
 * Gema facetada (losango com cortes), no lugar de um quadrado liso: base
 * escura, faces com variação de brilho para dar volume, contorno claro e
 * um reflexo branco no topo simulando o brilho de um cristal de verdade.
 */
export function createCrystalTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  color: number,
) {
  const gfx = scene.add.graphics();

  const top = { x: w * 0.5, y: 0 };
  const right = { x: w, y: h * 0.36 };
  const bottomRight = { x: w * 0.68, y: h };
  const bottomLeft = { x: w * 0.32, y: h };
  const left = { x: 0, y: h * 0.36 };
  const center = { x: w * 0.5, y: h * 0.46 };

  const darker = shade(color, -0.35);
  const dark = shade(color, -0.15);
  const light = shade(color, 0.25);

  // Face inferior esquerda (mais escura, sombra).
  gfx.fillStyle(darker, 1);
  gfx.beginPath();
  gfx.moveTo(center.x, center.y);
  gfx.lineTo(left.x, left.y);
  gfx.lineTo(bottomLeft.x, bottomLeft.y);
  gfx.closePath();
  gfx.fillPath();

  // Face inferior direita (tom médio).
  gfx.fillStyle(dark, 1);
  gfx.beginPath();
  gfx.moveTo(center.x, center.y);
  gfx.lineTo(bottomRight.x, bottomRight.y);
  gfx.lineTo(right.x, right.y);
  gfx.closePath();
  gfx.fillPath();

  // Face superior esquerda (cor base).
  gfx.fillStyle(color, 1);
  gfx.beginPath();
  gfx.moveTo(top.x, top.y);
  gfx.lineTo(center.x, center.y);
  gfx.lineTo(left.x, left.y);
  gfx.closePath();
  gfx.fillPath();

  // Face superior direita (mais clara, luz vindo de cima).
  gfx.fillStyle(light, 1);
  gfx.beginPath();
  gfx.moveTo(top.x, top.y);
  gfx.lineTo(right.x, right.y);
  gfx.lineTo(center.x, center.y);
  gfx.closePath();
  gfx.fillPath();

  // Linha inferior fechando a ponta.
  gfx.fillStyle(darker, 1);
  gfx.beginPath();
  gfx.moveTo(center.x, center.y);
  gfx.lineTo(bottomLeft.x, bottomLeft.y);
  gfx.lineTo(bottomRight.x, bottomRight.y);
  gfx.closePath();
  gfx.fillPath();

  // Contorno claro marcando as facetas (efeito "corte de cristal").
  gfx.lineStyle(1, 0xffffff, 0.5);
  gfx.beginPath();
  gfx.moveTo(top.x, top.y);
  gfx.lineTo(right.x, right.y);
  gfx.lineTo(bottomRight.x, bottomRight.y);
  gfx.lineTo(bottomLeft.x, bottomLeft.y);
  gfx.lineTo(left.x, left.y);
  gfx.closePath();
  gfx.strokePath();
  gfx.lineStyle(1, 0xffffff, 0.35);
  gfx.beginPath();
  gfx.moveTo(top.x, top.y);
  gfx.lineTo(center.x, center.y);
  gfx.moveTo(left.x, left.y);
  gfx.lineTo(center.x, center.y);
  gfx.moveTo(right.x, right.y);
  gfx.lineTo(center.x, center.y);
  gfx.strokePath();

  // Brilho: pequeno flash branco no canto superior direito da gema.
  gfx.fillStyle(0xffffff, 0.9);
  gfx.fillEllipse(w * 0.62, h * 0.22, w * 0.14, h * 0.1);

  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

export function createStarTexture(
  scene: Phaser.Scene,
  key: string,
  bgColor: number,
  starColor: number = 0xffffff,
) {
  const gfx = scene.add.graphics();
  gfx.fillStyle(bgColor, 1);
  gfx.fillRect(0, 0, 100, 100);
  gfx.fillStyle(starColor, 0.8);
  for (let i = 0; i < 14; i++) {
    const x = Phaser.Math.Between(0, 100);
    const y = Phaser.Math.Between(0, 100);
    const s = Phaser.Math.Between(1, 2);
    gfx.fillRect(x, y, s, s);
  }
  gfx.generateTexture(key, 100, 100);
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