#!/bin/sh
#
# Install git hooks for local development.
# Usage: ./scripts/install-hooks.sh
#

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "Installing pre-commit hook..."
mkdir -p "$HOOKS_DIR"
cp hooks/pre-commit "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

# Point git to use the correct hooks directory
# (overrides any stale core.hooksPath like .husky)
git config core.hooksPath "$HOOKS_DIR"

echo "Done! Pre-commit hook installed to $HOOKS_DIR/pre-commit"
