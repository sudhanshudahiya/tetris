# tetris

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
