<div align="center">

# Nebula Quest — O Jogo 🚀

### Plataforma 2D jogável, construído com Phaser, Next.js e TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Phaser](https://img.shields.io/badge/Phaser-3-8ED6FB?style=flat-square)](https://phaser.io)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

[**🔗 Jogar agora**](https://nebula-quest-game.vercel.app)

</div>

---

## Sobre o projeto

**Nebula Quest** começou como uma landing page fictícia de um jogo espacial retrô — e virou o jogo de verdade. Esta é a versão jogável: um **shoot 'em up de rolagem vertical**, no estilo clássico de Sonic Wings / Aero Fighters, construído com [Phaser](https://phaser.io) rodando dentro de uma aplicação Next.js.

O objetivo foi sair da "estética de jogo" para a **mecânica de jogo** de fato: movimento livre em 4 direções sem gravidade, tiro automático, spawn contínuo de inimigos vindos do topo da tela, fundo estrelado com scroll infinito, coleta de itens bônus, e condições de vitória e derrota.

## Como jogar

- **Setas ← → ↑ ↓** — pilotar a nave livremente pela tela
- A nave **atira automaticamente** para cima enquanto o jogo roda
- Destrua **12 naves inimigas** para vencer
- Colete os **cristais amarelos** que caem para ganhar pontos bônus
- Evite colidir com qualquer nave inimiga — um só encostão encerra o jogo
- **R** — reiniciar a qualquer momento após vitória ou derrota

## Funcionalidades técnicas

- **Física arcade sem gravidade** — movimento livre em 4 direções, como um shooter de verdade, não um platformer
- **Sistema de spawn por temporizador** (`Time.TimerEvent`) para inimigos e cristais, em intervalos independentes
- **Scroll infinito de fundo** via `TileSprite`, simulando voo contínuo através do espaço
- **Tiro automático com cooldown**, controlado por tempo de jogo (não input do jogador)
- **Carregamento client-only** do Phaser dentro do Next.js, evitando conflito com Server-Side Rendering
- **Texturas geradas por código** — nave do jogador, naves inimigas e efeitos de propulsor são todos desenhados via `Graphics` e convertidos em textura, sem nenhum arquivo de imagem
- **Máquina de estados do jogo**: em andamento, vitória, derrota, reinício

## Tecnologias

| Tecnologia | Uso |
|---|---|
| [Next.js](https://nextjs.org) | Estrutura da aplicação, App Router |
| [TypeScript](https://www.typescriptlang.org) | Tipagem da cena e da lógica do jogo |
| [Phaser 3](https://phaser.io) | Engine do jogo — física, sprites, input, cenas |
| [Vercel](https://vercel.com) | Deploy e hospedagem |

## Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/TiagoAlmeida13/nebula-quest-game.git

# Entre na pasta do projeto
cd nebula-quest-game

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para jogar.

## Estrutura do projeto

```
nebula-quest-game/
├── app/
│   ├── components/
│   │   └── Game.tsx           # Inicializa o Phaser dentro de um Client Component
│   ├── scenes/
│   │   └── MainScene.ts       # Toda a lógica do jogo: física, colisão, UI, estados
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── package.json
```

## Autor

**Tiago Machado**
Desenvolvedor Front-end

[Portfólio](https://whoami-tiago.vercel.app) · [GitHub](https://github.com/TiagoAlmeida13) · [tyygo@live.com](mailto:tyygo@live.com)

---

<div align="center">
<sub>Projeto desenvolvido para fins de portfólio.</sub>
</div>
