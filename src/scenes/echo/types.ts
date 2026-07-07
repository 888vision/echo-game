// ============================================================
// ECHO — 回声
// A game about sound becoming light, light becoming world
// ============================================================

import type { Vec2 } from './types';

// --- Color palettes for different sound colors ---
export const PALETTE = {
  gold:   { r: 232, g: 168, b: 124 },  // 暖金 — 基础声波
  silver: { r: 194, g: 195, b: 210 },  // 银白 — 反射声波
  violet: { r: 108, g: 92,  b: 231 },  // 紫   — 深层回声
  blue:   { r: 116, g: 185, b: 255 },  // 蓝   — 水/雨
  rose:   { r: 253, g: 121, b: 168 },  // 玫红 — 蝴蝶/生命
  green:  { r: 85,  g: 239, b: 196 },  // 绿   — 植物/生长
};

export type SoundColor = keyof typeof PALETTE;

// --- Room / Chapter definitions ---
export interface RoomDef {
  id: string;
  chapter: number;
  name: string;
  nameZh: string;
  width: number;
  height: number;
  walls: Wall[];
  triggers: Trigger[];
  butterflies: ButterflyDef[];
  echoes: EchoDef[];
  decorations: Decoration[];
  ambientColor: string;
  openingText: string;
  openingTextZh: string;
}

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  reflectivity?: number; // 0-1, how much sound bounces
  resonant?: boolean;    // can be activated by resonance
  symbol?: string;       // carved symbol on the wall
}

export interface Trigger {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'door' | 'bridge' | 'light' | 'symbol' | 'portal';
  activated: boolean;
  requiredColor?: SoundColor;
  requiresEcho?: string;  // echo fragment ID needed
  onActivate?: string;    // effect to trigger
}

export interface ButterflyDef {
  id: string;
  x: number;
  y: number;
  color: SoundColor;
  awake: boolean;
  follows: boolean;
}

export interface EchoDef {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  text: string;
  textZh: string;
  soundColor: SoundColor;
}

export interface Decoration {
  type: 'pillar' | 'floor_tile' | 'carving' | 'dust' | 'water_drop';
  x: number;
  y: number;
  size: number;
  opacity: number;
}

// --- Active game objects ---
export interface SoundWave {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  color: SoundColor;
  opacity: number;
  alive: boolean;
  reflections: number; // how many times bounced
  maxReflections: number;
  trail: Vec2[];
}

export interface Butterfly {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: SoundColor;
  awake: boolean;
  follows: boolean;
  wingAngle: number;
  wingSpeed: number;
  wanderTimer: number;
}

export interface EchoFragment {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  text: string;
  textZh: string;
  soundColor: SoundColor;
  glowPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'dust' | 'rain' | 'snow' | 'star';
}

export interface Door {
  x: number;
  y: number;
  w: number;
  h: number;
  opened: boolean;
  targetRoom?: string;
}

export interface Bridge {
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}

export interface LightNode {
  x: number;
  y: number;
  radius: number;
  lit: boolean;
  connections: string[]; // IDs of other nodes it connects to
}

// --- Game State ---
export interface EchoState {
  chapter: number;
  room: RoomDef | null;
  soundWaves: SoundWave[];
  butterflies: Butterfly[];
  echoFragments: EchoFragment[];
  doors: Door[];
  bridges: Bridge[];
  lightNodes: LightNode[];
  particles: Particle[];
  collectedEchoes: string[];
  resonance: number; // 0-100, grows as you explore
  textQueue: TextLine[];
  currentText: string;
  currentTextZh: string;
  textIndex: number;
  showText: boolean;
  showStory: boolean;
  storyText: string;
  storyTextZh: string;
  gameOver: boolean;
  completed: boolean;
  time: number;
  lastTap: number;
  ambientParticles: Particle[];
  camera: { x: number; y: number; shake: number; zoom: number };
}

export interface TextLine {
  text: string;
  textZh: string;
  delay: number; // frames to wait before showing
}
