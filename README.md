# Tetris

A single-file Tetris game with an Atari-inspired animated background.

## Background

The background pays homage to classic Atari games with six animated layers rendered on a shared canvas:

| Layer | Inspiration | What it does |
|-------|-------------|-------------|
| Star field | *Asteroids* | Twinkling pixel stars drift downward |
| Space Invaders | *Space Invaders* | Fleet of 8×8 pixel-art aliens march across the screen |
| Pong | *Pong* | Ball and AI paddles bounce silently behind the game |
| Breakout bricks | *Breakout* | Shimmering colored brick rows line the top edge |
| Falling Tetris pieces | *Tetris* | Dimmed tetrominoes fall and stack in the background |
| Laser shots | *Space Invaders* | Occasional green laser bolts fire upward |

All layers use the **Atari 2600 NTSC TIA color palette** for period-accurate colors.

### CRT Effects

Three overlays simulate a retro CRT monitor:

- **Scanlines** — horizontal repeating gradient
- **Vignette** — radial darkening at screen edges
- **Chromatic aberration** — subtle RGB color separation
- **Phosphor flicker** — gentle opacity animation

### Running

Open `index.html` in any modern browser. No build step required.

### Tests

```
node test_tetris.js
```

Validates game mechanics and all background features (35 tests).
