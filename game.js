// Tetris Game - Leaderboard Data Layer
// localStorage-backed high score persistence

const LEADERBOARD_KEY = 'tetris_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;

/**
 * Read leaderboard from localStorage.
 * Returns parsed array of entries (max 10), each {name, score, lines, level, date}.
 * Returns empty array on error or missing data.
 */
function getLeaderboard() {
    try {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        if (!data) {
            return [];
        }
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.slice(0, MAX_LEADERBOARD_ENTRIES);
    } catch (e) {
        return [];
    }
}

/**
 * Save a score to the leaderboard.
 * Inserts into sorted array (descending by score), trims to top 10, writes back.
 */
function saveScore(name, score, lines, level) {
    try {
        const leaderboard = getLeaderboard();
        const entry = {
            name: name,
            score: score,
            lines: lines,
            level: level,
            date: new Date().toISOString()
        };
        leaderboard.push(entry);
        leaderboard.sort(function(a, b) { return b.score - a.score; });
        const trimmed = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Check if a score qualifies for the top 10 leaderboard.
 */
function isHighScore(score) {
    try {
        const leaderboard = getLeaderboard();
        if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) {
            return true;
        }
        const lowestScore = leaderboard[leaderboard.length - 1].score;
        return score > lowestScore;
    } catch (e) {
        return true;
    }
}

/**
 * Clear the entire leaderboard.
 */
function clearLeaderboard() {
    try {
        localStorage.removeItem(LEADERBOARD_KEY);
        return true;
    } catch (e) {
        return false;
    }
}

// Export for Node.js testing, no-op in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getLeaderboard, saveScore, isHighScore, clearLeaderboard, LEADERBOARD_KEY, MAX_LEADERBOARD_ENTRIES };
}
