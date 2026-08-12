import Phaser from "phaser";
import { BOSS_BAR_WIDTH, BOSS_BAR_X } from "../config/gameConfig";
import { SFX } from "../lib/sfx";

export type HUDOptions = {
  sfx: SFX;
  onRestart: () => void;
};

/**
 * Toda a interface fixa na tela: pontuação, onda, nível de tiro/escudos,
 * botão de mute, mensagens de status (derrota/vitória) e o botão de
 * reiniciar, além da barra de vida do chefe (criada sob demanda).
 */
export class HUD {
  private scene: Phaser.Scene;
  private sfx: SFX;
  private onRestart: () => void;

  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private muteText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private restartButtonBg!: Phaser.GameObjects.Rectangle;
  private restartButtonText!: Phaser.GameObjects.Text;
  private bossHealthBarBg?: Phaser.GameObjects.Rectangle;
  private bossHealthBarFill?: Phaser.GameObjects.Rectangle;
  private bossLabel?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: HUDOptions) {
    this.scene = scene;
    this.sfx = options.sfx;
    this.onRestart = options.onRestart;
  }

  create() {
    this.bossHealthBarBg = undefined;
    this.bossHealthBarFill = undefined;
    this.bossLabel = undefined;

    this.scoreText = this.scene.add.text(16, 16, "Pontos: 0", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#f4f1ff",
    });

    this.waveText = this.scene.add.text(16, 42, "Onda: 0", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#f4f1ff99",
    });

    this.powerText = this.scene.add.text(
      16,
      64,
      "Tiro: Nível 1 · Escudos: 0",
      {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#9be8ff",
      },
    );

    this.muteText = this.scene.add
      .text(784, 16, "🔊 (M)", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#f4f1ff99",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.sfx.unlock();
        this.toggleMute();
      });

    this.statusText = this.scene.add
      .text(400, 220, "", {
        fontFamily: "monospace",
        fontSize: "30px",
        color: "#ffe45e",
        align: "center",
      })
      .setOrigin(0.5);

    this.restartButtonBg = this.scene.add
      .rectangle(400, 310, 240, 60, 0x1a1a2e, 0.9)
      .setStrokeStyle(2, 0xffe45e)
      .setOrigin(0.5)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    this.restartButtonText = this.scene.add
      .text(400, 310, "🔄 JOGAR DE NOVO", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffe45e",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.restartButtonBg.on("pointerdown", () => {
      this.sfx.unlock();
      this.onRestart();
    });
  }

  private toggleMute() {
    const newMuted = !this.sfx.isMuted();
    this.sfx.setMuted(newMuted);
    this.muteText.setText(newMuted ? "🔇 (M)" : "🔊 (M)");
  }

  /** Usado pelo atalho de teclado "M". */
  toggleMuteFromKeyboard() {
    this.toggleMute();
  }

  setScore(score: number) {
    this.scoreText.setText(`Pontos: ${score}`);
  }

  setWave(current: number, total: number) {
    this.waveText.setText(`Onda: ${current} / ${total}`);
  }

  setPower(powerLevel: number, shields: number) {
    this.powerText.setText(
      `Tiro: Nível ${powerLevel + 1} · Escudos: ${shields}`,
    );
  }

  /** true se o toque caiu em cima de algum elemento de UI (não deve mover a nave). */
  isPointerOverUI(pointer: Phaser.Input.Pointer): boolean {
    if (this.muteText.getBounds().contains(pointer.x, pointer.y)) return true;
    if (
      this.restartButtonBg.visible &&
      this.restartButtonBg.getBounds().contains(pointer.x, pointer.y)
    ) {
      return true;
    }
    return false;
  }

  showStatus(text: string) {
    this.statusText.setText(text);
  }

  showRestartButton() {
    this.restartButtonBg.setVisible(true);
    this.restartButtonText.setVisible(true);
  }

  // --- Chefe ---

  showBoss(name: string) {
    if (!this.bossLabel) {
      this.bossLabel = this.scene.add
        .text(400, 60, name, {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#ff2e97",
        })
        .setOrigin(0.5);
    } else {
      this.bossLabel.setText(name);
    }

    if (!this.bossHealthBarBg) {
      this.bossHealthBarBg = this.scene.add
        .rectangle(BOSS_BAR_X, 80, BOSS_BAR_WIDTH + 4, 12, 0x1a1030)
        .setOrigin(0, 0.5)
        .setStrokeStyle(2, 0xff2e97);
    }

    if (!this.bossHealthBarFill) {
      this.bossHealthBarFill = this.scene.add
        .rectangle(BOSS_BAR_X + 2, 80, BOSS_BAR_WIDTH, 8, 0xff2e97)
        .setOrigin(0, 0.5);
    } else {
      this.bossHealthBarFill.width = BOSS_BAR_WIDTH;
    }
  }

  setBossHealthRatio(ratio: number) {
    if (!this.bossHealthBarFill) return;
    this.bossHealthBarFill.width = BOSS_BAR_WIDTH * ratio;
  }

  setBossLabelText(text: string) {
    this.bossLabel?.setText(text);
  }

  clearBossLabel() {
    this.bossLabel?.setText("");
  }
}
