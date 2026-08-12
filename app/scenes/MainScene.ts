import Phaser from "phaser";
import { SFX } from "../lib/sfx";
import {
  createTexture,
  createStarTexture,
  createShipTexture,
  createEnemyShipTexture,
  createBossTexture,
} from "../lib/textures";
import {
  COLORS,
  PLAYER_SPEED,
  BULLET_SPEED,
  CRYSTALS_PER_POWER_LEVEL,
  MAX_POWER_LEVEL,
  CRYSTALS_PER_SHIELD,
} from "../config/gameConfig";
import { PHASES, PhaseDef } from "../config/phases";
import { InputController } from "../systems/InputController";
import { WaveSpawner } from "../systems/WaveSpawner";
import { BossController } from "../entities/BossController";
import { HUD } from "../ui/HUD";

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private crystals!: Phaser.Physics.Arcade.Group;
  private bossBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private starfield!: Phaser.GameObjects.TileSprite;
  private thrusterParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private shieldRing!: Phaser.GameObjects.Arc;

  private sfx = new SFX();
  private hud!: HUD;
  private input_!: InputController;
  private waveSpawner!: WaveSpawner;
  private bossController!: BossController;

  private score = 0;
  private gameOver = false;
  private crystalsCollected = 0;
  private powerLevel = 0;
  private shields = 0;
  private invulnerableUntil = 0;
  private lastShot = 0;
  private phaseIndex = 0;

  constructor() {
    super("MainScene");
  }

  private get phase(): PhaseDef {
    return PHASES[this.phaseIndex];
  }

  preload() {
    createShipTexture(this, "player", 40, 44, COLORS.player);
    createTexture(this, "bullet", 5, 14, COLORS.bullet);
    createTexture(this, "bossBullet", 8, 16, 0xffffff);
    createTexture(this, "enemyBullet", 5, 12, 0xa239ea);
    createTexture(this, "crystal", 18, 18, COLORS.crystal);
    createTexture(this, "spark", 6, 6, COLORS.spark);

    // Cada fase tem seu próprio visual (fundo, cor dos inimigos) e seus
    // próprios chefes, então geramos as texturas de todas as fases de uma
    // vez no preload.
    PHASES.forEach((phase) => {
      createStarTexture(
        this,
        phase.starTextureKey,
        phase.starBgColor,
        phase.starColor,
      );
      createEnemyShipTexture(
        this,
        phase.enemyTextureKey,
        32,
        36,
        phase.enemyColor,
      );
      phase.bosses.forEach((def) => {
        createBossTexture(this, def.textureKey, 90, 80, def.color);
      });
    });
  }

  create() {
    this.score = 0;
    this.gameOver = false;
    this.crystalsCollected = 0;
    this.powerLevel = 0;
    this.shields = 0;
    this.invulnerableUntil = 0;
    this.lastShot = 0;
    this.phaseIndex = 0;

    this.sfx.stopMusic();
    this.sfx.startMusic();

    this.starfield = this.add
      .tileSprite(400, 240, 800, 480, this.phase.starTextureKey)
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

    // --- HUD ---
    this.hud = new HUD(this, {
      sfx: this.sfx,
      onRestart: () => this.scene.restart(),
    });
    this.hud.create();
    this.hud.setPhaseLabel(`Fase ${this.phase.id}`);
    this.hud.setWave(0, this.phase.waves.length);

    // --- Input (teclado + toque/arraste) ---
    this.input_ = new InputController(this, {
      onPointerDown: () => this.sfx.unlock(),
      isDragBlocked: (pointer) =>
        this.gameOver || this.hud.isPointerOverUI(pointer),
    });
    this.input_.create();

    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      this.sfx.unlock();
      const key = event.key?.toUpperCase();

      if (key === "R" && this.gameOver) {
        this.scene.restart();
      }
      if (key === "M") {
        this.hud.toggleMuteFromKeyboard();
      }
    });

    // --- Chefes ---
    this.bossController = new BossController(this, {
      getPlayer: () => this.player,
      getBosses: () => this.phase.bosses,
      bullets: this.bullets,
      bossBullets: this.bossBullets,
      enemies: this.enemies,
      hud: this.hud,
      sfx: this.sfx,
      onScoreChange: (delta) => this.addScore(delta),
      onPlayerHit: this.hitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      onPhaseBossesDefeated: () => this.advancePhaseOrWin(),
    });
    this.bossController.reset();

    // --- Ondas de inimigos + cristais ---
    this.waveSpawner = new WaveSpawner(this, {
      enemies: this.enemies,
      crystals: this.crystals,
      isGameOver: () => this.gameOver,
      isBossActive: () => this.bossController.active,
      getWaves: () => this.phase.waves,
      getEnemyTextureKey: () => this.phase.enemyTextureKey,
      onWaveChange: (current, total) => this.hud.setWave(current, total),
      onWavesComplete: () => this.bossController.spawn(0),
    });
    this.waveSpawner.start();
  }

  private addScore(delta: number) {
    this.score += delta;
    this.hud.setScore(this.score);
  }

  /** Chamado pelo BossController quando os chefes da fase atual acabam. */
  private advancePhaseOrWin() {
    const nextIndex = this.phaseIndex + 1;

    if (nextIndex >= PHASES.length) {
      this.winGame();
      return;
    }

    const nextPhase = PHASES[nextIndex];
    this.hud.hideBoss();
    this.hud.showStatus(`🚀 ${nextPhase.label}`);

    this.time.delayedCall(2200, () => this.startPhase(nextIndex));
  }

  private startPhase(index: number) {
    this.phaseIndex = index;
    const phase = this.phase;

    this.starfield.setTexture(phase.starTextureKey);
    this.hud.setPhaseLabel(`Fase ${phase.id}`);
    this.hud.showStatus("");

    this.bossController.reset();
    this.waveSpawner.startWaves();
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
    this.addScore(10);
    this.sfx.enemyExplode();
  }

  collectCrystal(obj1: unknown, obj2: unknown) {
    const a = obj1 as Phaser.Physics.Arcade.Sprite;
    const c = obj2 as Phaser.Physics.Arcade.Sprite;
    const crystal = a.texture?.key === "crystal" ? a : c;

    if (!crystal?.active) return;
    crystal.destroy();
    this.addScore(25);
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

    this.hud.setPower(this.powerLevel, this.shields);
  }

  hitPlayer(_a: unknown, _b: unknown) {
    if (this.gameOver) return;

    if (this.time.now < this.invulnerableUntil) return;
    this.invulnerableUntil = this.time.now + 1200;

    if (this.shields > 0) {
      this.shields -= 1;
      this.hud.setPower(this.powerLevel, this.shields);
      if (this.shields === 0) {
        this.shieldRing.setVisible(false);
      }

      this.player.setTint(0x9be8ff);
      this.time.delayedCall(150, () => this.player.clearTint());
      this.sfx.shieldBlock();
      return;
    }

    this.endGame("VOCÊ FOI ATINGIDO");
    this.player.setTint(0xff0000);
    this.sfx.playerHit();
  }

  winGame() {
    if (this.gameOver) return;
    this.endGame("VOCÊ DERROTOU TODOS OS GUARDIÕES! 🎉");
    this.hud.hideBoss();
    this.sfx.win();
  }

  /** Estado comum de fim de jogo (derrota ou vitória). */
  private endGame(message: string) {
    this.gameOver = true;
    this.physics.pause();
    this.waveSpawner.stop();
    this.bossController.stopTimers();
    this.hud.showStatus(message);
    this.hud.showRestartButton();
    this.sfx.stopMusic();
  }

  update(time: number) {
    if (this.gameOver) return;

    this.starfield.tilePositionY -= 2;

    this.input_.updatePlayer(this.player, PLAYER_SPEED);
    this.shoot(time);

    this.shieldRing.setPosition(this.player.x, this.player.y);

    this.bossController.updateMovement();

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
