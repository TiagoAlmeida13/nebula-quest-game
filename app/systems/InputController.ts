import Phaser from "phaser";

export type InputControllerOptions = {
  /** Chamado a cada pointerdown, antes de qualquer outra checagem (ex: destravar áudio). */
  onPointerDown?: () => void;
  /**
   * Se retornar true para o pointer, o toque é ignorado e não inicia o
   * arrasto da nave (ex: jogo acabou, ou toque caiu em cima de um botão de UI).
   */
  isDragBlocked: (pointer: Phaser.Input.Pointer) => boolean;
};

/**
 * Controla o movimento do jogador: teclado (setas) no desktop e
 * toque/arraste na tela no mobile. A nave "segue o dedo" diretamente
 * (com suavização) em vez de perseguir um alvo fixo com velocidade
 * constante — assim ela acompanha arrastos rápidos sem atraso.
 */
export class InputController {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private scene: Phaser.Scene;
  private options: InputControllerOptions;
  private isDragging = false;
  private touchTarget = new Phaser.Math.Vector2();
  private readonly followFactor = 0.35;
  private readonly touchOffsetY = -40;

  constructor(scene: Phaser.Scene, options: InputControllerOptions) {
    this.scene = scene;
    this.options = options;
  }

  create() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.isDragging = false;

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.options.onPointerDown?.();
      if (this.options.isDragBlocked(pointer)) return;
      this.isDragging = true;
      this.touchTarget.set(pointer.x, pointer.y + this.touchOffsetY);
    });

    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      this.touchTarget.set(pointer.x, pointer.y + this.touchOffsetY);
    });

    this.scene.input.on("pointerup", () => {
      this.isDragging = false;
    });
  }

  /** Chamar a cada frame no update() da cena, passando a nave e sua velocidade base. */
  updatePlayer(player: Phaser.Physics.Arcade.Sprite, speed: number) {
    if (this.isDragging) {
      const dx = this.touchTarget.x - player.x;
      const dy = this.touchTarget.y - player.y;

      player.setVelocity(0, 0);
      player.x += dx * this.followFactor;
      player.y += dy * this.followFactor;

      if (Math.abs(dx) > 1) {
        player.setFlipX(dx < 0);
      }
      return;
    }

    if (this.cursors.left.isDown) {
      player.setVelocityX(-speed);
      player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      player.setVelocityX(speed);
      player.setFlipX(false);
    } else {
      player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      player.setVelocityY(speed);
    } else {
      player.setVelocityY(0);
    }
  }
}
