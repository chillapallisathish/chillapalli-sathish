/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, FormEvent, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ShieldAlert, Trophy, Gamepad2, Skull, RefreshCw, Disc3 } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Moving UP initially
const GAME_SPEED = 120; // ms per tick

const MUSIC_TRACKS = [
  {
    title: "CYBERNETIC_PULSE.mp3",
    artist: "AI_GEN // 0x01",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "NEON_DRIVE_OVERKILL.wav",
    artist: "AI_GEN // 0x02",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "DIGITAL_VOID_PROTOCOL.flac",
    artist: "AI_GEN // 0x03",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function App() {
  // --- Audio State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Snake Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Use refs to avoid stale closures in event listeners
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const gameOverRef = useRef(gameOver);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  // --- Music Player Functions ---
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    let newIndex = direction === 'next' ? currentTrackIndex + 1 : currentTrackIndex - 1;
    if (newIndex >= MUSIC_TRACKS.length) newIndex = 0;
    if (newIndex < 0) newIndex = MUSIC_TRACKS.length - 1;
    setCurrentTrackIndex(newIndex);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
    }
  }, [currentTrackIndex]);

  // --- Snake Game Functions ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Make sure food doesn't spawn on snake
      // eslint-disable-next-line no-loop-func
      if (!snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    generateFood();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling
      }

      if (e.key === ' ' && (gameOverRef.current || !gameStarted)) {
        resetGame();
        return;
      }

      const { x: dx, y: dy } = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
          if (dy === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (dy === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (dx === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (dx === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };
      const currentDir = directionRef.current;

      head.x += currentDir.x;
      head.y += currentDir.y;

      // Check walls
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return;
      }

      // Check self-collision
      if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return;
      }

      currentSnake.unshift(head);

      // Check food
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        generateFood();
      } else {
        currentSnake.pop();
      }

      setSnake(currentSnake);
    };

    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, food, generateFood]);

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <div className="min-h-screen crt relative w-full flex items-center justify-center p-2 sm:p-4 selection:bg-magenta-cyber selection:text-black">
      <div className="scanline"></div>
      
      {/* Hidden Audio Player */}
      <audio 
        ref={audioRef} 
        src={MUSIC_TRACKS[currentTrackIndex].url}
        onEnded={() => skipTrack('next')}
        loop={false}
      />

      <div className="w-full max-w-[1200px] h-[95vh] glitch-container bento-container grid grid-cols-1 md:grid-cols-12 grid-rows-12 gap-4 p-4 bg-black/90 backdrop-blur-sm relative overflow-hidden">
        
        {/* Cell 1: Header (Top) */}
        <div className="bento-cell aberration col-span-1 md:col-span-12 row-span-2 p-4 flex items-center justify-between relative z-10 overflow-hidden">
          <div className="noise-bg"></div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1, 0, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3 text-magenta-cyber"
          >
            <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
            <h1 className="text-2xl sm:text-4xl font-glitch tracking-widest text-shadow-glow-magenta uppercase truncate">
              Neural_Kinetics_App
            </h1>
          </motion.div>
          <div className="hidden md:block text-sm text-cyan-cyber/70 tracking-widest uppercase font-mono text-right">
            Node: <span className="text-cyan-cyber animate-pulse text-shadow-glow-cyan">Active</span><br/>
            Subroutines: <span className="text-magenta-cyber underline uppercase tracking-widest">Linked</span>
          </div>
        </div>

        {/* Cell 2: Media Player */}
        <div className="bento-cell col-span-1 md:col-span-4 row-span-5 p-5 flex flex-col relative z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-magenta-cyber/5 via-transparent to-transparent">
          <div className="text-magenta-cyber text-lg font-glitch tracking-widest mb-4 flex items-center gap-2 border-b border-magenta-cyber/50 pb-2">
            <Volume2 className="w-5 h-5" /> AUDIO_HAPTICS
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-center gap-4">
              <Disc3 className={`w-16 h-16 text-magenta-cyber ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              <div className="space-y-1 overflow-hidden">
                <div className="text-cyan-cyber font-mono text-xs opacity-70 uppercase tracking-widest">Now Playing</div>
                <div className="text-magenta-cyber font-glitch text-xl truncate text-shadow-glow-magenta" title={MUSIC_TRACKS[currentTrackIndex].title}>
                  {MUSIC_TRACKS[currentTrackIndex].title}
                </div>
                <div className="text-cyan-cyber font-mono text-xs opacity-80">{MUSIC_TRACKS[currentTrackIndex].artist}</div>
              </div>
            </div>

            {/* Audio Spectrum Visualizer (Fake) */}
            <div className="h-10 border border-cyan-cyber/30 bg-black/50 p-1 flex items-end gap-1 overflow-hidden mt-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-cyan-cyber w-full"
                  animate={{ 
                    height: isPlaying ? [`${Math.random() * 20 + 10}%`, `${Math.random() * 80 + 20}%`, `${Math.random() * 40 + 10}%`] : '10%'
                  }}
                  transition={{ 
                    duration: isPlaying ? 0.2 + Math.random() * 0.3 : 1, 
                    repeat: Infinity, 
                    repeatType: "mirror" 
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-2">
              <button onClick={() => skipTrack('prev')} className="p-2 border border-cyan-cyber/40 text-cyan-cyber hover:bg-cyan-cyber/20 hover:text-shadow-glow-cyan transition-all active:scale-95">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              <button onClick={togglePlay} className="p-3 border-2 border-magenta-cyber text-magenta-cyber hover:bg-magenta-cyber/20 hover:text-shadow-glow-magenta transition-all shadow-[0_0_10px_rgba(255,0,255,0.2)] active:scale-95">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
              <button onClick={() => skipTrack('next')} className="p-2 border border-cyan-cyber/40 text-cyan-cyber hover:bg-cyan-cyber/20 hover:text-shadow-glow-cyan transition-all active:scale-95">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        </div>

        {/* Cell 3: Snake Game */}
        <div className="bento-cell col-span-1 md:col-span-8 row-span-10 p-4 sm:p-6 flex flex-col relative z-10">
          <div className="flex items-center justify-between border-b border-cyan-cyber/50 pb-2 mb-4">
            <div className="flex items-center gap-2 text-cyan-cyber">
              <Gamepad2 className="w-6 h-6" />
              <span className="tracking-widest text-lg font-glitch uppercase">Simulation_Grid</span>
            </div>
            <div className="text-xs font-glitch text-cyan-cyber animate-pulse">
              STATUS: {gameOver ? 'TERMINATED' : gameStarted ? 'RUNNING' : 'STANDBY'}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
             {/* The Game Board */}
            <div 
              className="relative aspect-square w-full max-w-[450px] border-2 border-cyan-cyber/50 bg-black box-content grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                boxShadow: 'inset 0 0 20px rgba(0, 255, 255, 0.1)'
              }}
            >
              <div className="noise-bg opacity-20"></div>
              
              {/* Overlay states */}
              {(!gameStarted || gameOver) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm border border-magenta-cyber/50">
                  {gameOver ? (
                    <>
                      <Skull className="w-16 h-16 text-magenta-cyber mb-4 animate-pulse text-shadow-glow-magenta" />
                      <h2 className="text-4xl font-glitch tracking-widest text-magenta-cyber mb-2 text-shadow-glow-magenta">FATAL ERROR</h2>
                      <p className="font-mono text-cyan-cyber mb-6 uppercase tracking-widest">Score: {score}</p>
                      <button 
                        onClick={resetGame}
                        className="flex items-center gap-2 px-6 py-3 border border-cyan-cyber bg-cyan-cyber/10 text-cyan-cyber hover:bg-cyan-cyber focus:bg-cyan-cyber hover:text-black focus:text-black font-glitch text-xl uppercase transition-all tracking-widest outline-none"
                      >
                        <RefreshCw className="w-5 h-5" /> Reboot Sequence
                      </button>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-16 h-16 text-cyan-cyber mb-4 text-shadow-glow-cyan" />
                      <h2 className="text-3xl font-glitch tracking-widest text-cyan-cyber mb-6 text-shadow-glow-cyan">SYSTEM STANDBY</h2>
                      <button 
                        onClick={resetGame}
                        className="flex items-center gap-2 px-6 py-3 border border-magenta-cyber bg-magenta-cyber/10 text-magenta-cyber hover:bg-magenta-cyber focus:bg-magenta-cyber hover:text-black focus:text-black font-glitch text-xl uppercase transition-all tracking-widest outline-none shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                      >
                        <Play className="w-5 h-5 fill-current" /> Initialize Run
                      </button>
                    </>
                  )}
                  <p className="mt-8 text-xs font-mono text-cyan-cyber/50">[ USE ARROW KEYS TO NAVIGATE ]</p>
                </div>
              )}

              {/* Render Snake & Food */}
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                
                const isFood = food.x === x && food.y === y;
                const snakeIndex = snake.findIndex(seg => seg.x === x && seg.y === y);
                const isSnake = snakeIndex !== -1;
                const isHead = snakeIndex === 0;

                return (
                  <div 
                    key={index} 
                    className={`
                      w-full h-full border-[0.5px] border-cyan-cyber/10
                      ${isFood ? 'bg-cyan-cyber shadow-[0_0_8px_rgba(0,255,255,1)] animate-pulse' : ''}
                      ${isSnake && isHead ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}
                      ${isSnake && !isHead ? 'bg-magenta-cyber shadow-[0_0_5px_rgba(255,0,255,0.8)] opacity-90' : ''}
                    `}
                    style={{
                      borderRadius: isSnake ? '2px' : isFood ? '50%' : '0'
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Cell 4: Stats */}
        <div className="bento-cell col-span-1 md:col-span-4 row-span-5 p-5 flex flex-col relative z-10">
          <div className="text-cyan-cyber text-lg font-glitch tracking-widest mb-4 flex items-center gap-2 border-b border-cyan-cyber/50 pb-2">
            <Trophy className="w-5 h-5" /> PERFORMANCE_METRICS
          </div>
          
          <div className="space-y-6 flex-1 flex flex-col justify-center px-4">
            <div className="border border-cyan-cyber/30 p-4 bg-cyan-cyber/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-cyber" />
              <div className="text-cyan-cyber font-mono text-xs opacity-70 uppercase tracking-widest mb-1">Current Score</div>
              <div className="text-5xl font-glitch text-cyan-cyber text-shadow-glow-cyan">
                {score.toString().padStart(6, '0')}
              </div>
            </div>
            
            <div className="border border-magenta-cyber/30 p-4 bg-magenta-cyber/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-magenta-cyber" />
              <div className="text-magenta-cyber font-mono text-xs opacity-70 uppercase tracking-widest mb-1">High Score</div>
              <div className="text-4xl font-glitch text-magenta-cyber text-shadow-glow-magenta">
                {highScore.toString().padStart(6, '0')}
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-cyan-cyber/30 pt-3 text-[10px] text-cyan-cyber/40 font-mono tracking-widest uppercase">
            &gt; SECURE_SCORE_REGISTRY_ACTIVE
          </div>
        </div>

        {/* Decorative corner pieces */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-cyber pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-magenta-cyber pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-magenta-cyber pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-cyber pointer-events-none" />
        
      </div>
    </div>
  );
}
