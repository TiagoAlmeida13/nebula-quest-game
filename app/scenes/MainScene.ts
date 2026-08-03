import Phaser from "phaser";
import { SFX } from "../lib/sfx";

const COLORS = {
  player: 0xff2e97,
  enemy: 0xa239ea,
  bullet: 0x9be8ff,
  crystal: 0xffe45e,
  spark: 0xffe45e,
};

const PLAYER_SPEED = 260;
const BULLET_SPEED = 420;
const BOSS_MAX_HEALTH = 20;
const BOSS_BULLET_SPEED = 260;
const BOSS_BAR_WIDTH = 300;
const BOSS_BAR_X = 250;

const CRYSTALS_PER_POWER_LEVEL = 3;
const MAX_POWER_LEVEL = 2;
const CRYSTALS_PER_SHIELD = 6;

type WaveType = "line" | "v" | "diagonal" | "zigzagSquad";

type WaveDef = {
  type: WaveType;
  count: number;
  speed: number;
  gapAfter: number;
  shootChance: number;
};

const WAVES: WaveDef[] = [
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

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private crystals!: Phaser.Physics.Arcade.Group;
  private bossBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private boss?: Phaser.Physics.Arcade.Sprite;
  private starfield!: Phaser.GameObjects.TileSprite;
  private thrusterParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private shieldRing!: Phaser.GameObjects.Arc;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private muteText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private bossHealthBarBg?: Phaser.GameObjects.Rectangle;
  private bossHealthBarFill?: Phaser.GameObjects.Rectangle;
  private bossLabel?: Phaser.GameObjects.Text;
  private sfx = new SFX();

  private score = 0;
  private gameOver = false;
  private bossActive = false;
  private bossHealth = BOSS_MAX_HEALTH;
  private bossDirection = 1;
  private lastShot = 0;
  private crystalsCollected = 0;
  private powerLevel = 0;
  private shields = 0;
  private invulnerableUntil = 0;
  private waveNumber = 0;
  private currentWaveEvent?: Phaser.Time.TimerEvent;
  private crystalSpawnTimer!: Phaser.Time.TimerEvent;
  private bossShootTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.createShipTexture("player", 40, 44, COLORS.player);
    this.createEnemyShipTexture("enemy", 32, 36, COLORS.enemy);
    this.createBossTexture("boss", 90, 80, COLORS.enemy);
    this.createTexture("bullet", 5, 14, COLORS.bullet);
    this.createTexture("bossBullet", 8, 16, 0xff2e97);
    this.createTexture("enemyBullet", 5, 12, 0xa239ea);
    this.createTexture("crystal", 18, 18, COLORS.crystal);
    this.createTexture("spark", 6, 6, COLORS.spark);
    this.createStarTexture();
  }

  createTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, w, h);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  createStarTexture() {
    const gfx = this.add.graphics();
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

  createShipTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();
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

  createEnemyShipTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();
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

  createBossTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();

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

  create() {
    this.score = 0;
    this.gameOver = false;
    this.bossActive = false;
    this.bossHealth = BOSS_MAX_HEALTH;
    this.bossDirection = 1;
    this.lastShot = 0;
    this.crystalsCollected = 0;
    this.powerLevel = 0;
    this.shields = 0;
    this.invulnerableUntil = 0;
    this.waveNumber = 0;
    this.boss = undefined;
    this.bossHealthBarBg = undefined;
    this.bossHealthBarFill = undefined;
    this.bossLabel = undefined;

    this.sfx.stopMusic();
    this.sfx.startMusic();

    this.starfield = this.add
      .tileSprite(400, 240, 800, 480, "stars")
      .setDepth(-1);

    this.player = this.physics.add.sprite(400, 420, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(22, 30).setOffset(9, 10);

    this.thrusterParticles = this.add.particles(0, 0, "spark", {
      lifespan: 220,
      speed: { min: 20, max: 50 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      angle: { min: 85, max: 95 },
      frequency: 40,
      follow: this.player,
      followOffset: { x: 0, y: 20 },
    });

    this.shieldRing = this.add.circle(
      this.player.x,
      this.player.y,
      28,
      0x9be8ff,
      0.18,
    );
    this.shieldRing.setStrokeStyle(2, 0x9be8ff, 0.9);
    this.shieldRing.setVisible(false);

    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.crystals = this.physics.add.group();
    this.bossBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemyWithBullet,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.crystals,
      this.collectCrystal,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.bossBullets,
      this.hitPlayer,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      this.hitPlayer,
      undefined,
      this,
    );

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.scoreText = this.add.text(16, 16, "Pontos: 0", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#f4f1ff",
    });

    this.waveText = this.add.text(16, 42, `Onda: 0 / ${WAVES.length}`, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#f4f1ff99",
    });

    this.powerText = this.add.text(16, 64, "Tiro: Nível 1 · Escudos: 0", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#9be8ff",
    });

    this.muteText = this.add
      .text(784, 16, "🔊 (M)", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#f4f1ff99",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.sfx.unlock();
        const newMuted = !this.sfx.isMuted();
        this.sfx.setMuted(newMuted);
        this.muteText.setText(newMuted ? "🔇 (M)" : "🔊 (M)");
      });

    this.statusText = this.add
      .text(400, 240, "", {
        fontFamily: "monospace",
        fontSize: "30px",
        color: "#ffe45e",
        align: "center",
      })
      .setOrigin(0.5);

    this.crystalSpawnTimer = this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: this.spawnCrystal,
      callbackScope: this,
    });

    this.runWaveSequence(0);

    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      this.sfx.unlock();

      const key = event.key?.toUpperCase();

      if (key === "R" && this.gameOver) {
        this.scene.restart();
      }

      if (key === "M") {
        const newMuted = !this.sfx.isMuted();
        this.sfx.setMuted(newMuted);
        this.muteText.setText(newMuted ? "🔇 (M)" : "🔊 (M)");
      }
    });
  }

  runWaveSequence(index: number) {
    if (this.gameOver || this.bossActive) return;

    if (index >= WAVES.length) {
      this.currentWaveEvent = this.time.delayedCall(1500, () =>
        this.spawnBoss(),
      );
      return;
    }

    const wave = WAVES[index];
    this.waveNumber = index + 1;
    this.waveText.setText(`Onda: ${this.waveNumber} / ${WAVES.length}`);

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

    this.currentWaveEvent = this.time.delayedCall(wave.gapAfter, () =>
      this.runWaveSequence(index + 1),
    );
  }

  spawnEnemyAt(
    x: number,
    y: number,
    speed: number,
    zigzag: boolean,
    canShoot = false,
  ) {
    const enemy = this.enemies.create(
      x,
      y,
      "enemy",
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
        this.time.now + Phaser.Math.Between(800, 1800),
      );
    }

    return enemy;
  }

  spawnLineFormation(count: number, speed: number, shootChance: number) {
    const margin = 80;
    const spacing = (800 - margin * 2) / Math.max(count - 1, 1);
    for (let i = 0; i < count; i++) {
      const x = margin + spacing * i;
      const canShoot = Math.random() < shootChance;
      this.time.delayedCall(i * 220, () =>
        this.spawnEnemyAt(x, -30, speed, false, canShoot),
      );
    }
  }

  spawnVFormation(count: number, speed: number, shootChance: number) {
    const step = 55;
    const startOffset = -(count - 1) / 2;
    for (let i = 0; i < count; i++) {
      const offsetIndex = startOffset + i;
      const x = 400 + offsetIndex * step;
      const y = -30 - Math.abs(offsetIndex) * 40;
      const orderFromCenter = Math.abs(offsetIndex);
      const canShoot = Math.random() < shootChance;
      this.time.delayedCall(orderFromCenter * 200, () =>
        this.spawnEnemyAt(x, y, speed, false, canShoot),
      );
    }
  }

  spawnDiagonalFormation(count: number, speed: number, shootChance: number) {
    const stepX = 90;
    const startX = 100;
    for (let i = 0; i < count; i++) {
      const x = startX + i * stepX;
      const canShoot = Math.random() < shootChance;
      this.time.delayedCall(i * 260, () =>
        this.spawnEnemyAt(x, -30, speed, false, canShoot),
      );
    }
  }

  spawnZigzagFormation(count: number, speed: number, shootChance: number) {
    const margin = 100;
    const spacing = (800 - margin * 2) / Math.max(count - 1, 1);
    for (let i = 0; i < count; i++) {
      const x = margin + spacing * i;
      const canShoot = Math.random() < shootChance;
      this.time.delayedCall(i * 240, () =>
        this.spawnEnemyAt(x, -30, speed, true, canShoot),
      );
    }
  }

  spawnCrystal() {
    if (this.gameOver) return;
    const x = Phaser.Math.Between(40, 760);
    const crystal = this.crystals.create(
      x,
      -20,
      "crystal",
    ) as Phaser.Physics.Arcade.Sprite;
    crystal.setVelocityY(120);
  }

  spawnBoss() {
    this.bossActive = true;

    this.enemies.getChildren().forEach((e) => {
      (e as Phaser.Physics.Arcade.Sprite).destroy();
    });

    this.boss = this.physics.add.sprite(400, -60, "boss");
    this.boss.setCollideWorldBounds(true);
    this.boss.setSize(70, 60).setOffset(10, 10);

    this.bossLabel = this.add
      .text(400, 60, "IMPERADOR DO VAZIO", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ff2e97",
      })
      .setOrigin(0.5);

    this.bossHealthBarBg = this.add
      .rectangle(BOSS_BAR_X, 80, BOSS_BAR_WIDTH + 4, 12, 0x1a1030)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0xff2e97);

    this.bossHealthBarFill = this.add
      .rectangle(BOSS_BAR_X + 2, 80, BOSS_BAR_WIDTH, 8, 0xff2e97)
      .setOrigin(0, 0.5);

    this.tweens.add({
      targets: this.boss,
      y: 130,
      duration: 1200,
      ease: "sine.out",
    });

    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBossWithBullet,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.boss,
      this.hitPlayer,
      undefined,
      this,
    );

    this.bossShootTimer = this.time.addEvent({
      delay: 1100,
      loop: true,
      callback: this.bossShoot,
      callbackScope: this,
    });
  }

  bossShoot() {
    if (this.gameOver || !this.boss || !this.boss.active) return;
    const bullet = this.bossBullets.create(
      this.boss.x,
      this.boss.y + 30,
      "bossBullet",
    ) as Phaser.Physics.Arcade.Sprite;
    if (!bullet || !bullet.body) return;
    const angle = Phaser.Math.Angle.Between(
      this.boss.x,
      this.boss.y,
      this.player.x,
      this.player.y,
    );
    this.physics.velocityFromRotation(
      angle,
      BOSS_BULLET_SPEED,
      bullet.body.velocity,
    );
  }

  shoot(time: number) {
    if (time < this.lastShot + 220) return;
    this.lastShot = time;

    if (this.powerLevel === 0) {
      this.fireBullet(this.player.x, this.player.y - 26, 0);
    } else if (this.powerLevel === 1) {
      this.fireBullet(this.player.x - 10, this.player.y - 20, 0);
      this.fireBullet(this.player.x + 10, this.player.y - 20, 0);
    } else {
      this.fireBullet(this.player.x, this.player.y - 26, 0);
      this.fireBullet(this.player.x - 14, this.player.y - 16, -0.15);
      this.fireBullet(this.player.x + 14, this.player.y - 16, 0.15);
    }

    this.sfx.shoot();
  }

  fireBullet(x: number, y: number, angleOffset: number) {
    const bullet = this.bullets.create(
      x,
      y,
      "bullet",
    ) as Phaser.Physics.Arcade.Sprite;
    const vx = Math.sin(angleOffset) * BULLET_SPEED;
    const vy = -Math.cos(angleOffset) * BULLET_SPEED;
    bullet.setVelocity(vx, vy);
  }

  hitEnemyWithBullet(obj1: unknown, obj2: unknown) {
    const a = obj1 as Phaser.Physics.Arcade.Sprite;
    const c = obj2 as Phaser.Physics.Arcade.Sprite;
    const bullet = a.texture?.key === "bullet" ? a : c;
    const enemy = bullet === a ? c : a;

    if (!bullet?.active || !enemy?.active) return;

    bullet.destroy();
    enemy.destroy();
    this.score += 10;
    this.scoreText.setText(`Pontos: ${this.score}`);
    this.sfx.enemyExplode();
  }

  hitBossWithBullet(obj1: unknown, obj2: unknown) {
    const a = obj1 as Phaser.Physics.Arcade.Sprite;
    const c = obj2 as Phaser.Physics.Arcade.Sprite;
    const bullet = a.texture?.key === "bullet" ? a : c;

    if (!bullet?.active) return;
    if (!this.bossHealthBarFill) return;

    bullet.destroy();
    this.bossHealth = Math.max(this.bossHealth - 1, 0);
    this.score += 5;
    this.scoreText.setText(`Pontos: ${this.score}`);

    const ratio = this.bossHealth / BOSS_MAX_HEALTH;
    this.bossHealthBarFill.width = BOSS_BAR_WIDTH * ratio;

    if (this.bossHealth <= 0) {
      this.winGame();
    } else {
      this.sfx.enemyExplode();
    }
  }

  collectCrystal(obj1: unknown, obj2: unknown) {
    const a = obj1 as Phaser.Physics.Arcade.Sprite;
    const c = obj2 as Phaser.Physics.Arcade.Sprite;
    const crystal = a.texture?.key === "crystal" ? a : c;

    if (!crystal?.active) return;
    crystal.destroy();
    this.score += 25;
    this.scoreText.setText(`Pontos: ${this.score}`);
    this.sfx.crystalPickup();

    this.crystalsCollected += 1;

    const newPowerLevel = Math.min(
      Math.floor(this.crystalsCollected / CRYSTALS_PER_POWER_LEVEL),
      MAX_POWER_LEVEL,
    );
    if (newPowerLevel > this.powerLevel) {
      this.powerLevel = newPowerLevel;
    }

    if (this.crystalsCollected % CRYSTALS_PER_SHIELD === 0) {
      this.shields += 1;
      this.shieldRing.setVisible(true);
    }

    this.powerText.setText(
      `Tiro: Nível ${this.powerLevel + 1} · Escudos: ${this.shields}`,
    );
  }

  hitPlayer(_a: unknown, _b: unknown) {
    if (this.gameOver) return;

    if (this.time.now < this.invulnerableUntil) return;
    this.invulnerableUntil = this.time.now + 1200;

    if (this.shields > 0) {
      this.shields -= 1;
      this.powerText.setText(
        `Tiro: Nível ${this.powerLevel + 1} · Escudos: ${this.shields}`,
      );
      if (this.shields === 0) {
        this.shieldRing.setVisible(false);
      }

      this.player.setTint(0x9be8ff);
      this.time.delayedCall(150, () => this.player.clearTint());
      this.sfx.shieldBlock();
      return;
    }

    this.gameOver = true;
    this.physics.pause();
    this.currentWaveEvent?.remove();
    this.crystalSpawnTimer.remove();
    this.bossShootTimer?.remove();
    this.player.setTint(0xff0000);
    this.statusText.setText(
      "VOCÊ FOI ATINGIDO\n\nPressione R para tentar de novo",
    );
    this.sfx.playerHit();
    this.sfx.stopMusic();
  }

  winGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    this.currentWaveEvent?.remove();
    this.crystalSpawnTimer.remove();
    this.bossShootTimer?.remove();
    this.boss?.setTint(0xff0000);
    this.statusText.setText(
      "VOCÊ DERROTOU O IMPERADOR! 🎉\n\nPressione R para jogar de novo",
    );
    this.sfx.bossExplode();
    this.sfx.win();
    this.sfx.stopMusic();
  }

  update(time: number) {
    if (this.gameOver) return;

    this.starfield.tilePositionY -= 2;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-PLAYER_SPEED);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(PLAYER_SPEED);
    } else {
      this.player.setVelocityY(0);
    }

    this.shoot(time);

    this.shieldRing.setPosition(this.player.x, this.player.y);

    if (this.bossActive && this.boss?.active) {
      if (this.boss.x > 680) this.bossDirection = -1;
      if (this.boss.x < 120) this.bossDirection = 1;
      this.boss.setVelocityX(120 * this.bossDirection);
    }

    this.enemies.getChildren().forEach((e) => {
      const enemy = e as Phaser.Physics.Arcade.Sprite;

      if (enemy.getData("zigzag")) {
        const baseX = enemy.getData("baseX") as number;
        const offset = enemy.getData("zigzagOffset") as number;
        enemy.x = baseX + Math.sin(time / 300 + offset) * 80;
      }

      if (enemy.getData("canShoot") && enemy.y > 0 && enemy.y < 420) {
        const nextShotAt = enemy.getData("nextShotAt") as number;
        if (time >= nextShotAt) {
          const eb = this.enemyBullets.create(
            enemy.x,
            enemy.y + 18,
            "enemyBullet",
          ) as Phaser.Physics.Arcade.Sprite;
          eb.setVelocityY(220);
          enemy.setData("nextShotAt", time + Phaser.Math.Between(1400, 2200));
        }
      }
    });

    this.bullets.getChildren().forEach((b) => {
      const bullet = b as Phaser.Physics.Arcade.Sprite;
      if (bullet.y < -20) bullet.destroy();
    });

    this.enemies.getChildren().forEach((e) => {
      const enemy = e as Phaser.Physics.Arcade.Sprite;
      if (enemy.y > 520) enemy.destroy();
    });

    this.crystals.getChildren().forEach((c) => {
      const crystal = c as Phaser.Physics.Arcade.Sprite;
      if (crystal.y > 520) crystal.destroy();
    });

    this.bossBullets.getChildren().forEach((b) => {
      const bullet = b as Phaser.Physics.Arcade.Sprite;
      if (bullet.y > 520 || bullet.y < -20 || bullet.x < -20 || bullet.x > 820)
        bullet.destroy();
    });

    this.enemyBullets.getChildren().forEach((b) => {
      const bullet = b as Phaser.Physics.Arcade.Sprite;
      if (bullet.y > 520) bullet.destroy();
    });
  }
}
