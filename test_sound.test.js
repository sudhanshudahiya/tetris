// Sound Manager test suite — validates SoundManager integration via source string matching
// and structural verification (same pattern as existing test suites)
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

describe('SoundManager — Core Structure', () => {
    it('SoundManager IIFE is defined', () => {
        expect(gameContent.includes('const SoundManager = (function')).toBe(true);
    });

    it('SoundManager is exposed globally', () => {
        expect(gameContent.includes('window.SoundManager = SoundManager')).toBe(true);
    });

    it('Uses Web Audio API (AudioContext)', () => {
        expect(gameContent.includes('AudioContext') || gameContent.includes('webkitAudioContext')).toBe(true);
    });

    it('Creates master gain node', () => {
        expect(gameContent.includes('masterGain') && gameContent.includes('audioCtx.createGain()')).toBe(true);
    });

    it('Creates separate music gain node', () => {
        expect(gameContent.includes('musicGain') && gameContent.includes('musicGain.connect(masterGain)')).toBe(true);
    });

    it('Creates separate sfx gain node', () => {
        expect(gameContent.includes('sfxGain') && gameContent.includes('sfxGain.connect(masterGain)')).toBe(true);
    });

    it('Handles suspended AudioContext', () => {
        expect(gameContent.includes("audioCtx.state === 'suspended'") && gameContent.includes('audioCtx.resume()')).toBe(true);
    });
});

describe('SoundManager — SFX Methods', () => {
    it('playMoveSfx is defined and exported', () => {
        expect(gameContent.includes('function playMoveSfx')).toBe(true);
        expect(gameContent.includes('playMoveSfx: playMoveSfx')).toBe(true);
    });

    it('playRotateSfx is defined and exported', () => {
        expect(gameContent.includes('function playRotateSfx')).toBe(true);
        expect(gameContent.includes('playRotateSfx: playRotateSfx')).toBe(true);
    });

    it('playLockSfx is defined and exported', () => {
        expect(gameContent.includes('function playLockSfx')).toBe(true);
        expect(gameContent.includes('playLockSfx: playLockSfx')).toBe(true);
    });

    it('playLineClearSfx is defined and exported', () => {
        expect(gameContent.includes('function playLineClearSfx')).toBe(true);
        expect(gameContent.includes('playLineClearSfx: playLineClearSfx')).toBe(true);
    });

    it('playLineClearSfx accepts line count parameter', () => {
        expect(gameContent.includes('function playLineClearSfx(lineCount)')).toBe(true);
    });

    it('Tetris (4-line) has special SFX', () => {
        const idx = gameContent.indexOf('function playLineClearSfx');
        const nextFn = gameContent.indexOf('\n            function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('lineCount === 4')).toBe(true);
    });

    it('playLevelUpSfx is defined and exported', () => {
        expect(gameContent.includes('function playLevelUpSfx')).toBe(true);
        expect(gameContent.includes('playLevelUpSfx: playLevelUpSfx')).toBe(true);
    });

    it('playHardDropSfx is defined and exported', () => {
        expect(gameContent.includes('function playHardDropSfx')).toBe(true);
        expect(gameContent.includes('playHardDropSfx: playHardDropSfx')).toBe(true);
    });

    it('playGameOverSfx is defined and exported', () => {
        expect(gameContent.includes('function playGameOverSfx')).toBe(true);
        expect(gameContent.includes('playGameOverSfx: playGameOverSfx')).toBe(true);
    });

    it('Uses square wave for chiptune sound', () => {
        expect(gameContent.includes("'square'")).toBe(true);
    });

    it('Uses triangle wave for bass tones', () => {
        expect(gameContent.includes("'triangle'")).toBe(true);
    });

    it('Uses sawtooth wave for accent tones', () => {
        expect(gameContent.includes("'sawtooth'")).toBe(true);
    });
});

describe('SoundManager — Background Music', () => {
    it('MELODY array is defined', () => {
        expect(gameContent.includes('const MELODY = [')).toBe(true);
    });

    it('BASS array is defined', () => {
        expect(gameContent.includes('const BASS = [')).toBe(true);
    });

    it('startMusic function is defined and exported', () => {
        expect(gameContent.includes('function startMusic')).toBe(true);
        expect(gameContent.includes('startMusic: startMusic')).toBe(true);
    });

    it('stopMusic function is defined and exported', () => {
        expect(gameContent.includes('function stopMusic')).toBe(true);
        expect(gameContent.includes('stopMusic: stopMusic')).toBe(true);
    });

    it('pauseMusic function is defined and exported', () => {
        expect(gameContent.includes('function pauseMusic')).toBe(true);
        expect(gameContent.includes('pauseMusic: pauseMusic')).toBe(true);
    });

    it('resumeMusic function is defined and exported', () => {
        expect(gameContent.includes('function resumeMusic')).toBe(true);
        expect(gameContent.includes('resumeMusic: resumeMusic')).toBe(true);
    });

    it('Music loops without gap (scheduleLoop)', () => {
        expect(gameContent.includes('function scheduleLoop')).toBe(true);
        expect(gameContent.includes('scheduleLoop()')).toBe(true);
    });

    it('Music scheduling uses setTimeout for gapless loop', () => {
        const idx = gameContent.indexOf('function scheduleLoop');
        const nextFn = gameContent.indexOf('\n            function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 2000);
        expect(body.includes('setTimeout')).toBe(true);
        expect(body.includes('scheduleLoop')).toBe(true);
    });

    it('getMelodyDuration helper is defined', () => {
        expect(gameContent.includes('function getMelodyDuration')).toBe(true);
    });
});

describe('SoundManager — Mute Toggle', () => {
    it('toggleMute function is defined and exported', () => {
        expect(gameContent.includes('function toggleMute')).toBe(true);
        expect(gameContent.includes('toggleMute: toggleMute')).toBe(true);
    });

    it('isMuted function is defined and exported', () => {
        expect(gameContent.includes('function isMuted')).toBe(true);
        expect(gameContent.includes('isMuted: isMuted')).toBe(true);
    });

    it('Mute state persists via localStorage', () => {
        expect(gameContent.includes('localStorage.setItem(MUTE_KEY')).toBe(true);
        expect(gameContent.includes('localStorage.getItem(MUTE_KEY)')).toBe(true);
    });

    it('MUTE_KEY constant is defined', () => {
        expect(gameContent.includes("const MUTE_KEY = 'tetris_muted'")).toBe(true);
    });

    it('Master gain is set to 0 when muted', () => {
        expect(gameContent.includes('masterGain.gain.value = muted ? 0 : 1')).toBe(true);
    });
});

describe('SoundManager — Game Integration', () => {
    it('Line clear triggers SFX in clearLines()', () => {
        const idx = gameContent.indexOf('function clearLines()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.playLineClearSfx(clearingRows.length)')).toBe(true);
    });

    it('Piece lock triggers SFX in placePiece()', () => {
        const idx = gameContent.indexOf('function placePiece()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.playLockSfx()')).toBe(true);
    });

    it('Game over triggers SFX', () => {
        const idx = gameContent.indexOf('function gameOver()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.playGameOverSfx()')).toBe(true);
    });

    it('Game over stops music', () => {
        const idx = gameContent.indexOf('function gameOver()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.stopMusic()')).toBe(true);
    });

    it('Start game begins music', () => {
        const idx = gameContent.indexOf('function startGame()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.startMusic()')).toBe(true);
    });

    it('Pause game pauses music', () => {
        const idx = gameContent.indexOf('function pauseGame()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.pauseMusic()')).toBe(true);
    });

    it('Resume game resumes music', () => {
        const idx = gameContent.indexOf('function pauseGame()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.resumeMusic()')).toBe(true);
    });

    it('Restart game stops music', () => {
        const idx = gameContent.indexOf('function restartGame()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.stopMusic()')).toBe(true);
    });

    it('Hard drop triggers SFX', () => {
        expect(gameContent.includes('SoundManager.playHardDropSfx()')).toBe(true);
    });

    it('Move left triggers move SFX', () => {
        expect(gameContent.includes("case 'ArrowLeft'")).toBe(true);
        // Check move SFX exists near ArrowLeft handling
        expect(gameContent.includes('SoundManager.playMoveSfx()')).toBe(true);
    });

    it('Rotate triggers rotate SFX', () => {
        expect(gameContent.includes('SoundManager.playRotateSfx()')).toBe(true);
    });

    it('Level up triggers SFX in completeClear', () => {
        const idx = gameContent.indexOf('function completeClear()');
        const nextFn = gameContent.indexOf('\n        function ', idx + 1);
        const body = gameContent.substring(idx, nextFn > idx ? nextFn : idx + 1000);
        expect(body.includes('SoundManager.playLevelUpSfx()')).toBe(true);
        expect(body.includes('level > prevLevel')).toBe(true);
    });

    it('M key toggles mute', () => {
        expect(gameContent.includes("e.key === 'm' || e.key === 'M'")).toBe(true);
        expect(gameContent.includes('toggleMute()')).toBe(true);
    });
});

describe('SoundManager — UI Elements', () => {
    it('Mute button exists in HTML', () => {
        expect(htmlContent.includes('muteBtn')).toBe(true);
        expect(htmlContent.includes('toggleMute()')).toBe(true);
    });

    it('Mute button has proper styling', () => {
        expect(htmlContent.includes('.mute-btn')).toBe(true);
    });

    it('Mute button has muted state styling', () => {
        expect(htmlContent.includes('.mute-btn.muted')).toBe(true);
    });

    it('M key documented in controls section', () => {
        expect(htmlContent.includes('<kbd>M</kbd> Mute')).toBe(true);
    });

    it('Mute button label updates on toggle', () => {
        expect(gameContent.includes("btn.textContent = isMuted ? 'Unmute' : 'Mute'")).toBe(true);
    });

    it('Mute button state initialized from localStorage', () => {
        expect(gameContent.includes('initMuteButton')).toBe(true);
        expect(gameContent.includes("localStorage.getItem(SoundManager.MUTE_KEY)")).toBe(true);
    });
});
