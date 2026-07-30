import Phaser from "phaser";

const COLORS = {
  player: 0xff2e97,
  platform: 0x21e6c1,
  crystal: 0xffe45e,
  enemy: 0xa239ea,
  goal: 0x21e6c1,
  thruster: 0xffe45e,
};

const JUMP_VELOCITY = -480;
const PLAYER_SPEED = 220;

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private crystals!: Phaser.Physics.Arcade.Group;
  private enemy!: Phaser.Physics.Arcade.Sprite;
  private goal!: Phaser.Physics.Arcade.Sprite;
  private thrusterParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private scoreText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameOver = false;
  private enemyDirection = 1;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.createShipTexture("player", 40, 44, COLORS.player);
    this.createTexture("platform", 120, 24, COLORS.platform);
    this.createTexture("crystal", 20, 20, COLORS.crystal);
    this.createEnemyTexture("enemy", 28, 28, COLORS.enemy);
    this.createTexture("goal", 32, 48, COLORS.goal);
    this.createTexture("spark", 6, 6, COLORS.thruster);
  }

  createTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, w, h);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  // nave estilo caça estelar (asas laterais + fuselagem central + motores gêmeos)
  createShipTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();

    // asa esquerda
    gfx.fillStyle(color, 1);
    gfx.beginPath();
    gfx.moveTo(w * 0.1, h * 0.9);
    gfx.lineTo(w * 0.42, h * 0.55);
    gfx.lineTo(w * 0.42, h * 0.85);
    gfx.closePath();
    gfx.fillPath();

    // asa direita
    gfx.beginPath();
    gfx.moveTo(w * 0.9, h * 0.9);
    gfx.lineTo(w * 0.58, h * 0.55);
    gfx.lineTo(w * 0.58, h * 0.85);
    gfx.closePath();
    gfx.fillPath();

    // fuselagem central, alongada e afilada no nariz
    gfx.beginPath();
    gfx.moveTo(w * 0.5, 0);
    gfx.lineTo(w * 0.62, h * 0.35);
    gfx.lineTo(w * 0.58, h * 0.95);
    gfx.lineTo(w * 0.42, h * 0.95);
    gfx.lineTo(w * 0.38, h * 0.35);
    gfx.closePath();
    gfx.fillPath();

    // cockpit
    gfx.fillStyle(0x9be8ff, 0.95);
    gfx.fillEllipse(w * 0.5, h * 0.32, w * 0.16, h * 0.22);

    // detalhe das asas (listras neon)
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillRect(w * 0.2, h * 0.72, w * 0.16, 2);
    gfx.fillRect(w * 0.64, h * 0.72, w * 0.16, 2);

    // motores gêmeos (brilho, atrás das asas)
    gfx.fillStyle(0xffe45e, 1);
    gfx.fillCircle(w * 0.32, h * 0.92, 4);
    gfx.fillCircle(w * 0.68, h * 0.92, 4);

    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  // inimigo com formato de "drone" losangular, pra diferenciar do jogador
  createEnemyTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.beginPath();
    gfx.moveTo(w / 2, 0);
    gfx.lineTo(w, h / 2);
    gfx.lineTo(w / 2, h);
    gfx.lineTo(0, h / 2);
    gfx.closePath();
    gfx.fillPath();

    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(w / 2, h / 2, w * 0.15);

    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  create() {
    this.score = 0;
    this.gameOver = false;
    this.enemyDirection = 1;

    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 470, "platform").setScale(8, 1).refreshBody();
    platforms.create(200, 380, "platform");
    platforms.create(420, 300, "platform");
    platforms.create(200, 220, "platform");
    platforms.create(420, 140, "platform");

    this.player = this.physics.add.sprite(80, 400, "player");
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(22, 30).setOffset(9, 10);

    // rastro de partículas do propulsor, atrás da nave, contínuo
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

    this.crystals = this.physics.add.group();
    [
      [200, 340],
      [420, 260],
      [200, 180],
    ].forEach(([x, y]) => {
      const crystal = this.crystals.create(x, y, "crystal");
      crystal.setBounce(0.4);
      (crystal.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      this.tweens.add({
        targets: crystal,
        y: y - 10,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "sine.inout",
      });
    });

    this.enemy = this.physics.add.sprite(420, 274, "enemy");
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setVelocityX(70);

    this.goal = this.physics.add.sprite(420, 90, "goal");
    this.goal.setImmovable(true);
    (this.goal.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemy, platforms);

    this.physics.add.overlap(this.player, this.crystals, this.collectCrystal, undefined, this);
    this.physics.add.collider(this.player, this.enemy, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.goal, this.winGame, undefined, this);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.scoreText = this.add.text(16, 16, "Cristais: 0 / 3", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#f4f1ff",
    });

    this.statusText = this.add
      .text(400, 240, "", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#ffe45e",
        align: "center",
      })
      .setOrigin(0.5);

    this.input.keyboard!.on("keydown-R", () => {
      if (this.gameOver) this.scene.restart();
    });
  }

  collectCrystal(_player: unknown, crystal: unknown) {
    (crystal as Phaser.Physics.Arcade.Sprite).destroy();
    this.score += 1;
    this.scoreText.setText(`Cristais: ${this.score} / 3`);
  }

  hitEnemy() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.statusText.setText("VOCÊ FOI ATINGIDO\n\nPressione R para tentar de novo");
  }

  winGame() {
    if (this.gameOver) return;
    if (this.score < 3) return;
    this.gameOver = true;
    this.physics.pause();
    this.statusText.setText("VOCÊ VENCEU! 🎉\n\nPressione R para jogar de novo");
  }

  update() {
    if (this.gameOver) return;

    if (this.enemy.x > 470) this.enemyDirection = -1;
    if (this.enemy.x < 370) this.enemyDirection = 1;
    this.enemy.setVelocityX(70 * this.enemyDirection);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.up.isDown && body.blocked.down) {
      this.player.setVelocityY(JUMP_VELOCITY);
    }
  }
}
