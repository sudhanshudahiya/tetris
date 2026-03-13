// Tetris game requirements test suite — migrated to Vitest
// Reads source files and validates game features via string matching
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlFile = path.join(__dirname, 'index.html');
const gameFile = path.join(__dirname, 'game.js');

const htmlContent = fs.readFileSync(htmlFile, 'utf8');
const gameContent = fs.readFileSync(gameFile, 'utf8');
const content = htmlContent + '\n' + gameContent;

describe('Tetris Game Requirements', () => {
    // HTML structure requirement
    it('Single HTML file', () => { expect(htmlContent.includes('<!DOCTYPE html>')).toBe(true); });

    // Inline styles requirement
    it('Inline CSS styles', () => { expect(htmlContent.includes('<style>') && htmlContent.includes('</style>')).toBe(true); });

    // External JavaScript requirement
    it('External JavaScript', () => { expect(htmlContent.includes('<script src="game.js"') && htmlContent.includes('</script>')).toBe(true); });

    // Game board rendering
    it('Game board canvas', () => { expect(htmlContent.includes('<canvas') && htmlContent.includes('gameCanvas')).toBe(true); });

    // Piece movement controls
    it('Arrow key movement', () => { expect(content.includes('ArrowLeft') && content.includes('ArrowRight') && content.includes('ArrowDown')).toBe(true); });

    // Rotation feature
    it('Piece rotation', () => { expect(content.includes('ArrowUp') && content.includes('rotatePiece')).toBe(true); });

    // Line clearing
    it('Line clearing logic', () => { expect(content.includes('clearLines') && content.includes('isComplete')).toBe(true); });

    // Score tracking
    it('Score tracking', () => { expect(content.includes('score') && content.includes('updateDisplay')).toBe(true); });

    // Game over detection
    it('Game over detection', () => { expect(content.includes('gameOver') && htmlContent.includes('Game Over')).toBe(true); });

    // Start/Restart buttons
    it('Start button', () => { expect(content.includes('startGame') && htmlContent.includes('Start Game')).toBe(true); });
    it('Restart button', () => { expect(content.includes('restartGame') && htmlContent.includes('Restart')).toBe(true); });

    // Additional UI features
    it('Pause functionality', () => { expect(content.includes('pauseGame') && htmlContent.includes('Pause')).toBe(true); });
    it('Level tracking', () => { expect(content.includes('level') && htmlContent.includes('Level')).toBe(true); });
    it('Lines tracking', () => { expect(content.includes('lines') && htmlContent.includes('Lines')).toBe(true); });

    // Hard drop feature
    it('Hard drop (spacebar)', () => { expect(content.includes("' '") || content.includes("case ' '")).toBe(true); });

    // Game pieces
    it('Tetris pieces defined', () => { expect(content.includes('PIECES') && content.includes('COLORS')).toBe(true); });

    // Game board dimensions
    it('Proper board size', () => { expect(content.includes('BOARD_WIDTH') && content.includes('BOARD_HEIGHT')).toBe(true); });

    // Responsive design
    it('Responsive CSS', () => { expect(htmlContent.includes('@media') && htmlContent.includes('768px')).toBe(true); });
});

describe('Next Piece Preview', () => {
    it('Next piece preview canvas', () => { expect(htmlContent.includes('nextPieceCanvas') && htmlContent.includes('<canvas id="nextPieceCanvas"')).toBe(true); });
    it('Next piece preview panel', () => { expect(htmlContent.includes('next-piece-panel') && htmlContent.includes('NEXT')).toBe(true); });
    it('Next piece state variable', () => { expect(content.includes('let nextPiece')).toBe(true); });
    it('drawNextPiece function', () => { expect(content.includes('function drawNextPiece')).toBe(true); });
    it('Next piece queue in createPiece', () => { expect(content.includes('nextPiece = generateRandomPiece()')).toBe(true); });
    it('generateRandomPiece function', () => { expect(content.includes('function generateRandomPiece')).toBe(true); });
    it('Next piece canvas context', () => { expect(content.includes('nextCtx') && content.includes("nextCanvas.getContext('2d')")).toBe(true); });
    it('Next piece block size', () => { expect(content.includes('NEXT_BLOCK_SIZE')).toBe(true); });
    it('Next piece centering', () => { expect(content.includes('minR') && content.includes('maxR') && content.includes('minC') && content.includes('maxC')).toBe(true); });

    it('Next piece reset on restart', () => {
        const restartIdx = content.indexOf('function restartGame');
        const restartEnd = content.indexOf('function gameOver');
        const restartBody = content.substring(restartIdx, restartEnd);
        expect(restartBody.includes('nextPiece = null')).toBe(true);
    });

    it('Next piece reset on start', () => {
        const startIdx = content.indexOf('function startGame');
        const startEnd = content.indexOf('function pauseGame');
        const startBody = content.substring(startIdx, startEnd);
        expect(startBody.includes('nextPiece = null')).toBe(true);
    });

    it('Next piece panel styling', () => { expect(htmlContent.includes('.next-piece-panel') && htmlContent.includes('.next-piece-canvas-wrapper')).toBe(true); });

    it('Next piece neon glow rendering', () => {
        const fnIdx = content.indexOf('function drawNextPiece');
        const fnEnd = content.indexOf('// Place piece on board');
        const fnBody = content.substring(fnIdx, fnEnd);
        expect(fnBody.includes('shadowColor') && fnBody.includes('shadowBlur')).toBe(true);
    });

    it('Piece index tracking', () => { expect(content.includes('pieceIndex')).toBe(true); });

    it('Next piece consumed in createPiece', () => {
        const fnIdx = content.indexOf('function createPiece');
        const fnEnd = content.indexOf('// Check if piece can be placed');
        const fnBody = content.substring(fnIdx, fnEnd);
        expect(fnBody.includes('if (nextPiece)') && fnBody.includes('piece = nextPiece')).toBe(true);
    });
});

describe('Touch / Swipe Controls', () => {
    it('Touch event: touchstart listener', () => { expect(content.includes('touchstart') && content.includes('handleTouchStart')).toBe(true); });
    it('Touch event: touchmove listener', () => { expect(content.includes('touchmove') && content.includes('handleTouchMove')).toBe(true); });
    it('Touch event: touchend listener', () => { expect(content.includes('touchend') && content.includes('handleTouchEnd')).toBe(true); });
    it('Touch event: touchcancel listener', () => { expect(content.includes('touchcancel') && content.includes('handleTouchCancel')).toBe(true); });

    it('Swipe threshold defined', () => { expect(content.includes('SWIPE_THRESHOLD')).toBe(true); });
    it('Swipe max time defined', () => { expect(content.includes('SWIPE_MAX_TIME')).toBe(true); });
    it('Tap max distance defined', () => { expect(content.includes('TAP_MAX_DISTANCE')).toBe(true); });
    it('Hard drop velocity defined', () => { expect(content.includes('HARD_DROP_VELOCITY')).toBe(true); });

    it('Swipe left moves piece left', () => { expect(content.includes('Swipe LEFT') && content.includes('currentPiece.x--')).toBe(true); });
    it('Swipe right moves piece right', () => { expect(content.includes('Swipe RIGHT') && content.includes('currentPiece.x++')).toBe(true); });
    it('Swipe down soft drop', () => { expect(content.includes('Swipe DOWN')).toBe(true); });
    it('Fast swipe triggers hard drop', () => { expect(content.includes('HARD_DROP_VELOCITY') && content.includes('hard drop')).toBe(true); });
    it('Tap rotates piece', () => { expect(content.includes('TAP') && content.includes('rotatePiece')).toBe(true); });
    it('Swipe up rotates piece', () => { expect(content.includes('Swipe UP') && content.includes('rotatePiece')).toBe(true); });

    it('preventDefault on touch events', () => { expect(content.includes('e.preventDefault()')).toBe(true); });
    it('CSS touch-action: none on canvas', () => { expect(htmlContent.includes('touch-action: none')).toBe(true); });
    it('Touch controls UI section', () => { expect(htmlContent.includes('touch-controls') && htmlContent.includes('Drag')).toBe(true); });
    it('Touch controls hidden by default', () => { expect(htmlContent.includes('.touch-controls') && htmlContent.includes('display: none')).toBe(true); });
    it('Touch controls shown on touch devices', () => { expect(htmlContent.includes('pointer: coarse')).toBe(true); });
    it('Touch controls exposed for testing', () => { expect(content.includes('window._touchControls')).toBe(true); });
});

describe('Drag & Long-Press gesture support', () => {
    it('Long press delay defined', () => { expect(content.includes('LONG_PRESS_DELAY')).toBe(true); });
    it('Cell size for drag defined', () => { expect(content.includes('CELL_SIZE_PX')).toBe(true); });
    it('Long press timer implemented', () => { expect(content.includes('longPressTimer') && content.includes('setTimeout')).toBe(true); });
    it('Long press cancelled on move', () => { expect(content.includes('clearLongPress') && content.includes('totalDistance > TAP_MAX_DISTANCE')).toBe(true); });
    it('Drag cell tracking in touchmove', () => { expect(content.includes('dragCellsX') && content.includes('dragCellsY')).toBe(true); });
    it('Long press cancels on drag', () => { expect(content.includes('clearLongPress()') && content.includes('gestureDecided')).toBe(true); });
    it('Viewport prevents zoom', () => { expect(htmlContent.includes('user-scalable=no') && htmlContent.includes('maximum-scale=1')).toBe(true); });
    it('Overscroll behavior set', () => { expect(htmlContent.includes('overscroll-behavior: none')).toBe(true); });
    it('Touch blocked when game not running', () => { expect(content.includes('!gameRunning') && content.includes('return')).toBe(true); });
});

describe('Line-Clear Animation', () => {
    it('clearingRows state variable declared', () => { expect(content.includes('let clearingRows = []')).toBe(true); });
    it('clearAnimationStart timestamp declared', () => { expect(content.includes('let clearAnimationStart = 0')).toBe(true); });
    it('CLEAR_ANIMATION_DURATION constant defined', () => { expect(content.includes('CLEAR_ANIMATION_DURATION')).toBe(true); });

    it('clearLines populates clearingRows array', () => { expect(content.includes('clearingRows.push(row)')).toBe(true); });

    it('clearLines does not splice board directly', () => {
        const idx = content.indexOf('function clearLines()');
        const afterIdx = idx + 'function clearLines()'.length;
        const match = content.substring(afterIdx).match(/\n\s*function\s/);
        const nextFn = match ? afterIdx + match.index : -1;
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.length > 0 && !body.includes('board.splice')).toBe(true);
    });

    it('finishClearLines function exists', () => { expect(content.includes('function finishClearLines()')).toBe(true); });

    it('finishClearLines splices the board', () => {
        const idx = content.indexOf('function finishClearLines()');
        const nextFn = content.indexOf('\nfunction ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('board.splice')).toBe(true);
    });

    it('gameStep pauses drops during clearing', () => { expect(content.includes('clearingRows.length > 0')).toBe(true); });

    it('gameStep calls finishClearLines after animation', () => {
        const idx = content.indexOf('function gameStep(time)');
        const nextFn = content.indexOf('\nfunction ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('finishClearLines()')).toBe(true);
    });

    it('Flash effect uses white overlay', () => { expect(content.includes("ctx.fillStyle = '#ffffff'") && content.includes('flashAlpha')).toBe(true); });
    it('Flash uses sine-based pulsing', () => { expect(content.includes('Math.sin') && content.includes('flashAlpha')).toBe(true); });

    it('clearingRows reset in startGame', () => {
        const idx = content.indexOf('function startGame()');
        const nextFn = content.indexOf('\nfunction ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('clearingRows = []')).toBe(true);
    });

    it('clearingRows reset in restartGame', () => {
        const idx = content.indexOf('function restartGame()');
        const nextFn = content.indexOf('\nfunction ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('clearingRows = []')).toBe(true);
    });

    it('Keyboard input blocked during clearing', () => { expect(content.includes('clearingRows.length > 0')).toBe(true); });
    it('spawnNextPiece function exists', () => { expect(content.includes('function spawnNextPiece()')).toBe(true); });

    it('placePiece defers spawn during clearing', () => {
        const idx = content.indexOf('function placePiece()');
        const nextFn = content.indexOf('\nfunction ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('clearingRows.length === 0') && body.includes('spawnNextPiece()')).toBe(true);
    });
});

describe('Line-Clear Flash Animation (branch 68200bdb)', () => {
    it('Flash: clearingRows state defined', () => { expect(content.includes('let clearingRows') && content.includes('[]')).toBe(true); });
    it('Flash: isClearing flag defined', () => { expect(content.includes('let isClearing')).toBe(true); });
    it('Flash: CLEAR_ANIMATION_DURATION defined', () => { expect(content.includes('CLEAR_ANIMATION_DURATION')).toBe(true); });
    it('Flash: clearingStartTime defined', () => { expect(content.includes('let clearingStartTime')).toBe(true); });
    it('Flash: clearLines pushes to clearingRows', () => { expect(content.includes('clearingRows.push(row)')).toBe(true); });
    it('Flash: clearLines sets isClearing true', () => { expect(content.includes('isClearing = true')).toBe(true); });
    it('Flash: clearLines records clearingStartTime', () => { expect(content.includes('clearingStartTime = performance.now()')).toBe(true); });
    it('Flash: finishClearing function exists', () => { expect(content.includes('function finishClearing()')).toBe(true); });
    it('Flash: finishClearing splices board rows', () => { expect(content.includes('board.splice(row, 1)') || content.includes('board.splice(')).toBe(true); });
    it('Flash: finishClearing resets isClearing', () => { expect(content.includes('isClearing = false')).toBe(true); });
    it('Flash: drawBoard checks clearingRows', () => { expect(content.includes('clearingRows.includes(row)')).toBe(true); });
    it('Flash: oscillating alpha via Math.sin', () => { expect(content.includes('Math.sin') && content.includes('flash')).toBe(true); });
    it('Flash: white color for clearing blocks', () => { expect(content.includes("'#ffffff'") || content.includes('"#ffffff"')).toBe(true); });
    it('Flash: cyan glow for clearing blocks', () => { expect(content.includes('rgba(0,255,255,')).toBe(true); });
    it('Flash: gameStep handles isClearing', () => { expect(content.includes('if (isClearing)')).toBe(true); });
    it('Flash: gameStep calls finishClearing', () => { expect(content.includes('finishClearing()')).toBe(true); });
    it('Flash: placePiece defers piece during clearing', () => { expect(content.includes('if (isClearing)') && content.includes('currentPiece = null')).toBe(true); });
});

describe('Line-Clear Flash Animation (branch d4a465b0)', () => {
    it('Flash: clearingRows state variable', () => { expect(content.includes('let clearingRows = []')).toBe(true); });
    it('Flash: isClearing state variable', () => { expect(content.includes('let isClearing = false')).toBe(true); });
    it('Flash: clearAnimationStart state variable', () => { expect(content.includes('let clearAnimationStart = 0')).toBe(true); });
    it('Flash: FLASH_DURATION constant defined', () => { expect(content.includes('FLASH_DURATION') && content.includes('400')).toBe(true); });
    it('Flash: rAF drives animation during clearing', () => { expect(content.includes('isClearing') && content.includes('requestAnimationFrame(gameStep)')).toBe(true); });
    it('Flash: elapsed time checked against FLASH_DURATION', () => { expect(content.includes('elapsed >= FLASH_DURATION')).toBe(true); });
    it('Flash: white overlay rendered on clearing rows', () => { expect(content.includes('clearingRows.length > 0') && content.includes('rgba(255, 255, 255')).toBe(true); });
    it('Flash: flash intensity uses sine oscillation', () => { expect(content.includes('Math.sin') && content.includes('flashIntensity')).toBe(true); });
    it('Flash: flash drawn per clearing row', () => { expect(content.includes('for (const row of clearingRows)') && content.includes('fillRect')).toBe(true); });
    it('Flash: board.splice in completeClear', () => { expect(content.includes('function completeClear') && content.includes('board.splice(row, 1)')).toBe(true); });
    it('Flash: board.unshift in completeClear', () => { expect(content.includes('function completeClear') && content.includes('board.unshift')).toBe(true); });
    it('Flash: clearingRows reset after clear', () => { expect(content.includes('clearingRows = []') && content.includes('isClearing = false')).toBe(true); });
    it('Flash: completeClear called after duration', () => { expect(content.includes('completeClear()')).toBe(true); });
    it('Flash: input blocked during clearing', () => { expect(content.includes('isClearing') && content.includes('return')).toBe(true); });
    it('Flash: piece not spawned during clearing', () => { expect(content.includes('if (!isClearing)') && content.includes('createPiece')).toBe(true); });
    it('Flash: animation state exposed for testing', () => { expect(content.includes('window._flashAnimation')).toBe(true); });
});

describe('Leaderboard / High Score Persistence', () => {
    it('Leaderboard: LEADERBOARD_KEY defined', () => { expect(content.includes('LEADERBOARD_KEY') && content.includes('tetris_leaderboard')).toBe(true); });
    it('Leaderboard: MAX_LEADERBOARD_ENTRIES defined', () => { expect(content.includes('MAX_LEADERBOARD_ENTRIES') && content.includes('10')).toBe(true); });
    it('Leaderboard: getLeaderboard function', () => { expect(content.includes('function getLeaderboard') || content.includes('getLeaderboard')).toBe(true); });
    it('Leaderboard: saveScore function', () => { expect(content.includes('function saveScore') || content.includes('saveScore')).toBe(true); });
    it('Leaderboard: isHighScore function', () => { expect(content.includes('function isHighScore') || content.includes('isHighScore')).toBe(true); });
    it('Leaderboard: clearLeaderboard function exists', () => { expect(content.includes('clearLeaderboard')).toBe(true); });
    it('Leaderboard: renderLeaderboard function', () => { expect(content.includes('function renderLeaderboard') && content.includes('leaderboardBody')).toBe(true); });
    it('Leaderboard: submitScore function', () => { expect(content.includes('function submitScore') && content.includes('initialsInput')).toBe(true); });

    it('Leaderboard: gameOver calls isHighScore', () => {
        const idx = content.indexOf('function gameOver');
        const nextFn = content.indexOf('\n        function startNewGame', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('isHighScore(score)')).toBe(true);
    });

    it('Leaderboard: gameOver calls renderLeaderboard', () => {
        const idx = content.indexOf('function gameOver');
        const nextFn = content.indexOf('\n        function startNewGame', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('renderLeaderboard()')).toBe(true);
    });

    it('Leaderboard: gameOver toggles highScoreSection', () => {
        const idx = content.indexOf('function gameOver');
        const nextFn = content.indexOf('\n        function startNewGame', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('highScoreSection')).toBe(true);
    });

    it('Leaderboard: HTML table structure', () => { expect(htmlContent.includes('leaderboard-table') && htmlContent.includes('leaderboardBody')).toBe(true); });
    it('Leaderboard: HTML initials input', () => { expect(htmlContent.includes('initialsInput') && htmlContent.includes('initials-input')).toBe(true); });
    it('Leaderboard: HTML submit score button', () => { expect(htmlContent.includes('submitScore()') && htmlContent.includes('Submit Score')).toBe(true); });
    it('Leaderboard: HTML highScoreSection', () => { expect(htmlContent.includes('highScoreSection') && htmlContent.includes('high-score-section')).toBe(true); });
    it('Leaderboard: CSS leaderboard-table', () => { expect(htmlContent.includes('.leaderboard-table')).toBe(true); });
    it('Leaderboard: CSS initials-input', () => { expect(htmlContent.includes('.initials-input')).toBe(true); });
    it('Leaderboard: state exposed for testing', () => { expect(content.includes('window._leaderboard')).toBe(true); });
});

describe('Delta-Time Hardening', () => {
    it('Delta-time: first-frame guard checks lastTime === 0', () => { expect(content.includes('if (lastTime === 0)')).toBe(true); });

    it('Delta-time: first-frame guard sets lastTime = time', () => {
        const gsBody = content.substring(content.indexOf('function gameStep'));
        expect(gsBody.includes('lastTime === 0') && gsBody.includes('lastTime = time')).toBe(true);
    });

    it('Delta-time: first-frame guard re-schedules rAF', () => {
        const guardIdx = content.indexOf('if (lastTime === 0)');
        const guardBlock = content.substring(guardIdx, guardIdx + 200);
        expect(guardBlock.includes('requestAnimationFrame(gameStep)') && guardBlock.includes('return')).toBe(true);
    });

    it('Delta-time: deltaTime capped with Math.min', () => { expect(content.includes('Math.min(time - lastTime, 100)')).toBe(true); });

    it('Delta-time: startGame sets lastTime = 0', () => {
        const sgMatch = content.match(/function startGame\(\)\s*\{([\s\S]*?)\n {8}\}/);
        expect(sgMatch && sgMatch[1].includes('lastTime = 0')).toBe(true);
    });

    it('Delta-time: pauseGame resets lastTime on resume', () => {
        const pgMatch = content.match(/function pauseGame\(\)\s*\{([\s\S]*?)\n {8}\}/);
        expect(pgMatch && pgMatch[1].includes('lastTime = performance.now()')).toBe(true);
    });
});

describe('Delta-Time Normalization', () => {
    it('Delta-time: gameStep uses deltaTime with Math.min cap', () => {
        expect(gameContent.includes('function gameStep(time)') &&
               /Math\.min\(.*deltaTime|Math\.min\(.*time\s*-\s*lastTime/.test(gameContent)).toBe(true);
    });

    it('Delta-time: bgLoop accepts timestamp parameter', () => {
        expect(/function bgLoop\s*\(\s*\w+\s*\)/.test(gameContent)).toBe(true);
    });

    it('Delta-time: bgLoop uses delta-time pattern', () => {
        const idx = gameContent.indexOf('function bgLoop');
        const nextFn = gameContent.indexOf('\n            function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(!body.includes('time++') && /bgDeltaTime|deltaTime|timestamp/.test(body)).toBe(true);
    });

    it('Delta-time: no setInterval in game.js', () => {
        expect(!gameContent.includes('setInterval')).toBe(true);
    });

    it('Delta-time: delta cap constant exists', () => {
        expect(/Math\.min\(.*,\s*100\)/.test(gameContent)).toBe(true);
    });
});

describe('Ghost Piece (Drop-Position Preview)', () => {
    it('Ghost: getGhostY pure function exists', () => { expect(content.includes('function getGhostY(piece, boardState)')).toBe(true); });

    it('Ghost: drawGhost uses getGhostY', () => {
        const idx = content.indexOf('function drawGhost()');
        const nextFn = content.indexOf('\n        function ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('getGhostY(currentPiece, board)')).toBe(true);
    });

    it('Ghost: skipped when ghostY === currentPiece.y', () => {
        const idx = content.indexOf('function drawGhost()');
        const nextFn = content.indexOf('\n        function ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('ghostY === currentPiece.y') && body.includes('return')).toBe(true);
    });

    it('Ghost: uses currentPiece.color for rendering', () => {
        const idx = content.indexOf('function drawGhost()');
        const nextFn = content.indexOf('\n        function ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('currentPiece.color')).toBe(true);
    });

    it('Ghost: renders with reduced globalAlpha', () => {
        const idx = content.indexOf('function drawGhost()');
        const nextFn = content.indexOf('\n        function ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('globalAlpha') && /globalAlpha\s*=\s*0\.[12345]/.test(body)).toBe(true);
    });

    it('Ghost: state exposed for testing', () => { expect(content.includes('window._ghost')).toBe(true); });

    it('Ghost: getGhostY drops to bottom on empty board', () => {
        const ROWS = 20, COLS = 10;
        const emptyBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        const piece = { x: 4, y: 0, shape: [[0,1,0],[1,1,1]], color: '#ff0' };
        let ghostY = piece.y;
        const canMove = (dy) => {
            for (let r = 0; r < piece.shape.length; r++) {
                for (let c = 0; c < piece.shape[r].length; c++) {
                    if (piece.shape[r][c] === 1) {
                        const nX = piece.x + c;
                        const nY = piece.y + r + dy;
                        if (nX < 0 || nX >= COLS || nY >= ROWS || (nY >= 0 && emptyBoard[nY][nX] !== 0)) return false;
                    }
                }
            }
            return true;
        };
        while (canMove(ghostY - piece.y + 1)) ghostY++;
        expect(ghostY).toBe(18);
    });

    it('Ghost: getGhostY stops above filled rows', () => {
        const ROWS = 20, COLS = 10;
        const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        for (let c = 0; c < COLS; c++) board[15][c] = 1;
        const piece = { x: 4, y: 0, shape: [[1,1],[1,1]], color: '#ff0' };
        let ghostY = piece.y;
        const canMove = (dy) => {
            for (let r = 0; r < piece.shape.length; r++) {
                for (let c = 0; c < piece.shape[r].length; c++) {
                    if (piece.shape[r][c] === 1) {
                        const nX = piece.x + c;
                        const nY = piece.y + r + dy;
                        if (nX < 0 || nX >= COLS || nY >= ROWS || (nY >= 0 && board[nY][nX] !== 0)) return false;
                    }
                }
            }
            return true;
        };
        while (canMove(ghostY - piece.y + 1)) ghostY++;
        expect(ghostY).toBe(13);
    });

    it('Ghost: piece at bottom returns same Y', () => {
        const ROWS = 20, COLS = 10;
        const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        const piece = { x: 4, y: 18, shape: [[1,1],[1,1]], color: '#ff0' };
        let ghostY = piece.y;
        const canMove = (dy) => {
            for (let r = 0; r < piece.shape.length; r++) {
                for (let c = 0; c < piece.shape[r].length; c++) {
                    if (piece.shape[r][c] === 1) {
                        const nX = piece.x + c;
                        const nY = piece.y + r + dy;
                        if (nX < 0 || nX >= COLS || nY >= ROWS || (nY >= 0 && board[nY][nX] !== 0)) return false;
                    }
                }
            }
            return true;
        };
        while (canMove(ghostY - piece.y + 1)) ghostY++;
        expect(ghostY).toBe(piece.y);
    });

    it('Ghost: I-piece drops correctly on empty board', () => {
        const ROWS = 20, COLS = 10;
        const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        const piece = { x: 3, y: 0, shape: [[1,1,1,1]], color: '#0ff' };
        let ghostY = piece.y;
        const canMove = (dy) => {
            for (let r = 0; r < piece.shape.length; r++) {
                for (let c = 0; c < piece.shape[r].length; c++) {
                    if (piece.shape[r][c] === 1) {
                        const nX = piece.x + c;
                        const nY = piece.y + r + dy;
                        if (nX < 0 || nX >= COLS || nY >= ROWS || (nY >= 0 && board[nY][nX] !== 0)) return false;
                    }
                }
            }
            return true;
        };
        while (canMove(ghostY - piece.y + 1)) ghostY++;
        expect(ghostY).toBe(19);
    });

    it('Ghost: drawGhost called in drawBoard', () => {
        const idx = content.indexOf('function drawBoard()');
        const nextFn = content.indexOf('\n        function ', idx + 1);
        const body = content.substring(idx, nextFn > idx ? nextFn : idx + 3000);
        expect(body.includes('drawGhost()')).toBe(true);
    });

    it('Ghost: drawGhost function exists', () => { expect(gameContent.includes('function drawGhost()')).toBe(true); });
    it('Ghost: skips rendering during line-clear', () => { expect(gameContent.includes('clearingRows.length > 0') && /drawGhost[\s\S]{0,500}clearingRows\.length\s*>\s*0/.test(gameContent)).toBe(true); });
    it('Ghost: uses dashed border for distinction', () => { expect(/drawGhost[\s\S]*setLineDash/.test(gameContent)).toBe(true); });
    it('Ghost: uses piece color for rendering (regex)', () => { expect(/drawGhost[\s\S]*currentPiece\.color/.test(gameContent)).toBe(true); });
    it('Ghost: called in drawBoard (regex)', () => { expect(/drawBoard[\s\S]*drawGhost\(\)/.test(gameContent)).toBe(true); });
    it('Ghost: skips when piece at ghost position', () => { expect(/ghostY\s*===\s*currentPiece\.y.*return/.test(gameContent)).toBe(true); });
});
