// multiplayer.js — WebRTC two-player competitive Tetris via PeerJS
// Manages peer connections, room codes, garbage line exchange, and match state.

const TetrisMultiplayer = (function () {
    // ── Constants ────────────────────────────────────────────────
    const ROOM_CODE_LENGTH = 6;
    const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    const MESSAGE_TYPES = {
        GARBAGE: 'garbage',
        GAME_OVER: 'game_over',
        BOARD_STATE: 'board_state',
        READY: 'ready',
        START: 'start',
        SCORE_UPDATE: 'score_update'
    };

    // ── State ────────────────────────────────────────────────────
    let peer = null;
    let connection = null;
    let roomCode = null;
    let isHost = false;
    let isConnected = false;
    let isReady = false;
    let opponentReady = false;
    let matchActive = false;
    let onGarbageReceived = null;   // callback(lineCount)
    let onOpponentGameOver = null;  // callback()
    let onOpponentBoardState = null; // callback(boardData)
    let onConnectionReady = null;    // callback()
    let onConnectionClosed = null;   // callback()
    let onOpponentReady = null;      // callback()
    let onMatchStart = null;         // callback()
    let onOpponentScoreUpdate = null; // callback({score, lines, level})
    let onError = null;              // callback(errorMsg)

    // ── Room code generation ─────────────────────────────────────
    function generateRoomCode() {
        let code = '';
        for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
            code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
        }
        return code;
    }

    function isValidRoomCode(code) {
        if (!code || typeof code !== 'string') return false;
        if (code.length !== ROOM_CODE_LENGTH) return false;
        for (let i = 0; i < code.length; i++) {
            if (ROOM_CODE_CHARS.indexOf(code[i]) === -1) return false;
        }
        return true;
    }

    // ── Garbage line calculation ─────────────────────────────────
    // Standard competitive Tetris: lines cleared -> garbage sent
    // 1 line = 0 garbage, 2 lines = 1, 3 lines = 2, 4 lines (Tetris) = 4
    function calculateGarbageLines(linesCleared) {
        if (typeof linesCleared !== 'number' || linesCleared < 0) return 0;
        const garbageMap = [0, 0, 1, 2, 4];
        return garbageMap[Math.min(linesCleared, 4)] || 0;
    }

    // ── Create garbage rows ──────────────────────────────────────
    // Creates garbage rows with a random gap column for the opponent
    function createGarbageRows(count, boardWidth) {
        if (count <= 0 || !boardWidth || boardWidth <= 0) return [];
        const rows = [];
        const gapCol = Math.floor(Math.random() * boardWidth);
        for (let i = 0; i < count; i++) {
            const row = [];
            for (let col = 0; col < boardWidth; col++) {
                if (col === gapCol) {
                    row.push(0);
                } else {
                    row.push({ color: '#666666', glow: 'rgba(100,100,100,' });
                }
            }
            rows.push(row);
        }
        return rows;
    }

    // ── Inject garbage rows into a board ─────────────────────────
    // Pushes garbage rows from the bottom, shifting existing rows up.
    // Returns number of rows that overflowed (potential game over trigger).
    function injectGarbageRows(board, garbageRows) {
        if (!board || !garbageRows || garbageRows.length === 0) return 0;

        const overflow = garbageRows.length;

        // Remove rows from top to make room
        board.splice(0, overflow);

        // Add garbage rows at bottom
        for (let i = 0; i < garbageRows.length; i++) {
            board.push(garbageRows[i]);
        }

        // Check if any of the removed top rows had pieces (overflow)
        return overflow;
    }

    // ── PeerJS connection management ─────────────────────────────
    function setupConnectionHandlers(conn) {
        connection = conn;

        conn.on('open', function () {
            isConnected = true;
            if (onConnectionReady) onConnectionReady();
        });

        conn.on('data', function (data) {
            handleMessage(data);
        });

        conn.on('close', function () {
            isConnected = false;
            matchActive = false;
            connection = null;
            if (onConnectionClosed) onConnectionClosed();
        });

        conn.on('error', function (err) {
            if (onError) onError('Connection error: ' + err.message);
        });
    }

    function handleMessage(data) {
        if (!data || !data.type) return;

        switch (data.type) {
        case MESSAGE_TYPES.GARBAGE:
            if (onGarbageReceived && typeof data.lines === 'number') {
                onGarbageReceived(data.lines);
            }
            break;
        case MESSAGE_TYPES.GAME_OVER:
            matchActive = false;
            if (onOpponentGameOver) onOpponentGameOver();
            break;
        case MESSAGE_TYPES.BOARD_STATE:
            if (onOpponentBoardState && data.board) {
                onOpponentBoardState(data.board);
            }
            break;
        case MESSAGE_TYPES.READY:
            opponentReady = true;
            if (onOpponentReady) onOpponentReady();
            // If both ready, host starts the match
            if (isHost && isReady && opponentReady) {
                startMatch();
            }
            break;
        case MESSAGE_TYPES.START:
            matchActive = true;
            if (onMatchStart) onMatchStart();
            break;
        case MESSAGE_TYPES.SCORE_UPDATE:
            if (onOpponentScoreUpdate && data.score !== undefined) {
                onOpponentScoreUpdate({
                    score: data.score,
                    lines: data.lines,
                    level: data.level
                });
            }
            break;
        }
    }

    // ── Public API ───────────────────────────────────────────────

    // Create a room (host mode)
    function createRoom(peerInstance) {
        return new Promise(function (resolve, reject) {
            isHost = true;
            roomCode = generateRoomCode();
            const peerId = 'tetris-mp-' + roomCode;

            if (peerInstance) {
                // Use injected peer (for testing)
                peer = peerInstance;
                peer.on('connection', function (conn) {
                    setupConnectionHandlers(conn);
                });
                resolve(roomCode);
                return;
            }

            /* global Peer */
            peer = new Peer(peerId);

            peer.on('open', function () {
                peer.on('connection', function (conn) {
                    setupConnectionHandlers(conn);
                });
                resolve(roomCode);
            });

            peer.on('error', function (err) {
                reject(new Error('Failed to create room: ' + err.message));
            });
        });
    }

    // Join a room (client mode)
    function joinRoom(code, peerInstance) {
        return new Promise(function (resolve, reject) {
            if (!isValidRoomCode(code)) {
                reject(new Error('Invalid room code'));
                return;
            }

            isHost = false;
            roomCode = code;
            const hostPeerId = 'tetris-mp-' + code;

            if (peerInstance) {
                peer = peerInstance;
                const conn = peer.connect(hostPeerId);
                setupConnectionHandlers(conn);
                resolve();
                return;
            }

            peer = new Peer();

            peer.on('open', function () {
                const conn = peer.connect(hostPeerId);
                setupConnectionHandlers(conn);
                resolve();
            });

            peer.on('error', function (err) {
                reject(new Error('Failed to join room: ' + err.message));
            });
        });
    }

    // Signal readiness
    function setReady() {
        isReady = true;
        if (connection && isConnected) {
            connection.send({ type: MESSAGE_TYPES.READY });
        }
        // Host auto-starts if both are ready
        if (isHost && opponentReady) {
            startMatch();
        }
    }

    // Host starts the match
    function startMatch() {
        if (!isHost) return;
        matchActive = true;
        if (connection && isConnected) {
            connection.send({ type: MESSAGE_TYPES.START });
        }
        if (onMatchStart) onMatchStart();
    }

    // Send garbage lines to opponent
    function sendGarbage(linesCleared) {
        const garbageCount = calculateGarbageLines(linesCleared);
        if (garbageCount > 0 && connection && isConnected && matchActive) {
            connection.send({
                type: MESSAGE_TYPES.GARBAGE,
                lines: garbageCount
            });
        }
        return garbageCount;
    }

    // Send board state for opponent preview
    function sendBoardState(boardData) {
        if (connection && isConnected && matchActive) {
            connection.send({
                type: MESSAGE_TYPES.BOARD_STATE,
                board: boardData
            });
        }
    }

    // Notify opponent of game over
    function sendGameOver() {
        matchActive = false;
        if (connection && isConnected) {
            connection.send({ type: MESSAGE_TYPES.GAME_OVER });
        }
    }

    // Send score update to opponent
    function sendScoreUpdate(scoreVal, linesVal, levelVal) {
        if (connection && isConnected && matchActive) {
            connection.send({
                type: MESSAGE_TYPES.SCORE_UPDATE,
                score: scoreVal,
                lines: linesVal,
                level: levelVal
            });
        }
    }

    // Disconnect and clean up
    function disconnect() {
        matchActive = false;
        isConnected = false;
        isReady = false;
        opponentReady = false;
        roomCode = null;

        if (connection) {
            try { connection.close(); } catch (_e) { /* already closed */ }
            connection = null;
        }
        if (peer) {
            try { peer.destroy(); } catch (_e) { /* already destroyed */ }
            peer = null;
        }
    }

    // Register event callbacks
    function on(event, callback) {
        switch (event) {
        case 'garbage': onGarbageReceived = callback; break;
        case 'opponentGameOver': onOpponentGameOver = callback; break;
        case 'opponentBoardState': onOpponentBoardState = callback; break;
        case 'connectionReady': onConnectionReady = callback; break;
        case 'connectionClosed': onConnectionClosed = callback; break;
        case 'opponentReady': onOpponentReady = callback; break;
        case 'matchStart': onMatchStart = callback; break;
        case 'opponentScoreUpdate': onOpponentScoreUpdate = callback; break;
        case 'error': onError = callback; break;
        }
    }

    // Get current state (for testing and UI)
    function getState() {
        return {
            roomCode: roomCode,
            isHost: isHost,
            isConnected: isConnected,
            isReady: isReady,
            opponentReady: opponentReady,
            matchActive: matchActive
        };
    }

    // Reset internal state (for testing)
    function _reset() {
        disconnect();
        onGarbageReceived = null;
        onOpponentGameOver = null;
        onOpponentBoardState = null;
        onConnectionReady = null;
        onConnectionClosed = null;
        onOpponentReady = null;
        onMatchStart = null;
        onOpponentScoreUpdate = null;
        onError = null;
    }

    return {
        // Connection management
        createRoom: createRoom,
        joinRoom: joinRoom,
        disconnect: disconnect,
        setReady: setReady,

        // Game communication
        sendGarbage: sendGarbage,
        sendBoardState: sendBoardState,
        sendGameOver: sendGameOver,
        sendScoreUpdate: sendScoreUpdate,

        // Event registration
        on: on,

        // State access
        getState: getState,

        // Pure utility functions (exported for testing)
        generateRoomCode: generateRoomCode,
        isValidRoomCode: isValidRoomCode,
        calculateGarbageLines: calculateGarbageLines,
        createGarbageRows: createGarbageRows,
        injectGarbageRows: injectGarbageRows,

        // Internal (for testing)
        _reset: _reset,
        _handleMessage: handleMessage,

        // Constants
        ROOM_CODE_LENGTH: ROOM_CODE_LENGTH,
        ROOM_CODE_CHARS: ROOM_CODE_CHARS,
        MESSAGE_TYPES: MESSAGE_TYPES
    };
})();

// Browser: expose on window
if (typeof window !== 'undefined') {
    window.TetrisMultiplayer = TetrisMultiplayer;
}

// CommonJS export for Node.js / Vitest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TetrisMultiplayer;
}
