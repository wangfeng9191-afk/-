import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GameState, 
  GameMode,
  Player, 
  Enemy, 
  Bullet, 
  PowerUp, 
  Particle, 
  EnemyType,
  PowerUpType
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_SPEED, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT,
  BULLET_SPEED,
  BULLET_WIDTH,
  BULLET_HEIGHT,
  ENEMY_CONFIGS,
  POWERUP_WIDTH,
  POWERUP_HEIGHT,
  POWERUP_SPEED,
  ASSETS
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  gameMode: GameMode;
  onGameOver: () => void;
  onScoreChange: (score: number) => void;
  onLevelChange: (level: number) => void;
  onHealthChange: (health: number) => void;
  onTimeChange: (time: number) => void;
  onUnlockAchievement: (id: string) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  gameMode,
  onGameOver,
  onScoreChange,
  onLevelChange,
  onHealthChange,
  onTimeChange,
  onUnlockAchievement
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  // Game State Refs (to avoid re-renders)
  const playerRef = useRef<Player>({
    id: 'player',
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    health: 3,
    maxHealth: 3,
    score: 0,
    level: 1,
    isInvincible: false,
    invincibleTimer: 0,
    powerUps: {
      tripleShot: 0,
      shield: false
    }
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastShotTimeRef = useRef<number>(0);
  const lastEnemySpawnTimeRef = useRef<number>(0);
  const lastPowerUpSpawnTimeRef = useRef<number>(0);
  const enemiesDestroyedRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(60);
  const lastTimeUpdateRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  // Load Assets
  useEffect(() => {
    const loadImages = async () => {
      const sources = {
        player: ASSETS.PLAYER,
        BASIC: ASSETS.ENEMY_BASIC,
        FAST: ASSETS.ENEMY_FAST,
        HEAVY: ASSETS.ENEMY_HEAVY,
      };

      for (const [key, src] of Object.entries(sources)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          imagesRef.current[key] = img;
        };
      }
    };
    loadImages();
  }, []);

  // Sound Effects Generator
  const playSound = useCallback((type: 'shoot' | 'explosion' | 'powerup' | 'hit') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'explosion') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'powerup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }, []);

  // Background Music
  useEffect(() => {
    if (gameState === 'PLAYING') {
      if (!bgMusicRef.current) {
        // Using a more whimsical/orchestral track for Ghibli feel
        bgMusicRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3');
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.3;
      }
      bgMusicRef.current.play().catch(e => console.log("Audio play blocked", e));
    } else {
      bgMusicRef.current?.pause();
    }
    return () => {
      bgMusicRef.current?.pause();
    };
  }, [gameState]);

  // Input Handlers (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse & Touch Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (gameState !== 'PLAYING') return;
      const rect = canvas.getBoundingClientRect();
      
      // Calculate coordinates relative to canvas scale
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - playerRef.current.width, x - playerRef.current.width / 2));
      playerRef.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - playerRef.current.height, y - playerRef.current.height / 2));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // Use window for mouse move to capture movement even if slightly outside canvas
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchstart', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchMove);
    };
  }, [gameState]);

  // Reset Game
  useEffect(() => {
    if (gameState === 'PLAYING') {
      // Auto-focus window to ensure keyboard events are captured
      window.focus();
      timeLeftRef.current = 60;
      lastTimeUpdateRef.current = performance.now();
    }
    if (gameState === 'PLAYING' && playerRef.current.health <= 0) {
      playerRef.current = {
        id: 'player',
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - 100,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: PLAYER_SPEED,
        health: 3,
        maxHealth: 3,
        score: 0,
        level: 1,
        isInvincible: false,
        invincibleTimer: 0,
        powerUps: { tripleShot: 0, shield: false }
      };
      enemiesRef.current = [];
      bulletsRef.current = [];
      powerUpsRef.current = [];
      particlesRef.current = [];
      enemiesDestroyedRef.current = 0;
      onScoreChange(0);
      onLevelChange(1);
      onHealthChange(3);
    }
  }, [gameState, onScoreChange, onLevelChange, onHealthChange]);

  const createExplosion = (x: number, y: number, color: string, count = 15) => {
    playSound('explosion');
    for (let i = 0; i < count; i++) {
      // Petal-like particles
      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        color: Math.random() > 0.5 ? '#fff' : color,
        size: 3 + Math.random() * 4
      });
    }
  };

  const spawnEnemy = useCallback((time: number) => {
    const level = playerRef.current.level;
    const spawnInterval = Math.max(500, 2000 - (level * 150));
    
    if (time - lastEnemySpawnTimeRef.current > spawnInterval) {
      const types: EnemyType[] = ['BASIC'];
      if (level >= 2) types.push('FAST');
      if (level >= 3) types.push('HEAVY');
      
      const type = types[Math.floor(Math.random() * types.length)];
      const config = ENEMY_CONFIGS[type];
      
      enemiesRef.current.push({
        id: Math.random().toString(),
        x: Math.random() * (CANVAS_WIDTH - config.width),
        y: -config.height,
        width: config.width,
        height: config.height,
        speed: config.speed + (level * 0.2),
        type,
        health: config.health,
        points: config.points,
        color: config.color,
        glowColor: config.glowColor
      });
      lastEnemySpawnTimeRef.current = time;
    }
  }, []);

  const spawnPowerUp = useCallback((time: number) => {
    if (time - lastPowerUpSpawnTimeRef.current > 15000) { // Every 15 seconds
      const types: PowerUpType[] = ['TRIPLE_SHOT', 'SHIELD', 'HEALTH'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      powerUpsRef.current.push({
        id: Math.random().toString(),
        x: Math.random() * (CANVAS_WIDTH - POWERUP_WIDTH),
        y: -POWERUP_HEIGHT,
        width: POWERUP_WIDTH,
        height: POWERUP_HEIGHT,
        speed: POWERUP_SPEED,
        type
      });
      lastPowerUpSpawnTimeRef.current = time;
    }
  }, []);

  const update = useCallback((time: number) => {
    if (gameState !== 'PLAYING') return;

    // Handle Time Limit
    if (gameMode === 'TIME_LIMIT') {
      const delta = (time - lastTimeUpdateRef.current) / 1000;
      timeLeftRef.current -= delta;
      lastTimeUpdateRef.current = time;
      onTimeChange(timeLeftRef.current);
      
      if (timeLeftRef.current <= 0) {
        onGameOver();
        return;
      }
    }

    const player = playerRef.current;

    // Player Movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) player.x -= player.speed;
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) player.x += player.speed;
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) player.y -= player.speed;
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) player.y += player.speed;

    // Boundary Check
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));

    // Auto Shooting
    const shootInterval = 200; // Faster auto-fire
    if (time - lastShotTimeRef.current > shootInterval) {
      const bulletY = player.y;
      const bulletX = player.x + player.width / 2 - BULLET_WIDTH / 2;
      
      playSound('shoot');
      if (player.powerUps.tripleShot > 0) {
        bulletsRef.current.push({ id: Math.random().toString(), x: bulletX, y: bulletY, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: BULLET_SPEED, damage: 1, isPlayerBullet: true, angle: 0 });
        bulletsRef.current.push({ id: Math.random().toString(), x: bulletX, y: bulletY, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: BULLET_SPEED, damage: 1, isPlayerBullet: true, angle: -0.2 });
        bulletsRef.current.push({ id: Math.random().toString(), x: bulletX, y: bulletY, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: BULLET_SPEED, damage: 1, isPlayerBullet: true, angle: 0.2 });
      } else {
        bulletsRef.current.push({ id: Math.random().toString(), x: bulletX, y: bulletY, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: BULLET_SPEED, damage: 1, isPlayerBullet: true, angle: 0 });
      }
      lastShotTimeRef.current = time;
    }

    // Update PowerUp Timers
    if (player.powerUps.tripleShot > 0) player.powerUps.tripleShot--;
    if (player.invincibleTimer > 0) {
      player.invincibleTimer--;
      if (player.invincibleTimer === 0) player.isInvincible = false;
    }

    // Update Bullets
    bulletsRef.current = bulletsRef.current.filter(b => {
      b.y -= b.speed * Math.cos(b.angle);
      b.x += b.speed * Math.sin(b.angle);
      return b.y > -50 && b.y < CANVAS_HEIGHT + 50;
    });

    // Update Enemies
    enemiesRef.current = enemiesRef.current.filter(e => {
      e.y += e.speed;
      
      // Collision with Player
      if (!player.isInvincible && 
          player.x < e.x + e.width &&
          player.x + player.width > e.x &&
          player.y < e.y + e.height &&
          player.y + player.height > e.y) {
        
        if (player.powerUps.shield) {
          player.powerUps.shield = false;
          playSound('hit');
          createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#60a5fa', 20);
        } else {
          player.health--;
          onHealthChange(player.health);
          playSound('hit');
          createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ef4444', 30);
          if (player.health <= 0) {
            onGameOver();
          }
        }
        
        player.isInvincible = true;
        player.invincibleTimer = 120; // 2 seconds at 60fps
        return false; // Destroy enemy
      }

      // Escape Check
      if (e.y > CANVAS_HEIGHT) {
        player.score = Math.max(0, player.score - 50);
        onScoreChange(player.score);
        return false;
      }
      return true;
    });

    // Update PowerUps
    powerUpsRef.current = powerUpsRef.current.filter(p => {
      p.y += p.speed;
      
      // Collection
      if (player.x < p.x + p.width &&
          player.x + player.width > p.x &&
          player.y < p.y + p.height &&
          player.y + player.height > p.y) {
        
        playSound('powerup');
        if (p.type === 'TRIPLE_SHOT') player.powerUps.tripleShot = 600; // 10 seconds
        if (p.type === 'SHIELD') player.powerUps.shield = true;
        if (p.type === 'HEALTH') {
          player.health = Math.min(player.maxHealth, player.health + 1);
          onHealthChange(player.health);
        }
        
        if (player.powerUps.tripleShot > 0 && player.powerUps.shield) {
          onUnlockAchievement('power_hungry');
        }
        
        const explosionColor = p.type === 'TRIPLE_SHOT' ? '#fbbf24' : (p.type === 'SHIELD' ? '#60a5fa' : '#ef4444');
        createExplosion(p.x + p.width / 2, p.y + p.height / 2, explosionColor, 10);
        return false;
      }
      return p.y < CANVAS_HEIGHT;
    });

    // Bullet-Enemy Collision
    bulletsRef.current = bulletsRef.current.filter(b => {
      if (!b.isPlayerBullet) return true;
      
      let hit = false;
      enemiesRef.current = enemiesRef.current.filter(e => {
        if (b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y) {
          
          e.health -= b.damage;
          hit = true;
          
          if (e.health <= 0) {
            player.score += e.points;
            onScoreChange(player.score);
            enemiesDestroyedRef.current++;
            createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.color, 20);
            
            // Achievements
            if (enemiesDestroyedRef.current === 1) onUnlockAchievement('first_blood');
            if (enemiesDestroyedRef.current === 50) onUnlockAchievement('unstoppable');
            if (player.score >= 5000) onUnlockAchievement('ace');
            
            // Level Up
            const nextLevel = Math.floor(player.score / 2000) + 1;
            if (nextLevel > player.level) {
              player.level = nextLevel;
              onLevelChange(player.level);
              if (player.level === 3) onUnlockAchievement('survivor');
              // Clear current enemies on level up
              enemiesRef.current = [];
            }
            return false;
          }
          return true;
        }
        return true;
      });
      return !hit;
    });

    // Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

    spawnEnemy(time);
    spawnPowerUp(time);
  }, [gameState, onGameOver, onScoreChange, onLevelChange, onHealthChange, onUnlockAchievement, spawnEnemy, spawnPowerUp]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const player = playerRef.current;

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Bullets
    bulletsRef.current.forEach(b => {
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#60a5fa';
      ctx.save();
      ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
      ctx.rotate(b.angle);
      ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
      ctx.restore();
      ctx.shadowBlur = 0;
    });

    // Draw Enemies
    enemiesRef.current.forEach(e => {
      const img = imagesRef.current[e.type];
      if (img) {
        ctx.drawImage(img, e.x, e.y, e.width, e.height);
      } else {
        ctx.fillStyle = e.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.glowColor;
        
        // Draw a more "ship-like" shape
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2, e.y + e.height);
        ctx.lineTo(e.x, e.y);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    });

    // Draw PowerUps
    powerUpsRef.current.forEach(p => {
      if (p.type === 'HEALTH') {
        ctx.fillStyle = '#ef4444';
      } else {
        ctx.fillStyle = p.type === 'TRIPLE_SHOT' ? '#fbbf24' : '#60a5fa';
      }
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.fillStyle;
      
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon inside
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      let icon = 'S';
      if (p.type === 'TRIPLE_SHOT') icon = '3';
      if (p.type === 'HEALTH') icon = '+';
      ctx.fillText(icon, p.x + p.width / 2, p.y + p.height / 2 + 4);
      
      ctx.shadowBlur = 0;
    });

    // Draw Player
    if (!player.isInvincible || Math.floor(Date.now() / 100) % 2 === 0) {
      const playerImg = imagesRef.current['player'];
      
      if (playerImg) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
      } else {
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#3b82f6';
        
        // Player Ship Shape
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height * 0.8);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();
      }

      // Shield Effect
      if (player.powerUps.shield) {
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.1;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Engine Flame
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.9);
      ctx.lineTo(player.x + player.width / 2, player.y + player.height * 1.2 + Math.random() * 5);
      ctx.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.9);
      ctx.fill();
      
      ctx.shadowBlur = 0;
    }
  }, []);

  const loop = useCallback((time: number) => {
    update(time);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg bg-black/20"
    />
  );
};

export default GameCanvas;
