import Phaser from "phaser";

const COLORS = {
  player: 0xff2e97,
  platform: 0x21e6c1,
  crystal: 0xffe45e,
  enemy: 0xa239ea,
  goal: 0x21e6c1,
};

const JUMP_VELOCITY = -480;
const PLAYER_SPEED = 220;

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private crystals!: Phaser.Physics.Arcade.Group;
  private enemy!: Phaser.Physics.Arcade.Sprite;
  private goal!: Phaser.Physics.Arcade.Sprite;
  private scoreText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameOver = false;
  private enemyDirection = 1;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.createTexture("player", 28, 36, COLORS.player);
    this.createTexture("platform", 120, 24, COLORS.platform);
    this.createTexture("crystal", 20, 20, COLORS.crystal);
    this.createTexture("enemy", 28, 28, COLORS.enemy);
    this.createTexture("goal", 32, 48, COLORS.goal);
  }

  createTexture(key: string, w: number, h: number, color: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, w, h);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  create() {
    this.score = 0;
    this.gameOver = false;
    this.enemyDirection = 1;

    // plataformas em formato de escada, cada degrau alcançável pelo pulo
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 470, "platform").setScale(8, 1).refreshBody();
    platforms.create(200, 380, "platform"); // degrau 1
    platforms.create(420, 300, "platform"); // degrau 2
    platforms.create(200, 220, "platform"); // degrau 3
    platforms.create(420, 140, "platform"); // degrau 4 (topo)

    // jogador
    this.player = this.physics.add.sprite(80, 400, "player");
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // cristais, um por degrau (exceto o topo)
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

    // inimigo patrulhando o degrau 2 (o mais no meio do caminho)
    this.enemy = this.physics.add.sprite(420, 274, "enemy");
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setVelocityX(70);

    // meta / portal no topo
    this.goal = this.physics.add.sprite(420, 90, "goal");
    this.goal.setImmovable(true);
    (this.goal.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    // colisões
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemy, platforms);

    this.physics.add.overlap(
      this.player,
      this.crystals,
      this.collectCrystal,
      undefined,
      this,
    );
    this.physics.add.collider(
      this.player,
      this.enemy,
      this.hitEnemy,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.goal,
      this.winGame,
      undefined,
      this,
    );

    // controles
    this.cursors = this.input.keyboard!.createCursorKeys();

    // UI
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
    this.statusText.setText(
      "VOCÊ FOI ATINGIDO\n\nPressione R para tentar de novo",
    );
  }

  winGame() {
    if (this.gameOver) return;
    if (this.score < 3) return;
    this.gameOver = true;
    this.physics.pause();
    this.statusText.setText(
      "VOCÊ VENCEU! 🎉\n\nPressione R para jogar de novo",
    );
  }

  update() {
    if (this.gameOver) return;

    // patrulha do inimigo dentro do degrau 2
    if (this.enemy.x > 470) this.enemyDirection = -1;
    if (this.enemy.x < 370) this.enemyDirection = 1;
    this.enemy.setVelocityX(70 * this.enemyDirection);

    // movimento do jogador
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.up.isDown && body.blocked.down) {
      this.player.setVelocityY(JUMP_VELOCITY);
    }
  }
}
