import Phaser from "phaser";

const COLORS = {
  player: 0xff2e97,
  enemy: 0xa239ea,
  bullet: 0x9be8ff,
  crystal: 0xffe45e,
  spark: 0xffe45e,
};

const PLAYER_SPEED = 260;
const BULLET_SPEED = 420;
const ENEMY_SPEED = 90;
const ENEMIES_TO_WIN = 12;
const BOSS_MAX_HEALTH = 20;
const BOSS_BULLET_SPEED = 260;
const BOSS_BAR_WIDTH = 300;
const BOSS_BAR_X = 250; // canto esquerdo fixo da barra, no topo

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private crystals!: Phaser.Physics.Arcade.Group;
  private bossBullets!: Phaser.Physics.Arcade.Group;
  private boss?: Phaser.Physics.Arcade.Sprite;
  private starfield!: Phaser.GameObjects.TileSprite;
  private thrusterParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private scoreText!: Phaser.GameObjects.Text;
  private defeatedText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private bossHealthBarBg?: Phaser.GameObjects.Rectangle;
  private bossHealthBarFill?: Phaser.GameObjects.Rectangle;
  private bossLabel?: Phaser.GameObjects.Text;

  private score = 0;
  private defeated = 0;
  private gameOver = false;
  private bossActive = false;
  private bossHealth = BOSS_MAX_HEALTH;
  private bossDirection = 1;
  private lastShot = 0;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
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
    this.defeated = 0;
    this.gameOver = false;
    this.bossActive = false;
    this.bossHealth = BOSS_MAX_HEALTH;
    this.bossDirection = 1;
    this.lastShot = 0;
    this.boss = undefined;
    this.bossHealthBarBg = undefined;
    this.bossHealthBarFill = undefined;
    this.bossLabel = undefined;

    this.starfield = this.add.tileSprite(400, 240, 800, 480, "stars").setDepth(-1);

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

    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.crystals = this.physics.add.group();
    this.bossBullets = this.physics.add.group();

    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemyWithBullet, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.crystals, this.collectCrystal, undefined, this);
    this.physics.add.overlap(this.player, this.bossBullets, this.hitPlayer, undefined, this);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.scoreText = this.add.text(16, 16, "Pontos: 0", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#f4f1ff",
    });

    this.defeatedText = this.add.text(16, 42, `Inimigos: 0 / ${ENEMIES_TO_WIN}`, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#f4f1ff99",
    });

    this.statusText = this.add
      .text(400, 240, "", {
        fontFamily: "monospace",
        fontSize: "30px",
        color: "#ffe45e",
        align: "center",
      })
      .setOrigin(0.5);

    this.enemySpawnTimer = this.time.addEvent({
      delay: 900,
      loop: true,
      callback: this.spawnEnemy,
      callbackScope: this,
    });

    this.crystalSpawnTimer = this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: this.spawnCrystal,
      callbackScope: this,
    });

    this.input.keyboard!.on("keydown-R", () => {
      if (this.gameOver) this.scene.restart();
    });
  }

  spawnEnemy() {
    if (this.gameOver || this.bossActive) return;
    const x = Phaser.Math.Between(40, 760);
    const enemy = this.enemies.create(x, -30, "enemy") as Phaser.Physics.Arcade.Sprite;
    enemy.setVelocityY(ENEMY_SPEED);
    enemy.setSize(20, 24).setOffset(6, 6);
  }

  spawnCrystal() {
    if (this.gameOver) return;
    const x = Phaser.Math.Between(40, 760);
    const crystal = this.crystals.create(x, -20, "crystal") as Phaser.Physics.Arcade.Sprite;
    crystal.setVelocityY(120);
  }

  spawnBoss() {
    this.bossActive = true;
    this.enemySpawnTimer.remove();

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

    this.physics.add.overlap(this.bullets, this.boss, this.hitBossWithBullet, undefined, this);
    this.physics.add.overlap(this.player, this.boss, this.hitPlayer, undefined, this);

    this.bossShootTimer = this.time.addEvent({
      delay: 1100,
      loop: true,
      callback: this.bossShoot,
      callbackScope: this,
    });
  }

  bossShoot() {
    if (this.gameOver || !this.boss || !this.boss.active) return;
    const bullet = this.bossBullets.create(this.boss.x, this.boss.y + 30, "bossBullet") as Phaser.Physics.Arcade.Sprite;
    if (!bullet || !bullet.body) return;
    const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    this.physics.velocityFromRotation(angle, BOSS_BULLET_SPEED, bullet.body.velocity);
  }

  shoot(time: number) {
    if (time < this.lastShot + 220) return;
    this.lastShot = time;
    const bullet = this.bullets.create(this.player.x, this.player.y - 26, "bullet") as Phaser.Physics.Arcade.Sprite;
    bullet.setVelocityY(-BULLET_SPEED);
  }

  // identifica bala e inimigo pela textura, não pela ordem dos parâmetros
  // (a v4 do Phaser pode inverter a ordem quando um dos lados é um sprite único)
  hitEnemyWithBullet(obj1: unknown, obj2: unknown) {
    const a = obj1 as Phaser.Physics.Arcade.Sprite;
    const c = obj2 as Phaser.Physics.Arcade.Sprite;
    const bullet = a.texture?.key === "bullet" ? a : c;
    const enemy = bullet === a ? c : a;

    if (!bullet?.active || !enemy?.active) return;

    bullet.destroy();
    enemy.destroy();
    this.score += 10;
    this.defeated += 1;
    this.scoreText.setText(`Pontos: ${this.score}`);
    this.defeatedText.setText(`Inimigos: ${this.defeated} / ${ENEMIES_TO_WIN}`);

    if (this.defeated >= ENEMIES_TO_WIN && !this.bossActive) {
      this.spawnBoss();
    }
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
  }

  hitPlayer() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    this.enemySpawnTimer.remove();
    this.crystalSpawnTimer.remove();
    this.bossShootTimer?.remove();
    this.player.setTint(0xff0000);
    this.statusText.setText("VOCÊ FOI ATINGIDO\n\nPressione R para tentar de novo");
  }

  winGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    this.enemySpawnTimer.remove();
    this.crystalSpawnTimer.remove();
    this.bossShootTimer?.remove();
    this.boss?.setTint(0xff0000);
    this.statusText.setText("VOCÊ DERROTOU O IMPERADOR! 🎉\n\nPressione R para jogar de novo");
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

    if (this.bossActive && this.boss?.active) {
      if (this.boss.x > 680) this.bossDirection = -1;
      if (this.boss.x < 120) this.bossDirection = 1;
      this.boss.setVelocityX(120 * this.bossDirection);
    }

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
      if (bullet.y > 520 || bullet.y < -20 || bullet.x < -20 || bullet.x > 820) bullet.destroy();
    });
  }
}
