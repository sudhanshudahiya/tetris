// Simple Node.js test to validate Tetris game requirements
// ESLint verified
const fs = require('fs');
const path = require('path');

function testTetrisRequirements() {
    const htmlFile = path.join(__dirname, 'index.html');
    const gameFile = path.join(__dirname, 'game.js');

    if (!fs.existsSync(htmlFile)) {
        throw new Error('index.html file not found');
    }
    if (!fs.existsSync(gameFile)) {
        throw new Error('game.js file not found');
    }

    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    const gameContent = fs.readFileSync(gameFile, 'utf8');
    const content = htmlContent + '\n' + gameContent;

    const tests = [
        // HTML structure requirement
        { name: 'Single HTML file', test: () => htmlContent.includes('<!DOCTYPE html>') },

        // Inline styles requirement
        { name: 'Inline CSS styles', test: () => htmlContent.includes('<style>') && htmlContent.includes('</style>') },

        // External JavaScript requirement (game logic extracted to game.js)
        { name: 'External JavaScript', test: () => htmlContent.includes('<script src="game.js"') && htmlContent.includes('</script>') },

        // Game board rendering
        { name: 'Game board canvas', test: () => htmlContent.includes('<canvas') && htmlContent.includes('gameCanvas') },

        // Piece movement controls
        { name: 'Arrow key movement', test: () => content.includes('ArrowLeft') && content.includes('ArrowRight') && content.includes('ArrowDown') },

        // Rotation feature
        { name: 'Piece rotation', test: () => content.includes('ArrowUp') && content.includes('rotatePiece') },

        // Line clearing
        { name: 'Line clearing logic', test: () => content.includes('clearLines') && content.includes('isComplete') },

        // Score tracking
        { name: 'Score tracking', test: () => content.includes('score') && content.includes('updateDisplay') },

        // Game over detection
        { name: 'Game over detection', test: () => content.includes('gameOver') && htmlContent.includes('Game Over') },

        // Start/Restart buttons
        { name: 'Start button', test: () => content.includes('startGame') && htmlContent.includes('Start Game') },
        { name: 'Restart button', test: () => content.includes('restartGame') && htmlContent.includes('Restart') },

        // Additional UI features
        { name: 'Pause functionality', test: () => content.includes('pauseGame') && htmlContent.includes('Pause') },
        { name: 'Level tracking', test: () => content.includes('level') && htmlContent.includes('Level') },
        { name: 'Lines tracking', test: () => content.includes('lines') && htmlContent.includes('Lines') },

        // Hard drop feature
        { name: 'Hard drop (spacebar)', test: () => content.includes("' '") || content.includes("case ' '") },

        // Game pieces
        { name: 'Tetris pieces defined', test: () => content.includes('PIECES') && content.includes('COLORS') },

        // Game board dimensions
        { name: 'Proper board size', test: () => content.includes('BOARD_WIDTH') && content.includes('BOARD_HEIGHT') },

        // Responsive design
        { name: 'Responsive CSS', test: () => htmlContent.includes('@media') && htmlContent.includes('768px') },

        // =====================================================
        // NEXT PIECE PREVIEW TESTS
        // =====================================================

        // Next piece preview canvas exists
        { name: 'Next piece preview canvas', test: () => htmlContent.includes('nextPieceCanvas') && htmlContent.includes('<canvas id="nextPieceCanvas"') },

        // Next piece preview panel UI
        { name: 'Next piece preview panel', test: () => htmlContent.includes('next-piece-panel') && htmlContent.includes('NEXT') },

        // Next piece state variable
        { name: 'Next piece state variable', test: () => content.includes('let nextPiece') },

        // Next piece drawing function
        { name: 'drawNextPiece function', test: () => content.includes('function drawNextPiece') },

        // Next piece is generated on createPiece
        { name: 'Next piece queue in createPiece', test: () => content.includes('nextPiece = generateRandomPiece()') },

        // generateRandomPiece helper function
        { name: 'generateRandomPiece function', test: () => content.includes('function generateRandomPiece') },

        // Next piece canvas context
        { name: 'Next piece canvas context', test: () => content.includes('nextCtx') && content.includes("nextCanvas.getContext('2d')") },

        // Next piece block size constant
        { name: 'Next piece block size', test: () => content.includes('NEXT_BLOCK_SIZE') },

        // Next piece centering logic (calculates bounding box)
        { name: 'Next piece centering', test: () => content.includes('minR') && content.includes('maxR') && content.includes('minC') && content.includes('maxC') },

        // Next piece reset on restart
        { name: 'Next piece reset on restart', test: () => {
            // Check that restartGame resets nextPiece
            const restartIdx = content.indexOf('function restartGame');
            const restartEnd = content.indexOf('function gameOver');
            const restartBody = content.substring(restartIdx, restartEnd);
            return restartBody.includes('nextPiece = null');
        }},

        // Next piece reset on startGame
        { name: 'Next piece reset on start', test: () => {
            const startIdx = content.indexOf('function startGame');
            const startEnd = content.indexOf('function pauseGame');
            const startBody = content.substring(startIdx, startEnd);
            return startBody.includes('nextPiece = null');
        }},

        // Next piece CSS styling
        { name: 'Next piece panel styling', test: () => htmlContent.includes('.next-piece-panel') && htmlContent.includes('.next-piece-canvas-wrapper') },

        // Next piece neon rendering (glow effect on preview)
        { name: 'Next piece neon glow rendering', test: () => {
            const fnIdx = content.indexOf('function drawNextPiece');
            const fnEnd = content.indexOf('// Place piece on board');
            const fnBody = content.substring(fnIdx, fnEnd);
            return fnBody.includes('shadowColor') && fnBody.includes('shadowBlur');
        }},

        // pieceIndex is tracked on pieces
        { name: 'Piece index tracking', test: () => content.includes('pieceIndex') },

        // Next piece is used when available in createPiece
        { name: 'Next piece consumed in createPiece', test: () => {
            const fnIdx = content.indexOf('function createPiece');
            const fnEnd = content.indexOf('// Check if piece can be placed');
            const fnBody = content.substring(fnIdx, fnEnd);
            return fnBody.includes('if (nextPiece)') && fnBody.includes('piece = nextPiece');
        }},

        // ── Touch / Swipe Controls ──────────────────────────────
        // Touch event listeners registered on canvas
        { name: 'Touch event: touchstart listener', test: () => content.includes('touchstart') && content.includes('handleTouchStart') },
        { name: 'Touch event: touchmove listener', test: () => content.includes('touchmove') && content.includes('handleTouchMove') },
        { name: 'Touch event: touchend listener', test: () => content.includes('touchend') && content.includes('handleTouchEnd') },
        { name: 'Touch event: touchcancel listener', test: () => content.includes('touchcancel') && content.includes('handleTouchCancel') },

        // Swipe detection configuration
        { name: 'Swipe threshold defined', test: () => content.includes('SWIPE_THRESHOLD') },
        { name: 'Swipe max time defined', test: () => content.includes('SWIPE_MAX_TIME') },
        { name: 'Tap max distance defined', test: () => content.includes('TAP_MAX_DISTANCE') },
        { name: 'Hard drop velocity defined', test: () => content.includes('HARD_DROP_VELOCITY') },

        // Gesture → action mapping
        { name: 'Swipe left moves piece left', test: () => content.includes('Swipe LEFT') && content.includes('currentPiece.x--') },
        { name: 'Swipe right moves piece right', test: () => content.includes('Swipe RIGHT') && content.includes('currentPiece.x++') },
        { name: 'Swipe down soft drop', test: () => content.includes('Swipe DOWN') },
        { name: 'Fast swipe triggers hard drop', test: () => content.includes('HARD_DROP_VELOCITY') && content.includes('hard drop') },
        { name: 'Tap rotates piece', test: () => content.includes('TAP') && content.includes('rotatePiece') },
        { name: 'Swipe up rotates piece', test: () => content.includes('Swipe UP') && content.includes('rotatePiece') },

        // preventDefault to block scrolling
        { name: 'preventDefault on touch events', test: () => content.includes('e.preventDefault()') },

        // CSS touch-action: none on canvas
        { name: 'CSS touch-action: none on canvas', test: () => htmlContent.includes('touch-action: none') },

        // Touch controls UI hint for mobile
        { name: 'Touch controls UI section', test: () => htmlContent.includes('touch-controls') && htmlContent.includes('Swipe') },

        // Touch controls visibility: hidden on desktop, shown on touch devices
        { name: 'Touch controls hidden by default', test: () => htmlContent.includes('.touch-controls') && htmlContent.includes('display: none') },
        { name: 'Touch controls shown on touch devices', test: () => htmlContent.includes('pointer: coarse') },

        // Exposed for testing
        { name: 'Touch controls exposed for testing', test: () => content.includes('window._touchControls') },

        // ── Line-Clear Animation (clearingRows state) ─────────────
        // clearingRows array declared in game state
        { name: 'clearingRows state variable declared', test: () => content.includes('let clearingRows = []') },

        // clearAnimationStart timestamp for tracking animation progress
        { name: 'clearAnimationStart timestamp declared', test: () => content.includes('let clearAnimationStart = 0') },

        // CLEAR_ANIMATION_DURATION constant defined
        { name: 'CLEAR_ANIMATION_DURATION constant defined', test: () => content.includes('CLEAR_ANIMATION_DURATION') },

        // clearLines() populates clearingRows instead of splicing immediately
        { name: 'clearLines populates clearingRows array', test: () => content.includes('clearingRows.push(row)') },

        // clearLines() no longer calls board.splice directly
        { name: 'clearLines does not splice board directly', test: () => {
            const idx = content.indexOf('function clearLines()');
            // Find next function declaration (may be indented)
            const afterIdx = idx + 'function clearLines()'.length;
            const match = content.substring(afterIdx).match(/\n\s*function\s/);
            const nextFn = match ? afterIdx + match.index : -1;
            const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
            return body.length > 0 && !body.includes('board.splice');
        }},

        // finishClearLines() function exists for deferred row removal
        { name: 'finishClearLines function exists', test: () => content.includes('function finishClearLines()') },

        // finishClearLines() performs the actual board.splice
        { name: 'finishClearLines splices the board', test: () => {
            const idx = content.indexOf('function finishClearLines()');
            const nextFn = content.indexOf('\nfunction ', idx + 1);
            const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
            return body.includes('board.splice');
        }},

        // gameStep() checks clearingRows to pause piece drops
        { name: 'gameStep pauses drops during clearing', test: () => content.includes('clearingRows.length > 0') },

        // gameStep() calls finishClearLines after animation duration
        { name: 'gameStep calls finishClearLines after animation', test: () => {
            const idx = content.indexOf('function gameStep(time)');
            const nextFn = content.indexOf('\nfunction ', idx + 1);
            const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
            return body.includes('finishClearLines()');
        }},

        // Flash effect rendering: white overlay on clearing rows
        { name: 'Flash effect uses white overlay', test: () => content.includes("ctx.fillStyle = '#ffffff'") && content.includes('flashAlpha') },

        // Flash uses sine-based pulsing animation
        { name: 'Flash uses sine-based pulsing', test: () => content.includes('Math.sin') && content.includes('flashAlpha') },

        // clearingRows is reset in startGame
        { name: 'clearingRows reset in startGame', test: () => {
            const idx = content.indexOf('function startGame()');
            const nextFn = content.indexOf('\nfunction ', idx + 1);
            const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
            return body.includes('clearingRows = []');
        }},

        // clearingRows is reset in restartGame
        { name: 'clearingRows reset in restartGame', test: () => {
            const idx = content.indexOf('function restartGame()');
            const nextFn = content.indexOf('\nfunction ', idx + 1);
            const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
            return body.includes('clearingRows = []');
        }},

        // Input blocked during clearing animation
        { name: 'Keyboard input blocked during clearing', test: () => content.includes('clearingRows.length > 0') },

        // spawnNextPiece extracted as separate function
        { name: 'spawnNextPiece function exists', test: () => content.includes('function spawnNextPiece()') },

        // placePiece defers spawning when clearing
        { name: 'placePiece defers spawn during clearing', test: () => {
            const idx = content.indexOf('function placePiece()');
            const nextFn = content.indexOf('\nfunction ', idx + 1);
            const body = content.substring(idx, nextFn > idx ? nextFn : idx + 2000);
            return body.includes('clearingRows.length === 0') && body.includes('spawnNextPiece()');
        }},

        // ── Line-Clear Flash Animation (branch 68200bdb) ─────────────────────────
        // clearingRows state variable
        { name: 'Flash: clearingRows state defined', test: () => content.includes('let clearingRows') && content.includes('[]') },
        // isClearing flag
        { name: 'Flash: isClearing flag defined', test: () => content.includes('let isClearing') },
        // Animation duration constant
        { name: 'Flash: CLEAR_ANIMATION_DURATION defined', test: () => content.includes('CLEAR_ANIMATION_DURATION') },
        // clearingStartTime tracker
        { name: 'Flash: clearingStartTime defined', test: () => content.includes('let clearingStartTime') },
        // clearLines detects complete rows into clearingRows
        { name: 'Flash: clearLines pushes to clearingRows', test: () => content.includes('clearingRows.push(row)') },
        // clearLines starts animation (sets isClearing)
        { name: 'Flash: clearLines sets isClearing true', test: () => content.includes('isClearing = true') },
        // clearLines records start time
        { name: 'Flash: clearLines records clearingStartTime', test: () => content.includes('clearingStartTime = performance.now()') },
        // finishClearing function exists
        { name: 'Flash: finishClearing function exists', test: () => content.includes('function finishClearing()') },
        // finishClearing removes rows via splice
        { name: 'Flash: finishClearing splices board rows', test: () => content.includes('board.splice(row, 1)') || content.includes('board.splice(') },
        // finishClearing resets isClearing
        { name: 'Flash: finishClearing resets isClearing', test: () => content.includes('isClearing = false') },
        // drawBoard checks clearingRows for flash rendering
        { name: 'Flash: drawBoard checks clearingRows', test: () => content.includes('clearingRows.includes(row)') },
        // Flash uses oscillating alpha (Math.sin)
        { name: 'Flash: oscillating alpha via Math.sin', test: () => content.includes('Math.sin') && content.includes('flash') },
        // Flash uses white color for blocks
        { name: 'Flash: white color for clearing blocks', test: () => content.includes("'#ffffff'") || content.includes('"#ffffff"') },
        // Flash uses cyan glow
        { name: 'Flash: cyan glow for clearing blocks', test: () => content.includes("rgba(0,255,255,") },
        // gameStep handles isClearing state
        { name: 'Flash: gameStep handles isClearing', test: () => content.includes('if (isClearing)') },
        // gameStep calls finishClearing when animation done
        { name: 'Flash: gameStep calls finishClearing', test: () => content.includes('finishClearing()') },
        // placePiece defers new piece during clearing
        { name: 'Flash: placePiece defers piece during clearing', test: () => content.includes('if (isClearing)') && content.includes('currentPiece = null') },

        // ── Line-Clear Flash Animation (branch d4a465b0) ────────────────────────────
        // State variables for clearing animation
        { name: 'Flash: clearingRows state variable', test: () => content.includes('let clearingRows = []') },
        { name: 'Flash: isClearing state variable', test: () => content.includes('let isClearing = false') },
        { name: 'Flash: clearAnimationStart state variable', test: () => content.includes('let clearAnimationStart = 0') },
        { name: 'Flash: FLASH_DURATION constant defined', test: () => content.includes('FLASH_DURATION') && content.includes('400') },

        // requestAnimationFrame manages flash timing in gameStep
        { name: 'Flash: rAF drives animation during clearing', test: () => content.includes('isClearing') && content.includes('requestAnimationFrame(gameStep)') },
        { name: 'Flash: elapsed time checked against FLASH_DURATION', test: () => content.includes('elapsed >= FLASH_DURATION') },

        // Flash rendering in drawBoard
        { name: 'Flash: white overlay rendered on clearing rows', test: () => content.includes('clearingRows.length > 0') && content.includes('rgba(255, 255, 255') },
        { name: 'Flash: flash intensity uses sine oscillation', test: () => content.includes('Math.sin') && content.includes('flashIntensity') },
        { name: 'Flash: flash drawn per clearing row', test: () => content.includes('for (const row of clearingRows)') && content.includes('fillRect') },

        // board.splice and board.unshift in completeClear after flash
        { name: 'Flash: board.splice in completeClear', test: () => content.includes('function completeClear') && content.includes('board.splice(row, 1)') },
        { name: 'Flash: board.unshift in completeClear', test: () => content.includes('function completeClear') && content.includes('board.unshift') },

        // clearingRows reset post-operation
        { name: 'Flash: clearingRows reset after clear', test: () => content.includes("clearingRows = []") && content.includes("isClearing = false") },

        // completeClear called after flash duration
        { name: 'Flash: completeClear called after duration', test: () => content.includes('completeClear()') },

        // Game freezes during flash (no piece drop, no input)
        { name: 'Flash: input blocked during clearing', test: () => content.includes('isClearing') && content.includes('return') },
        { name: 'Flash: piece not spawned during clearing', test: () => content.includes('if (!isClearing)') && content.includes('createPiece') },

        // Exposed for testing
        { name: 'Flash: animation state exposed for testing', test: () => content.includes('window._flashAnimation') },

        // ── Leaderboard / localStorage High Score Persistence ─────────
        // localStorage key referenced
        { name: 'Leaderboard: localStorage key tetris_leaderboard', test: () => content.includes("'tetris_leaderboard'") },

        // getLeaderboard function exists
        { name: 'Leaderboard: getLeaderboard function exists', test: () => content.includes('function getLeaderboard') },

        // saveScore function exists
        { name: 'Leaderboard: saveScore function exists', test: () => content.includes('function saveScore') },

        // isHighScore function exists
        { name: 'Leaderboard: isHighScore function exists', test: () => content.includes('function isHighScore') },

        // leaderboard table HTML exists in index.html
        { name: 'Leaderboard: table HTML in index.html', test: () => htmlContent.includes('leaderboard-table') && htmlContent.includes('<table') },

        // initials input exists
        { name: 'Leaderboard: initials input exists', test: () => htmlContent.includes('initialsInput') && htmlContent.includes('<input') },

        // submitScore function exists
        { name: 'Leaderboard: submitScore function exists', test: () => content.includes('function submitScore') },

        // renderLeaderboard function exists
        { name: 'Leaderboard: renderLeaderboard function exists', test: () => content.includes('function renderLeaderboard') },

        // window._leaderboard exposed for testing
        { name: 'Leaderboard: window._leaderboard exposed for testing', test: () => content.includes('window._leaderboard') },

        // clearLeaderboard function exists
        { name: 'Leaderboard: clearLeaderboard function exists', test: () => content.includes('function clearLeaderboard') }
    ];

    console.log('Testing Tetris Game Requirements...\n');

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
        try {
            if (test.test()) {
                console.log(`  PASS: ${test.name}`);
                passed++;
            } else {
                console.log(`  FAIL: ${test.name}`);
                failed++;
            }
        } catch (error) {
            console.log(`  FAIL: ${test.name} - Error: ${error.message}`);
            failed++;
        }
    });

    console.log(`\nTest Results: ${passed} passed, ${failed} failed out of ${passed + failed} total`);

    if (failed === 0) {
        console.log('All requirements implemented successfully!');
        return true;
    } else {
        console.log('Some requirements may be missing or need attention.');
        process.exit(1);
        return false;
    }
}

// Run the test
try {
    testTetrisRequirements();
} catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
}
