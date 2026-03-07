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
        { name: 'Touch controls exposed for testing', test: () => content.includes('window._touchControls') }
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