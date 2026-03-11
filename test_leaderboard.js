// Leaderboard data layer tests
// Uses a localStorage mock for Node.js testing

// --- localStorage mock ---
const store = {};
const localStorageMock = {
    getItem: function(key) { return store[key] || null; },
    setItem: function(key, value) { store[key] = String(value); },
    removeItem: function(key) { delete store[key]; },
    clear: function() { Object.keys(store).forEach(function(k) { delete store[k]; }); }
};
global.localStorage = localStorageMock;

const { getLeaderboard, saveScore, isHighScore, clearLeaderboard, LEADERBOARD_KEY, MAX_LEADERBOARD_ENTRIES } = require('./game.js');

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) {
        console.log('  PASS: ' + name);
        passed++;
    } else {
        console.log('  FAIL: ' + name);
        failed++;
    }
}

function setup() {
    localStorageMock.clear();
}

console.log('Testing Leaderboard Data Layer...\n');

// --- getLeaderboard ---
setup();
assert(Array.isArray(getLeaderboard()), 'getLeaderboard returns array when empty');
assert(getLeaderboard().length === 0, 'getLeaderboard returns empty array when no data');

setup();
localStorageMock.setItem(LEADERBOARD_KEY, 'not-json');
assert(getLeaderboard().length === 0, 'getLeaderboard returns empty array for invalid JSON');

setup();
localStorageMock.setItem(LEADERBOARD_KEY, JSON.stringify('not-array'));
assert(getLeaderboard().length === 0, 'getLeaderboard returns empty array for non-array JSON');

// --- saveScore + getLeaderboard round-trip ---
setup();
saveScore('Alice', 1000, 10, 1);
const lb1 = getLeaderboard();
assert(lb1.length === 1, 'saveScore adds one entry');
assert(lb1[0].name === 'Alice', 'entry has correct name');
assert(lb1[0].score === 1000, 'entry has correct score');
assert(lb1[0].lines === 10, 'entry has correct lines');
assert(lb1[0].level === 1, 'entry has correct level');
assert(typeof lb1[0].date === 'string', 'entry has date string');

// --- Sorting ---
setup();
saveScore('Low', 100, 5, 1);
saveScore('High', 5000, 50, 5);
saveScore('Mid', 2000, 20, 3);
const lb2 = getLeaderboard();
assert(lb2[0].score === 5000, 'leaderboard sorted descending - first is highest');
assert(lb2[1].score === 2000, 'leaderboard sorted descending - second is mid');
assert(lb2[2].score === 100, 'leaderboard sorted descending - third is lowest');

// --- Trim to top 10 ---
setup();
for (let i = 0; i < 12; i++) {
    saveScore('Player' + i, (i + 1) * 100, i, 1);
}
const lb3 = getLeaderboard();
assert(lb3.length === MAX_LEADERBOARD_ENTRIES, 'leaderboard trimmed to max 10 entries');
assert(lb3[0].score === 1200, 'highest score is first after trim');
assert(lb3[9].score === 300, 'lowest kept score is 10th highest');

// --- isHighScore ---
setup();
assert(isHighScore(1) === true, 'isHighScore returns true when leaderboard not full');

setup();
for (let i = 0; i < 10; i++) {
    saveScore('P' + i, (i + 1) * 100, i, 1);
}
assert(isHighScore(1001) === true, 'isHighScore returns true for score beating lowest');
assert(isHighScore(50) === false, 'isHighScore returns false for score below lowest');
assert(isHighScore(100) === false, 'isHighScore returns false for score equal to lowest');

// --- clearLeaderboard ---
setup();
saveScore('Alice', 1000, 10, 1);
assert(getLeaderboard().length === 1, 'entry exists before clear');
clearLeaderboard();
assert(getLeaderboard().length === 0, 'clearLeaderboard removes all entries');

// --- Private browsing / error resilience ---
setup();
const origSetItem = localStorageMock.setItem;
localStorageMock.setItem = function() { throw new Error('QuotaExceededError'); };
const result = saveScore('Fail', 100, 1, 1);
assert(result === false, 'saveScore returns false when localStorage throws');
localStorageMock.setItem = origSetItem;

const origRemove = localStorageMock.removeItem;
localStorageMock.removeItem = function() { throw new Error('SecurityError'); };
const clearResult = clearLeaderboard();
assert(clearResult === false, 'clearLeaderboard returns false when localStorage throws');
localStorageMock.removeItem = origRemove;

// --- Summary ---
console.log('\nLeaderboard Test Results: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed) + ' total');
if (failed > 0) {
    process.exit(1);
}
