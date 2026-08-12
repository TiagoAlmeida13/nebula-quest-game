export type WaveType = "line" | "v" | "diagonal" | "zigzagSquad";

export type WaveDef = {
  type: WaveType;
  count: number;
  speed: number;
  gapAfter: number;
  shootChance: number;
};

export type BossPattern = "aimed" | "spread" | "mixed";

export type BossDef = {
  name: string;
  /** Chave da textura gerada no preload (única em todo o jogo, não só na fase). */
  textureKey: string;
  maxHealth: number;
  color: number;
  moveSpeed: number;
  shootDelay: number;
  pattern: BossPattern;
};

export type PhaseDef = {
  id: number;
  label: string;
  /** Cor de fundo do campo de estrelas. */
  starBgColor: number;
  /** Cor das próprias estrelas. */
  starColor: number;
  starTextureKey: string;
  enemyColor: number;
  enemyTextureKey: string;
  waves: WaveDef[];
  bosses: BossDef[];
};

const PHASE_1_WAVES: WaveDef[] = [
  { type: "line", count: 4, speed: 90, gapAfter: 3200, shootChance: 0 },
  { type: "v", count: 5, speed: 100, gapAfter: 3200, shootChance: 0 },
  { type: "diagonal", count: 5, speed: 110, gapAfter: 3000, shootChance: 0.3 },
  { type: "line", count: 6, speed: 120, gapAfter: 3000, shootChance: 0.3 },
  {
    type: "zigzagSquad",
    count: 5,
    speed: 110,
    gapAfter: 3000,
    shootChance: 0.4,
  },
  { type: "v", count: 6, speed: 130, gapAfter: 2800, shootChance: 0.5 },
  { type: "diagonal", count: 6, speed: 140, gapAfter: 2800, shootChance: 0.5 },
  {
    type: "zigzagSquad",
    count: 6,
    speed: 150,
    gapAfter: 2600,
    shootChance: 0.6,
  },
];

const PHASE_1_BOSSES: BossDef[] = [
  {
    name: "IMPERADOR DO VAZIO",
    textureKey: "boss0",
    maxHealth: 20,
    color: 0xa239ea,
    moveSpeed: 120,
    shootDelay: 1100,
    pattern: "aimed",
  },
  {
    name: "GUARDIÃO ESTELAR",
    textureKey: "boss1",
    maxHealth: 26,
    color: 0x21e6c1,
    moveSpeed: 140,
    shootDelay: 1500,
    pattern: "spread",
  },
  {
    name: "NÚCLEO PRIMORDIAL",
    textureKey: "boss2",
    maxHealth: 34,
    color: 0xff2e97,
    moveSpeed: 160,
    shootDelay: 900,
    pattern: "mixed",
  },
];

// Fase 2: zona da nebulosa vermelha — visual mais quente/hostil e ondas e
// chefes mais difíceis que a fase 1 (mais inimigos, mais rápidos, atiram mais).
const PHASE_2_WAVES: WaveDef[] = [
  { type: "diagonal", count: 6, speed: 160, gapAfter: 2600, shootChance: 0.5 },
  {
    type: "zigzagSquad",
    count: 7,
    speed: 160,
    gapAfter: 2500,
    shootChance: 0.55,
  },
  { type: "v", count: 7, speed: 170, gapAfter: 2500, shootChance: 0.6 },
  { type: "line", count: 8, speed: 180, gapAfter: 2400, shootChance: 0.6 },
  {
    type: "zigzagSquad",
    count: 7,
    speed: 180,
    gapAfter: 2300,
    shootChance: 0.65,
  },
  { type: "diagonal", count: 8, speed: 190, gapAfter: 2200, shootChance: 0.7 },
  { type: "v", count: 8, speed: 200, gapAfter: 2100, shootChance: 0.7 },
];

const PHASE_2_BOSSES: BossDef[] = [
  {
    name: "SENTINELA CARMESIM",
    textureKey: "boss3",
    maxHealth: 30,
    color: 0xff4433,
    moveSpeed: 150,
    shootDelay: 900,
    pattern: "spread",
  },
  {
    name: "DEVORADOR DE ESTRELAS",
    textureKey: "boss4",
    maxHealth: 38,
    color: 0xffaa00,
    moveSpeed: 170,
    shootDelay: 1200,
    pattern: "mixed",
  },
  {
    name: "ECO DO CAOS",
    textureKey: "boss5",
    maxHealth: 46,
    color: 0xff0066,
    moveSpeed: 190,
    shootDelay: 750,
    pattern: "aimed",
  },
];

export const PHASES: PhaseDef[] = [
  {
    id: 1,
    label: "Fase 1 · Vazio Estelar",
    starBgColor: 0x0d0221,
    starColor: 0xffffff,
    starTextureKey: "stars_phase1",
    enemyColor: 0xa239ea,
    enemyTextureKey: "enemy_phase1",
    waves: PHASE_1_WAVES,
    bosses: PHASE_1_BOSSES,
  },
  {
    id: 2,
    label: "Fase 2 · Nebulosa Carmesim",
    starBgColor: 0x220505,
    starColor: 0xffcfaa,
    starTextureKey: "stars_phase2",
    enemyColor: 0xff5533,
    enemyTextureKey: "enemy_phase2",
    waves: PHASE_2_WAVES,
    bosses: PHASE_2_BOSSES,
  },
];
