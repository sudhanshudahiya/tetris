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

        // =====================================================
        // NEXT PIECE PREVIEW TESTS
        // =====================================================

        // Next piece preview canvas exists
        { name: 'Next piece preview canvas', test: () => content.includes('nextPieceCanvas') && content.includes('<canvas id="nextPieceCanvas"') },

        // Next piece preview panel UI
        { name: 'Next piece preview panel', test: () => content.includes('next-piece-panel') && content.includes('NEXT') },

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
        { name: 'Next piece panel styling', test: () => content.includes('.next-piece-panel') && content.includes('.next-piece-canvas-wrapper') },

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
