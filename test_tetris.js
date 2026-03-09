// Simple Node.js test to validate Tetris game requirements
const fs = require('fs');
const path = require('path');

function testTetrisRequirements() {
    const htmlFile = path.join(__dirname, 'index.html');

    if (!fs.existsSync(htmlFile)) {
        throw new Error('index.html file not found');
    }

    const content = fs.readFileSync(htmlFile, 'utf8');

    const tests = [
        // Single file requirement
        { name: 'Single HTML file', test: () => content.includes('<!DOCTYPE html>') },

        // Inline styles requirement
        { name: 'Inline CSS styles', test: () => content.includes('<style>') && content.includes('</style>') },

        // Inline JavaScript requirement
        { name: 'Inline JavaScript', test: () => content.includes('<script>') && content.includes('</script>') },

        // Game board rendering
        { name: 'Game board canvas', test: () => content.includes('<canvas') && content.includes('gameCanvas') },

        // Piece movement controls
        { name: 'Arrow key movement', test: () => content.includes('ArrowLeft') && content.includes('ArrowRight') && content.includes('ArrowDown') },

        // Rotation feature
        { name: 'Piece rotation', test: () => content.includes('ArrowUp') && content.includes('rotatePiece') },

        // Line clearing
        { name: 'Line clearing logic', test: () => content.includes('clearLines') && content.includes('isComplete') },

        // Score tracking
        { name: 'Score tracking', test: () => content.includes('score') && content.includes('updateDisplay') },

        // Game over detection
        { name: 'Game over detection', test: () => content.includes('gameOver') && content.includes('Game Over') },

        // Start/Restart buttons
        { name: 'Start button', test: () => content.includes('startGame') && content.includes('Start Game') },
        { name: 'Restart button', test: () => content.includes('restartGame') && content.includes('Restart') },

        // Additional UI features
        { name: 'Pause functionality', test: () => content.includes('pauseGame') && content.includes('Pause') },
        { name: 'Level tracking', test: () => content.includes('level') && content.includes('Level') },
        { name: 'Lines tracking', test: () => content.includes('lines') && content.includes('Lines') },

        // Hard drop feature
        { name: 'Hard drop (spacebar)', test: () => content.includes("' '") || content.includes("case ' '") },

        // Game pieces
        { name: 'Tetris pieces defined', test: () => content.includes('PIECES') && content.includes('COLORS') },

        // Game board dimensions
        { name: 'Proper board size', test: () => content.includes('BOARD_WIDTH') && content.includes('BOARD_HEIGHT') },

        // Responsive design
        { name: 'Responsive CSS', test: () => content.includes('@media') && content.includes('768px') },

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
        { name: 'CSS touch-action: none on canvas', test: () => content.includes('touch-action: none') },

        // Touch controls UI hint for mobile
        { name: 'Touch controls UI section', test: () => content.includes('touch-controls') && content.includes('Swipe') },

        // Touch controls visibility: hidden on desktop, shown on touch devices
        { name: 'Touch controls hidden by default', test: () => content.includes('.touch-controls') && content.includes('display: none') },
        { name: 'Touch controls shown on touch devices', test: () => content.includes('pointer: coarse') },

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
            // Extract the clearLines function body
            const clMatch = content.match(/function clearLines\(\)\s*\{([\s\S]*?)\n        \}/);
            return clMatch && !clMatch[1].includes('board.splice');
        }},

        // finishClearLines() function exists for deferred row removal
        { name: 'finishClearLines function exists', test: () => content.includes('function finishClearLines()') },

        // finishClearLines() performs the actual board.splice
        { name: 'finishClearLines splices the board', test: () => {
            const flMatch = content.match(/function finishClearLines\(\)\s*\{([\s\S]*?)\n        \}/);
            return flMatch && flMatch[1].includes('board.splice');
        }},

        // gameStep() checks clearingRows to pause piece drops
        { name: 'gameStep pauses drops during clearing', test: () => content.includes('clearingRows.length > 0') },

        // gameStep() calls finishClearLines after animation duration
        { name: 'gameStep calls finishClearLines after animation', test: () => {
            const gsMatch = content.match(/function gameStep\(time\)\s*\{([\s\S]*?)\n        \}/);
            return gsMatch && gsMatch[1].includes('finishClearLines()');
        }},

        // Flash effect rendering: white overlay on clearing rows
        { name: 'Flash effect uses white overlay', test: () => content.includes("ctx.fillStyle = '#ffffff'") && content.includes('flashAlpha') },

        // Flash uses sine-based pulsing animation
        { name: 'Flash uses sine-based pulsing', test: () => content.includes('Math.sin') && content.includes('flashAlpha') },

        // clearingRows is reset in startGame
        { name: 'clearingRows reset in startGame', test: () => {
            const sgMatch = content.match(/function startGame\(\)\s*\{([\s\S]*?)\n        \}/);
            return sgMatch && sgMatch[1].includes('clearingRows = []');
        }},

        // clearingRows is reset in restartGame
        { name: 'clearingRows reset in restartGame', test: () => {
            const rgMatch = content.match(/function restartGame\(\)\s*\{([\s\S]*?)\n        \}/);
            return rgMatch && rgMatch[1].includes('clearingRows = []');
        }},

        // Input blocked during clearing animation
        { name: 'Keyboard input blocked during clearing', test: () => content.includes('clearingRows.length > 0') },

        // spawnNextPiece extracted as separate function
        { name: 'spawnNextPiece function exists', test: () => content.includes('function spawnNextPiece()') },

        // placePiece defers spawning when clearing
        { name: 'placePiece defers spawn during clearing', test: () => {
            const ppMatch = content.match(/function placePiece\(\)\s*\{([\s\S]*?)\n        \}/);
            return ppMatch && ppMatch[1].includes('clearingRows.length === 0') && ppMatch[1].includes('spawnNextPiece()');
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
        { name: 'Flash: animation state exposed for testing', test: () => content.includes('window._flashAnimation') }
    ];

    console.log('🎮 Testing Tetris Game Requirements...\n');

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
        try {
            if (test.test()) {
                console.log(`✅ ${test.name}`);
                passed++;
            } else {
                console.log(`❌ ${test.name}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - Error: ${error.message}`);
            failed++;
        }
    });

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All requirements implemented successfully!');
        return true;
    } else {
        console.log('⚠️  Some requirements may be missing or need attention.');
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