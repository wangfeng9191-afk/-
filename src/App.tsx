/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Shield, 
  Zap, 
  Target, 
  Flame, 
  Info,
  Gamepad,
  Keyboard,
  MousePointer,
  Maximize,
  Minimize
} from 'lucide-react';
import { GameState, Achievement, GameMode } from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';
import GameCanvas from './components/GameCanvas';
import { cn } from './utils';
import { Clock } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameMode, setGameMode] = useState<GameMode>('LEVEL');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const startGame = (mode: GameMode = 'LEVEL') => {
    setGameMode(mode);
    setGameState('PLAYING');
    setScore(0);
    setLevel(1);
    setHealth(3);
    setTimeLeft(60);
  };

  const pauseGame = () => {
    if (gameState === 'PLAYING') setGameState('PAUSED');
  };

  const resumeGame = () => {
    if (gameState === 'PAUSED') setGameState('PLAYING');
  };

  const gameOver = () => {
    setGameState('GAMEOVER');
  };

  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        const updated = prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
        setLastAchievement({ ...achievement, unlocked: true });
        setTimeout(() => setLastAchievement(null), 3000);
        return updated;
      }
      return prev;
    });
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#87CEEB] overflow-hidden font-serif text-[#2d3436]">
      {/* Ghibli Sky Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="sky-container"></div>
        <div className="clouds-layer">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="cloud" 
              style={{
                width: `${150 + Math.random() * 200}px`,
                height: `${60 + Math.random() * 40}px`,
                top: `${Math.random() * 100}%`,
                left: `-${200 + Math.random() * 400}px`,
                animationDuration: `${20 + Math.random() * 40}s`,
                animationDelay: `${Math.random() * 20}s`
              }}
            />
          ))}
        </div>
        <div className="stars-small"></div>
      </div>

      {/* Main Game Area */}
      <div className="relative w-full h-full flex items-center justify-center">
        <GameCanvas 
          gameState={gameState}
          gameMode={gameMode}
          onGameOver={gameOver}
          onScoreChange={setScore}
          onLevelChange={setLevel}
          onHealthChange={setHealth}
          onTimeChange={setTimeLeft}
          onUnlockAchievement={unlockAchievement}
        />

        {/* UI Overlays */}
        <AnimatePresence>
          {gameState === 'START' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-[2px]"
            >
              <div className="max-w-md w-full p-10 rounded-[40px] border border-white/40 bg-[#fffcf0]/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-center">
                <motion.h1 
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="text-6xl font-bold mb-2 text-[#5a5a40] tracking-tight"
                >
                  风之谷
                </motion.h1>
                <p className="text-lg font-medium tracking-[0.2em] text-[#8c8c70] mb-10 uppercase">天空冒险</p>
                
                <div className="space-y-4 mb-10">
                  <button 
                    onClick={() => startGame('LEVEL')}
                    className="w-full py-5 rounded-full bg-[#5a5a40] hover:bg-[#4a4a30] text-white transition-all flex items-center justify-center gap-3 text-2xl font-bold shadow-lg shadow-[#5a5a40]/20"
                  >
                    <Play className="fill-current" />
                    关卡模式
                  </button>
                  <button 
                    onClick={() => startGame('TIME_LIMIT')}
                    className="w-full py-5 rounded-full bg-white/60 hover:bg-white/80 text-[#5a5a40] transition-all flex items-center justify-center gap-3 text-2xl font-bold border border-[#5a5a40]/10"
                  >
                    <Clock className="fill-current" />
                    限时挑战 (60s)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 text-left text-sm text-[#5a5a40]/80">
                  <div className="p-5 rounded-3xl bg-white/40 border border-white/60">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Keyboard size={18} /> 飞行指引
                    </h3>
                    <ul className="space-y-1.5 opacity-80">
                      <li>方向键: 自由翱翔</li>
                      <li>空格键: 守护射击</li>
                      <li>P键: 稍作休息</li>
                    </ul>
                  </div>
                  <div className="p-5 rounded-3xl bg-white/40 border border-white/60">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Zap size={18} /> 奇迹之物
                    </h3>
                    <ul className="space-y-1.5 opacity-80">
                      <li><span className="text-[#d4a017]">三向羽翼:</span> 广域守护</li>
                      <li><span className="text-[#4facfe]">风之护盾:</span> 柔和抵挡</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'PAUSED' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 bg-white/20 backdrop-blur-sm"
            >
              <div className="p-10 rounded-[40px] border border-white/40 bg-[#fffcf0]/90 backdrop-blur-xl text-center min-w-[320px] shadow-2xl">
                <h2 className="text-3xl font-bold mb-10 text-[#5a5a40]">静谧时刻</h2>
                <div className="space-y-4">
                  <button 
                    onClick={resumeGame}
                    className="w-full py-4 rounded-full bg-[#5a5a40] hover:bg-[#4a4a30] text-white transition-all font-bold text-lg"
                  >
                    继续旅程
                  </button>
                  <button 
                    onClick={() => setGameState('START')}
                    className="w-full py-4 rounded-full bg-white/60 hover:bg-white/80 text-[#5a5a40] transition-all font-bold text-lg border border-[#5a5a40]/10"
                  >
                    返回原点
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-md"
            >
              <div className="max-w-lg w-full p-10 rounded-[40px] border border-white/40 bg-[#fffcf0]/90 backdrop-blur-xl shadow-2xl text-center">
                <h2 className="text-5xl font-bold mb-3 text-[#8c4a4a]">旅途终点</h2>
                <p className="text-[#8c8c70] mb-10">虽然羽翼已折，但风会记住你的飞行...</p>
                
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-6 rounded-[32px] bg-white/40 border border-white/60">
                    <p className="text-xs text-[#8c8c70] uppercase tracking-widest mb-1">飞行里程</p>
                    <p className="text-4xl font-bold text-[#5a5a40]">{score}</p>
                  </div>
                  <div className="p-6 rounded-[32px] bg-white/40 border border-white/60">
                    <p className="text-xs text-[#8c8c70] uppercase tracking-widest mb-1">最高关卡</p>
                    <p className="text-4xl font-bold text-[#8c8c70]">{level}</p>
                  </div>
                </div>

                <div className="mb-10 text-left">
                  <h3 className="text-xs font-bold text-[#8c8c70] uppercase mb-4 flex items-center gap-2">
                    <Trophy size={18} /> 飞行印记
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {achievements.filter(a => a.unlocked).length > 0 ? (
                      achievements.filter(a => a.unlocked).map(a => (
                        <div key={a.id} className="px-4 py-2 rounded-full bg-[#5a5a40]/10 border border-[#5a5a40]/20 text-[#5a5a40] text-sm font-bold">
                          {a.title}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#8c8c70]/60 italic">尚未留下印记</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => startGame(gameMode)}
                  className="w-full py-5 rounded-full bg-[#5a5a40] hover:bg-[#4a4a30] text-white transition-all flex items-center justify-center gap-3 text-2xl font-bold"
                >
                  <RotateCcw size={28} /> 再次启航
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD */}
        {gameState !== 'START' && (
          <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-40">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-5 p-4 rounded-[24px] bg-[#fffcf0]/60 backdrop-blur-md border border-white/40 shadow-sm">
                <div className="flex gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        scale: i < health ? 1 : 0.8,
                        opacity: i < health ? 1 : 0.2
                      }}
                      className={cn(
                        "w-7 h-2.5 rounded-full",
                        i < health ? "bg-[#8c4a4a] shadow-[0_0_10px_rgba(140,74,74,0.3)]" : "bg-[#8c8c70]/30"
                      )}
                    />
                  ))}
                </div>
                <div className="h-5 w-px bg-[#5a5a40]/20" />
                <div className="text-base font-bold text-[#5a5a40]">
                  {gameMode === 'LEVEL' ? '关卡' : '时间'} <span className={cn(gameMode === 'TIME_LIMIT' && timeLeft < 10 ? "text-red-500" : "text-[#8c8c70]")}>
                    {gameMode === 'LEVEL' ? level : `${Math.ceil(timeLeft)}s`}
                  </span>
                </div>
              </div>
              <div className="text-sm text-[#8c8c70] font-bold pl-2 tracking-wider">
                里程: <span className="text-[#5a5a40]">{score.toString().padStart(6, '0')}</span>
              </div>
            </div>

            <div className="flex gap-3 pointer-events-auto">
              <button 
                onClick={toggleFullscreen}
                className="p-4 rounded-[24px] bg-[#fffcf0]/60 backdrop-blur-md border border-white/40 hover:bg-white/80 transition-all shadow-sm text-[#5a5a40]"
                title="全屏切换"
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
              <button 
                onClick={pauseGame}
                className="p-4 rounded-[24px] bg-[#fffcf0]/60 backdrop-blur-md border border-white/40 hover:bg-white/80 transition-all shadow-sm text-[#5a5a40]"
              >
                <Pause size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Achievement Popup */}
        <AnimatePresence>
          {lastAchievement && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-10 right-10 z-[60] p-5 rounded-[32px] bg-[#fffcf0]/90 backdrop-blur-xl border border-[#5a5a40]/20 flex items-center gap-5 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#5a5a40] flex items-center justify-center text-white">
                <Trophy size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#8c8c70] uppercase tracking-[0.2em]">印记解锁</p>
                <p className="text-xl font-bold text-[#5a5a40]">{lastAchievement.title}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden xl:flex absolute right-0 top-0 h-full w-80 p-8 flex-col gap-8 bg-white/20 border-l border-white/40 backdrop-blur-md z-30">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-[#5a5a40]">
          <Info size={24} /> 飞行日志
        </h2>
        
        <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          <section>
            <h3 className="text-xs font-bold text-[#8c8c70] uppercase tracking-widest mb-4">天空之影</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-[24px] bg-white/40 border border-white/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#4facfe]/10 border border-[#4facfe]/20 flex items-center justify-center">
                  <Target size={20} className="text-[#4facfe]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#5a5a40]">轻盈之影</p>
                  <p className="text-xs text-[#8c8c70]">随风而动，并不危险</p>
                </div>
              </div>
              <div className="p-4 rounded-[24px] bg-white/40 border border-white/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#d4a017]/10 border border-[#d4a017]/20 flex items-center justify-center">
                  <Zap size={20} className="text-[#d4a017]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#5a5a40]">疾风之影</p>
                  <p className="text-xs text-[#8c8c70]">瞬间掠过，难以捉摸</p>
                </div>
              </div>
              <div className="p-4 rounded-[24px] bg-white/40 border border-white/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#8c4a4a]/10 border border-[#8c4a4a]/20 flex items-center justify-center">
                  <Flame size={20} className="text-[#8c4a4a]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#5a5a40]">沉重之影</p>
                  <p className="text-xs text-[#8c8c70]">如乌云般厚重，需耐心应对</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-[#8c8c70] uppercase tracking-widest mb-4">飞行印记</h3>
            <div className="grid grid-cols-1 gap-3">
              {achievements.map(a => (
                <div 
                  key={a.id} 
                  className={cn(
                    "p-4 rounded-[24px] border transition-all",
                    a.unlocked 
                      ? "bg-[#5a5a40]/10 border-[#5a5a40]/20" 
                      : "bg-white/20 border-white/40 opacity-40"
                  )}
                >
                  <p className={cn("text-base font-bold", a.unlocked ? "text-[#5a5a40]" : "text-[#8c8c70]")}>
                    {a.title}
                  </p>
                  <p className="text-[11px] text-[#8c8c70] mt-1 leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
