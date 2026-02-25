export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_SPEED = 5;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;

export const BULLET_SPEED = 16;
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 12;

export const ENEMY_CONFIGS = {
  BASIC: {
    width: 35,
    height: 35,
    speed: 2,
    health: 1,
    points: 100,
    color: '#3b82f6', // blue-500
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  FAST: {
    width: 25,
    height: 25,
    speed: 4,
    health: 1,
    points: 200,
    color: '#f59e0b', // amber-500
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  HEAVY: {
    width: 50,
    height: 50,
    speed: 1,
    health: 3,
    points: 500,
    color: '#ef4444', // red-500
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
};

export const POWERUP_WIDTH = 30;
export const POWERUP_HEIGHT = 30;
export const POWERUP_SPEED = 1.5;

export const ASSETS = {
  PLAYER: 'https://raw.githubusercontent.com/wangfeng9191-afk/piciure/8df782431b402a73174b9b9ae43731494a8b5bfd/player.png',
  ENEMY_BASIC: 'https://raw.githubusercontent.com/wangfeng9191-afk/piciure/8df782431b402a73174b9b9ae43731494a8b5bfd/enemy_basic.png',
  ENEMY_FAST: 'https://raw.githubusercontent.com/wangfeng9191-afk/piciure/8df782431b402a73174b9b9ae43731494a8b5bfd/enemy_fast.png',
  ENEMY_HEAVY: 'https://raw.githubusercontent.com/wangfeng9191-afk/piciure/8df782431b402a73174b9b9ae43731494a8b5bfd/enemy_heavy.png',
};

export const INITIAL_ACHIEVEMENTS = [
  { id: 'first_blood', title: '第一滴血', description: '击毁第一架敌机', unlocked: false, icon: 'Target' },
  { id: 'survivor', title: '生存者', description: '达到第3关', unlocked: false, icon: 'Shield' },
  { id: 'ace', title: '王牌飞行员', description: '得分超过 5000', unlocked: false, icon: 'Trophy' },
  { id: 'power_hungry', title: '能量狂人', description: '同时拥有两种道具', unlocked: false, icon: 'Zap' },
  { id: 'unstoppable', title: '势不可挡', description: '击毁 50 架敌机', unlocked: false, icon: 'Flame' },
];
