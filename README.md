# Tetris

A mobile-friendly, browser-based Tetris game with neon/CRT aesthetics, ghost piece preview, responsive touch controls, and a local leaderboard. Fully playable on phones and tablets with intuitive swipe and tap gestures.

## Run the Game

Open `index.html` directly in a browser, or serve it locally:

```sh
python3 -m http.server 8888
# then open http://localhost:8888
```

## Controls

**Keyboard:**
- Arrow keys to move and rotate
- Space for hard drop
- P to pause

**Touch (mobile):**
- Drag left/right to move
- Drag down for soft drop
- Long press for hard drop
- Tap to rotate

## Development Setup

Install dependencies:

```sh
npm install
```

This automatically installs the pre-commit hook via `npm prepare`.

To manually install the hook:

```sh
./scripts/install-hooks.sh
```

## Linting

Run ESLint on all files:

```sh
npm run lint
```

The pre-commit hook automatically runs ESLint on staged `.js` and `.html` files and blocks commits with syntax errors.

## Tests

```sh
npm test
```
