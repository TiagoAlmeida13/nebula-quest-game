import Phaser from "phaser";
import { WaveDef } from "../config/phases";

export type WaveSpawnerOptions = {
  enemies: Phaser.Physics.Arcade.Group;
  crystals: Phaser.Physics.Arcade.Group;
  isGameOver: () => boolean;
  isBossActive: () => boolean;
  /** Lista de ondas da fase atual (pode mudar entre fases). */
  getWaves: () => WaveDef[];
  /** Chave da textura de inimigo da fase atual (pode mudar entre fases). */
  getEnemyTextureKey: () => string;
  onWaveChange: (current: number, total: number) => void;
  /** Chamado quando todas as ondas da fase atual já foram lançadas. */
  onWavesComplete: () => void;
};

/**
 * Cuida da sequência de ondas de inimigos (linha, V, diagonal, esquadrão
 * em zigue-zague) e do spawn periódico de cristais coletáveis.
 *
 * O spawner de cristais roda o jogo inteiro (start()/stop()); já a
 * sequência de ondas pode ser reiniciada a cada fase via startWaves(),
 * sem recriar o timer de cristais.
 */
export class WaveSpawner {
  private scene: Phaser.Scene;
  private options: WaveSpawnerOptions;
  private currentWaveEvent?: Phaser.Time.TimerEvent;
  private crystalSpawnTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, options: WaveSpawnerOptions) {
    this.scene = scene;
    this.options = options;
  }

  /** Chamar uma vez, no início da partida. */
  start() {
    this.crystalSpawnTimer = this.scene.time.addEvent({
      delay: 2600,
      loop: true,
      callback: this.spawnCrystal,
      callbackScope: this,
    });

    this.startWaves();
  }

  /** Chamar no início da partida e de novo a cada troca de fase. */
  startWaves() {
    this.currentWaveEvent?.remove();
    this.runWaveSequence(0);
  }

  stop() {
    this.currentWaveEvent?.remove();
    this.crystalSpawnTimer?.remove();
  }

  runWaveSequence(index: number) {
    if (this.options.isGameOver() || this.options.isBossActive()) return;

    const waves = this.options.getWaves();

    if (index >= waves.length) {
      this.currentWaveEvent = this.scene.time.delayedCall(1500, () =>
        this.options.onWavesComplete(),
      );
      return;
    }

    const wave = waves[index];
    this.options.onWaveChange(index + 1, waves.length);

    switch (wave.type) {
      case "line":
        this.spawnLineFormation(wave.count, wave.speed, wave.shootChance);
        break;
      case "v":
        this.spawnVFormation(wave.count, wave.speed, wave.shootChance);
        break;
      case "diagonal":
        this.spawnDiagonalFormation(wave.count, wave.speed, wave.shootChance);
        break;
      case "zigzagSquad":
        this.spawnZigzagFormation(wave.count, wave.speed, wave.shootChance);
        break;
    }

    this.currentWaveEvent = this.scene.time.delayedCall(wave.gapAfter, () =>
      this.runWaveSequence(index + 1),
    );
  }

  private spawnEnemyAt(
    x: number,
    y: number,
    speed: number,
    zigzag: boolean,
    canShoot = false,
  ) {
    const enemy = this.options.enemies.create(
      x,
      y,
      this.options.getEnemyTextureKey(),
    ) as Phaser.Physics.Arcade.Sprite;
    enemy.setVelocityY(speed);
    enemy.setSize(20, 24).setOffset(6, 6);
    enemy.setData("zigzag", zigzag);
    if (zigzag) {
      enemy.setData("baseX", x);
      enemy.setData("zigzagOffset", Math.random() * Math.PI * 2);
      enemy.setTint(0xff8fd6);
    }

    if (canShoot) {
      enemy.setData("canShoot", true);
      enemy.setData(
        "nextShotAt",
        this.scene.time.now + Phaser.Math.Between(800, 1800),
      );
    }

    return enemy;
  }

  private spawnLineFormation(count: number, speed: number, shootChance: number) {
    const margin = 80;
    const spacing = (800 - margin * 2) / Math.max(count - 1, 1);
    for (let i = 0; i < count; i++) {
      const x = margin + spacing * i;
      const canShoot = Math.random() < shootChance;
      this.scene.time.delayedCall(i * 220, () =>
        this.spawnEnemyAt(x, -30, speed, false, canShoot),
      );
    }
  }

  private spawnVFormation(count: number, speed: number, shootChance: number) {
    const step = 55;
    const startOffset = -(count - 1) / 2;
    for (let i = 0; i < count; i++) {
      const offsetIndex = startOffset + i;
      const x = 400 + offsetIndex * step;
      const y = -30 - Math.abs(offsetIndex) * 40;
      const orderFromCenter = Math.abs(offsetIndex);
      const canShoot = Math.random() < shootChance;
      this.scene.time.delayedCall(orderFromCenter * 200, () =>
        this.spawnEnemyAt(x, y, speed, false, canShoot),
      );
    }
  }

  private spawnDiagonalFormation(
    count: number,
    speed: number,
    shootChance: number,
  ) {
    const stepX = 90;
    const startX = 100;
    for (let i = 0; i < count; i++) {
      const x = startX + i * stepX;
      const canShoot = Math.random() < shootChance;
      this.scene.time.delayedCall(i * 260, () =>
        this.spawnEnemyAt(x, -30, speed, false, canShoot),
      );
    }
  }

  private spawnZigzagFormation(
    count: number,
    speed: number,
    shootChance: number,
  ) {
    const margin = 100;
    const spacing = (800 - margin * 2) / Math.max(count - 1, 1);
    for (let i = 0; i < count; i++) {
      const x = margin + spacing * i;
      const canShoot = Math.random() < shootChance;
      this.scene.time.delayedCall(i * 240, () =>
        this.spawnEnemyAt(x, -30, speed, true, canShoot),
      );
    }
  }

  private spawnCrystal = () => {
    if (this.options.isGameOver()) return;
    const x = Phaser.Math.Between(40, 760);
    const crystal = this.options.crystals.create(
      x,
      -20,
      "crystal",
    ) as Phaser.Physics.Arcade.Sprite;
    crystal.setVelocityY(120);
  };
}
