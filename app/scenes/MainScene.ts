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
    this.createShipTexture("player", 34, 30, COLORS.player);
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

  // desenha uma naves triangular com "cockpit" e bordas, em vez de um retângulo
  createShipTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();

    // corpo da nave (triângulo apontando pra cima)
    gfx.fillStyle(color, 1);
    gfx.beginPath();
    gfx.moveTo(w / 2, 0);
    gfx.lineTo(w, h * 0.8);
    gfx.lineTo(w / 2, h * 0.6);
    gfx.lineTo(0, h * 0.8);
    gfx.closePath();
    gfx.fillPath();

    // cockpit (janela)
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(w / 2, h * 0.42, w * 0.14);

    // saída do propulsor
    gfx.fillStyle(0x0d0221, 1);
    gfx.fillRect(w * 0.35, h * 0.75, w * 0.3, h * 0.2);

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
    this.player.setSize(24, 24).setOffset(5, 4);

    // rastro de partículas do propulsor, atrás da nave
    this.thrusterParticles = this.add.particles(0, 0, "spark", {
      lifespan: 260,
      speed: { min: 40, max: 90 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.9, end: 0 },
      angle: { min: 80, max: 100 },
      frequency: -1,
      follow: this.player,
      followOffset: { x: 0, y: 14 },
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
      this.thrusterParticles.explode(8);
    }
  }
}
