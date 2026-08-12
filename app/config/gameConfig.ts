export const COLORS = {
  player: 0xff2e97,
  enemy: 0xa239ea,
  bullet: 0x9be8ff,
  crystal: 0xffe45e,
  spark: 0xffe45e,
};

export const PLAYER_SPEED = 260;
export const BULLET_SPEED = 420;
export const BOSS_BULLET_SPEED = 260;
export const BOSS_BAR_WIDTH = 300;
export const BOSS_BAR_X = 250;

export const CRYSTALS_PER_POWER_LEVEL = 3;
export const MAX_POWER_LEVEL = 2;
export const CRYSTALS_PER_SHIELD = 6;

export type WaveType = "line" | "v" | "diagonal" | "zigzagSquad";

export type WaveDef = {
  type: WaveType;
  count: number;
  speed: number;
  gapAfter: number;
  shootChance: number;
};

export const WAVES: WaveDef[] = [
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

export type BossPattern = "aimed" | "spread" | "mixed";

export type BossDef = {
  name: string;
  maxHealth: number;
  color: number;
  moveSpeed: number;
  shootDelay: number;
  pattern: BossPattern;
};

export const BOSSES: BossDef[] = [
  {
    name: "IMPERADOR DO VAZIO",
    maxHealth: 20,
    color: 0xa239ea,
    moveSpeed: 120,
    shootDelay: 1100,
    pattern: "aimed",
  },
  {
    name: "GUARDIÃO ESTELAR",
    maxHealth: 26,
    color: 0x21e6c1,
    moveSpeed: 140,
    shootDelay: 1500,
    pattern: "spread",
  },
  {
    name: "NÚCLEO PRIMORDIAL",
    maxHealth: 34,
    color: 0xff2e97,
    moveSpeed: 160,
    shootDelay: 900,
    pattern: "mixed",
  },
];
