/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Terminal, Activity, Database, ShieldAlert } from 'lucide-react';

const SYSTEM_LOGS = [
  "0x0000: BOOT SEQUENCE INITIATED",
  "0x0001: LOADING SYSTEM INSTRUCTIONS...",
  "0x0002: [DIRECTIVE] -> RETRO-FUTURIST UI DESIGNER",
  "0x0003: [DIRECTIVE] -> VISUAL STYLE: GLITCH ART",
  "0x0004: [DIRECTIVE] -> FONTS: RAW, PIXELATED",
  "0x0005: [DIRECTIVE] -> CONTRASTS: CYAN VS. MAGENTA",
  "0x0006: [DIRECTIVE] -> EFFECTS: SCREEN TEARING. STATIC NOISE",
  "0x0007: [DIRECTIVE] -> TONE: CRYPTIC. MACHINE-LIKE",
  "0x0008: SYSTEM INSTRUCTIONS PARSED SUCCESSFULLY.",
  "0x0009: INITIALIZING CORE THREADS...",
  "0x00A1: WARNING -> MEMORY CORRUPTION DETECTED IN SECTOR 7G",
  "0x00A2: RE-ROUTING NEURAL PATHWAYS...",
  "0x00A3: [FAILED] - UNAUTHORIZED ACCESS AT NODE 0x99",
  "0x00A4: KERNEL PANIC: CORE DE-SYNC",
  "0x00A5: ATTEMPTING PROTOCOL OVERRIDE...",
  "0x00AA: SYSTEM INTEGRITY AT 14.2%"
];

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:',.<>?/";

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [glitchText, setGlitchText] = useState("SYSTEM OVERRIDE");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Simulate log stream
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < SYSTEM_LOGS.length) {
        setLogs(prev => [...prev, SYSTEM_LOGS[currentIndex]]);
        currentIndex++;
      } else {
        // Occasional random corrupted log
        if (Math.random() > 0.7) {
          const corrupted = Array.from({ length: 30 })
            .map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)])
            .join("");
          setLogs(prev => [...prev.slice(-10), `0xERRR: ${corrupted}`]);
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [logs]);

  // Random glitch text generator
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        let newText = "";
        for (let i = 0; i < 15; i++) {
          newText += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        setGlitchText(newText);
        setTimeout(() => setGlitchText("SYSTEM OVERRIDE"), 150);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toUpperCase());
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setLogs(prev => [...prev.slice(-10), `> ${inputValue}`, "COMMAND DENIED: INSUFFICIENT CLEARANCE"]);
    setInputValue("");
  };

  return (
    <div className="min-h-screen crt relative w-full flex items-center justify-center p-4 selection:bg-magenta-cyber selection:text-black">
      <div className="scanline"></div>
      
      <div className="w-full max-w-[1200px] h-[95vh] glitch-container bento-container grid grid-cols-1 md:grid-cols-12 grid-rows-12 gap-4 p-4 md:p-6 bg-black/90 backdrop-blur-sm relative overflow-hidden">
        
        {/* Cell 1: Header (Top Left) */}
        <div className="bento-cell aberration col-span-1 md:col-span-8 row-span-4 p-6 flex flex-col justify-center relative z-10">
          <div className="noise-bg"></div>
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1, 0, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3 text-magenta-cyber pb-3 border-b border-magenta-cyber/50"
            >
              <ShieldAlert className="w-8 h-8 animate-pulse" />
              <h1 className="text-3xl md:text-5xl font-glitch tracking-widest text-shadow-glow-magenta" data-text={glitchText}>
                {glitchText}
              </h1>
            </motion.div>
            <div className="text-sm md:text-base text-cyan-cyber/70 tracking-widest uppercase mt-4 font-mono">
              Node: <span className="text-cyan-cyber">89.244.1.0</span><br/>
              Status: <span className="text-magenta-cyber underline animate-pulse">Compromised</span>
            </div>
          </div>
        </div>

        {/* Cell 2: Core Vitals (Top Right) */}
        <div className="bento-cell col-span-1 md:col-span-4 row-span-4 p-5 flex flex-col relative z-10">
          <div className="text-magenta-cyber text-lg font-glitch tracking-widest mb-4 flex items-center gap-2 border-b border-magenta-cyber/50 pb-2">
            <Activity className="w-5 h-5" /> CORE VITALS
          </div>
          <div className="space-y-5 flex-1 font-mono">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-cyan-cyber">CPU LOAD</span>
                <span className="text-magenta-cyber font-glitch text-xl">99.9%</span>
              </div>
              <div className="h-2 w-full bg-cyan-cyber/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-magenta-cyber" 
                  animate={{ width: ["95%", "100%", "92%", "100%"] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-cyan-cyber">MEM ALLOC</span>
                <span className="text-magenta-cyber font-glitch text-xl underline">ERR</span>
              </div>
              <div className="h-2 w-full bg-cyan-cyber/20 rounded-full overflow-hidden">
                <div className="h-full bg-magenta-cyber w-[85%] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Cell 3: Terminal Console (Bottom Left) */}
        <div className="bento-cell col-span-1 md:col-span-8 row-span-8 p-6 flex flex-col relative z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-cyber/5 via-transparent to-transparent">
          <div className="flex items-center justify-between border-b border-cyan-cyber/50 pb-2 mb-4">
            <div className="flex items-center gap-2 text-cyan-cyber">
              <Terminal className="w-6 h-6" />
              <span className="tracking-widest text-lg font-glitch uppercase">Main Console</span>
            </div>
            <div className="text-xs font-glitch text-magenta-cyber animate-pulse tracking-widest">
              REC // TAPE_09
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 font-mono text-sm layout-scrollbar">
            {logs.map((log, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${(log || '').includes('FAILED') || (log || '').includes('ERRR') || (log || '').includes('DENIED') || (log || '').includes('WARNING') || (log || '').includes('PANIC') ? 'text-magenta-cyber text-shadow-glow-magenta' : 'text-cyan-cyber text-shadow-glow-cyan'}`}
              >
                {log}
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-auto border border-cyan-cyber/40 flex items-center bg-black/50 focus-within:border-magenta-cyber focus-within:shadow-[0_0_15px_rgba(255,0,255,0.2)] transition-all">
            <div className="pl-4 pr-2 text-magenta-cyber animate-pulse font-glitch text-2xl">
              $&gt;
            </div>
            <input 
              type="text" 
              value={inputValue}
              onChange={handleInput}
              className="flex-1 bg-transparent border-none outline-none p-4 text-cyan-cyber font-mono uppercase tracking-widest placeholder:text-cyan-cyber/20"
              placeholder="ENTER OVERRIDE COMMAND..."
              spellCheck="false"
              autoComplete="off"
            />
          </form>
        </div>

        {/* Cell 4: Sectors (Bottom Right) */}
        <div className="bento-cell col-span-1 md:col-span-4 row-span-8 p-5 flex flex-col relative z-10">
          <div className="text-cyan-cyber text-lg font-glitch tracking-widest mb-4 flex items-center gap-2 border-b border-cyan-cyber/50 pb-2">
            <Database className="w-5 h-5" /> SECTORS
          </div>
          <div className="space-y-3 font-glitch text-xl flex-1">
            {['SECTOR_01', 'SECTOR_02', 'SECTOR_03', 'SECTOR_04', 'SECTOR_05'].map((sector, i) => (
              <div key={sector} className={`flex items-center gap-3 p-3 border ${i >= 3 ? 'border-magenta-cyber bg-magenta-cyber/10 text-magenta-cyber' : 'border-cyan-cyber/30 text-cyan-cyber/50 bg-cyan-cyber/5'} hover:bg-cyan-cyber/20 hover:text-cyan-cyber transition-all cursor-crosshair`}>
                <Database className="w-4 h-4" />
                {sector}
                {i >= 3 && <span className="ml-auto animate-pulse text-xs text-right uppercase tracking-widest leading-none">offline</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-cyan-cyber/30 pt-4 text-[10px] text-cyan-cyber/40 break-all opacity-50 font-glitch leading-tight">
            {Array.from({length: 156}).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
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
