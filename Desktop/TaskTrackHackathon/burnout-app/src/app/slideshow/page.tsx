'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Activity,
  Flame,
  Sparkles,
  ShieldAlert,
  Swords,
  Cpu,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HeartPulse,
  Timer,
  Hammer,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Slide Types
type SlideType = 'intro' | 'problem' | 'solution' | 'ai' | 'breathing' | 'village' | 'crises' | 'raids' | 'stack' | 'conclusion';

interface Slide {
  id: SlideType;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  { id: 'intro', title: 'MindGuard', subtitle: 'Work Healthy. Build Strong.' },
  { id: 'problem', title: 'The Burnout Epidemic', subtitle: 'The Silent Killer of Modern Work & Study' },
  { id: 'solution', title: 'The MindGuard Shield', subtitle: 'Three Layers of Prevention' },
  { id: 'ai', title: 'AI Diagnostics (Gemini)', subtitle: 'Mood & Trajectory Insights' },
  { id: 'breathing', title: 'Emergency Override', subtitle: 'Enforced Decompression' },
  { id: 'village', title: 'Gamified Motivation', subtitle: 'Tasks as Building Blocks' },
  { id: 'crises', title: 'Village Crises', subtitle: 'Gamifying Health Consequences' },
  { id: 'raids', title: 'War Room Raids', subtitle: 'Risk vs. Reward Strategy' },
  { id: 'stack', title: 'Technical Stack', subtitle: 'Modern Web Architecture' },
  { id: 'conclusion', title: 'The Wellness Standard', subtitle: 'Healthy Minds Build Stronger Villages' },
];

export default function Slideshow() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [isImmersive, setIsImmersive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Box breathing simulation state
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathActive, setBreathActive] = useState(false);

  // Raid simulator state
  const [raidDifficulty, setRaidDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [raidStatus, setRaidStatus] = useState<'idle' | 'raiding' | 'victory' | 'defeat'>('idle');
  const [raidChance, setRaidChance] = useState(70);
  const [raidResultGold, setRaidResultGold] = useState(0);

  // References
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault();
        nextSlide();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.code === 'Escape' && isImmersive) {
        setIsImmersive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, isImmersive]);

  // Autoplay handler
  useEffect(() => {
    if (isPlaying) {
      setProgress(0);
      const interval = 100; // tick every 100ms
      const totalDuration = 7000; // 7 seconds per slide
      const increment = (interval / totalDuration) * 100;

      progressTimer.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + increment;
        });
      }, interval);
    } else {
      if (progressTimer.current) clearInterval(progressTimer.current);
    }

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [isPlaying, currentSlideIndex]);

  // Box breathing simulation effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathActive) {
      timer = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              switch (currentPhase) {
                case 'inhale': return 'hold1';
                case 'hold1': return 'exhale';
                case 'exhale': return 'hold2';
                case 'hold2': return 'inhale';
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathActive]);

  // Update raid win chances when difficulty changes
  useEffect(() => {
    switch (raidDifficulty) {
      case 'easy': setRaidChance(70); break;
      case 'medium': setRaidChance(45); break;
      case 'hard': setRaidChance(15); break;
    }
  }, [raidDifficulty]);

  // Slide navigation actions
  const nextSlide = () => {
    setDirection(1);
    setCurrentSlideIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlideIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    setProgress(0);
  };

  const jumpToSlide = (index: number) => {
    setDirection(index > currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(index);
    setProgress(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleImmersive = () => {
    setIsImmersive(!isImmersive);
  };

  // Run mock raid game
  const runMockRaid = () => {
    setRaidStatus('raiding');
    setTimeout(() => {
      const roll = Math.random() * 100;
      const success = roll <= raidChance;
      if (success) {
        setRaidStatus('victory');
        setRaidResultGold(raidDifficulty === 'easy' ? 200 : raidDifficulty === 'medium' ? 500 : 1500);
      } else {
        setRaidStatus('defeat');
        setRaidResultGold(raidDifficulty === 'easy' ? 50 : raidDifficulty === 'medium' ? 150 : 400);
      }
    }, 1500);
  };

  // Slide animation settings
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0
    })
  };

  // Custom breathing widget text/size helpers
  const getBreathingLabel = () => {
    switch (breathPhase) {
      case 'inhale': return 'INHALE';
      case 'hold1': return 'HOLD';
      case 'exhale': return 'EXHALE';
      case 'hold2': return 'REST';
    }
  };

  const getBreathingScale = () => {
    if (!breathActive) return 1.0;
    switch (breathPhase) {
      case 'inhale': return 1.4;
      case 'hold1': return 1.4;
      case 'exhale': return 1.0;
      case 'hold2': return 1.0;
    }
  };

  // Content rendering based on slide ID
  const renderSlideContent = (id: SlideType) => {
    switch (id) {
      case 'intro':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full px-4 select-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl w-48 h-48 mx-auto -z-10" />
              <BrainCircuit className="text-accent w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
              Mind<span className="text-accent">Guard.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-400 font-medium max-w-2xl mb-8 leading-relaxed">
              Gamified Task Management & AI-Driven Burnout Prevention
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={() => setIsImmersive(true)}
                className="bg-accent text-black font-semibold px-8 py-3.5 rounded-xl hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] cursor-pointer"
              >
                <Play size={18} fill="currentColor" /> Start Pitch
              </button>
              <Link
                href="/"
                className="bg-transparent border border-gray-800 text-gray-300 font-medium px-8 py-3.5 rounded-xl hover:bg-gray-900 hover:border-gray-700 transition-all text-center flex items-center justify-center gap-2"
              >
                Dashboard <ArrowRight size={16} />
              </Link>
            </div>

            <p className="text-gray-650 text-xs mt-12 font-mono">
              Use Left / Right Arrows or Spacebar to navigate
            </p>
          </div>
        );

      case 'problem':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full max-w-4xl mx-auto px-4">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-900/60 px-3 py-1.5 rounded-full text-red-400 text-xs font-semibold uppercase tracking-wider">
                <Flame size={14} className="animate-pulse" /> The Issue
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                The Silent Workplace Epidemic: Burnout
              </h2>
              <p className="text-gray-450 leading-relaxed text-sm md:text-base">
                High performers operate in highly pressurized environments. Compressed deadlines, constant context switching, and complex problem-solving demand relentless focus.
              </p>
              <ul className="space-y-3.5 text-sm text-gray-300">
                <li className="flex items-start gap-2.5">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <span><strong>Invisible Fatigue:</strong> Classic task managers track work done, but completely ignore your energy baseline.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <span><strong>Cognitive Friction:</strong> Fatigue spikes analytical errors, degrades focus clarity, and compounds cognitive mistakes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <span><strong>Delayed Relief:</strong> High-performers only stop when they hit total exhaustion, resulting in days of lost momentum.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#151515] p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col justify-center gap-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <span className="text-gray-400 font-mono text-xs">DIAGNOSTIC STATUS</span>
                <span className="text-red-500 text-xs font-bold animate-pulse flex items-center gap-1">
                  CRITICAL OVERLOAD
                </span>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Cognitive Load Factor</span>
                    <span className="text-red-400 font-semibold">92%</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="bg-red-950/20 border-l-4 border-red-500 p-3 rounded-r-lg">
                  <p className="text-xs text-red-400 font-semibold mb-1">Burnout Cascade Triggered</p>
                  <p className="text-xs text-gray-450 leading-normal">
                    AI detects syntax patterns slowing down, repeated deletes, and continuous focus logs. Wellness rating: F.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={14} /> The Innovation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Introducing MindGuard
              </h2>
              <p className="text-gray-450 text-sm mt-2 max-w-lg mx-auto">
                A wellness-first task tracker pairing cognitive analytics with retro village expansion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                {
                  icon: Activity,
                  title: "1. Smart Diagnostics",
                  color: "text-blue-400 bg-blue-950/20 border-blue-900/50",
                  desc: "Categorizes tasks as Focus or Recharge. Tracks work intervals to calculate real-time strain indicators."
                },
                {
                  icon: BrainCircuit,
                  title: "2. Gemini Insights",
                  color: "text-amber-400 bg-amber-950/20 border-amber-900/50",
                  desc: "Semantic logs analyzed by Gemini to evaluate sentiment, track score trajectories, and trigger village events."
                },
                {
                  icon: HeartPulse,
                  title: "3. Action Interventions",
                  color: "text-emerald-400 bg-emerald-950/20 border-emerald-900/50",
                  desc: "Emergency box-breathing locks when burnout spikes, forcing immediate decompression to recover your pace."
                }
              ].map((card, i) => (
                <div key={i} className={`p-5 rounded-xl border ${card.color} bg-opacity-30 backdrop-blur-sm flex flex-col gap-3 hover:scale-[1.02] transition-transform`}>
                  <card.icon className="w-8 h-8" />
                  <h3 className="font-bold text-white text-base">{card.title}</h3>
                  <p className="text-gray-450 text-xs leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full max-w-4xl mx-auto px-4">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-purple-950/40 border border-purple-900/60 px-3 py-1.5 rounded-full text-purple-400 text-xs font-semibold uppercase tracking-wider">
                <BrainCircuit size={14} /> AI Engine
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Deep Semantic Sentiment Analysis
              </h2>
              <p className="text-gray-450 leading-relaxed text-sm">
                Integrates directly with the latest Google Gemini API models to analyze user journal updates.
              </p>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-purple-400 shrink-0" size={16} />
                  <span>Checks emotional undertones to pinpoint stress curves.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-purple-400 shrink-0" size={16} />
                  <span>Translates journal reflections into numeric Burnout Scores.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-purple-400 shrink-0" size={16} />
                  <span>Synthesizes dynamic text suggestions to improve mental hygiene.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800 shadow-xl flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                <BrainCircuit size={18} className="text-accent" />
                <span className="font-bold text-white text-sm">MindGuard Gemini Audit</span>
              </div>
              
              <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
                <p className="text-[10px] text-gray-500 font-mono">USER LOG REFLECTION</p>
                <p className="text-gray-300 text-xs italic mt-1 font-medium leading-relaxed">
                  "I've been working on this project report for 4 hours straight and nothing is making sense. My head feels heavy, I'm losing focus, and I just want to close the laptop and sleep."
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-black/40 rounded border border-gray-900">
                  <span className="text-gray-500">Detected State:</span>
                  <span className="text-amber-400 font-bold">FRUSTRATED & EXHAUSTED</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/40 rounded border border-gray-900">
                  <span className="text-gray-500">Calculated Stress Score:</span>
                  <span className="text-red-500 font-bold font-mono">78 / 100</span>
                </div>
                <div className="p-3 bg-accent/5 rounded border border-accent/20">
                  <span className="text-accent font-semibold block mb-0.5 text-[11px]">GEMINI DIRECTIVE</span>
                  <p className="text-gray-300 leading-normal text-[11px]">
                    Step away from the screen. Walk for 5 minutes and drink water. Do not push yourself further in this state.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'breathing':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full max-w-4xl mx-auto px-4">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <HeartPulse size={14} /> Emergency Override
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Enforced Wellness Decompression
              </h2>
              <p className="text-gray-450 text-sm leading-relaxed">
                When cognitive stress crosses the **Danger Line**, MindGuard triggers a mandatory lock screen. Work is frozen. Paced breathing is activated.
              </p>
              <ul className="space-y-3.5 text-xs text-gray-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span><strong>Locked Panels:</strong> All task management modules are disabled until breathing cycle completion.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span><strong>Box Breathing (4-4-4-4):</strong> Guided pacing ring helps calm the nervous system.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span><strong>Heart Recovery:</strong> Forces physical detachment from the workspace, preventing emotional exhaustion.</span>
                </li>
              </ul>
            </div>

            {/* Interactive Breathing Simulation */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden min-h-[300px]">
              <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono bg-black/60 border border-gray-900 px-2 py-0.5 rounded">
                DEMO WIDGET
              </div>
              
              <h3 className="text-sm font-bold text-white">Box Breathing Visualizer</h3>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Breathing ring */}
                <motion.div
                  animate={{
                    scale: getBreathingScale(),
                    borderColor: breathActive 
                      ? breathPhase === 'inhale' ? '#10b981' : breathPhase === 'hold1' ? '#3b82f6' : breathPhase === 'exhale' ? '#f59e0b' : '#ef4444'
                      : '#333333'
                  }}
                  transition={{ duration: breathPhase === 'inhale' || breathPhase === 'exhale' ? 4 : 0.5, ease: 'easeInOut' }}
                  className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center bg-black/40 z-10"
                >
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                    {breathActive ? getBreathingLabel() : 'READY'}
                  </span>
                  <span className="text-2xl font-mono font-bold text-white">
                    {breathActive ? `${breathTimer}s` : '--'}
                  </span>
                </motion.div>

                {/* Glowing breathing shadow */}
                {breathActive && (
                  <motion.div
                    animate={{ scale: getBreathingScale() * 1.1, opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute w-28 h-28 rounded-full bg-emerald-500/10 blur-xl"
                  />
                )}
              </div>

              <button
                onClick={() => setBreathActive(!breathActive)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  breathActive 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20' 
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                }`}
              >
                {breathActive ? 'Pause Demo' : 'Run Paced Breathing'}
              </button>
            </div>
          </div>
        );

      case 'village':
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-950/40 border border-yellow-900/60 px-3 py-1.5 rounded-full text-accent text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={14} /> Gamification
              </div>
              <h2 className="text-3xl font-bold text-white">Gamified Motivation Engine</h2>
              <p className="text-gray-455 text-xs mt-1">
                Your real-world accomplishments power your digital village. Spend task cash to build & expand.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              {[
                {
                  title: "Wheat Farms",
                  tagline: "🌾 Growth Base",
                  stat: "+2 Population per min",
                  cost: "100 Gold",
                  color: "border-yellow-900/50 hover:shadow-yellow-900/10 bg-yellow-950/10",
                  desc: "Supports population capacity. Increases your overall village growth potential."
                },
                {
                  title: "Gold Markets",
                  tagline: "🪙 Economic Engine",
                  stat: "+5 Gold per min",
                  cost: "150 Gold",
                  color: "border-amber-900/50 hover:shadow-amber-900/10 bg-amber-950/10",
                  desc: "Generates passive gold. Completing tasks boosts this revenue curve."
                },
                {
                  title: "Guard Towers",
                  tagline: "🏹 War Defense",
                  stat: "+15% Raid Safety Factor",
                  cost: "250 Gold",
                  color: "border-blue-900/50 hover:shadow-blue-900/10 bg-blue-950/10",
                  desc: "Protects against damage. Boosts tactical advantage during Village Raids."
                }
              ].map((b, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${b.color} bg-black/40 hover:scale-[1.01] transition-all flex flex-col justify-between`}>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 font-bold uppercase">{b.tagline}</span>
                      <span className="text-[10px] text-accent bg-accent/5 px-2 py-0.5 border border-accent/20 rounded font-bold">{b.cost}</span>
                    </div>
                    <h3 className="font-bold text-white text-base mb-2">{b.title}</h3>
                    <p className="text-gray-450 text-xs leading-normal mb-3">{b.desc}</p>
                  </div>
                  <div className="text-[11px] text-accent font-mono font-bold bg-black/60 p-2 rounded border border-gray-900 text-center">
                    {b.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'crises':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full max-w-4xl mx-auto px-4">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-orange-950/40 border border-orange-900/60 px-3 py-1.5 rounded-full text-orange-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldAlert size={14} className="animate-pulse" /> Wellness Consequence
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                AI Village Crises
              </h2>
              <p className="text-gray-450 text-sm leading-relaxed">
                If you push through burnout and ignore check-in warnings, Gemini-triggered crises hit your village:
              </p>
              <ul className="space-y-3.5 text-xs text-gray-300">
                <li className="flex items-start gap-2.5">
                  <XCircle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                  <span><strong>Structural Damage:</strong> Collapsing roofs decrease economy outputs by 50%.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                  <span><strong>Supply Shortage:</strong> Worker fatigue halts active income and stops progression.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                  <span><strong>Active Repair Loop:</strong> Must log wellness actions or spend Gold to fix buildings before they collapse.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800 flex flex-col gap-4 relative overflow-hidden text-left">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl animate-pulse" />
              
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-orange-500 text-xs font-bold flex items-center gap-1">
                  ⚠️ AI EVENT TRIGGERED
                </span>
                <span className="text-[10px] text-gray-500 font-mono">CRISIS WARNING</span>
              </div>

              <div className="p-3 bg-orange-950/20 border border-orange-900/30 rounded text-center">
                <p className="text-xs text-orange-400 font-bold">EVENT: LABOR STRIKE</p>
                <p className="text-[10px] text-gray-450 mt-1 leading-normal">
                  "Due to user exhaustion, farm workers have walked out. Store yields are frozen until recharge completed."
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">🌾 Farm HP</span>
                    <span className="text-orange-400 font-bold font-mono">35 / 100</span>
                  </div>
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-gray-900">
                    <div className="bg-orange-500 h-full rounded-full w-[35%]" />
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <div className="flex-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded py-2 text-[10px] font-bold text-center flex items-center justify-center gap-1">
                    <Hammer size={12} /> Repair (50 Gold)
                  </div>
                  <div className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded py-2 text-[10px] font-bold text-center flex items-center justify-center gap-1">
                    <Timer size={12} /> Complete Recharge
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'raids':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full max-w-4xl mx-auto px-4">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/60 px-3 py-1.5 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Swords size={14} /> War Room
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Village Raiding Mechanics
              </h2>
              <p className="text-gray-455 text-sm leading-relaxed">
                Take tactical risks! Launch raids against nearby towns for gold, using your population and defense to skew the odds.
              </p>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-400 shrink-0" size={16} />
                  <span><strong>Raid Tiers:</strong> Small Settlement, Fortified Town, and The Citadel.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-400 shrink-0" size={16} />
                  <span><strong>Tactical Boost:</strong> Population and Guard Towers raise success probability.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-400 shrink-0" size={16} />
                  <span><strong>Risk Outcomes:</strong> Failure drains cash reserves and inflicts random building damage.</span>
                </li>
              </ul>
            </div>

            {/* Live Interactive Raid Simulator */}
            <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800 flex flex-col gap-4 relative overflow-hidden min-h-[300px] justify-between text-left">
              <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono bg-black/60 border border-gray-900 px-2 py-0.5 rounded">
                SIMULATOR WIDGET
              </div>

              <div className="text-center pt-2">
                <h3 className="text-sm font-bold text-white">Raid Command Room</h3>
              </div>

              {raidStatus === 'idle' && (
                <div className="space-y-3.5">
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setRaidDifficulty(diff)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded border capitalize cursor-pointer transition-all ${
                          raidDifficulty === diff
                            ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                            : 'bg-black/40 border-gray-900 text-gray-500 hover:text-gray-450'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>

                  <div className="bg-black/60 p-3 rounded-lg border border-gray-950 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-white font-bold capitalize">
                        {raidDifficulty === 'easy' ? 'Small Settlement' : raidDifficulty === 'medium' ? 'Fortified Town' : 'The Citadel'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Victory Probability:</span>
                      <span className="text-indigo-400 font-bold font-mono">{raidChance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raid Reward/Risk:</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        +{raidDifficulty === 'easy' ? '200' : raidDifficulty === 'medium' ? '500' : '1500'}{' '}
                        <span className="text-red-400">
                          /-{raidDifficulty === 'easy' ? '50' : raidDifficulty === 'medium' ? '150' : '400'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={runMockRaid}
                    className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer"
                  >
                    🚀 Launch Raid!
                  </button>
                </div>
              )}

              {raidStatus === 'raiding' && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <RefreshCw className="animate-spin text-indigo-400 w-10 h-10" />
                  <p className="text-xs text-gray-450 font-mono animate-pulse">
                    Clashing shields... marching battalions...
                  </p>
                </div>
              )}

              {(raidStatus === 'victory' || raidStatus === 'defeat') && (
                <div className="flex flex-col items-center justify-center py-4 text-center gap-3">
                  {raidStatus === 'victory' ? (
                    <>
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <ShieldCheck size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">RAID VICTORY!</h4>
                        <p className="text-xs text-emerald-400 font-mono font-bold mt-1">
                          +{raidResultGold} Gold Plundered!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <XCircle size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">RAID DEFEAT</h4>
                        <p className="text-xs text-red-400 font-mono font-bold mt-1">
                          -{raidResultGold} Gold Lost & building damaged!
                        </p>
                      </div>
                    </>
                  )}
                  
                  <button
                    onClick={() => setRaidStatus('idle')}
                    className="mt-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-4 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Return to Map
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'stack':
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-900/60 px-3 py-1.5 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Cpu size={14} /> Architecture
              </div>
              <h2 className="text-3xl font-bold text-white">The Technical Framework</h2>
              <p className="text-gray-455 text-xs mt-1">
                A robust front-end stack engineered for responsive feedback and wellness logic.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
              {[
                { title: "Next.js 16", subtitle: "App Router setup", color: "border-gray-800" },
                { title: "React 19", subtitle: "Concurrent hooks", color: "border-gray-800" },
                { title: "Gemini API", subtitle: "@google/genai SDK", color: "border-purple-900/50" },
                { title: "Tailwind CSS v4", subtitle: "Theme engine & HSL", color: "border-gray-800" },
                { title: "Framer Motion", subtitle: "Isometric canvas panning", color: "border-gray-800" },
                { title: "Zustand", subtitle: "State persist loop", color: "border-gray-800" }
              ].map((tech, i) => (
                <div key={i} className={`p-4 rounded-xl border bg-[#121212]/40 backdrop-blur-sm ${tech.color} hover:border-gray-700 transition-colors`}>
                  <h3 className="font-bold text-white text-sm mb-0.5">{tech.title}</h3>
                  <p className="text-gray-500 text-[11px] font-mono">{tech.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'conclusion':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full px-4 select-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="mb-6"
            >
              <BrainCircuit className="text-accent w-20 h-20 drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Work Healthy. Build Strong.
            </h2>

            <p className="text-base md:text-lg text-gray-405 max-w-xl mb-8 leading-relaxed">
              By aligning cognitive well-being with fun progression systems, MindGuard shifts wellness from a chore into a core mechanic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="bg-accent text-black font-semibold px-8 py-3 rounded-xl hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setCurrentSlideIndex(0);
                  setIsImmersive(false);
                }}
                className="bg-transparent border border-gray-800 text-gray-300 font-medium px-8 py-3 rounded-xl hover:bg-gray-900 hover:border-gray-700 transition-all cursor-pointer"
              >
                Exit Presentation
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentSlide = SLIDES[currentSlideIndex];

  return (
    <div className={`w-full flex flex-col items-center justify-center transition-all ${isImmersive ? 'fixed inset-0 bg-[#060606] z-[9999] p-6 md:p-12' : 'min-h-[550px] py-4'}`}>
      
      {/* Immersive Banner Header */}
      {isImmersive && (
        <div className="absolute top-6 left-8 right-8 flex justify-between items-center text-gray-500 font-mono text-xs z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-white font-bold tracking-wider">MINDGUARD PRESENTATION</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Slide {currentSlideIndex + 1} of {SLIDES.length}</span>
            <button
              onClick={() => setIsImmersive(false)}
              className="text-gray-400 hover:text-white font-bold border border-gray-800 bg-black/40 px-3 py-1.5 rounded-lg hover:border-gray-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Minimize2 size={14} /> Exit (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Autoplay Progress bar at top of immersive */}
      {isImmersive && isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900">
          <div className="h-full bg-accent transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Presentation Canvas */}
      <div className={`relative w-full flex items-center justify-center flex-1 max-w-5xl rounded-3xl border border-gray-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden ${isImmersive ? 'bg-[#0b0b0b]' : 'bg-[#0f0f0f] border-gray-800/80 min-h-[500px]'}`}>
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f11_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f11_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Soft Background Gradients */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Carousel Container */}
        <div className="w-full h-full p-6 md:p-12 z-10 flex flex-col justify-center min-h-[420px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full h-full flex flex-col justify-center"
            >
              {renderSlideContent(currentSlide.id)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Overlays (Desktop Arrow hovers) */}
        {!isImmersive && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-gray-800 text-gray-400 hover:text-white flex items-center justify-center hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 hover:opacity-100 focus:opacity-100 z-30"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-gray-800 text-gray-400 hover:text-white flex items-center justify-center hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 hover:opacity-100 focus:opacity-100 z-30"
              aria-label="Next Slide"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Control Console (Buttons & Slide indicator dots) */}
      <div className="w-full max-w-xl flex flex-col items-center gap-4 mt-6">
        
        {/* Direct Slide Navigation dots */}
        <div className="flex gap-2">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => jumpToSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === idx 
                  ? 'bg-accent w-6 shadow-[0_0_10px_rgba(255,215,0,0.5)]' 
                  : 'bg-gray-800 hover:bg-gray-600'
              }`}
              title={slide.title}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Playback Controls Panel */}
        <div className="flex items-center gap-3 bg-[#121212]/80 border border-gray-800 px-4 py-2.5 rounded-2xl shadow-lg w-full justify-between sm:w-auto">
          
          <button
            onClick={prevSlide}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-950 transition-colors cursor-pointer"
            title="Previous (Arrow Left)"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={togglePlay}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isPlaying ? 'text-accent hover:bg-gray-950' : 'text-gray-400 hover:text-white hover:bg-gray-950'
            }`}
            title={isPlaying ? 'Pause Auto-play' : 'Auto-play Slideshow'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <span className="text-xs font-mono text-gray-500 min-w-[64px] text-center select-none">
            {String(currentSlideIndex + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </span>

          <button
            onClick={toggleImmersive}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isImmersive ? 'text-accent hover:bg-gray-950' : 'text-gray-400 hover:text-white hover:bg-gray-950'
            }`}
            title={isImmersive ? 'Exit Presentation Mode (Esc)' : 'Enter Presentation Mode'}
          >
            {isImmersive ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <button
            onClick={nextSlide}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-950 transition-colors cursor-pointer"
            title="Next (Arrow Right / Space)"
          >
            <ChevronRight size={20} />
          </button>

        </div>
      </div>
    </div>
  );
}
