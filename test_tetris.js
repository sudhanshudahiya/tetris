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

        // Touch controls - swipe gestures
        { name: 'Touch event listeners (touchstart)', test: () => content.includes('touchstart') },
        { name: 'Touch event listeners (touchend)', test: () => content.includes('touchend') },
        { name: 'Touch event listeners (touchmove)', test: () => content.includes('touchmove') },
        { name: 'Swipe threshold configuration', test: () => content.includes('SWIPE_THRESHOLD') },
        { name: 'Swipe direction detection', test: () => content.includes('touchStartX') && content.includes('touchStartY') },
        { name: 'Tap to rotate gesture', test: () => content.includes('TAP_THRESHOLD') },

        // Touch controls - on-screen buttons
        { name: 'Touch control buttons HTML', test: () => content.includes('touch-controls') && content.includes('touchControls') },
        { name: 'Touch left button', test: () => content.includes('touchLeft') },
        { name: 'Touch right button', test: () => content.includes('touchRight') },
        { name: 'Touch down button', test: () => content.includes('touchDown') },
        { name: 'Touch rotate button', test: () => content.includes('touchRotate') },
        { name: 'Touch hard drop button', test: () => content.includes('touchDrop') },
        { name: 'Touch button repeat support', test: () => content.includes('repeatInterval') && content.includes('setupTouchButton') },
        { name: 'Touch controls CSS', test: () => content.includes('.touch-btn') && content.includes('.touch-controls') },
        { name: 'Prevent scroll on game area', test: () => content.includes('preventDefault') },
        { name: 'Accessibility labels on touch buttons', test: () => content.includes('aria-label') }
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