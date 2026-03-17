import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the multiplayer module
const TetrisMultiplayer = require('./multiplayer.js');

describe('TetrisMultiplayer', () => {
    beforeEach(() => {
        TetrisMultiplayer._reset();
    });

    // ── Room Code Generation ─────────────────────────────────
    describe('generateRoomCode', () => {
        it('generates a code of correct length', () => {
            const code = TetrisMultiplayer.generateRoomCode();
            expect(code.length).toBe(TetrisMultiplayer.ROOM_CODE_LENGTH);
        });

        it('generates codes using only valid characters', () => {
            for (let i = 0; i < 50; i++) {
                const code = TetrisMultiplayer.generateRoomCode();
                for (const char of code) {
                    expect(TetrisMultiplayer.ROOM_CODE_CHARS).toContain(char);
                }
            }
        });

        it('generates unique codes', () => {
            const codes = new Set();
            for (let i = 0; i < 100; i++) {
                codes.add(TetrisMultiplayer.generateRoomCode());
            }
            // With 6 chars from 30-char alphabet, collisions in 100 are extremely unlikely
            expect(codes.size).toBeGreaterThan(90);
        });
    });

    // ── Room Code Validation ─────────────────────────────────
    describe('isValidRoomCode', () => {
        it('accepts valid room codes', () => {
            expect(TetrisMultiplayer.isValidRoomCode('ABC234')).toBe(true);
            expect(TetrisMultiplayer.isValidRoomCode('ZZZZZ9')).toBe(true);
        });

        it('rejects null/undefined/empty', () => {
            expect(TetrisMultiplayer.isValidRoomCode(null)).toBe(false);
            expect(TetrisMultiplayer.isValidRoomCode(undefined)).toBe(false);
            expect(TetrisMultiplayer.isValidRoomCode('')).toBe(false);
        });

        it('rejects wrong length', () => {
            expect(TetrisMultiplayer.isValidRoomCode('ABC')).toBe(false);
            expect(TetrisMultiplayer.isValidRoomCode('ABCDEFGH')).toBe(false);
        });

        it('rejects codes with invalid characters', () => {
            expect(TetrisMultiplayer.isValidRoomCode('ABC!@#')).toBe(false);
            expect(TetrisMultiplayer.isValidRoomCode('abcdef')).toBe(false); // lowercase
            expect(TetrisMultiplayer.isValidRoomCode('ABC10O')).toBe(false); // O and 0 and 1 excluded
        });

        it('rejects non-string input', () => {
            expect(TetrisMultiplayer.isValidRoomCode(123456)).toBe(false);
            expect(TetrisMultiplayer.isValidRoomCode({})).toBe(false);
        });
    });

    // ── Garbage Line Calculation ─────────────────────────────
    describe('calculateGarbageLines', () => {
        it('sends 0 garbage for 1 line clear', () => {
            expect(TetrisMultiplayer.calculateGarbageLines(1)).toBe(0);
        });

        it('sends 1 garbage for 2 line clear', () => {
            expect(TetrisMultiplayer.calculateGarbageLines(2)).toBe(1);
        });

        it('sends 2 garbage for 3 line clear', () => {
            expect(TetrisMultiplayer.calculateGarbageLines(3)).toBe(2);
        });

        it('sends 4 garbage for 4 line clear (Tetris)', () => {
            expect(TetrisMultiplayer.calculateGarbageLines(4)).toBe(4);
        });

        it('sends 0 garbage for 0 lines', () => {
            expect(TetrisMultiplayer.calculateGarbageLines(0)).toBe(0);
        });

        it('handles negative input', () => {
            expect(TetrisMultiplayer.calculateGarbageLines(-1)).toBe(0);
        });

        it('handles non-number input', () => {
            expect(TetrisMultiplayer.calculateGarbageLines('four')).toBe(0);
            expect(TetrisMultiplayer.calculateGarbageLines(null)).toBe(0);
        });

        it('clamps at 4 for values above 4', () => {
            expect(TetrisMultiplayer.calculateGarbageLines(5)).toBe(4); // clamped to index 4
            expect(TetrisMultiplayer.calculateGarbageLines(10)).toBe(4);
        });
    });

    // ── Garbage Row Creation ─────────────────────────────────
    describe('createGarbageRows', () => {
        it('creates correct number of rows', () => {
            const rows = TetrisMultiplayer.createGarbageRows(3, 10);
            expect(rows.length).toBe(3);
        });

        it('each row has correct width', () => {
            const rows = TetrisMultiplayer.createGarbageRows(2, 10);
            for (const row of rows) {
                expect(row.length).toBe(10);
            }
        });

        it('each row has exactly one gap (empty cell)', () => {
            const rows = TetrisMultiplayer.createGarbageRows(4, 10);
            for (const row of rows) {
                const gapCount = row.filter(cell => cell === 0).length;
                expect(gapCount).toBe(1);
            }
        });

        it('filled cells have garbage color', () => {
            const rows = TetrisMultiplayer.createGarbageRows(1, 10);
            const filled = rows[0].filter(cell => cell !== 0);
            for (const cell of filled) {
                expect(cell.color).toBe('#666666');
            }
        });

        it('returns empty array for zero count', () => {
            expect(TetrisMultiplayer.createGarbageRows(0, 10)).toEqual([]);
        });

        it('returns empty array for negative count', () => {
            expect(TetrisMultiplayer.createGarbageRows(-1, 10)).toEqual([]);
        });

        it('returns empty array for invalid boardWidth', () => {
            expect(TetrisMultiplayer.createGarbageRows(3, 0)).toEqual([]);
            expect(TetrisMultiplayer.createGarbageRows(3, null)).toEqual([]);
        });

        it('all rows share same gap column', () => {
            // Run multiple times to verify consistency within a batch
            for (let attempt = 0; attempt < 20; attempt++) {
                const rows = TetrisMultiplayer.createGarbageRows(5, 10);
                const gapCols = rows.map(row => row.indexOf(0));
                const unique = new Set(gapCols);
                expect(unique.size).toBe(1); // all same gap column
            }
        });
    });

    // ── Garbage Row Injection ────────────────────────────────
    describe('injectGarbageRows', () => {
        function makeBoard(height, width) {
            const board = [];
            for (let r = 0; r < height; r++) {
                board.push(new Array(width).fill(0));
            }
            return board;
        }

        it('adds garbage rows at bottom of board', () => {
            const board = makeBoard(20, 10);
            const garbage = TetrisMultiplayer.createGarbageRows(2, 10);
            TetrisMultiplayer.injectGarbageRows(board, garbage);

            expect(board.length).toBe(20); // board height unchanged
            expect(board[19]).toEqual(garbage[1]);
            expect(board[18]).toEqual(garbage[0]);
        });

        it('shifts existing rows up', () => {
            const board = makeBoard(20, 10);
            board[19][5] = { color: '#ff0000', glow: 'rgba(255,0,0,' };
            const garbage = TetrisMultiplayer.createGarbageRows(1, 10);

            TetrisMultiplayer.injectGarbageRows(board, garbage);

            // The existing piece should have moved up by 1
            expect(board[18][5]).toEqual({ color: '#ff0000', glow: 'rgba(255,0,0,' });
            expect(board[19]).toEqual(garbage[0]);
        });

        it('maintains board height after injection', () => {
            const board = makeBoard(20, 10);
            TetrisMultiplayer.injectGarbageRows(board, TetrisMultiplayer.createGarbageRows(4, 10));
            expect(board.length).toBe(20);
        });

        it('returns overflow count', () => {
            const board = makeBoard(20, 10);
            const result = TetrisMultiplayer.injectGarbageRows(board, TetrisMultiplayer.createGarbageRows(3, 10));
            expect(result).toBe(3);
        });

        it('handles empty garbage array', () => {
            const board = makeBoard(20, 10);
            const result = TetrisMultiplayer.injectGarbageRows(board, []);
            expect(result).toBe(0);
            expect(board.length).toBe(20);
        });

        it('handles null inputs gracefully', () => {
            expect(TetrisMultiplayer.injectGarbageRows(null, [])).toBe(0);
            expect(TetrisMultiplayer.injectGarbageRows([], null)).toBe(0);
        });
    });

    // ── Message Handling ─────────────────────────────────────
    describe('_handleMessage', () => {
        it('dispatches garbage messages', () => {
            const handler = vi.fn();
            TetrisMultiplayer.on('garbage', handler);
            TetrisMultiplayer._handleMessage({ type: 'garbage', lines: 4 });
            expect(handler).toHaveBeenCalledWith(4);
        });

        it('dispatches game over messages', () => {
            const handler = vi.fn();
            TetrisMultiplayer.on('opponentGameOver', handler);
            TetrisMultiplayer._handleMessage({ type: 'game_over' });
            expect(handler).toHaveBeenCalledOnce();
        });

        it('dispatches board state messages', () => {
            const handler = vi.fn();
            TetrisMultiplayer.on('opponentBoardState', handler);
            const boardData = [[0, 0], [1, 1]];
            TetrisMultiplayer._handleMessage({ type: 'board_state', board: boardData });
            expect(handler).toHaveBeenCalledWith(boardData);
        });

        it('dispatches score update messages', () => {
            const handler = vi.fn();
            TetrisMultiplayer.on('opponentScoreUpdate', handler);
            TetrisMultiplayer._handleMessage({
                type: 'score_update',
                score: 1000,
                lines: 10,
                level: 2
            });
            expect(handler).toHaveBeenCalledWith({ score: 1000, lines: 10, level: 2 });
        });

        it('ignores null/invalid messages', () => {
            expect(() => TetrisMultiplayer._handleMessage(null)).not.toThrow();
            expect(() => TetrisMultiplayer._handleMessage({})).not.toThrow();
            expect(() => TetrisMultiplayer._handleMessage({ type: 'unknown' })).not.toThrow();
        });

        it('ignores garbage messages with non-number lines', () => {
            const handler = vi.fn();
            TetrisMultiplayer.on('garbage', handler);
            TetrisMultiplayer._handleMessage({ type: 'garbage', lines: 'four' });
            expect(handler).not.toHaveBeenCalled();
        });

        it('ignores board state messages without board data', () => {
            const handler = vi.fn();
            TetrisMultiplayer.on('opponentBoardState', handler);
            TetrisMultiplayer._handleMessage({ type: 'board_state' });
            expect(handler).not.toHaveBeenCalled();
        });
    });

    // ── Event Registration ───────────────────────────────────
    describe('on', () => {
        it('registers all supported events', () => {
            const events = [
                'garbage', 'opponentGameOver', 'opponentBoardState',
                'connectionReady', 'connectionClosed', 'opponentReady',
                'matchStart', 'opponentScoreUpdate', 'error'
            ];

            for (const event of events) {
                const handler = vi.fn();
                TetrisMultiplayer.on(event, handler);
                // Verify no error was thrown during registration
                expect(handler).not.toHaveBeenCalled();
            }
        });
    });

    // ── State Management ─────────────────────────────────────
    describe('getState', () => {
        it('returns initial state', () => {
            const state = TetrisMultiplayer.getState();
            expect(state.roomCode).toBeNull();
            expect(state.isHost).toBe(false);
            expect(state.isConnected).toBe(false);
            expect(state.isReady).toBe(false);
            expect(state.opponentReady).toBe(false);
            expect(state.matchActive).toBe(false);
        });
    });

    // ── Reset ────────────────────────────────────────────────
    describe('_reset', () => {
        it('clears all state and callbacks', () => {
            TetrisMultiplayer.on('garbage', vi.fn());
            TetrisMultiplayer._reset();

            const state = TetrisMultiplayer.getState();
            expect(state.roomCode).toBeNull();
            expect(state.isConnected).toBe(false);

            // Verify callback was cleared
            const handler = vi.fn();
            TetrisMultiplayer._handleMessage({ type: 'garbage', lines: 2 });
            expect(handler).not.toHaveBeenCalled();
        });
    });

    // ── Message Types Constants ──────────────────────────────
    describe('MESSAGE_TYPES', () => {
        it('exposes all message type constants', () => {
            expect(TetrisMultiplayer.MESSAGE_TYPES.GARBAGE).toBe('garbage');
            expect(TetrisMultiplayer.MESSAGE_TYPES.GAME_OVER).toBe('game_over');
            expect(TetrisMultiplayer.MESSAGE_TYPES.BOARD_STATE).toBe('board_state');
            expect(TetrisMultiplayer.MESSAGE_TYPES.READY).toBe('ready');
            expect(TetrisMultiplayer.MESSAGE_TYPES.START).toBe('start');
            expect(TetrisMultiplayer.MESSAGE_TYPES.SCORE_UPDATE).toBe('score_update');
        });
    });

    // ── sendGarbage (without connection) ─────────────────────
    describe('sendGarbage', () => {
        it('returns calculated garbage count', () => {
            expect(TetrisMultiplayer.sendGarbage(4)).toBe(4);
            expect(TetrisMultiplayer.sendGarbage(2)).toBe(1);
            expect(TetrisMultiplayer.sendGarbage(1)).toBe(0);
        });
    });

    // ── joinRoom validation ──────────────────────────────────
    describe('joinRoom', () => {
        it('rejects invalid room codes', async () => {
            await expect(TetrisMultiplayer.joinRoom('bad')).rejects.toThrow('Invalid room code');
        });

        it('rejects empty room codes', async () => {
            await expect(TetrisMultiplayer.joinRoom('')).rejects.toThrow('Invalid room code');
        });
    });

    // ── createRoom with mock peer ────────────────────────────
    describe('createRoom', () => {
        it('returns a valid room code with mock peer', async () => {
            const mockPeer = {
                on: vi.fn()
            };
            const code = await TetrisMultiplayer.createRoom(mockPeer);
            expect(TetrisMultiplayer.isValidRoomCode(code)).toBe(true);
            expect(TetrisMultiplayer.getState().isHost).toBe(true);
        });
    });

    // ── Integration: Ready handshake ─────────────────────────
    describe('ready handshake', () => {
        it('tracks opponent ready via message', () => {
            const readyHandler = vi.fn();
            TetrisMultiplayer.on('opponentReady', readyHandler);
            TetrisMultiplayer._handleMessage({ type: 'ready' });
            expect(readyHandler).toHaveBeenCalledOnce();
            expect(TetrisMultiplayer.getState().opponentReady).toBe(true);
        });

        it('dispatches match start message', () => {
            const startHandler = vi.fn();
            TetrisMultiplayer.on('matchStart', startHandler);
            TetrisMultiplayer._handleMessage({ type: 'start' });
            expect(startHandler).toHaveBeenCalledOnce();
            expect(TetrisMultiplayer.getState().matchActive).toBe(true);
        });
    });
});
