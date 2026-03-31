        // ESLint verified
        // ============================================================
        //  SOUND MANAGER — Chiptune SFX & Background Music via Web Audio API
        // ============================================================
        const SoundManager = (function () {
            let audioCtx = null;
            let masterGain = null;
            let musicGain = null;
            let sfxGain = null;
            let muted = false;
            let musicPlaying = false;
            let musicNodes = [];       // active music oscillators/gains for cleanup
            let musicTimer = null;     // scheduling timer for music loop

            // Persist mute state
            const MUTE_KEY = 'tetris_muted';

            function ensureContext() {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    masterGain = audioCtx.createGain();
                    masterGain.connect(audioCtx.destination);
                    musicGain = audioCtx.createGain();
                    musicGain.gain.value = 0.25;
                    musicGain.connect(masterGain);
                    sfxGain = audioCtx.createGain();
                    sfxGain.gain.value = 0.4;
                    sfxGain.connect(masterGain);

                    // Restore mute state from localStorage
                    try {
                        muted = localStorage.getItem(MUTE_KEY) === 'true';
                    } catch (_e) { /* localStorage unavailable */ }
                    masterGain.gain.value = muted ? 0 : 1;
                }
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                return audioCtx;
            }

            // Play a single tone (square wave for chiptune feel)
            function playTone(freq, duration, startOffset, gainNode, type) {
                const ctx = ensureContext();
                const osc = ctx.createOscillator();
                const env = ctx.createGain();
                osc.type = type || 'square';
                osc.frequency.value = freq;
                env.gain.setValueAtTime(0.5, ctx.currentTime + startOffset);
                env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
                osc.connect(env);
                env.connect(gainNode || sfxGain);
                osc.start(ctx.currentTime + startOffset);
                osc.stop(ctx.currentTime + startOffset + duration + 0.05);
                return osc;
            }

            // ── SFX definitions ──────────────────────────────────────

            function playMoveSfx() {
                ensureContext();
                playTone(200, 0.05, 0, sfxGain, 'square');
            }

            function playRotateSfx() {
                ensureContext();
                playTone(400, 0.06, 0, sfxGain, 'square');
                playTone(500, 0.06, 0.03, sfxGain, 'square');
            }

            function playLockSfx() {
                ensureContext();
                playTone(150, 0.12, 0, sfxGain, 'triangle');
                playTone(100, 0.1, 0.06, sfxGain, 'triangle');
            }

            function playLineClearSfx(lineCount) {
                ensureContext();
                if (lineCount === 4) {
                    // Tetris! — triumphant ascending arpeggio
                    playTone(523, 0.1, 0, sfxGain, 'square');
                    playTone(659, 0.1, 0.08, sfxGain, 'square');
                    playTone(784, 0.1, 0.16, sfxGain, 'square');
                    playTone(1047, 0.2, 0.24, sfxGain, 'square');
                    playTone(784, 0.15, 0.4, sfxGain, 'sawtooth');
                    playTone(1047, 0.3, 0.5, sfxGain, 'sawtooth');
                } else {
                    // Standard line clear — short ascending sweep
                    playTone(330, 0.08, 0, sfxGain, 'square');
                    playTone(440, 0.08, 0.06, sfxGain, 'square');
                    playTone(550, 0.12, 0.12, sfxGain, 'square');
                }
            }

            function playLevelUpSfx() {
                ensureContext();
                playTone(440, 0.1, 0, sfxGain, 'square');
                playTone(554, 0.1, 0.1, sfxGain, 'square');
                playTone(659, 0.1, 0.2, sfxGain, 'square');
                playTone(880, 0.25, 0.3, sfxGain, 'sawtooth');
            }

            function playHardDropSfx() {
                ensureContext();
                playTone(80, 0.15, 0, sfxGain, 'sawtooth');
                playTone(60, 0.12, 0.05, sfxGain, 'triangle');
            }

            function playGameOverSfx() {
                ensureContext();
                playTone(440, 0.2, 0, sfxGain, 'square');
                playTone(370, 0.2, 0.2, sfxGain, 'square');
                playTone(311, 0.2, 0.4, sfxGain, 'square');
                playTone(262, 0.4, 0.6, sfxGain, 'sawtooth');
                playTone(196, 0.5, 0.9, sfxGain, 'triangle');
            }

            // ── Background Music — simple chiptune loop ─────────────

            // Korobeiniki-inspired melody (simplified, note frequencies)
            const MELODY = [
                // bar 1
                { f: 659, d: 0.2 }, { f: 494, d: 0.1 }, { f: 523, d: 0.1 }, { f: 587, d: 0.2 },
                { f: 523, d: 0.1 }, { f: 494, d: 0.1 },
                // bar 2
                { f: 440, d: 0.2 }, { f: 440, d: 0.1 }, { f: 523, d: 0.1 }, { f: 659, d: 0.2 },
                { f: 587, d: 0.1 }, { f: 523, d: 0.1 },
                // bar 3
                { f: 494, d: 0.3 }, { f: 523, d: 0.1 }, { f: 587, d: 0.2 },
                { f: 659, d: 0.2 },
                // bar 4
                { f: 523, d: 0.2 }, { f: 440, d: 0.2 }, { f: 440, d: 0.3 },
                { f: 0, d: 0.1 },  // rest
                // bar 5
                { f: 587, d: 0.3 }, { f: 698, d: 0.1 }, { f: 880, d: 0.2 },
                { f: 784, d: 0.1 }, { f: 698, d: 0.1 },
                // bar 6
                { f: 659, d: 0.3 }, { f: 523, d: 0.1 }, { f: 659, d: 0.2 },
                { f: 587, d: 0.1 }, { f: 523, d: 0.1 },
                // bar 7
                { f: 494, d: 0.2 }, { f: 494, d: 0.1 }, { f: 523, d: 0.1 }, { f: 587, d: 0.2 },
                { f: 659, d: 0.2 },
                // bar 8
                { f: 523, d: 0.2 }, { f: 440, d: 0.2 }, { f: 440, d: 0.2 },
                { f: 0, d: 0.2 },  // rest
            ];

            // Bass line (root notes, lower octave)
            const BASS = [
                { f: 165, d: 0.4 }, { f: 0, d: 0.4 },
                { f: 110, d: 0.4 }, { f: 0, d: 0.4 },
                { f: 123, d: 0.4 }, { f: 0, d: 0.4 },
                { f: 165, d: 0.4 }, { f: 0, d: 0.4 },
                { f: 147, d: 0.4 }, { f: 0, d: 0.4 },
                { f: 165, d: 0.4 }, { f: 0, d: 0.4 },
                { f: 123, d: 0.4 }, { f: 0, d: 0.4 },
                { f: 110, d: 0.4 }, { f: 0, d: 0.4 },
            ];

            function getMelodyDuration() {
                let total = 0;
                for (let i = 0; i < MELODY.length; i++) total += MELODY[i].d;
                return total;
            }

            function scheduleLoop() {
                if (!musicPlaying) return;
                const ctx = ensureContext();
                const startTime = ctx.currentTime + 0.05; // tiny lookahead to avoid gaps

                // Schedule melody
                let t = 0;
                for (let i = 0; i < MELODY.length; i++) {
                    const note = MELODY[i];
                    if (note.f > 0) {
                        const osc = ctx.createOscillator();
                        const env = ctx.createGain();
                        osc.type = 'square';
                        osc.frequency.value = note.f;
                        env.gain.setValueAtTime(0.35, startTime + t);
                        env.gain.exponentialRampToValueAtTime(0.001, startTime + t + note.d - 0.02);
                        osc.connect(env);
                        env.connect(musicGain);
                        osc.start(startTime + t);
                        osc.stop(startTime + t + note.d);
                        musicNodes.push(osc);
                    }
                    t += note.d;
                }

                // Schedule bass
                const loopDur = getMelodyDuration();
                const bassTotalDur = BASS.reduce(function (s, n) { return s + n.d; }, 0);
                const bassRepeats = Math.ceil(loopDur / bassTotalDur);
                let bt = 0;
                for (let r = 0; r < bassRepeats && bt < loopDur; r++) {
                    for (let i = 0; i < BASS.length && bt < loopDur; i++) {
                        const note = BASS[i];
                        if (note.f > 0) {
                            const osc = ctx.createOscillator();
                            const env = ctx.createGain();
                            osc.type = 'triangle';
                            osc.frequency.value = note.f;
                            env.gain.setValueAtTime(0.3, startTime + bt);
                            env.gain.exponentialRampToValueAtTime(0.001, startTime + bt + note.d - 0.02);
                            osc.connect(env);
                            env.connect(musicGain);
                            osc.start(startTime + bt);
                            osc.stop(startTime + bt + note.d);
                            musicNodes.push(osc);
                        }
                        bt += note.d;
                    }
                }

                // Schedule the next loop iteration just before this one ends
                const loopMs = loopDur * 1000;
                musicTimer = setTimeout(function () {
                    // Clean up old nodes
                    musicNodes = [];
                    scheduleLoop();
                }, loopMs - 50);
            }

            function startMusic() {
                if (musicPlaying) return;
                ensureContext();
                musicPlaying = true;
                scheduleLoop();
            }

            function stopMusic() {
                musicPlaying = false;
                if (musicTimer) {
                    clearTimeout(musicTimer);
                    musicTimer = null;
                }
                // Stop all active music oscillators
                for (let i = 0; i < musicNodes.length; i++) {
                    try { musicNodes[i].stop(); } catch (_e) { /* already stopped */ }
                }
                musicNodes = [];
            }

            function pauseMusic() {
                if (audioCtx && audioCtx.state === 'running') {
                    audioCtx.suspend();
                }
                if (musicTimer) {
                    clearTimeout(musicTimer);
                    musicTimer = null;
                }
            }

            function resumeMusic() {
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                if (musicPlaying && !musicTimer) {
                    scheduleLoop();
                }
            }

            function toggleMute() {
                ensureContext();
                muted = !muted;
                masterGain.gain.value = muted ? 0 : 1;
                try {
                    localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
                } catch (_e) { /* localStorage unavailable */ }
                return muted;
            }

            function isMuted() {
                return muted;
            }

            return {
                ensureContext: ensureContext,
                playMoveSfx: playMoveSfx,
                playRotateSfx: playRotateSfx,
                playLockSfx: playLockSfx,
                playLineClearSfx: playLineClearSfx,
                playLevelUpSfx: playLevelUpSfx,
                playHardDropSfx: playHardDropSfx,
                playGameOverSfx: playGameOverSfx,
                startMusic: startMusic,
                stopMusic: stopMusic,
                pauseMusic: pauseMusic,
                resumeMusic: resumeMusic,
                toggleMute: toggleMute,
                isMuted: isMuted,
                getMelodyDuration: getMelodyDuration,
                MELODY: MELODY,
                BASS: BASS,
                MUTE_KEY: MUTE_KEY
            };
        })();

        // Expose SoundManager globally for UI and testing
        window.SoundManager = SoundManager;

        // ============================================================
        //  BACKGROUND ANIMATION — Enhanced Multi-Layer System
        // ============================================================
        (function () {
            const bgCanvas = document.getElementById('bgCanvas');
            const bgCtx = bgCanvas.getContext('2d');

            // Tetromino shapes for background decoration
            const BG_SHAPES = [
                [[1,1,1,1]],             // I
                [[1,1],[1,1]],           // O
                [[0,1,0],[1,1,1]],       // T
                [[0,1,1],[1,1,0]],       // S
                [[1,1,0],[0,1,1]],       // Z
                [[1,0,0],[1,1,1]],       // J
                [[0,0,1],[1,1,1]]        // L
            ];

            const NEON_PALETTE = [
                { r:0,   g:255, b:255 },  // cyan
                { r:180, g:0,   b:255 },  // violet
                { r:0,   g:140, b:255 },  // blue
                { r:255, g:0,   b:180 },  // magenta
                { r:0,   g:255, b:100 },  // green
                { r:255, g:200, b:0   },  // gold
                { r:255, g:80,  b:0   },  // orange
            ];

            // ── Depth layers for tetrominos ──────────────────────────
            // Layer 0: far  – small blocks, very transparent, slow
            // Layer 1: mid  – medium blocks, semi-transparent, medium speed
            // Layer 2: near – large blocks, more visible, fast
            const LAYER_CONFIG = [
                { blockSize: 10, count: 14, speedMin: 0.12, speedMax: 0.3,  alphaMin: 0.04, alphaMax: 0.09 },
                { blockSize: 18, count: 10, speedMin: 0.28, speedMax: 0.55, alphaMin: 0.09, alphaMax: 0.16 },
                { blockSize: 28, count:  6, speedMin: 0.55, speedMax: 0.95, alphaMin: 0.14, alphaMax: 0.24 },
            ];

            // ── State ─────────────────────────────────────────────────
            let stars = [];          // background star field
            let shootingStars = [];  // occasional shooting stars
            let fallerLayers = [[], [], []];
            let nebulae = [];        // drifting color clouds
            let auroraPhase = 0;
            let time = 0;            // global tick counter (derived from timestamps)
            let bgLastTimestamp = 0;  // previous frame timestamp for delta-time

            // ── Helper: rotate shape ──────────────────────────────────
            function rotateShape(shape, times) {
                let s = shape;
                for (let t = 0; t < times; t++) {
                    const rows = s.length, cols = s[0].length;
                    const out = [];
                    for (let c = 0; c < cols; c++) {
                        out[c] = [];
                        for (let r = rows - 1; r >= 0; r--) out[c][rows - 1 - r] = s[r][c];
                    }
                    s = out;
                }
                return s;
            }

            // ── Factory functions ─────────────────────────────────────
            function mkStar() {
                const tier = Math.random();
                return {
                    x: Math.random() * bgLogicalW,
                    y: Math.random() * bgLogicalH,
                    // Tier 0: distant pin-points, tier 1: mid, tier 2: close twinklers
                    r: tier < 0.7 ? 0.4 + Math.random() * 0.6
                     : tier < 0.93 ? 0.8 + Math.random() * 1.0
                     :               1.4 + Math.random() * 1.6,
                    alpha: 0.15 + Math.random() * 0.7,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.004 + Math.random() * 0.018,
                    color: Math.random() < 0.15
                        ? `rgba(200,160,255,` // slightly purple for variety
                        : `rgba(200,220,255,`
                };
            }

            function mkShootingStar() {
                const angle = (-15 + Math.random() * -20) * Math.PI / 180; // downward-right streak
                const speed = 6 + Math.random() * 10;
                return {
                    x:  Math.random() * bgLogicalW * 0.8,
                    y:  Math.random() * bgLogicalH * 0.4,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed * -1 + Math.random() * 2,
                    len: 60 + Math.random() * 120,
                    alpha: 0.9,
                    life: 1.0
                };
            }

            function mkFaller(layerIdx) {
                const cfg = LAYER_CONFIG[layerIdx];
                const col = NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
                const shapeIdx = Math.floor(Math.random() * BG_SHAPES.length);
                return {
                    shape: BG_SHAPES[shapeIdx],
                    rotation: Math.floor(Math.random() * 4),
                    x: Math.random() * (bgLogicalW + cfg.blockSize * 4) - cfg.blockSize * 2,
                    y: -(cfg.blockSize * 4 + Math.random() * 60),
                    speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
                    col,
                    alpha: cfg.alphaMin + Math.random() * (cfg.alphaMax - cfg.alphaMin),
                    blockSize: cfg.blockSize,
                    driftX: (Math.random() - 0.5) * 0.12,
                    spinPhase: Math.random() * Math.PI * 2,
                    spinSpeed: (Math.random() - 0.5) * 0.006
                };
            }

            function mkNebula() {
                const col = NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
                return {
                    x: Math.random() * bgLogicalW,
                    y: Math.random() * bgLogicalH,
                    r: 180 + Math.random() * 280,
                    col,
                    alpha: 0.025 + Math.random() * 0.045,
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: (Math.random() - 0.5) * 0.05,
                    phase: Math.random() * Math.PI * 2,
                    phaseSpeed: 0.002 + Math.random() * 0.003
                };
            }

            // ── Resize / init ─────────────────────────────────────────
            let bgLogicalW = window.innerWidth;
            let bgLogicalH = window.innerHeight;

            function resize() {
                const dpr = window.devicePixelRatio || 1;
                bgLogicalW = window.innerWidth;
                bgLogicalH = window.innerHeight;
                bgCanvas.width  = bgLogicalW * dpr;
                bgCanvas.height = bgLogicalH * dpr;
                bgCanvas.style.width  = bgLogicalW + 'px';
                bgCanvas.style.height = bgLogicalH + 'px';
                bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
                init();
            }

            function init() {
                const W = bgLogicalW, H = bgLogicalH;
                // Stars
                stars = [];
                const starCount = Math.min(280, Math.round(W * H / 5000));
                for (let i = 0; i < starCount; i++) stars.push(mkStar());
                // Fallers
                for (let l = 0; l < 3; l++) {
                    fallerLayers[l] = [];
                    for (let i = 0; i < LAYER_CONFIG[l].count; i++) {
                        const f = mkFaller(l);
                        f.y = Math.random() * H; // stagger initial positions
                        fallerLayers[l].push(f);
                    }
                }
                // Nebulae
                nebulae = [];
                for (let i = 0; i < 8; i++) nebulae.push(mkNebula());
            }

            // ── Draw helpers ──────────────────────────────────────────
            function drawNeonBlock(bx, by, size, col, alpha) {
                const { r, g, b } = col;
                const innerAlpha = alpha;
                const borderAlpha = Math.min(1, alpha + 0.3);

                // Glow halo
                bgCtx.save();
                bgCtx.shadowColor = `rgb(${r},${g},${b})`;
                bgCtx.shadowBlur = size * 0.8;
                bgCtx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.3})`;
                bgCtx.fillRect(bx, by, size - 1, size - 1);
                bgCtx.restore();

                // Main face gradient
                const grd = bgCtx.createLinearGradient(bx, by, bx + size, by + size);
                grd.addColorStop(0, `rgba(${r},${g},${b},${innerAlpha * 0.55})`);
                grd.addColorStop(1, `rgba(${r},${g},${b},${innerAlpha * 0.15})`);
                bgCtx.fillStyle = grd;
                bgCtx.fillRect(bx + 1, by + 1, size - 2, size - 2);

                // Neon border
                bgCtx.strokeStyle = `rgba(${r},${g},${b},${borderAlpha})`;
                bgCtx.lineWidth = size > 20 ? 1.5 : 1;
                bgCtx.strokeRect(bx + 0.5, by + 0.5, size - 1, size - 1);

                // Top-left inner highlight
                bgCtx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
                const hl = Math.max(1, Math.floor(size * 0.12));
                bgCtx.fillRect(bx + 2, by + 2, size - 6, hl);
                bgCtx.fillRect(bx + 2, by + 2, hl, size - 6);
            }

            function drawFallerLayer(layerFallers, layerIdx) {
                const H = bgLogicalH;
                const cfg = LAYER_CONFIG[layerIdx];

                layerFallers.forEach((f, idx) => {
                    f.y += f.speed;
                    f.x += f.driftX;
                    f.spinPhase += f.spinSpeed;

                    const rotation = f.rotation; // we keep rotation fixed for each piece
                    const shape = rotateShape(f.shape, rotation);

                    shape.forEach((rowArr, r) => {
                        rowArr.forEach((cell, c) => {
                            if (cell) {
                                const bx = f.x + c * f.blockSize;
                                const by = f.y + r * f.blockSize;
                                drawNeonBlock(bx, by, f.blockSize, f.col, f.alpha);
                            }
                        });
                    });

                    if (f.y > H + f.blockSize * 5) {
                        layerFallers[idx] = mkFaller(layerIdx);
                    }
                });
            }

            // ── Main loop ─────────────────────────────────────────────
            function bgLoop(timestamp) {
                const W = bgLogicalW, H = bgLogicalH;
                if (!bgLastTimestamp) bgLastTimestamp = timestamp;
                const bgDeltaTime = Math.min(timestamp - bgLastTimestamp, 100);
                bgLastTimestamp = timestamp;
                time += bgDeltaTime * 0.06;  // normalize: ~1 unit per frame at 60fps
                auroraPhase += 0.004;

                bgCtx.clearRect(0, 0, W, H);

                // ─ 1. Deep space base gradient ────────────────────────
                {
                    const t1 = time * 0.0012;
                    const cx = W * 0.5 + Math.cos(t1) * W * 0.22;
                    const cy = H * 0.5 + Math.sin(t1 * 0.8) * H * 0.18;
                    const base = bgCtx.createRadialGradient(cx, cy, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.9);
                    // Cycle slowly between cool purple and deep blue
                    const hueShift = Math.sin(time * 0.0008) * 0.5 + 0.5; // 0–1
                    const r0 = Math.round(10 + hueShift * 20);
                    const g0 = Math.round(0  + hueShift * 5);
                    const b0 = Math.round(30 + hueShift * 25);
                    base.addColorStop(0,   `rgb(${r0+16},${g0},${b0+34})`);
                    base.addColorStop(0.35, `rgb(${r0+3},${g0+3},${b0+18})`);
                    base.addColorStop(0.75, `rgb(1,2,${b0+6})`);
                    base.addColorStop(1,    '#000000');
                    bgCtx.fillStyle = base;
                    bgCtx.fillRect(0, 0, W, H);
                }

                // ─ 2. Nebula clouds ───────────────────────────────────
                nebulae.forEach(n => {
                    n.x += n.vx;
                    n.y += n.vy;
                    n.phase += n.phaseSpeed;
                    // Wrap around edges
                    if (n.x < -n.r) n.x = W + n.r;
                    if (n.x > W + n.r) n.x = -n.r;
                    if (n.y < -n.r) n.y = H + n.r;
                    if (n.y > H + n.r) n.y = -n.r;

                    const pulseMod = 1 + Math.sin(n.phase) * 0.12;
                    const rr = n.r * pulseMod;
                    const { r, g, b } = n.col;
                    const nebGrad = bgCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rr);
                    nebGrad.addColorStop(0,   `rgba(${r},${g},${b},${n.alpha * 1.5})`);
                    nebGrad.addColorStop(0.4,  `rgba(${r},${g},${b},${n.alpha})`);
                    nebGrad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
                    bgCtx.fillStyle = nebGrad;
                    bgCtx.fillRect(n.x - rr, n.y - rr, rr * 2, rr * 2);
                });

                // ─ 3. Aurora bands ────────────────────────────────────
                {
                    const auroraColors = [
                        [0,   220, 255],
                        [120, 0,   255],
                        [0,   255, 140],
                        [200, 0,   255],
                    ];
                    const bandCount = 4;
                    for (let i = 0; i < bandCount; i++) {
                        const col = auroraColors[i % auroraColors.length];
                        const yBase = H * (0.05 + i * 0.06);
                        const amp = 18 + Math.sin(auroraPhase * 0.7 + i * 1.2) * 12;
                        const freq = 0.004 + i * 0.0015;
                        const alpha = 0.03 + Math.sin(auroraPhase + i * 0.9) * 0.015;
                        if (alpha <= 0) continue;

                        bgCtx.beginPath();
                        bgCtx.moveTo(0, yBase);
                        for (let x = 0; x <= W; x += 4) {
                            const y = yBase + Math.sin(x * freq + auroraPhase + i * 1.8) * amp
                                            + Math.sin(x * freq * 2.3 + auroraPhase * 1.4) * (amp * 0.4);
                            bgCtx.lineTo(x, y);
                        }
                        bgCtx.lineTo(W, 0);
                        bgCtx.lineTo(0, 0);
                        bgCtx.closePath();
                        bgCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${Math.abs(alpha)})`;
                        bgCtx.fill();
                    }
                    // Mirror at bottom
                    for (let i = 0; i < 3; i++) {
                        const col = auroraColors[(i + 1) % auroraColors.length];
                        const yBase = H * (0.92 - i * 0.05);
                        const amp = 14 + Math.sin(auroraPhase * 0.6 + i) * 10;
                        const freq = 0.003 + i * 0.002;
                        const alpha = 0.025 + Math.sin(auroraPhase * 1.1 + i) * 0.012;
                        if (alpha <= 0) continue;

                        bgCtx.beginPath();
                        bgCtx.moveTo(0, yBase);
                        for (let x = 0; x <= W; x += 4) {
                            const y = yBase - Math.sin(x * freq + auroraPhase * 1.1 + i * 2) * amp;
                            bgCtx.lineTo(x, y);
                        }
                        bgCtx.lineTo(W, H);
                        bgCtx.lineTo(0, H);
                        bgCtx.closePath();
                        bgCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${Math.abs(alpha)})`;
                        bgCtx.fill();
                    }
                }

                // ─ 4. Perspective grid ────────────────────────────────
                {
                    const horizonY = H * 0.48;
                    const vpX = W * 0.5;
                    const gridAlpha = 0.045;

                    bgCtx.save();
                    bgCtx.strokeStyle = `rgba(0,200,255,${gridAlpha})`;
                    bgCtx.lineWidth = 0.8;

                    // Vertical "converging" lines
                    const vLines = 22;
                    for (let i = 0; i <= vLines; i++) {
                        const bx = (i / vLines) * W;
                        bgCtx.beginPath();
                        bgCtx.moveTo(vpX, horizonY);
                        bgCtx.lineTo(bx, H);
                        bgCtx.stroke();
                    }

                    // Horizontal rows (exponential spacing for perspective)
                    const hRows = 12;
                    for (let r = 1; r <= hRows; r++) {
                        const t = Math.pow(r / hRows, 1.8);
                        const y = horizonY + (H - horizonY) * t;
                        bgCtx.beginPath();
                        bgCtx.moveTo(0, y);
                        bgCtx.lineTo(W, y);
                        bgCtx.stroke();
                    }

                    // Flat grid above horizon (standard lines)
                    bgCtx.strokeStyle = `rgba(0,180,255,${gridAlpha * 0.5})`;
                    bgCtx.lineWidth = 0.5;
                    const cellW = 44;
                    const cellH = 44;
                    for (let x = 0; x < W; x += cellW) {
                        bgCtx.beginPath();
                        bgCtx.moveTo(x, 0);
                        bgCtx.lineTo(x, horizonY);
                        bgCtx.stroke();
                    }
                    for (let y = 0; y < horizonY; y += cellH) {
                        bgCtx.beginPath();
                        bgCtx.moveTo(0, y);
                        bgCtx.lineTo(W, y);
                        bgCtx.stroke();
                    }

                    bgCtx.restore();
                }

                // ─ 5. Star field ──────────────────────────────────────
                stars.forEach(s => {
                    s.pulse += s.pulseSpeed;
                    const a = s.alpha * (0.45 + 0.55 * Math.sin(s.pulse));
                    // Cross flare for larger stars
                    if (s.r > 1.2) {
                        bgCtx.save();
                        bgCtx.strokeStyle = `${s.color}${a * 0.5})`;
                        bgCtx.lineWidth = 0.7;
                        const flare = s.r * 2.5;
                        bgCtx.beginPath(); bgCtx.moveTo(s.x - flare, s.y); bgCtx.lineTo(s.x + flare, s.y); bgCtx.stroke();
                        bgCtx.beginPath(); bgCtx.moveTo(s.x, s.y - flare); bgCtx.lineTo(s.x, s.y + flare); bgCtx.stroke();
                        bgCtx.restore();
                    }
                    bgCtx.beginPath();
                    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    bgCtx.fillStyle = `${s.color}${a})`;
                    bgCtx.fill();
                });

                // ─ 6. Shooting stars ──────────────────────────────────
                // Spawn occasionally
                if (Math.random() < 0.004 && shootingStars.length < 3) {
                    shootingStars.push(mkShootingStar());
                }
                for (let i = shootingStars.length - 1; i >= 0; i--) {
                    const ss = shootingStars[i];
                    ss.x += ss.vx;
                    ss.y += ss.vy;
                    ss.life -= 0.018;
                    if (ss.life <= 0 || ss.x > bgLogicalW + 50 || ss.y > bgLogicalH + 50) {
                        shootingStars.splice(i, 1);
                        continue;
                    }
                    const tail = ss.len * ss.life;
                    const grad = bgCtx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * (tail / ss.vx || 1), ss.y - ss.vy * (tail / ss.vx || 1));
                    grad.addColorStop(0, `rgba(255,255,255,${ss.life * 0.9})`);
                    grad.addColorStop(0.3, `rgba(150,200,255,${ss.life * 0.5})`);
                    grad.addColorStop(1, 'rgba(0,0,0,0)');
                    bgCtx.save();
                    bgCtx.strokeStyle = grad;
                    bgCtx.lineWidth = 1.5;
                    bgCtx.beginPath();
                    const dx = ss.vx / Math.hypot(ss.vx, ss.vy);
                    const dy = ss.vy / Math.hypot(ss.vx, ss.vy);
                    bgCtx.moveTo(ss.x, ss.y);
                    bgCtx.lineTo(ss.x - dx * tail, ss.y - dy * tail);
                    bgCtx.stroke();
                    bgCtx.restore();
                }

                // ─ 7. Far layer (smallest, most transparent) ─────────
                drawFallerLayer(fallerLayers[0], 0);

                // ─ 8. Mid layer ───────────────────────────────────────
                drawFallerLayer(fallerLayers[1], 1);

                // ─ 9. Near layer (largest, most visible) ─────────────
                drawFallerLayer(fallerLayers[2], 2);

                // ─ 10. Vignette + edge glow ───────────────────────────
                {
                    const vig = bgCtx.createRadialGradient(W/2, H/2, H * 0.25, W/2, H/2, H * 0.92);
                    vig.addColorStop(0, 'rgba(0,0,0,0)');
                    vig.addColorStop(1, 'rgba(0,0,0,0.68)');
                    bgCtx.fillStyle = vig;
                    bgCtx.fillRect(0, 0, W, H);

                    // Subtle edge color bleed
                    const edgeGlow = bgCtx.createLinearGradient(0, 0, 0, H);
                    edgeGlow.addColorStop(0,   'rgba(0,80,200,0.06)');
                    edgeGlow.addColorStop(0.5, 'rgba(0,0,0,0)');
                    edgeGlow.addColorStop(1,   'rgba(80,0,200,0.06)');
                    bgCtx.fillStyle = edgeGlow;
                    bgCtx.fillRect(0, 0, W, H);
                }

                requestAnimationFrame(bgLoop);
            }

            window.addEventListener('resize', resize);
            resize();
            requestAnimationFrame(bgLoop);
        })();

        // ============================================================
        //  GAME CANVAS BACKGROUND (grid lines on board)
        // ============================================================
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const BLOCK_SIZE = 30;
        const BOARD_WIDTH = 10;
        const BOARD_HEIGHT = 20;

        // HiDPI / Retina display support
        function scaleCanvasForHiDPI(cvs, context, logicalWidth, logicalHeight) {
            const dpr = window.devicePixelRatio || 1;
            cvs.width = logicalWidth * dpr;
            cvs.height = logicalHeight * dpr;
            cvs.style.width = logicalWidth + 'px';
            cvs.style.height = logicalHeight + 'px';
            context.scale(dpr, dpr);
        }
        scaleCanvasForHiDPI(canvas, ctx, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

        let board = [];
        let currentPiece = null;
        let gameRunning = false;
        let gamePaused = false;
        let gameLoop = null;
        let score = 0;
        let lines = 0;
        let level = 1;
        let dropTime = 0;
        let lastTime = 0;

        // Line-clear animation state
        let clearingRows = [];              // row indices currently being cleared
        let clearAnimationStart = 0;        // timestamp when clear animation began
        let clearingStartTime = 0;          // alias timestamp for animation tracking
        let isClearing = false;             // flag indicating clearing in progress
        const CLEAR_ANIMATION_DURATION = 400; // ms for the flash effect
        const FLASH_DURATION = 400; // ms for flash effect

        // Tetris piece shapes
        const PIECES = [
            // I-piece
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            // O-piece
            [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            // T-piece
            [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            // S-piece
            [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [1, 1, 0, 0],
                [0, 0, 0, 0]
            ],
            // Z-piece
            [
                [0, 0, 0, 0],
                [1, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            // J-piece
            [
                [0, 0, 0, 0],
                [1, 0, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            // L-piece
            [
                [0, 0, 0, 0],
                [0, 0, 1, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        ];

        // Colors for each piece type - neon palette
        const COLORS = ['#00ffff', '#ff00aa', '#ffff00', '#00ff88', '#ff4444', '#4488ff', '#cc44ff'];
        // Glow colors matching each piece
        const GLOW_COLORS = ['rgba(0,255,255,', 'rgba(255,0,170,', 'rgba(255,255,0,', 'rgba(0,255,136,', 'rgba(255,68,68,', 'rgba(68,136,255,', 'rgba(204,68,255,'];

        // Next piece preview canvas
        const nextCanvas = document.getElementById('nextPieceCanvas');
        const nextCtx = nextCanvas.getContext('2d');
        const NEXT_BLOCK_SIZE = 24;
        const NEXT_CANVAS_SIZE = 120;
        scaleCanvasForHiDPI(nextCanvas, nextCtx, NEXT_CANVAS_SIZE, NEXT_CANVAS_SIZE);

        // Piece index tracker for glow
        let pieceColorIndex = 0;
        let nextPiece = null;
        let nextPieceColorIndex = 0;

        // Initialize game board
        function initBoard() {
            board = [];
            for (let row = 0; row < BOARD_HEIGHT; row++) {
                board[row] = [];
                for (let col = 0; col < BOARD_WIDTH; col++) {
                    board[row][col] = 0;
                }
            }
        }

        // Generate a random piece object
        function generateRandomPiece() {
            const idx = Math.floor(Math.random() * PIECES.length);
            return {
                shape: JSON.parse(JSON.stringify(PIECES[idx])), // Deep copy
                x: Math.floor(BOARD_WIDTH / 2) - 2,
                y: 0,
                color: COLORS[idx],
                glowBase: GLOW_COLORS[idx],
                pieceIndex: idx
            };
        }

        // Create the next piece in the queue; return the current one
        function createPiece() {
            let piece;
            if (nextPiece) {
                piece = nextPiece;
                piece.x = Math.floor(BOARD_WIDTH / 2) - 2;
                piece.y = 0;
                pieceColorIndex = piece.pieceIndex;
            } else {
                piece = generateRandomPiece();
                pieceColorIndex = piece.pieceIndex;
            }
            nextPiece = generateRandomPiece();
            nextPieceColorIndex = nextPiece.pieceIndex;
            drawNextPiece();
            return piece;
        }

        // Check if piece can be placed at position
        function isValidMove(piece, dx, dy, shape = piece.shape) {
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col] === 1) {
                        const newX = piece.x + col + dx;
                        const newY = piece.y + row + dy;

                        if (newX < 0 || newX >= BOARD_WIDTH ||
                            newY >= BOARD_HEIGHT ||
                            (newY >= 0 && board[newY][newX] !== 0)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        // Rotate piece shape 90 degrees clockwise
        function rotatePiece(shape) {
            const rotated = [];
            for (let i = 0; i < 4; i++) {
                rotated[i] = [];
                for (let j = 0; j < 4; j++) {
                    rotated[i][j] = shape[3 - j][i];
                }
            }
            return rotated;
        }

        // Draw a single neon block
        function drawNeonBlock(x, y, color, glowBase, alpha = 1) {
            const glow = glowBase || 'rgba(255,255,255,';

            // Shadow/glow behind the block
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha * 0.25;
            ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            ctx.restore();

            // Main block face - dark with slight color tint
            const grad = ctx.createLinearGradient(x, y, x + BLOCK_SIZE, y + BLOCK_SIZE);
            grad.addColorStop(0, glow + (alpha * 0.35) + ')');
            grad.addColorStop(1, glow + (alpha * 0.1) + ')');
            ctx.fillStyle = grad;
            ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

            // Bright border (neon edge)
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = alpha;
            ctx.strokeRect(x + 0.75, y + 0.75, BLOCK_SIZE - 1.5, BLOCK_SIZE - 1.5);

            // Top-left inner highlight
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
            ctx.fillRect(x + 3, y + 3, BLOCK_SIZE - 8, 2);
            ctx.fillRect(x + 3, y + 3, 2, BLOCK_SIZE - 8);

            ctx.globalAlpha = 1;
        }

        // Draw the next piece preview
        function drawNextPiece() {
            nextCtx.fillStyle = 'rgba(0, 0, 8, 0.95)';
            nextCtx.fillRect(0, 0, NEXT_CANVAS_SIZE, NEXT_CANVAS_SIZE);

            if (!nextPiece) return;

            const shape = nextPiece.shape;
            const color = nextPiece.color;
            const glowBase = nextPiece.glowBase;

            // Calculate bounding box of the piece to center it
            let minR = 4, maxR = 0, minC = 4, maxC = 0;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] === 1) {
                        minR = Math.min(minR, r);
                        maxR = Math.max(maxR, r);
                        minC = Math.min(minC, c);
                        maxC = Math.max(maxC, c);
                    }
                }
            }

            const pieceW = (maxC - minC + 1) * NEXT_BLOCK_SIZE;
            const pieceH = (maxR - minR + 1) * NEXT_BLOCK_SIZE;
            const offsetX = (NEXT_CANVAS_SIZE - pieceW) / 2;
            const offsetY = (NEXT_CANVAS_SIZE - pieceH) / 2;

            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] === 1) {
                        const x = offsetX + (c - minC) * NEXT_BLOCK_SIZE;
                        const y = offsetY + (r - minR) * NEXT_BLOCK_SIZE;

                        // Draw neon block on the next piece canvas
                        const glow = glowBase || 'rgba(255,255,255,';

                        // Shadow/glow
                        nextCtx.save();
                        nextCtx.shadowColor = color;
                        nextCtx.shadowBlur = 10;
                        nextCtx.fillStyle = color;
                        nextCtx.globalAlpha = 0.25;
                        nextCtx.fillRect(x + 1, y + 1, NEXT_BLOCK_SIZE - 2, NEXT_BLOCK_SIZE - 2);
                        nextCtx.restore();

                        // Main block face
                        const grad = nextCtx.createLinearGradient(x, y, x + NEXT_BLOCK_SIZE, y + NEXT_BLOCK_SIZE);
                        grad.addColorStop(0, glow + '0.35)');
                        grad.addColorStop(1, glow + '0.1)');
                        nextCtx.fillStyle = grad;
                        nextCtx.fillRect(x + 1, y + 1, NEXT_BLOCK_SIZE - 2, NEXT_BLOCK_SIZE - 2);

                        // Bright border
                        nextCtx.strokeStyle = color;
                        nextCtx.lineWidth = 1.5;
                        nextCtx.globalAlpha = 1;
                        nextCtx.strokeRect(x + 0.75, y + 0.75, NEXT_BLOCK_SIZE - 1.5, NEXT_BLOCK_SIZE - 1.5);

                        // Inner highlight
                        nextCtx.fillStyle = 'rgba(255,255,255,0.35)';
                        nextCtx.fillRect(x + 3, y + 3, NEXT_BLOCK_SIZE - 8, 2);
                        nextCtx.fillRect(x + 3, y + 3, 2, NEXT_BLOCK_SIZE - 8);

                        nextCtx.globalAlpha = 1;
                    }
                }
            }
        }

        // Place piece on board
        function placePiece() {
            for (let row = 0; row < currentPiece.shape.length; row++) {
                for (let col = 0; col < currentPiece.shape[row].length; col++) {
                    if (currentPiece.shape[row][col] === 1) {
                        const boardY = currentPiece.y + row;
                        const boardX = currentPiece.x + col;
                        if (boardY >= 0) {
                            board[boardY][boardX] = { color: currentPiece.color, glow: currentPiece.glowBase };
                        }
                    }
                }
            }

            // Detect completed lines (starts animation if any found)
            clearLines();

            // If clearing animation started, defer new piece creation
            if (isClearing) {
                currentPiece = null;
                return;
            }

            // Only spawn next piece immediately if not in clearing animation
            if (!isClearing) {
                if (clearingRows.length === 0) {
                    SoundManager.playLockSfx();
                    spawnNextPiece();
                }
            }
            // Otherwise, gameStep will call spawnNextPiece after animation finishes
        }

        // Spawn the next piece and check for game over
        function spawnNextPiece() {
            currentPiece = createPiece();

            if (!isValidMove(currentPiece, 0, 0)) {
                gameOver();
            }
        }

        // Detect completed lines and begin clear/flash animation
        function clearLines() {
            clearingRows = [];

            for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
                let isComplete = true;
                for (let col = 0; col < BOARD_WIDTH; col++) {
                    if (board[row][col] === 0) {
                        isComplete = false;
                        break;
                    }
                }

                if (isComplete) {
                    clearingRows.push(row);
                }
            }

            if (clearingRows.length > 0) {
                clearAnimationStart = performance.now();
                isClearing = true;
                clearingStartTime = performance.now();
                SoundManager.playLineClearSfx(clearingRows.length);
            }
        }

        // Finish clearing after flash animation completes
        function finishClearing() {
            // Sort descending so splicing doesn't shift indices
            clearingRows.sort((a, b) => b - a);
            const linesCleared = clearingRows.length;
            const prevLevel = level;

            for (const row of clearingRows) {
                board.splice(row, 1);
                board.unshift(new Array(BOARD_WIDTH).fill(0));
            }

            if (linesCleared > 0) {
                const lineValues = [0, 40, 100, 300, 1200];
                score += lineValues[linesCleared] * level;
                lines += linesCleared;
                level = Math.floor(lines / 10) + 1;
                updateDisplay();
                if (level > prevLevel) {
                    SoundManager.playLevelUpSfx();
                }
            }

            clearingRows = [];
            isClearing = false;

            // Create new piece after animation
            currentPiece = createPiece();

            // Check game over
            if (!isValidMove(currentPiece, 0, 0)) {
                gameOver();
            }
        }

        // Complete line clear after flash animation finishes
        function completeClear() {
            const linesCleared = clearingRows.length;
            const prevLevel = level;

            // Sort descending so we splice from bottom-up correctly
            clearingRows.sort((a, b) => b - a);

            for (const row of clearingRows) {
                board.splice(row, 1);
                board.unshift(new Array(BOARD_WIDTH).fill(0));
            }

            // Reset clearing state
            clearingRows = [];
            isClearing = false;

            if (linesCleared > 0) {
                const lineValues = [0, 40, 100, 300, 1200];
                score += lineValues[linesCleared] * level;
                lines += linesCleared;
                level = Math.floor(lines / 10) + 1;
                updateDisplay();
                if (level > prevLevel) {
                    SoundManager.playLevelUpSfx();
                }
            }

            // Spawn next piece now that clearing is done
            currentPiece = createPiece();
            if (!isValidMove(currentPiece, 0, 0)) {
                gameOver();
            }
        }

        // Finish clearing: splice rows, update score, spawn next piece
        function finishClearLines() {
            const linesCleared = clearingRows.length;
            const prevLevel = level;

            // Sort descending so splicing from bottom up doesn't shift indices
            clearingRows.sort((a, b) => b - a);
            for (const row of clearingRows) {
                board.splice(row, 1);
                board.unshift(new Array(BOARD_WIDTH).fill(0));
            }

            // Update score
            const lineValues = [0, 40, 100, 300, 1200];
            score += lineValues[linesCleared] * level;
            lines += linesCleared;

            // Level up every 10 lines
            level = Math.floor(lines / 10) + 1;

            updateDisplay();
            if (level > prevLevel) {
                SoundManager.playLevelUpSfx();
            }

            // Reset clearing state
            clearingRows = [];
            clearAnimationStart = 0;
            isClearing = false;
        }

        // Expose ghost piece logic for testing
        window._ghost = {
            getGhostY,
            get currentPiece() { return currentPiece; },
            get board() { return board; },
            BOARD_WIDTH,
            BOARD_HEIGHT
        };

        // Expose flash animation state for testing
        window._flashAnimation = {
            get clearingRows() { return clearingRows; },
            get isClearing() { return isClearing; },
            get clearAnimationStart() { return clearAnimationStart; },
            FLASH_DURATION,
            completeClear
        };

        // Draw grid lines on board
        function drawBoardGrid() {
            ctx.strokeStyle = 'rgba(0, 180, 255, 0.07)';
            ctx.lineWidth = 0.5;
            for (let c = 0; c <= BOARD_WIDTH; c++) {
                ctx.beginPath();
                ctx.moveTo(c * BLOCK_SIZE, 0);
                ctx.lineTo(c * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
                ctx.stroke();
            }
            for (let r = 0; r <= BOARD_HEIGHT; r++) {
                ctx.beginPath();
                ctx.moveTo(0, r * BLOCK_SIZE);
                ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, r * BLOCK_SIZE);
                ctx.stroke();
            }
        }

        // Calculate ghost piece Y position (pure function, testable)
        function getGhostY(piece, boardState) {
            let ghostY = piece.y;
            // Simulate isValidMove inline using boardState
            const canMove = (dy) => {
                for (let row = 0; row < piece.shape.length; row++) {
                    for (let col = 0; col < piece.shape[row].length; col++) {
                        if (piece.shape[row][col] === 1) {
                            const newX = piece.x + col;
                            const newY = piece.y + row + dy;
                            if (newX < 0 || newX >= boardState[0].length ||
                                newY >= boardState.length ||
                                (newY >= 0 && boardState[newY][newX] !== 0)) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };
            while (canMove(ghostY - piece.y + 1)) {
                ghostY++;
            }
            return ghostY;
        }

        // Draw ghost piece (landing preview)
        function drawGhost() {
            if (!currentPiece) return;
            // Don't render ghost during line-clear animations
            if (clearingRows.length > 0) return;

            const ghostY = getGhostY(currentPiece, board);
            if (ghostY === currentPiece.y) return;

            ctx.save();
            for (let row = 0; row < currentPiece.shape.length; row++) {
                for (let col = 0; col < currentPiece.shape[row].length; col++) {
                    if (currentPiece.shape[row][col] === 1) {
                        const x = (currentPiece.x + col) * BLOCK_SIZE;
                        const y = (ghostY + row) * BLOCK_SIZE;
                        // Subtle filled shadow
                        ctx.globalAlpha = 0.08;
                        ctx.fillStyle = currentPiece.color;
                        ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                        // Dashed outline only
                        ctx.globalAlpha = 0.25;
                        ctx.setLineDash([3, 3]);
                        ctx.strokeStyle = currentPiece.color;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x + 0.5, y + 0.5, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                        ctx.setLineDash([]);
                    }
                }
            }
            ctx.restore();
        }

        // Draw the game board
        function drawBoard() {
            // Clear canvas with dark semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 8, 0.95)';
            ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

            // Draw subtle grid
            drawBoardGrid();

            // Draw placed pieces (with flash effect for clearing rows)
            const isClearing = clearingRows.length > 0;
            let flashAlpha = 0;
            if (isClearing) {
                const elapsed = performance.now() - clearAnimationStart;
                const progress = Math.min(elapsed / CLEAR_ANIMATION_DURATION, 1);
                // Pulsing flash: rapid sine oscillation that fades out
                flashAlpha = Math.sin(progress * Math.PI * 4) * (1 - progress);
            }

            for (let row = 0; row < BOARD_HEIGHT; row++) {
                const isClearingRow = clearingRows.includes(row);
                for (let col = 0; col < BOARD_WIDTH; col++) {
                    if (board[row][col] !== 0) {
                        const cell = board[row][col];

                        if (isClearingRow && clearingRows.includes(row)) {
                            // Flash effect: oscillating alpha with bright white/cyan glow
                            const elapsed = performance.now() - clearingStartTime;
                            const progress = elapsed / CLEAR_ANIMATION_DURATION;
                            // Oscillate rapidly (8 Hz flash) with decreasing intensity
                            const flash = Math.abs(Math.sin(progress * Math.PI * 8));
                            const alpha = flash * (1 - progress * 0.5);
                            drawNeonBlock(col * BLOCK_SIZE, row * BLOCK_SIZE, '#ffffff', 'rgba(0,255,255,', alpha);
                            // Additional white overlay pulse
                            ctx.save();
                            ctx.globalAlpha = Math.abs(flashAlpha) * 0.8;
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                            ctx.restore();
                        } else {
                            drawNeonBlock(col * BLOCK_SIZE, row * BLOCK_SIZE, cell.color, cell.glow);
                        }
                    }
                }
            }

            // Draw flash effect on clearing rows
            if (clearingRows.length > 0) {
                const elapsed = performance.now() - clearAnimationStart;
                const progress = Math.min(elapsed / FLASH_DURATION, 1);
                // Pulsing flash: rapid sine oscillation that fades out
                const flashIntensity = Math.abs(Math.sin(progress * Math.PI * 3)) * (1 - progress);

                for (const row of clearingRows) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.85})`;
                    ctx.fillRect(0, row * BLOCK_SIZE, BOARD_WIDTH * BLOCK_SIZE, BLOCK_SIZE);
                }
            }

            // Draw ghost piece
            drawGhost();

            // Draw current piece
            if (currentPiece) {
                for (let row = 0; row < currentPiece.shape.length; row++) {
                    for (let col = 0; col < currentPiece.shape[row].length; col++) {
                        if (currentPiece.shape[row][col] === 1) {
                            const x = (currentPiece.x + col) * BLOCK_SIZE;
                            const y = (currentPiece.y + row) * BLOCK_SIZE;
                            drawNeonBlock(x, y, currentPiece.color, currentPiece.glowBase);
                        }
                    }
                }
            }
        }

        // Update display elements
        function updateDisplay() {
            document.getElementById('score').textContent = score;
            document.getElementById('lines').textContent = lines;
            document.getElementById('level').textContent = level;
        }

        // Game loop
        function gameStep(time) {
            if (!gameRunning || gamePaused) return;

            // During clearing animation, keep rendering but freeze game logic
            if (isClearing) {
                const elapsed = time - clearAnimationStart;
                if (elapsed >= FLASH_DURATION) {
                    completeClear();
                }
                drawBoard();
                gameLoop = requestAnimationFrame(gameStep);
                return;
            }

            // Guard against first-frame spike: skip frame when lastTime is unset
            if (lastTime === 0) {
                lastTime = time;
                gameLoop = requestAnimationFrame(gameStep);
                return;
            }

            // Cap deltaTime to 100ms to prevent huge drops after tab-switch or debugger pause
            const deltaTime = Math.min(time - lastTime, 100);
            lastTime = time;

            // If rows are being cleared, pause piece drops and run animation
            if (clearingRows.length > 0) {
                if (isClearing) {
                    const elapsed = performance.now() - clearingStartTime;
                    if (elapsed >= CLEAR_ANIMATION_DURATION) {
                        finishClearLines();
                        spawnNextPiece();
                        dropTime = 0;
                    }
                }
                drawBoard();
                gameLoop = requestAnimationFrame(gameStep);
                return;
            }

            dropTime += deltaTime;

            // Drop piece based on level (faster as level increases)
            const dropInterval = Math.max(50, 1000 - (level - 1) * 100);

            if (dropTime > dropInterval) {
                if (isValidMove(currentPiece, 0, 1)) {
                    currentPiece.y++;
                } else {
                    placePiece();
                }
                dropTime = 0;
            }

            drawBoard();
            gameLoop = requestAnimationFrame(gameStep);
        }

        // Handle keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                pauseGame();
                return;
            }

            if (e.key === 'm' || e.key === 'M') {
                toggleMute();
                return;
            }

            if (!gameRunning || gamePaused || clearingRows.length > 0 || isClearing) return;

            switch (e.key) {
                case 'ArrowLeft':
                    if (isValidMove(currentPiece, -1, 0)) {
                        currentPiece.x--;
                        SoundManager.playMoveSfx();
                    }
                    break;
                case 'ArrowRight':
                    if (isValidMove(currentPiece, 1, 0)) {
                        currentPiece.x++;
                        SoundManager.playMoveSfx();
                    }
                    break;
                case 'ArrowDown':
                    if (isValidMove(currentPiece, 0, 1)) {
                        currentPiece.y++;
                        score++;
                        updateDisplay();
                    }
                    break;
                case 'ArrowUp':
                    const rotatedShape = rotatePiece(currentPiece.shape);
                    if (isValidMove(currentPiece, 0, 0, rotatedShape)) {
                        currentPiece.shape = rotatedShape;
                        SoundManager.playRotateSfx();
                    }
                    break;
                case ' ':
                    // Hard drop
                    SoundManager.playHardDropSfx();
                    while (isValidMove(currentPiece, 0, 1)) {
                        currentPiece.y++;
                        score += 2;
                    }
                    updateDisplay();
                    placePiece();
                    break;
            }

            drawBoard();
        });

        // ============================================================
        //  TOUCH / SWIPE CONTROLS — Mobile Play Support
        // ============================================================
        (function initTouchControls() {
            const touchTarget = document.getElementById('gameCanvas');

            // ── Tunable thresholds ──────────────────────────────────
            const SWIPE_THRESHOLD    = 30;   // min px distance to register a swipe
            const SWIPE_MAX_TIME     = 400;  // max ms for a gesture to count as swipe
            const TAP_MAX_DISTANCE   = 15;   // max px movement to count as a tap
            const HARD_DROP_VELOCITY = 1.8;  // px/ms — fast downward swipe triggers hard drop
            const LONG_PRESS_DELAY   = 500;  // ms — hold without moving to hard drop
            const CELL_SIZE_PX       = 30;   // px per board cell (matches BLOCK_SIZE)
            const SOFT_DROP_REPEAT   = 80;   // ms interval for continuous soft drop

            // ── Touch state ─────────────────────────────────────────
            let touchStartX      = 0;
            let touchStartY      = 0;
            let touchStartTime   = 0;
            let isTouching       = false;
            let softDropInterval = null;
            let longPressTimer   = null;
            let dragCellsX       = 0;   // how many full cells dragged horizontally
            let dragCellsY       = 0;   // how many full cells dragged vertically
            let gestureDecided   = false; // true once we've committed to drag/long-press

            // Prevent scrolling / zooming on the game canvas
            touchTarget.addEventListener('touchstart', handleTouchStart, { passive: false });
            touchTarget.addEventListener('touchmove', handleTouchMove, { passive: false });
            touchTarget.addEventListener('touchend', handleTouchEnd, { passive: false });
            touchTarget.addEventListener('touchcancel', handleTouchCancel, { passive: false });

            function handleTouchStart(e) {
                e.preventDefault();
                if (e.touches.length !== 1) return; // ignore multi-touch

                const touch = e.touches[0];
                touchStartX    = touch.clientX;
                touchStartY    = touch.clientY;
                touchStartTime = Date.now();
                isTouching     = true;
                dragCellsX     = 0;
                dragCellsY     = 0;
                gestureDecided = false;

                clearSoftDrop();
                clearLongPress();

                // Start long-press timer — fires hard drop if finger stays still
                if (gameRunning && !gamePaused && !isClearing) {
                    longPressTimer = setTimeout(function () {
                        longPressTimer = null;
                        if (!isTouching || !gameRunning || gamePaused || isClearing) return;
                        if (!currentPiece) return;
                        gestureDecided = true;

                        // Hard drop
                        while (isValidMove(currentPiece, 0, 1)) {
                            currentPiece.y++;
                            score += 2;
                        }
                        updateDisplay();
                        placePiece();
                        drawBoard();
                        isTouching = false;
                    }, LONG_PRESS_DELAY);
                }
            }

            function handleTouchMove(e) {
                e.preventDefault(); // prevent scroll while playing
                if (!isTouching) return;
                if (!gameRunning || gamePaused || isClearing) return;
                if (!currentPiece) return;

                const touch = e.touches[0];
                const dx = touch.clientX - touchStartX;
                const dy = touch.clientY - touchStartY;
                const totalDistance = Math.sqrt(dx * dx + dy * dy);

                // If finger moves beyond tap threshold, cancel long-press
                if (totalDistance > TAP_MAX_DISTANCE) {
                    clearLongPress();
                    gestureDecided = true;
                }

                // ── Drag left/right — move one cell per CELL_SIZE_PX of drag ──
                const cellDx = Math.floor((touch.clientX - touchStartX) / CELL_SIZE_PX);
                if (cellDx !== dragCellsX) {
                    const delta = cellDx - dragCellsX;
                    const dir = delta > 0 ? 1 : -1;
                    const steps = Math.abs(delta);
                    for (let i = 0; i < steps; i++) {
                        if (isValidMove(currentPiece, dir, 0)) {
                            currentPiece.x += dir;
                        }
                    }
                    dragCellsX = cellDx;
                    drawBoard();
                }

                // ── Drag down — soft drop one cell per CELL_SIZE_PX of downward drag ──
                const cellDy = Math.floor((touch.clientY - touchStartY) / CELL_SIZE_PX);
                if (cellDy > dragCellsY && cellDy > 0) {
                    const dropSteps = cellDy - dragCellsY;
                    for (let i = 0; i < dropSteps; i++) {
                        if (isValidMove(currentPiece, 0, 1)) {
                            currentPiece.y++;
                            score++;
                        }
                    }
                    dragCellsY = cellDy;
                    updateDisplay();
                    drawBoard();
                }
            }

            function handleTouchEnd(e) {
                e.preventDefault();
                if (!isTouching) return;
                isTouching = false;

                clearLongPress();
                clearSoftDrop();

                // If gesture was already handled (drag or long-press), skip end logic
                if (gestureDecided) return;

                // Ignore if game isn't active or clearing animation in progress
                if (!gameRunning || gamePaused || isClearing) return;
                if (!currentPiece) return;

                const touch = e.changedTouches[0];
                const dx = touch.clientX - touchStartX;
                const dy = touch.clientY - touchStartY;
                const dt = Date.now() - touchStartTime;
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);
                const distance = Math.sqrt(dx * dx + dy * dy);

                // ── TAP → Rotate ────────────────────────────────
                if (distance < TAP_MAX_DISTANCE && dt < SWIPE_MAX_TIME) {
                    const rotatedShape = rotatePiece(currentPiece.shape);
                    if (isValidMove(currentPiece, 0, 0, rotatedShape)) {
                        currentPiece.shape = rotatedShape;
                    }
                    drawBoard();
                    return;
                }

                // ── SWIPE detection ─────────────────────────────
                if (distance >= SWIPE_THRESHOLD && dt < SWIPE_MAX_TIME) {
                    const velocity = distance / dt; // px per ms

                    if (absDx > absDy) {
                        // Horizontal swipe
                        if (dx < 0) {
                            // Swipe LEFT → move piece left
                            if (isValidMove(currentPiece, -1, 0)) {
                                currentPiece.x--;
                            }
                        } else {
                            // Swipe RIGHT → move piece right
                            if (isValidMove(currentPiece, 1, 0)) {
                                currentPiece.x++;
                            }
                        }
                    } else {
                        // Vertical swipe
                        if (dy > 0) {
                            // Swipe DOWN
                            if (velocity >= HARD_DROP_VELOCITY) {
                                // Fast swipe → hard drop
                                while (isValidMove(currentPiece, 0, 1)) {
                                    currentPiece.y++;
                                    score += 2;
                                }
                                updateDisplay();
                                placePiece();
                            } else {
                                // Slow swipe → soft drop (move down once)
                                if (isValidMove(currentPiece, 0, 1)) {
                                    currentPiece.y++;
                                    score++;
                                    updateDisplay();
                                }
                            }
                        } else {
                            // Swipe UP → rotate
                            const rotatedShape = rotatePiece(currentPiece.shape);
                            if (isValidMove(currentPiece, 0, 0, rotatedShape)) {
                                currentPiece.shape = rotatedShape;
                            }
                        }
                    }

                    drawBoard();
                }
            }

            function handleTouchCancel(e) {
                isTouching = false;
                clearLongPress();
                clearSoftDrop();
            }

            function clearLongPress() {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }

            function clearSoftDrop() {
                if (softDropInterval) {
                    clearInterval(softDropInterval);
                    softDropInterval = null;
                }
            }

            // Expose for testing
            window._touchControls = {
                SWIPE_THRESHOLD,
                SWIPE_MAX_TIME,
                TAP_MAX_DISTANCE,
                HARD_DROP_VELOCITY,
                LONG_PRESS_DELAY,
                CELL_SIZE_PX,
                handleTouchStart,
                handleTouchMove,
                handleTouchEnd,
                handleTouchCancel
            };
        })();

        // ============================================================
        //  LEADERBOARD — localStorage High Score Persistence
        // ============================================================
        const LEADERBOARD_KEY = 'tetris_leaderboard';
        const MAX_LEADERBOARD_ENTRIES = 10;

        function getLeaderboard() {
            try {
                const data = localStorage.getItem(LEADERBOARD_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        }

        function saveScore(initials, scoreVal, linesVal) {
            const leaderboard = getLeaderboard();
            leaderboard.push({
                initials: initials.toUpperCase().substring(0, 3),
                score: scoreVal,
                lines: linesVal,
                date: Date.now()
            });
            leaderboard.sort((a, b) => b.score - a.score);
            if (leaderboard.length > MAX_LEADERBOARD_ENTRIES) {
                leaderboard.length = MAX_LEADERBOARD_ENTRIES;
            }
            try {
                localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
            } catch (e) {
                // Storage full or unavailable
            }
            return leaderboard;
        }

        function isHighScore(scoreVal) {
            if (scoreVal <= 0) return false;
            const leaderboard = getLeaderboard();
            if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) return true;
            return scoreVal > leaderboard[leaderboard.length - 1].score;
        }

        function renderLeaderboard() {
            const tbody = document.getElementById('leaderboardBody');
            if (!tbody) return;
            const leaderboard = getLeaderboard();
            tbody.innerHTML = '';
            if (leaderboard.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="4" style="text-align:center;color:rgba(255,255,255,0.5);padding:8px;">No scores yet</td>';
                tbody.appendChild(tr);
                return;
            }
            leaderboard.forEach((entry, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${i + 1}</td><td>${entry.initials}</td><td>${entry.score}</td><td>${entry.lines}</td>`;
                tbody.appendChild(tr);
            });
        }

        function submitScore() {
            const input = document.getElementById('initialsInput');
            if (!input) return;
            const initials = input.value.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
            if (initials.length === 0) return;
            saveScore(initials, score, lines);
            renderLeaderboard();
            // Hide the initials input section
            const section = document.getElementById('highScoreSection');
            if (section) section.style.display = 'none';
            input.value = '';
        }

        function clearLeaderboard() {
            localStorage.removeItem(LEADERBOARD_KEY);
            renderLeaderboard();
        }

        // Expose leaderboard functions for testing
        window._leaderboard = {
            getLeaderboard,
            saveScore,
            isHighScore,
            renderLeaderboard,
            submitScore,
            clearLeaderboard,
            LEADERBOARD_KEY,
            MAX_LEADERBOARD_ENTRIES
        };

        // Game control functions
        function startGame() {
            if (gameRunning) return;

            initBoard();
            nextPiece = null; // Reset so createPiece generates fresh
            currentPiece = createPiece();
            gameRunning = true;
            gamePaused = false;
            score = 0;
            lines = 0;
            level = 1;
            dropTime = 0;
            lastTime = 0;
            clearingRows = [];
            clearAnimationStart = 0;
            isClearing = false;

            updateDisplay();
            document.getElementById('gameOverModal').style.display = 'none';
            document.getElementById('startBtn').style.display = 'none';

            SoundManager.startMusic();
            gameLoop = requestAnimationFrame(gameStep);
        }

        function pauseGame() {
            if (!gameRunning) return;

            gamePaused = !gamePaused;
            document.getElementById('pauseBtn').textContent = gamePaused ? 'Resume' : 'Pause';

            if (gamePaused) {
                SoundManager.pauseMusic();
            } else {
                SoundManager.resumeMusic();
                lastTime = performance.now();
                gameLoop = requestAnimationFrame(gameStep);
            }
        }

        // Pause automatically when the browser tab becomes hidden to prevent
        // pieces from falling and locking without player input (Page Visibility API)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && gameRunning && !gamePaused) {
                pauseGame();
            }
        });

        function restartGame() {
            gameRunning = false;
            gamePaused = false;
            clearingRows = [];
            clearAnimationStart = 0;
            isClearing = false;
            nextPiece = null;
            SoundManager.stopMusic();
            if (gameLoop) {
                cancelAnimationFrame(gameLoop);
            }

            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('pauseBtn').textContent = 'Pause';
            document.getElementById('gameOverModal').style.display = 'none';

            // Clear the board
            ctx.fillStyle = 'rgba(0, 0, 8, 0.95)';
            ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            drawBoardGrid();

            // Clear the next piece preview
            nextCtx.fillStyle = 'rgba(0, 0, 8, 0.95)';
            nextCtx.fillRect(0, 0, NEXT_CANVAS_SIZE, NEXT_CANVAS_SIZE);
        }

        function gameOver() {
            gameRunning = false;
            gamePaused = false;
            SoundManager.stopMusic();
            SoundManager.playGameOverSfx();

            document.getElementById('finalScore').textContent = score;
            document.getElementById('finalLines').textContent = lines;
            document.getElementById('gameOverModal').style.display = 'block';
            document.getElementById('startBtn').style.display = 'inline-block';

            // Show/hide initials input based on high score qualification
            const highScoreSection = document.getElementById('highScoreSection');
            if (highScoreSection) {
                if (isHighScore(score)) {
                    highScoreSection.style.display = 'block';
                    const input = document.getElementById('initialsInput');
                    if (input) {
                        input.value = '';
                        input.focus();
                    }
                } else {
                    highScoreSection.style.display = 'none';
                }
            }

            // Always render leaderboard on game over
            renderLeaderboard();

            if (gameLoop) {
                cancelAnimationFrame(gameLoop);
            }
        }

        function startNewGame() {
            document.getElementById('gameOverModal').style.display = 'none';
            startGame();
        }

        // Toggle mute state and update button label
        function toggleMute() {
            const isMuted = SoundManager.toggleMute();
            const btn = document.getElementById('muteBtn');
            if (btn) {
                btn.textContent = isMuted ? 'Unmute' : 'Mute';
                if (isMuted) {
                    btn.classList.add('muted');
                } else {
                    btn.classList.remove('muted');
                }
            }
        }

        // Initialize mute button state from localStorage on load
        (function initMuteButton() {
            var isMuted = false;
            try {
                isMuted = localStorage.getItem(SoundManager.MUTE_KEY) === 'true';
            } catch (_e) { /* localStorage unavailable */ }
            var btn = document.getElementById('muteBtn');
            if (btn) {
                btn.textContent = isMuted ? 'Unmute' : 'Mute';
                if (isMuted) {
                    btn.classList.add('muted');
                }
            }
        })();

        // Initialize display
        updateDisplay();
        // Draw initial board grid
        ctx.fillStyle = 'rgba(0, 0, 8, 0.95)';
        ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
        drawBoardGrid();
        // Clear next piece preview
        nextCtx.fillStyle = 'rgba(0, 0, 8, 0.95)';
        nextCtx.fillRect(0, 0, NEXT_CANVAS_SIZE, NEXT_CANVAS_SIZE);
        // Initialize leaderboard display
        renderLeaderboard();
