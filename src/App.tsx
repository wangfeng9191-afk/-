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
  MousePointer
} from 'lucide-react';
import { GameState, Achievement } from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';
import GameCanvas from './components/GameCanvas';
import { cn } from './utils';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(3);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setLevel(1);
    setHealth(3);
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
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* Background Stars (Static CSS for performance) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="nebula"></div>
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      {/* Main Game Area */}
      <div className="relative w-full h-full flex items-center justify-center">
        <GameCanvas 
          gameState={gameState}
          onGameOver={gameOver}
          onScoreChange={setScore}
          onLevelChange={setLevel}
          onHealthChange={setHealth}
          onUnlockAchievement={unlockAchievement}
        />

        {/* UI Overlays */}
        <AnimatePresence>
          {gameState === 'START' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
            >
              <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-center">
                <motion.h1 
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent italic"
                >
                  BOBBY
                </motion.h1>
                <p className="text-xl font-light tracking-widest text-blue-200 mb-8 uppercase">星际先锋</p>
                
                <div className="space-y-4 mb-8">
                  <button 
                    onClick={startGame}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 text-xl font-bold group shadow-lg shadow-blue-900/20"
                  >
                    <Play className="fill-current group-hover:scale-110 transition-transform" />
                    开始游戏
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left text-sm text-gray-400">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-1">
                      <Keyboard size={16} /> 操作指南
                    </h3>
                    <ul className="space-y-1">
                      <li>方向键 / WASD: 移动</li>
                      <li>空格键: 射击</li>
                      <li>P键: 暂停</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-1">
                      <Zap size={16} /> 道具说明
                    </h3>
                    <ul className="space-y-1">
                      <li><span className="text-yellow-400">三向子弹:</span> 增强火力</li>
                      <li><span className="text-blue-400">能量护盾:</span> 抵挡伤害</li>
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
              className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md"
            >
              <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl text-center min-w-[300px]">
                <h2 className="text-3xl font-bold mb-8">游戏暂停</h2>
                <div className="space-y-4">
                  <button 
                    onClick={resumeGame}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-bold"
                  >
                    继续游戏
                  </button>
                  <button 
                    onClick={() => setGameState('START')}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold"
                  >
                    退出游戏
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-lg"
            >
              <div className="max-w-lg w-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-center">
                <h2 className="text-4xl font-black mb-2 text-red-500">任务失败</h2>
                <p className="text-gray-400 mb-8">你的战机在深空中陨落了...</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-sm text-gray-400 uppercase tracking-wider">最终得分</p>
                    <p className="text-3xl font-mono font-bold text-blue-400">{score}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-sm text-gray-400 uppercase tracking-wider">最高关卡</p>
                    <p className="text-3xl font-mono font-bold text-purple-400">{level}</p>
                  </div>
                </div>

                <div className="mb-8 text-left">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Trophy size={16} /> 本局成就
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {achievements.filter(a => a.unlocked).length > 0 ? (
                      achievements.filter(a => a.unlocked).map(a => (
                        <div key={a.id} className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 text-xs font-bold">
                          {a.title}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-600">暂未解锁任何成就</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={startGame}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 text-xl font-bold"
                >
                  <RotateCcw size={24} /> 重新开始
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD */}
        {gameState !== 'START' && (
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-40">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        scale: i < health ? 1 : 0.8,
                        opacity: i < health ? 1 : 0.2
                      }}
                      className={cn(
                        "w-6 h-2 rounded-full",
                        i < health ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-gray-700"
                      )}
                    />
                  ))}
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="text-sm font-mono font-bold">
                  LV <span className="text-purple-400">{level}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-mono pl-1">
                SCORE: <span className="text-blue-400">{score.toString().padStart(6, '0')}</span>
              </div>
            </div>

            <button 
              onClick={pauseGame}
              className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 pointer-events-auto hover:bg-white/10 transition-all"
            >
              <Pause size={20} />
            </button>
          </div>
        )}

        {/* Achievement Popup */}
        <AnimatePresence>
          {lastAchievement && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute bottom-8 right-8 z-[60] p-4 rounded-2xl bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/30 flex items-center gap-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-black">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">成就解锁!</p>
                <p className="text-lg font-bold">{lastAchievement.title}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden xl:flex absolute right-0 top-0 h-full w-80 p-6 flex-col gap-6 bg-white/[0.02] border-l border-white/5 backdrop-blur-sm z-30">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
          <Info size={20} /> 任务简报
        </h2>
        
        <div className="space-y-6 overflow-y-auto pr-2">
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">敌机情报</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Target size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">基础型</p>
                  <p className="text-xs text-gray-500">速度中等，容易对付</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Zap size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">快速型</p>
                  <p className="text-xs text-gray-500">极速突袭，难以捕捉</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Flame size={16} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">重型</p>
                  <p className="text-xs text-gray-500">装甲厚重，需要多次打击</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">成就系统</h3>
            <div className="grid grid-cols-1 gap-2">
              {achievements.map(a => (
                <div 
                  key={a.id} 
                  className={cn(
                    "p-3 rounded-xl border transition-all",
                    a.unlocked 
                      ? "bg-yellow-500/10 border-yellow-500/30" 
                      : "bg-white/5 border-white/5 opacity-40"
                  )}
                >
                  <p className={cn("text-sm font-bold", a.unlocked ? "text-yellow-500" : "text-gray-400")}>
                    {a.title}
                  </p>
                  <p className="text-[10px] text-gray-500">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
