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

**Nebula Quest** começou como uma landing page fictícia de um jogo espacial retrô — e virou o jogo de verdade. Esta é a versão jogável: uma fase de plataforma 2D construída com [Phaser](https://phaser.io), rodando dentro de uma aplicação Next.js.

O objetivo foi sair da "estética de jogo" para a **mecânica de jogo** de fato: física de colisão, gravidade, coleta de itens, um inimigo com padrão de movimento simples, e condições de vitória e derrota — os fundamentos de qualquer jogo 2D.

## Como jogar

- **Setas ← →** — mover a nave
- **Seta ↑** — pular
- Colete os **3 cristais** espalhados pelas plataformas
- Evite o **inimigo roxo** patrulhando o caminho
- Chegue ao **portal** no topo do mapa para vencer
- **R** — reiniciar a qualquer momento após vitória ou derrota

## Funcionalidades técnicas

- **Física arcade** (gravidade, colisão, bounce) via Phaser
- **Carregamento client-only** do Phaser dentro do Next.js, evitando conflito com Server-Side Rendering
- **Texturas geradas por código** (sem nenhum arquivo de imagem — sprites são retângulos coloridos desenhados via `Graphics` e convertidos em textura)
- **Animação de flutuação** dos cristais com tweens
- **IA simples de patrulha** do inimigo (inverte direção ao atingir os limites de uma zona)
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
