// ============================================================
// ECHO — 回声  |  Core Game Engine
// Sound wave physics, rendering, game loop
// ============================================================
import type {
  EchoState, SoundWave, Butterfly, EchoFragment, Particle, Vec2,
  Door, Bridge, LightNode, TextLine, SoundColor,
} from './types';
import { ROOMS, getRoomsByChapter } from './rooms';
import { PALETTE } from './types';

// --- Audio Context (lazy init) ---
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

function playTapSound(color: SoundColor = 'gold', distance: number = 0) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // Base frequency depends on color
    const freqMap: Record<SoundColor, number> = {
      gold: 440, silver: 520, violet: 330, blue: 380, rose: 560, green: 480,
    };
    const baseFreq = freqMap[color] || 440;

    // Oscillator — the tap sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    // Reverb — delayed echo
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.15 + distance * 0.01;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.3;
    const delayOsc = ctx.createOscillator();
    const delayGain2 = ctx.createGain();
    delayOsc.type = 'sine';
    delayOsc.frequency.value = baseFreq * 0.8;
    delayGain2.gain.setValueAtTime(0.08, ctx.currentTime);
    delayGain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    delayOsc.connect(delayGain2);
    delayGain2.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(ctx.destination);
    delayOsc.start(ctx.currentTime);
    delayOsc.stop(ctx.currentTime + 0.8);
  } catch { /* audio not available */ }
}

function playAmbientHum() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 60;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    // Stop after 2 seconds
    setTimeout(() => { try { osc.stop(); } catch {} }, 2000);
  } catch {}
}

// --- Color helpers ---
function colorStr(c: SoundColor, alpha: number = 1): string {
  const p = PALETTE[c];
  return `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
}

function hexColor(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

// --- State initialization ---
function createInitialState(): EchoState {
  return {
    chapter: 0,
    room: null,
    soundWaves: [],
    butterflies: [],
    echoFragments: [],
    doors: [],
    bridges: [],
    lightNodes: [],
    particles: [],
    collectedEchoes: [],
    resonance: 0,
    textQueue: [],
    currentText: '',
    currentTextZh: '',
    textIndex: 0,
    showText: false,
    showStory: false,
    storyText: '',
    storyTextZh: '',
    gameOver: false,
    completed: false,
    time: 0,
    lastTap: 0,
    ambientParticles: [],
    camera: { x: 0, y: 0, shake: 0, zoom: 1 },
  };
}

function loadRoom(chapter: number): EchoState {
  const state = createInitialState();
  state.chapter = chapter;
  const rooms = getRoomsByChapter(chapter);
  if (rooms.length === 0) {
    state.completed = true;
    return state;
  }
  state.room = { ...rooms[0] };
  // Deep copy mutable state
  state.room.walls = rooms[0].walls.map(w => ({ ...w }));
  state.room.triggers = rooms[0].triggers.map(t => ({ ...t }));
  state.room.butterflies = rooms[0].butterflies.map(b => ({ ...b }));
  state.room.echoes = rooms[0].echoes.map(e => ({ ...e }));
  state.room.decorations = rooms[0].decorations.map(d => ({ ...d }));

  // Init butterflies
  state.butterflies = rooms[0].butterflies.map(b => ({
    ...b,
    targetX: b.x,
    targetY: b.y,
    wingAngle: 0,
    wingSpeed: 3 + Math.random() * 2,
    wanderTimer: 0,
  }));

  // Init echo fragments
  state.echoFragments = rooms[0].echoes.map(e => ({
    ...e,
    glowPhase: Math.random() * Math.PI * 2,
  }));

  // Init ambient particles
  for (let i = 0; i < 30; i++) {
    state.ambientParticles.push({
      x: Math.random() * rooms[0].width,
      y: Math.random() * rooms[0].height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.3 - 0.1,
      life: Math.random() * 200,
      maxLife: 200,
      color: 'rgba(245, 240, 232, 0.15)',
      size: Math.random() * 2 + 0.5,
      type: 'dust',
    });
  }

  return state;
}

// --- Sound wave physics ---
function spawnSoundWave(state: EchoState, x: number, y: number, color: SoundColor = 'gold', maxRadius: number = 300, reflections: number = 3): SoundWave {
  return {
    id: `sw_${Date.now()}_${Math.random()}`,
    x, y,
    radius: 5,
    maxRadius,
    speed: 3,
    color,
    opacity: 0.8,
    alive: true,
    reflections,
    maxReflections: reflections,
    trail: [],
  };
}

function checkWallCollision(sw: SoundWave, wall: { x: number; y: number; w: number; h: number }): boolean {
  // Check if wave circle intersects wall rectangle
  const closestX = Math.max(wall.x, Math.min(sw.x, wall.x + wall.w));
  const closestY = Math.max(wall.y, Math.min(sw.y, wall.y + wall.h));
  const dx = sw.x - closestX;
  const dy = sw.y - closestY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < sw.radius;
}

function reflectSoundWave(sw: SoundWave, wall: { x: number; y: number; w: number; h: number }): SoundWave[] {
  // Create a reflected wave from the wall
  const closestX = Math.max(wall.x, Math.min(sw.x, wall.x + wall.w));
  const closestY = Math.max(wall.y, Math.min(sw.y, wall.y + wall.h));

  // Direction from closest point to wave center
  const dx = sw.x - closestX;
  const dy = sw.y - closestY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  const reflected: SoundWave[] = [];
  if (wall.w > wall.h) {
    // Horizontal wall — flip Y
    reflected.push({
      ...sw,
      id: `sw_r_${Date.now()}`,
      x: closestX,
      y: closestY,
      radius: 5,
      maxRadius: sw.maxRadius * 0.6,
      reflections: sw.reflections - 1,
      opacity: sw.opacity * 0.5,
      alive: sw.reflections > 0,
    });
  } else {
    // Vertical wall — flip X
    reflected.push({
      ...sw,
      id: `sw_r_${Date.now()}`,
      x: closestX,
      y: closestY,
      radius: 5,
      maxRadius: sw.maxRadius * 0.6,
      reflections: sw.reflections - 1,
      opacity: sw.opacity * 0.5,
      alive: sw.reflections > 0,
    });
  }
  return reflected;
}

function updateSoundWave(sw: SoundWave, state: EchoState) {
  if (!sw.alive) return;

  sw.radius += sw.speed;
  sw.opacity = Math.max(0, 1 - sw.radius / sw.maxRadius);

  // Check wall collisions
  if (sw.reflections > 0 && state.room) {
    for (const wall of state.room.walls) {
      if (checkWallCollision(sw, wall)) {
        const reflected = reflectSoundWave(sw, wall);
        state.soundWaves.push(...reflected);
        sw.alive = false;
        break;
      }
    }
  }

  // Check triggers
  if (state.room) {
    for (const trigger of state.room.triggers) {
      if (trigger.activated) continue;
      const dx = sw.x - trigger.x;
      const dy = sw.y - trigger.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < sw.radius && d > sw.radius - 20) {
        // Check color requirement
        if (!trigger.requiredColor || trigger.requiredColor === sw.color) {
          trigger.activated = true;
          // Activate door
          if (trigger.type === 'door' && trigger.onActivate) {
            activateDoor(state, trigger.onActivate);
          }
          // Spawn particles
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            state.particles.push({
              x: trigger.x, y: trigger.y,
              vx: Math.cos(angle) * (1 + Math.random() * 2),
              vy: Math.sin(angle) * (1 + Math.random() * 2),
              life: 0, maxLife: 40 + Math.random() * 20,
              color: colorStr(sw.color, 0.8),
              size: 2 + Math.random() * 3,
              type: 'spark',
            });
          }
        }
      }
    }
  }

  // Check echo collection
  if (state.room) {
    for (const echo of state.echoFragments) {
      if (echo.collected) continue;
      const dx = sw.x - echo.x;
      const dy = sw.y - echo.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < sw.radius && d > sw.radius - 15) {
        echo.collected = true;
        state.collectedEchoes.push(echo.id);
        state.resonance = Math.min(100, state.resonance + 5);
        playTapSound(echo.soundColor, 0);
        // Big particle burst
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          state.particles.push({
            x: echo.x, y: echo.y,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3),
            life: 0, maxLife: 60 + Math.random() * 30,
            color: colorStr(echo.soundColor, 1),
            size: 2 + Math.random() * 4,
            type: 'spark',
          });
        }
      }
    }
  }

  if (sw.radius >= sw.maxRadius) sw.alive = false;
}

function activateDoor(state: EchoState, doorId: string) {
  // Find and open the corresponding door
  for (const door of state.doors) {
    if (door.id === doorId.replace('open_door_', '')) {
      door.opened = true;
    }
  }
}

// --- Butterfly AI ---
function updateButterfly(b: Butterfly, state: EchoState, dt: number) {
  if (!b.awake) return;

  b.wingAngle += b.wingSpeed * dt;

  if (b.follows) {
    // Follow player (center of screen)
    const targetX = state.camera.x + 100;
    const targetY = state.camera.y + 100;
    const dx = targetX - b.x;
    const dy = targetY - b.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 5) {
      b.x += (dx / d) * 2 * dt * 60;
      b.y += (dy / d) * 2 * dt * 60;
    }
  } else {
    // Wander
    b.wanderTimer -= dt * 60;
    if (b.wanderTimer <= 0) {
      b.targetX = b.x + (Math.random() - 0.5) * 200;
      b.targetY = b.y + (Math.random() - 0.5) * 200;
      b.wanderTimer = 60 + Math.random() * 120;
    }
    const dx = b.targetX - b.x;
    const dy = b.targetY - b.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 2) {
      b.x += (dx / d) * 1.5 * dt * 60;
      b.y += (dy / d) * 1.5 * dt * 60;
    }
  }
}

// --- Particles ---
function updateParticles(particles: Particle[], dt: number) {
  for (const p of particles) {
    p.life += dt * 60;
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    if (p.type === 'spark') {
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
  }
}

// --- Rendering ---
function drawRoom(ctx: CanvasRenderingContext2D, state: EchoState, w: number, h: number) {
  if (!state.room) return;

  const room = state.room;

  // Background — pure black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Camera transform
  ctx.save();
  ctx.translate(-state.camera.x, -state.camera.y);

  // Apply shake
  if (state.camera.shake > 0.5) {
    ctx.translate(
      (Math.random() - 0.5) * state.camera.shake * 2,
      (Math.random() - 0.5) * state.camera.shake * 2
    );
  }

  // Draw decorations (pillars, carvings) — dim outlines
  for (const dec of room.decorations) {
    ctx.globalAlpha = dec.opacity;
    ctx.strokeStyle = 'rgba(245, 240, 232, 0.3)';
    ctx.lineWidth = 1;

    if (dec.type === 'pillar') {
      ctx.strokeRect(dec.x - dec.size / 2, dec.y - dec.size * 2, dec.size, dec.size * 2);
    } else if (dec.type === 'carving') {
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, dec.size / 2, 0, Math.PI * 2);
      ctx.stroke();
      // Inner symbol
      ctx.font = `${dec.size * 0.4}px 'Cormorant Garamond', serif`;
      ctx.fillStyle = 'rgba(245, 240, 232, 0.2)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦', dec.x, dec.y);
    } else if (dec.type === 'dust') {
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 240, 232, 0.1)';
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Draw walls
  for (const wall of room.walls) {
    ctx.fillStyle = 'rgba(245, 240, 232, 0.06)';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

    // Wall edge highlight
    ctx.strokeStyle = 'rgba(245, 240, 232, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

    // Resonant symbol
    if (wall.symbol) {
      ctx.font = '16px Georgia, serif';
      ctx.fillStyle = 'rgba(245, 240, 232, 0.15)';
      ctx.textAlign = 'center';
      ctx.fillText(wall.symbol, wall.x + wall.w / 2, wall.y + wall.h / 2 + 5);
    }
  }

  // Draw doors
  for (const door of state.doors) {
    if (!door.opened) {
      ctx.fillStyle = 'rgba(20, 20, 30, 0.8)';
      ctx.fillRect(door.x, door.y, door.w, door.h);
      ctx.strokeStyle = 'rgba(232, 168, 124, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(door.x, door.y, door.w, door.h);
      // Lock symbol
      ctx.font = '14px Georgia, serif';
      ctx.fillStyle = 'rgba(232, 168, 124, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('🔒', door.x + door.w / 2, door.y + door.h / 2 + 5);
    } else {
      // Open door — portal glow
      const pulse = Math.sin(state.time * 3) * 0.3 + 0.5;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = colorStr('gold', 0.2);
      ctx.fillRect(door.x, door.y, door.w, door.h);
      ctx.globalAlpha = 1;
    }
  }

  // Draw bridges
  for (const bridge of state.bridges) {
    if (bridge.visible) {
      ctx.globalAlpha = 0.4 + Math.sin(state.time * 2) * 0.1;
      ctx.fillStyle = colorStr('silver', 0.3);
      ctx.fillRect(bridge.x, bridge.y, bridge.w, bridge.h);
      ctx.globalAlpha = 1;
    }
  }

  // Draw triggers (dim indicators)
  for (const trigger of room.triggers) {
    if (!trigger.activated) {
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.arc(trigger.x, trigger.y, trigger.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 240, 232, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // Draw echo fragments
  for (const echo of state.echoFragments) {
    if (echo.collected) continue;
    echo.glowPhase += 0.02;
    const pulse = Math.sin(echo.glowPhase) * 0.3 + 0.7;
    ctx.globalAlpha = pulse * 0.6;

    // Glow
    const grad = ctx.createRadialGradient(echo.x, echo.y, 0, echo.x, echo.y, echo.radius * 2);
    grad.addColorStop(0, colorStr(echo.soundColor, 0.4));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(echo.x - echo.radius * 2, echo.y - echo.radius * 2, echo.radius * 4, echo.radius * 4);

    // Core
    ctx.beginPath();
    ctx.arc(echo.x, echo.y, echo.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = colorStr(echo.soundColor, 0.8);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  // Draw butterflies
  for (const b of state.butterflies) {
    if (!b.awake) continue;
    const wingFlap = Math.sin(b.wingAngle) * 0.4;

    // Glow
    ctx.globalAlpha = 0.3;
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 30);
    grad.addColorStop(0, colorStr(b.color, 0.3));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(b.x - 30, b.y - 30, 60, 60);
    ctx.globalAlpha = 1;

    // Wings
    ctx.save();
    ctx.translate(b.x, b.y);
    // Left wing
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = colorStr(b.color, 0.6);
    ctx.beginPath();
    ctx.ellipse(-8, 0, 10, 6 * (1 - wingFlap), -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(8, 0, 10, 6 * (1 - wingFlap), 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = colorStr(b.color, 0.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Draw sound waves
  for (const sw of state.soundWaves) {
    if (!sw.alive) continue;

    // Main ring
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = colorStr(sw.color, sw.opacity * 0.8);
    ctx.lineWidth = 2 + sw.opacity * 2;
    ctx.shadowColor = colorStr(sw.color, 1);
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner glow
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = colorStr(sw.color, sw.opacity * 0.3);
    ctx.lineWidth = 8 + sw.opacity * 8;
    ctx.stroke();

    // Trail dots
    if (sw.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(sw.trail[0].x, sw.trail[0].y);
      for (let i = 1; i < sw.trail.length; i++) {
        ctx.lineTo(sw.trail[i].x, sw.trail[i].y);
      }
      ctx.strokeStyle = colorStr(sw.color, sw.opacity * 0.2);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Draw particles
  for (const p of state.particles) {
    if (p.life >= p.maxLife) continue;
    const alpha = 1 - p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Draw ambient particles
  for (const p of state.ambientParticles) {
    if (p.life >= p.maxLife) continue;
    const alpha = (1 - p.life / p.maxLife) * 0.3;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 240, 232, 0.3)';
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

// --- Update loop ---
function update(state: EchoState, dt: number) {
  if (state.completed || state.gameOver) return;
  state.time += dt;

  // Update sound waves
  for (const sw of state.soundWaves) {
    updateSoundWave(sw, state);
  }
  state.soundWaves = state.soundWaves.filter(sw => sw.alive);

  // Update butterflies
  for (const b of state.butterflies) {
    updateButterfly(b, state, dt);
  }

  // Update particles
  updateParticles(state.particles, dt);
  state.particles = state.particles.filter(p => p.life < p.maxLife);

  // Update ambient particles
  for (const p of state.ambientParticles) {
    p.life += dt * 60;
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    if (p.life >= p.maxLife) {
      p.life = 0;
      p.x = Math.random() * (state.room?.width || 1200);
      p.y = state.room?.height || 800;
    }
  }

  // Camera follows center
  if (state.room) {
    const targetX = state.room.width / 2 - 400;
    const targetY = state.room.height / 2 - 300;
    state.camera.x += (targetX - state.camera.x) * 0.02;
    state.camera.y += (targetY - state.camera.y) * 0.02;
  }

  // Shake decay
  if (state.camera.shake > 0) state.camera.shake *= 0.95;
  if (state.camera.shake < 0.1) state.camera.shake = 0;
}

// --- Tap handler ---
function handleTap(state: EchoState, screenX: number, screenY: number, color: SoundColor = 'gold', duration: number = 0) {
  if (state.completed || state.gameOver) return;
  if (!state.room) return;

  // Convert screen coords to world coords
  const worldX = screenX + state.camera.x;
  const worldY = screenY + state.camera.y;

  // Spawn sound wave
  const maxRadius = 200 + duration * 300;
  const wave = spawnSoundWave(state, worldX, worldY, color, maxRadius);
  state.soundWaves.push(wave);

  // Play sound
  playTapSound(color, duration);

  // Spawn ripple particles at tap point
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    state.particles.push({
      x: worldX, y: worldY,
      vx: Math.cos(angle) * (0.5 + Math.random()),
      vy: Math.sin(angle) * (0.5 + Math.random()),
      life: 0, maxLife: 30 + Math.random() * 20,
      color: colorStr(color, 0.6),
      size: 1 + Math.random() * 2,
      type: 'spark',
    });
  }

  // Check if wave wakes up butterflies
  if (state.room) {
    for (const bDef of state.room.butterflies) {
      const b = state.butterflies.find(b => b.id === bDef.id);
      if (b && !b.awake) {
        const dx = worldX - bDef.x;
        const dy = worldY - bDef.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxRadius) {
          b.awake = true;
          playTapSound(b.color, 0);
          // Sparkle burst
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            state.particles.push({
              x: bDef.x, y: bDef.y,
              vx: Math.cos(angle) * (1 + Math.random() * 3),
              vy: Math.sin(angle) * (1 + Math.random() * 3),
              life: 0, maxLife: 50,
              color: colorStr(b.color, 1),
              size: 2 + Math.random() * 3,
              type: 'spark',
            });
          }
        }
      }
    }
  }

  // Screen shake
  state.camera.shake = Math.min(8, 2 + duration * 3);

  // Check if all echoes collected → advance chapter
  if (state.room && state.room.echoes.every(e => e.collected)) {
    // Small delay before advancing
    setTimeout(() => {
      if (state.chapter < 6 && !state.completed) {
        // Could advance to next chapter here
      }
    }, 1000);
  }
}

// --- Export ---
export {
  createInitialState,
  loadRoom,
  update,
  drawRoom,
  handleTap,
  playAmbientHum,
};
