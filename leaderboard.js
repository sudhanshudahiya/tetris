// leaderboard.js - Pure leaderboard data functions (testable module)
const LEADERBOARD_KEY = 'tetris_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;

function getLeaderboard() {
    try {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        if (!data) return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveScore(name, scoreVal, linesVal, levelVal) {
    const leaderboard = getLeaderboard();
    leaderboard.push({
        name: name,
        score: scoreVal,
        lines: linesVal,
        level: levelVal,
        date: new Date().toISOString()
    });
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > MAX_LEADERBOARD_ENTRIES) {
        leaderboard.length = MAX_LEADERBOARD_ENTRIES;
    }
    try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        return leaderboard;
    } catch (e) {
        return false;
    }
}

function isHighScore(scoreVal) {
    if (scoreVal <= 0) return false;
    const leaderboard = getLeaderboard();
    if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) return true;
    return scoreVal > leaderboard[leaderboard.length - 1].score;
}

function clearLeaderboard() {
    try {
        localStorage.removeItem(LEADERBOARD_KEY);
        return true;
    } catch (e) {
        return false;
    }
}

// Browser: expose on window for game.js
if (typeof window !== 'undefined') {
    window._leaderboardModule = { getLeaderboard, saveScore, isHighScore, clearLeaderboard, LEADERBOARD_KEY, MAX_LEADERBOARD_ENTRIES };
}

// CommonJS export for Node.js / Vitest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getLeaderboard, saveScore, isHighScore, clearLeaderboard, LEADERBOARD_KEY, MAX_LEADERBOARD_ENTRIES };
}
