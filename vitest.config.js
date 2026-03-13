import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test_*.test.js'],
        globals: false,
        coverage: {
            provider: 'v8',
            include: ['game.js', 'leaderboard.js'],
        },
    },
});
