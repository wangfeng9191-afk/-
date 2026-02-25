export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
export type GameMode = 'LEVEL' | 'TIME_LIMIT';

export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  id: string;
  width: number;
  height: number;
  speed: number;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  score: number;
  level: number;
  isInvincible: boolean;
  invincibleTimer: number;
  powerUps: {
    tripleShot: number; // duration in frames
    shield: boolean;
  };
}

export type EnemyType = 'BASIC' | 'FAST' | 'HEAVY';

export interface Enemy extends Entity {
  type: EnemyType;
  health: number;
  points: number;
  color: string;
  glowColor: string;
}

export interface Bullet extends Entity {
  damage: number;
  isPlayerBullet: boolean;
  angle: number;
}

export type PowerUpType = 'TRIPLE_SHOT' | 'SHIELD' | 'HEALTH';

export interface PowerUp extends Entity {
  type: PowerUpType;
}

export interface Particle extends Point {
  id: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}
