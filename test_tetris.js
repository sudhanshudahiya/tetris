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

        // ── Touch / Mobile Controls ──────────────────────────────
        // D-pad HTML structure
        { name: 'D-pad container', test: () => content.includes('touch-controls') && content.includes('dpad') },
        { name: 'D-pad left button', test: () => content.includes('dpadLeft') && content.includes('dpad-left') },
        { name: 'D-pad right button', test: () => content.includes('dpadRight') && content.includes('dpad-right') },
        { name: 'D-pad down button', test: () => content.includes('dpadDown') && content.includes('dpad-down') },
        { name: 'D-pad up/rotate button', test: () => content.includes('dpadUp') && content.includes('dpad-up') },
        { name: 'Hard drop action button', test: () => content.includes('btnHardDrop') && content.includes('DROP') },
        { name: 'Rotate action button', test: () => content.includes('btnRotate') && content.includes('rotate-btn') },

        // D-pad CSS styles
        { name: 'D-pad CSS grid layout', test: () => content.includes('.dpad') && content.includes('grid-template-columns') },
        { name: 'D-pad button active states', test: () => content.includes('.dpad-btn:active') || content.includes('.dpad-btn.active') },
        { name: 'Action button styles', test: () => content.includes('.action-btn') && content.includes('border-radius: 50%') },

        // Touch/Swipe JavaScript logic
        { name: 'Touch event listeners', test: () => content.includes('touchstart') && content.includes('touchend') },
        { name: 'Swipe gesture detection', test: () => content.includes('SWIPE_THRESHOLD') && content.includes('touchStartX') },
        { name: 'Swipe direction handling', test: () => content.includes('Swipe right') && content.includes('Swipe left') && content.includes('Swipe down') },
        { name: 'D-pad action handler', test: () => content.includes('dpadAction') && content.includes('buttonMap') },
        { name: 'Button repeat on hold', test: () => content.includes('startRepeat') && content.includes('stopRepeat') },
        { name: 'Touch controls prevent scroll', test: () => content.includes("e.preventDefault()") && content.includes('touchmove') },

        // Swipe hint overlay
        { name: 'Swipe hint overlay', test: () => content.includes('swipeHint') && content.includes('swipe-hint') },
        { name: 'Swipe hint auto-dismiss', test: () => content.includes('dismissSwipeHint') && content.includes('tetris_swipe_hint_seen') },

        // Accessibility
        { name: 'D-pad button aria-labels', test: () => content.includes('aria-label="Move left"') && content.includes('aria-label="Move right"') },
        { name: 'Action button aria-labels', test: () => content.includes('aria-label="Hard drop"') && content.includes('aria-label="Rotate piece"') },

        // Touch controls visibility (responsive)
        { name: 'Touch controls hidden by default', test: () => content.includes('.touch-controls') && content.includes('display: none') },
        { name: 'Touch controls shown on touch devices', test: () => content.includes('pointer: coarse') }
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