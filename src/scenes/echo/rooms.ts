import type { RoomDef } from './types';

export const ROOMS: RoomDef[] = [
  // === Chapter 1: Awakening ===
  {
    id: 'ch1_room1',
    chapter: 1,
    name: 'The First Strike',
    nameZh: '第一声敲击',
    width: 1200,
    height: 800,
    walls: [
      { x: 0, y: 0, w: 1200, h: 8, reflectivity: 0.8 },       // top
      { x: 0, y: 792, w: 1200, h: 8, reflectivity: 0.8 },      // bottom
      { x: 0, y: 0, w: 8, h: 800, reflectivity: 0.8 },         // left
      { x: 1192, y: 0, w: 8, h: 800, reflectivity: 0.8 },      // right
      { x: 400, y: 200, w: 8, h: 300, reflectivity: 0.6 },     // pillar
      { x: 700, y: 300, w: 200, h: 8, reflectivity: 0.6 },    // beam
    ],
    triggers: [
      { id: 't1', x: 900, y: 400, radius: 40, type: 'door', activated: false, onActivate: 'open_door_1' },
    ],
    butterflies: [],
    echoes: [
      { id: 'e1', x: 500, y: 350, radius: 20, collected: false, text: '...there was once a voice that spoke to the dark...', textZh: '……曾有一个声音，对黑暗说过话……', soundColor: 'gold' },
    ],
    decorations: [
      { type: 'pillar', x: 200, y: 100, size: 40, opacity: 0.15 },
      { type: 'pillar', x: 1000, y: 100, size: 40, opacity: 0.15 },
      { type: 'carving', x: 600, y: 600, size: 60, opacity: 0.1 },
    ],
    ambientColor: 'rgba(0, 0, 0, 1)',
    openingText: '...there was once a voice that spoke to the dark...',
    openingTextZh: '……曾有一个声音，对黑暗说过话……',
  },

  // === Chapter 2: Echoes ===
  {
    id: 'ch2_room1',
    chapter: 2,
    name: 'The Reflecting Hall',
    nameZh: '回声大厅',
    width: 1400,
    height: 900,
    walls: [
      { x: 0, y: 0, w: 1400, h: 8, reflectivity: 0.9 },
      { x: 0, y: 892, w: 1400, h: 8, reflectivity: 0.9 },
      { x: 0, y: 0, w: 8, h: 900, reflectivity: 0.9 },
      { x: 1392, y: 0, w: 8, h: 900, reflectivity: 0.9 },
      { x: 300, y: 200, w: 8, h: 500, reflectivity: 0.7 },
      { x: 800, y: 200, w: 8, h: 500, reflectivity: 0.7 },
      { x: 1100, y: 100, w: 8, h: 700, reflectivity: 0.7 },
    ],
    triggers: [
      { id: 't2a', x: 150, y: 450, radius: 50, type: 'door', activated: false, requiredColor: 'gold', onActivate: 'open_door_2a' },
      { id: 't2b', x: 1250, y: 450, radius: 50, type: 'door', activated: false, requiredColor: 'violet', onActivate: 'open_door_2b' },
    ],
    butterflies: [],
    echoes: [
      { id: 'e2', x: 600, y: 400, radius: 25, collected: false, text: '...the walls remembered every word ever spoken...', textZh: '……墙壁记得曾说过的每一句话……', soundColor: 'silver' },
      { id: 'e3', x: 1000, y: 700, radius: 20, collected: false, text: '...some sounds travel further than others...', textZh: '……有些声音比其他的传得更远……', soundColor: 'violet' },
    ],
    decorations: [
      { type: 'carving', x: 500, y: 100, size: 80, opacity: 0.08 },
      { type: 'carving', x: 900, y: 100, size: 80, opacity: 0.08 },
    ],
    ambientColor: 'rgba(0, 0, 0, 1)',
    openingText: '...the walls remembered every word ever spoken...',
    openingTextZh: '……墙壁记得曾说过的每一句话……',
  },

  // === Chapter 3: Butterflies ===
  {
    id: 'ch3_room1',
    chapter: 3,
    name: 'The Garden of Light',
    nameZh: '光之花园',
    width: 1200,
    height: 800,
    walls: [
      { x: 0, y: 0, w: 1200, h: 8, reflectivity: 0.5 },
      { x: 0, y: 792, w: 1200, h: 8, reflectivity: 0.5 },
      { x: 0, y: 0, w: 8, h: 800, reflectivity: 0.5 },
      { x: 1192, y: 0, w: 8, h: 800, reflectivity: 0.5 },
    ],
    triggers: [
      { id: 't3', x: 1000, y: 400, radius: 60, type: 'door', activated: false, onActivate: 'open_door_3' },
    ],
    butterflies: [
      { id: 'b1', x: 300, y: 300, color: 'rose', awake: false, follows: false },
      { id: 'b2', x: 600, y: 200, color: 'green', awake: false, follows: false },
      { id: 'b3', x: 800, y: 500, color: 'blue', awake: false, follows: false },
    ],
    echoes: [
      { id: 'e4', x: 500, y: 600, radius: 20, collected: false, text: '...some creatures carry light in their wings...', textZh: '……有些生物把光藏在翅膀里……', soundColor: 'rose' },
    ],
    decorations: [
      { type: 'dust', x: 200, y: 100, size: 2, opacity: 0.3 },
      { type: 'dust', x: 400, y: 200, size: 1, opacity: 0.2 },
      { type: 'dust', x: 600, y: 150, size: 3, opacity: 0.25 },
    ],
    ambientColor: 'rgba(0, 0, 0, 1)',
    openingText: '...some creatures carry light in their wings...',
    openingTextZh: '……有些生物把光藏在翅膀里……',
  },

  // === Chapter 4: Colors ===
  {
    id: 'ch4_room1',
    chapter: 4,
    name: 'The Prism Chamber',
    nameZh: '棱镜密室',
    width: 1300,
    height: 900,
    walls: [
      { x: 0, y: 0, w: 1300, h: 8, reflectivity: 0.8 },
      { x: 0, y: 892, w: 1300, h: 8, reflectivity: 0.8 },
      { x: 0, y: 0, w: 8, h: 900, reflectivity: 0.8 },
      { x: 1292, y: 0, w: 8, h: 900, reflectivity: 0.8 },
      { x: 400, y: 300, w: 3, h: 300, reflectivity: 0.9, resonant: true, symbol: '△' },
      { x: 700, y: 300, w: 3, h: 300, reflectivity: 0.9, resonant: true, symbol: '○' },
      { x: 1000, y: 300, w: 3, h: 300, reflectivity: 0.9, resonant: true, symbol: '□' },
    ],
    triggers: [
      { id: 't4a', x: 200, y: 700, radius: 50, type: 'door', activated: false, requiredColor: 'gold', onActivate: 'open_door_4a' },
      { id: 't4b', x: 650, y: 700, radius: 50, type: 'door', activated: false, requiredColor: 'blue', onActivate: 'open_door_4b' },
      { id: 't4c', x: 1100, y: 700, radius: 50, type: 'door', activated: false, requiredColor: 'violet', onActivate: 'open_door_4c' },
    ],
    butterflies: [
      { id: 'b4', x: 500, y: 200, color: 'gold', awake: false, follows: false },
    ],
    echoes: [
      { id: 'e5', x: 700, y: 100, radius: 25, collected: false, text: '...every color is a different kind of remembering...', textZh: '……每一种颜色都是不同的记忆方式……', soundColor: 'gold' },
    ],
    decorations: [
      { type: 'carving', x: 650, y: 500, size: 100, opacity: 0.1 },
    ],
    ambientColor: 'rgba(0, 0, 0, 1)',
    openingText: '...every color is a different kind of remembering...',
    openingTextZh: '……每一种颜色都是不同的记忆方式……',
  },

  // === Chapter 5: Low Frequency ===
  {
    id: 'ch5_room1',
    chapter: 5,
    name: 'The Hidden Depths',
    nameZh: '隐藏的深处',
    width: 1200,
    height: 1000,
    walls: [
      { x: 0, y: 0, w: 1200, h: 8, reflectivity: 0.3 },
      { x: 0, y: 992, w: 1200, h: 8, reflectivity: 0.3 },
      { x: 0, y: 0, w: 8, h: 1000, reflectivity: 0.3 },
      { x: 1192, y: 0, w: 8, h: 1000, reflectivity: 0.3 },
    ],
    triggers: [],
    butterflies: [
      { id: 'b5', x: 600, y: 500, color: 'violet', awake: false, follows: false },
    ],
    echoes: [
      { id: 'e6', x: 300, y: 300, radius: 20, collected: false, text: '...beneath every sound, there is a deeper one...', textZh: '……每个声音之下，都有一个更深的声音……', soundColor: 'violet' },
      { id: 'e7', x: 900, y: 600, radius: 20, collected: false, text: '...and beneath that, silence...', textZh: '……而在寂静之下……', soundColor: 'violet' },
      { id: 'e8', x: 600, y: 800, radius: 30, collected: false, text: '...you built this place. You forgot it. You are finding it again.', textZh: '……这个地方是你建的。你忘记了它。你正在重新找到它。', soundColor: 'violet' },
    ],
    decorations: [
      { type: 'dust', x: 100, y: 100, size: 2, opacity: 0.15 },
      { type: 'dust', x: 500, y: 200, size: 1, opacity: 0.1 },
    ],
    ambientColor: 'rgba(0, 0, 0, 1)',
    openingText: '...beneath every sound, there is a deeper one...',
    openingTextZh: '……每个声音之下，都有一个更深的声音……',
  },

  // === Chapter 6: Homecoming ===
  {
    id: 'ch6_room1',
    chapter: 6,
    name: 'The Heart of the Temple',
    nameZh: '神殿之心',
    width: 1000,
    height: 800,
    walls: [
      { x: 0, y: 0, w: 1000, h: 8, reflectivity: 1.0 },
      { x: 0, y: 792, w: 1000, h: 8, reflectivity: 1.0 },
      { x: 0, y: 0, w: 8, h: 800, reflectivity: 1.0 },
      { x: 992, y: 0, w: 8, h: 800, reflectivity: 1.0 },
    ],
    triggers: [],
    butterflies: [
      { id: 'b6a', x: 300, y: 300, color: 'gold', awake: true, follows: false },
      { id: 'b6b', x: 500, y: 200, color: 'rose', awake: true, follows: false },
      { id: 'b6c', x: 700, y: 300, color: 'blue', awake: true, follows: false },
      { id: 'b6d', x: 400, y: 500, color: 'green', awake: true, follows: false },
      { id: 'b6e', x: 600, y: 500, color: 'violet', awake: true, follows: false },
    ],
    echoes: [
      { id: 'e9', x: 500, y: 400, radius: 40, collected: false, text: '...you are not lost. You never were. You are home.', textZh: '……你没有迷路。你从未迷路。你回家了。', soundColor: 'gold' },
    ],
    decorations: [
      { type: 'pillar', x: 100, y: 100, size: 50, opacity: 0.2 },
      { type: 'pillar', x: 900, y: 100, size: 50, opacity: 0.2 },
      { type: 'carving', x: 500, y: 600, size: 120, opacity: 0.15 },
    ],
    ambientColor: 'rgba(0, 0, 0, 1)',
    openingText: '...you are not lost. You never were. You are home.',
    openingTextZh: '……你没有迷路。你从未迷路。你回家了。',
  },
];

export function getRoom(chapter: number, index: number = 0): RoomDef | null {
  return ROOMS.find(r => r.chapter === chapter && ROOMS.indexOf(r) === index * (chapter === 1 ? 1 : 1)) || null;
}

export function getRoomsByChapter(chapter: number): RoomDef[] {
  return ROOMS.filter(r => r.chapter === chapter);
}
