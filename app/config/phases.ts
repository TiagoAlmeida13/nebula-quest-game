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

// Fase 3: núcleo do buraco negro — a mais difícil. Visual sombrio/dourado,
// ondas mais densas e rápidas, inimigos atirando com mais frequência, e
// chefes com muito mais vida e cadência de tiro agressiva.
const PHASE_3_WAVES: WaveDef[] = [
  { type: "zigzagSquad", count: 8, speed: 200, gapAfter: 2100, shootChance: 0.65 },
  { type: "diagonal", count: 8, speed: 210, gapAfter: 2000, shootChance: 0.7 },
  { type: "v", count: 9, speed: 220, gapAfter: 1900, shootChance: 0.7 },
  { type: "line", count: 10, speed: 230, gapAfter: 1900, shootChance: 0.75 },
  { type: "zigzagSquad", count: 9, speed: 230, gapAfter: 1800, shootChance: 0.75 },
  { type: "diagonal", count: 10, speed: 240, gapAfter: 1700, shootChance: 0.8 },
  { type: "v", count: 10, speed: 250, gapAfter: 1600, shootChance: 0.8 },
  { type: "zigzagSquad", count: 11, speed: 260, gapAfter: 1500, shootChance: 0.85 },
  { type: "line", count: 12, speed: 270, gapAfter: 1400, shootChance: 0.85 },
];

const PHASE_3_BOSSES: BossDef[] = [
  {
    name: "TIRANO DO ABISMO",
    textureKey: "boss6",
    maxHealth: 44,
    color: 0xffd700,
    moveSpeed: 190,
    shootDelay: 700,
    pattern: "mixed",
  },
  {
    name: "SINGULARIDADE VIVA",
    textureKey: "boss7",
    maxHealth: 54,
    color: 0x8a2be2,
    moveSpeed: 210,
    shootDelay: 600,
    pattern: "spread",
  },
  {
    name: "OLHO DO NADA ETERNO",
    textureKey: "boss8",
    maxHealth: 66,
    color: 0xff003c,
    moveSpeed: 230,
    shootDelay: 500,
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
  {
    id: 3,
    label: "Fase 3 · Núcleo do Vazio",
    starBgColor: 0x050208,
    starColor: 0xffd700,
    starTextureKey: "stars_phase3",
    enemyColor: 0x8a2be2,
    enemyTextureKey: "enemy_phase3",
    waves: PHASE_3_WAVES,
    bosses: PHASE_3_BOSSES,
  },
];