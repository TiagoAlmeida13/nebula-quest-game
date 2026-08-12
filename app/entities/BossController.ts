import Phaser from "phaser";
import { BOSSES, BOSS_BULLET_SPEED } from "../config/gameConfig";
import { HUD } from "../ui/HUD";
import { SFX } from "../lib/sfx";

export type BossControllerOptions = {
  getPlayer: () => Phaser.Physics.Arcade.Sprite;
  bullets: Phaser.Physics.Arcade.Group;
  bossBullets: Phaser.Physics.Arcade.Group;
  enemies: Phaser.Physics.Arcade.Group;
  hud: HUD;
  sfx: SFX;
  onScoreChange: (delta: number) => void;
  onPlayerHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;
  /** Chamado quando o último chefe da lista é derrotado. */
  onAllBossesDefeated: () => void;
};

/**
 * Cuida de um chefe por vez: spawn, movimento lateral, padrões de tiro
 * (mirado / espalhado / misto), dano e progressão para o próximo chefe.
 */
export class BossController {
  boss?: Phaser.Physics.Arcade.Sprite;
  active = false;

  private scene: Phaser.Scene;
  private options: BossControllerOptions;
  private bossIndex = 0;
  private bossMaxHealth = BOSSES[0].maxHealth;
  private bossHealth = BOSSES[0].maxHealth;
  private bossShotCount = 0;
  private bossDirection = 1;
  private bossShootTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, options: BossControllerOptions) {
    this.scene = scene;
    this.options = options;
  }

  /** Chamar no create() da cena, para zerar o estado entre partidas. */
  reset() {
    this.boss = undefined;
    this.active = false;
    this.bossIndex = 0;
    this.bossMaxHealth = BOSSES[0].maxHealth;
    this.bossHealth = BOSSES[0].maxHealth;
    this.bossShotCount = 0;
    this.bossDirection = 1;
    this.bossShootTimer?.remove();
    this.bossShootTimer = undefined;
  }

  stopTimers() {
    this.bossShootTimer?.remove();
  }

  spawn(index: number) {
    this.active = true;
    this.bossIndex = index;
    const def = BOSSES[index];
    this.bossMaxHealth = def.maxHealth;
    this.bossHealth = def.maxHealth;
    this.bossShotCount = 0;

    this.options.enemies.getChildren().forEach((e) => {
      (e as Phaser.Physics.Arcade.Sprite).destroy();
    });

    this.boss = this.scene.physics.add.sprite(400, -60, `boss${index}`);
    this.boss.setCollideWorldBounds(true);
    this.boss.setSize(70, 60).setOffset(10, 10);

    this.options.hud.showBoss(def.name);

    this.scene.tweens.add({
      targets: this.boss,
      y: 130,
      duration: 1200,
      ease: "sine.out",
    });

    this.scene.physics.add.overlap(
      this.options.bullets,
      this.boss,
      this.handleBulletHit,
      undefined,
      this,
    );
    this.scene.physics.add.overlap(
      this.options.getPlayer(),
      this.boss,
      this.options.onPlayerHit,
      undefined,
      this.scene,
    );

    this.bossShootTimer?.remove();
    this.bossShootTimer = this.scene.time.addEvent({
      delay: def.shootDelay,
      loop: true,
      callback: this.shoot,
      callbackScope: this,
    });
  }

  /** Chamar a cada frame no update() da cena. */
  updateMovement() {
    if (!this.active || !this.boss?.active) return;
    const def = BOSSES[this.bossIndex];
    if (this.boss.x > 680) this.bossDirection = -1;
    if (this.boss.x < 120) this.bossDirection = 1;
    this.boss.setVelocityX(def.moveSpeed * this.bossDirection);
  }

  private shoot = () => {
    if (!this.boss || !this.boss.active) return;
    const def = BOSSES[this.bossIndex];
    this.bossShotCount++;

    if (def.pattern === "aimed") {
      this.fireAimed();
    } else if (def.pattern === "spread") {
      this.fireSpread();
    } else {
      if (this.bossShotCount % 2 === 0) {
        this.fireSpread();
      } else {
        this.fireAimed();
      }
    }
  };

  private fireAimed() {
    if (!this.boss) return;
    const player = this.options.getPlayer();
    const bullet = this.options.bossBullets.create(
      this.boss.x,
      this.boss.y + 30,
      "bossBullet",
    ) as Phaser.Physics.Arcade.Sprite;
    if (!bullet || !bullet.body) return;
    const angle = Phaser.Math.Angle.Between(
      this.boss.x,
      this.boss.y,
      player.x,
      player.y,
    );
    this.scene.physics.velocityFromRotation(
      angle,
      BOSS_BULLET_SPEED,
      bullet.body.velocity,
    );
  }

  private fireSpread() {
    if (!this.boss) return;
    const offsets = [-0.35, 0, 0.35];
    offsets.forEach((offset) => {
      const bullet = this.options.bossBullets.create(
        this.boss!.x,
        this.boss!.y + 30,
        "bossBullet",
      ) as Phaser.Physics.Arcade.Sprite;
      if (!bullet || !bullet.body) return;
      const vx = Math.sin(offset) * BOSS_BULLET_SPEED;
      const vy = Math.cos(offset) * BOSS_BULLET_SPEED;
      bullet.setVelocity(vx, vy);
    });
  }

  private handleBulletHit = (obj1: unknown, obj2: unknown) => {
    const a = obj1 as Phaser.Physics.Arcade.Sprite;
    const c = obj2 as Phaser.Physics.Arcade.Sprite;
    const bullet = a.texture?.key === "bullet" ? a : c;

    if (!bullet?.active) return;

    bullet.destroy();
    this.bossHealth = Math.max(this.bossHealth - 1, 0);
    this.options.onScoreChange(5);
    this.options.hud.setBossHealthRatio(this.bossHealth / this.bossMaxHealth);

    if (this.bossHealth <= 0) {
      this.defeat();
    } else {
      this.options.sfx.enemyExplode();
    }
  };

  // chefe atual derrotado: avança pro próximo, ou vence o jogo se era o último
  private defeat() {
    this.bossShootTimer?.remove();
    this.boss?.destroy();
    this.options.onScoreChange(100);
    this.options.sfx.bossExplode();

    const nextIndex = this.bossIndex + 1;

    if (nextIndex < BOSSES.length) {
      this.options.hud.setBossLabelText(`${BOSSES[this.bossIndex].name} DERROTADO!`);
      this.scene.time.delayedCall(2000, () => this.spawn(nextIndex));
    } else {
      this.active = false;
      this.options.onAllBossesDefeated();
    }
  }
}
