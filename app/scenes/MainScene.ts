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

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private crystals!: Phaser.Physics.Arcade.Group;
  private starfield!: Phaser.GameObjects.TileSprite;
  private thrusterParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private scoreText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  private score = 0;
  private defeated = 0;
  private gameOver = false;
  private lastShot = 0;
  private enemySpawnTimer!: Phaser.Time.TimerEvent;
  private crystalSpawnTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.createShipTexture("player", 40, 44, COLORS.player);
    this.createEnemyShipTexture("enemy", 32, 36, COLORS.enemy);
    this.createTexture("bullet", 5, 14, COLORS.bullet);
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

  // nave inimiga, formato similar mas invertida (aponta pra baixo) e mais angulosa
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

  create() {
    this.score = 0;
    this.defeated = 0;
    this.gameOver = false;
    this.lastShot = 0;

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

    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemyWithBullet, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.crystals, this.collectCrystal, undefined, this);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.scoreText = this.add.text(16, 16, "Pontos: 0", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#f4f1ff",
    });

    this.add.text(16, 42, `Inimigos: 0 / ${ENEMIES_TO_WIN}`, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#f4f1ff99",
    }).setName("defeatedText");

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
    if (this.gameOver) return;
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

  shoot(time: number) {
    if (time < this.lastShot + 220) return;
    this.lastShot = time;
    const bullet = this.bullets.create(this.player.x, this.player.y - 26, "bullet") as Phaser.Physics.Arcade.Sprite;
    bullet.setVelocityY(-BULLET_SPEED);
  }

  hitEnemyWithBullet(bullet: unknown, enemy: unknown) {
    (bullet as Phaser.Physics.Arcade.Sprite).destroy();
    (enemy as Phaser.Physics.Arcade.Sprite).destroy();
    this.score += 10;
    this.defeated += 1;
    this.scoreText.setText(`Pontos: ${this.score}`);
    (this.children.getByName("defeatedText") as Phaser.GameObjects.Text).setText(
      `Inimigos: ${this.defeated} / ${ENEMIES_TO_WIN}`
    );

    if (this.defeated >= ENEMIES_TO_WIN) {
      this.winGame();
    }
  }

  collectCrystal(_player: unknown, crystal: unknown) {
    (crystal as Phaser.Physics.Arcade.Sprite).destroy();
    this.score += 25;
    this.scoreText.setText(`Pontos: ${this.score}`);
  }

  hitPlayer() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    this.enemySpawnTimer.remove();
    this.crystalSpawnTimer.remove();
    this.player.setTint(0xff0000);
    this.statusText.setText("VOCÊ FOI ATINGIDO\n\nPressione R para tentar de novo");
  }

  winGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    this.enemySpawnTimer.remove();
    this.crystalSpawnTimer.remove();
    this.statusText.setText("VOCÊ VENCEU! 🎉\n\nPressione R para jogar de novo");
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

    // limpa balas e inimigos que saíram da tela
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
  }
}
