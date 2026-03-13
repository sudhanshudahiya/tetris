// Leaderboard data layer tests — migrated to Vitest
// Tests the pure leaderboard functions from leaderboard.js
import { describe, it, expect, beforeEach } from 'vitest';

// localStorage mock for Node.js testing
const store = {};
const localStorageMock = {
    getItem(key) { return store[key] || null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((k) => { delete store[k]; }); }
};
globalThis.localStorage = localStorageMock;

const { getLeaderboard, saveScore, isHighScore, clearLeaderboard, LEADERBOARD_KEY, MAX_LEADERBOARD_ENTRIES } = await import('./leaderboard.js');

describe('getLeaderboard', () => {
    beforeEach(() => { localStorageMock.clear(); });

    it('returns array when empty', () => {
        expect(Array.isArray(getLeaderboard())).toBe(true);
    });

    it('returns empty array when no data', () => {
        expect(getLeaderboard().length).toBe(0);
    });

    it('returns empty array for invalid JSON', () => {
        localStorageMock.setItem(LEADERBOARD_KEY, 'not-json');
        expect(getLeaderboard().length).toBe(0);
    });

    it('returns empty array for non-array JSON', () => {
        localStorageMock.setItem(LEADERBOARD_KEY, JSON.stringify('not-array'));
        expect(getLeaderboard().length).toBe(0);
    });
});

describe('saveScore + getLeaderboard round-trip', () => {
    beforeEach(() => { localStorageMock.clear(); });

    it('adds one entry', () => {
        saveScore('Alice', 1000, 10, 1);
        const lb = getLeaderboard();
        expect(lb.length).toBe(1);
    });

    it('entry has correct name', () => {
        saveScore('Alice', 1000, 10, 1);
        expect(getLeaderboard()[0].name).toBe('Alice');
    });

    it('entry has correct score', () => {
        saveScore('Alice', 1000, 10, 1);
        expect(getLeaderboard()[0].score).toBe(1000);
    });

    it('entry has correct lines', () => {
        saveScore('Alice', 1000, 10, 1);
        expect(getLeaderboard()[0].lines).toBe(10);
    });

    it('entry has correct level', () => {
        saveScore('Alice', 1000, 10, 1);
        expect(getLeaderboard()[0].level).toBe(1);
    });

    it('entry has date string', () => {
        saveScore('Alice', 1000, 10, 1);
        expect(typeof getLeaderboard()[0].date).toBe('string');
    });
});

describe('Sorting', () => {
    beforeEach(() => { localStorageMock.clear(); });

    it('leaderboard sorted descending - first is highest', () => {
        saveScore('Low', 100, 5, 1);
        saveScore('High', 5000, 50, 5);
        saveScore('Mid', 2000, 20, 3);
        expect(getLeaderboard()[0].score).toBe(5000);
    });

    it('leaderboard sorted descending - second is mid', () => {
        saveScore('Low', 100, 5, 1);
        saveScore('High', 5000, 50, 5);
        saveScore('Mid', 2000, 20, 3);
        expect(getLeaderboard()[1].score).toBe(2000);
    });

    it('leaderboard sorted descending - third is lowest', () => {
        saveScore('Low', 100, 5, 1);
        saveScore('High', 5000, 50, 5);
        saveScore('Mid', 2000, 20, 3);
        expect(getLeaderboard()[2].score).toBe(100);
    });
});

describe('Trim to top 10', () => {
    beforeEach(() => { localStorageMock.clear(); });

    it('leaderboard trimmed to max 10 entries', () => {
        for (let i = 0; i < 12; i++) {
            saveScore('Player' + i, (i + 1) * 100, i, 1);
        }
        expect(getLeaderboard().length).toBe(MAX_LEADERBOARD_ENTRIES);
    });

    it('highest score is first after trim', () => {
        for (let i = 0; i < 12; i++) {
            saveScore('Player' + i, (i + 1) * 100, i, 1);
        }
        expect(getLeaderboard()[0].score).toBe(1200);
    });

    it('lowest kept score is 10th highest', () => {
        for (let i = 0; i < 12; i++) {
            saveScore('Player' + i, (i + 1) * 100, i, 1);
        }
        expect(getLeaderboard()[9].score).toBe(300);
    });
});

describe('isHighScore', () => {
    beforeEach(() => { localStorageMock.clear(); });

    it('returns true when leaderboard not full', () => {
        expect(isHighScore(1)).toBe(true);
    });

    it('returns true for score beating lowest', () => {
        for (let i = 0; i < 10; i++) {
            saveScore('P' + i, (i + 1) * 100, i, 1);
        }
        expect(isHighScore(1001)).toBe(true);
    });

    it('returns false for score below lowest', () => {
        for (let i = 0; i < 10; i++) {
            saveScore('P' + i, (i + 1) * 100, i, 1);
        }
        expect(isHighScore(50)).toBe(false);
    });

    it('returns false for score equal to lowest', () => {
        for (let i = 0; i < 10; i++) {
            saveScore('P' + i, (i + 1) * 100, i, 1);
        }
        expect(isHighScore(100)).toBe(false);
    });
});

describe('clearLeaderboard', () => {
    beforeEach(() => { localStorageMock.clear(); });

    it('entry exists before clear', () => {
        saveScore('Alice', 1000, 10, 1);
        expect(getLeaderboard().length).toBe(1);
    });

    it('clearLeaderboard removes all entries', () => {
        saveScore('Alice', 1000, 10, 1);
        clearLeaderboard();
        expect(getLeaderboard().length).toBe(0);
    });
});

describe('Private browsing / error resilience', () => {
    beforeEach(() => { localStorageMock.clear(); });

    it('saveScore returns false when localStorage throws', () => {
        const origSetItem = localStorageMock.setItem;
        localStorageMock.setItem = function() { throw new Error('QuotaExceededError'); };
        const result = saveScore('Fail', 100, 1, 1);
        expect(result).toBe(false);
        localStorageMock.setItem = origSetItem;
    });

    it('clearLeaderboard returns false when localStorage throws', () => {
        const origRemove = localStorageMock.removeItem;
        localStorageMock.removeItem = function() { throw new Error('SecurityError'); };
        const clearResult = clearLeaderboard();
        expect(clearResult).toBe(false);
        localStorageMock.removeItem = origRemove;
    });
});
