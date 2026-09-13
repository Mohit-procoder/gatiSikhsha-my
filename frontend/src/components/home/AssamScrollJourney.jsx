import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar, Award, Users, BookOpen, BrainCircuit,
  Code2, Trophy, MapPin, Sparkles, ArrowDown
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function SchoolIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

// =============================================================================
// SINGLE SOURCE OF TRUTH: OFFICIAL 10-STEP SCHEDULE
// =============================================================================
export const STAGES = [
  { step: '01', title: 'School Registration', date: '17th to 30th September, 2026', desc: 'Registrations for participating schools/teams.', category: 'Registration', icon: SchoolIcon, color: 'emerald', percent: 6 },
  { step: '02', title: 'Team Orientation', date: '1st to 10th October, 2026', desc: 'Orientation of 2 hours for participating teams through SSA YouTube.', category: 'Orientation', icon: Users, color: 'teal', percent: 17 },
  { step: '03', title: 'Self-Paced Foundation Learning', date: '10th to 22nd October, 2026', desc: 'Teams complete the self-paced Foundation Learning activities.', category: 'Foundation Learning', icon: BookOpen, color: 'cyan', percent: 28 },
  { step: '04', title: 'MCQ Assessment', date: '23rd to 30th October, 2026', desc: 'Assessment of participating teams through MCQ.', category: 'Assessment', icon: BrainCircuit, color: 'amber', percent: 39 },
  { step: '05', title: 'District-Level Shortlisting', date: '1st to 7th November, 2026', desc: 'Shortlisting for the District Level, with teams distributed equally by district (approximately 70 teams per district).', category: 'District Shortlisting', icon: MapPin, color: 'orange', percent: 50 },
  { step: '06', title: 'Self-Paced Advanced Learning', date: '9th November to 6th December, 2026', desc: 'Teams complete the self-paced Advanced Learning activities.', category: 'Advanced Learning', icon: Code2, color: 'blue', percent: 61 },
  { step: '07A', title: 'Coding Challenge Assessment', date: '14th to 19th December, 2026', desc: 'Assessment through Coding Challenge for the relevant team category.', category: 'Coding Challenge', icon: Code2, color: 'indigo', percent: 70 },
  { step: '07B', title: 'Jury Round Shortlisting', date: '21st to 26th December, 2026', desc: 'Shortlisting for the Jury Round based on soft skills, with the Top 20 teams per district.', category: 'Jury Round', offline: true, icon: Award, color: 'purple', percent: 79 },
  { step: '08', title: '72-Hour Hackathon', date: '4th to 8th January, 2027', desc: 'A 5-day offline activity involving assessment through the 72-Hour Hackathon.', category: 'Hackathon', offline: true, icon: Trophy, color: 'rose', percent: 89 },
  { step: '09', title: 'Winners', date: 'Final Outcome', desc: 'Final selection of 30 winners across Assam.', category: 'Final', highlightBadge: '30 Winners', icon: Sparkles, color: 'emerald', percent: 97 }
];

// =============================================================================
// SERPENTINE SVG PATH — Scaled up to match Journey page visual (viewBox 1200x920)
// Row 1 left->right: 01-04  (y=100)
// Row 2 right->left: 07B-05 (y=420)
// Row 3 left->right: 08-09  (y=740)
// =============================================================================
const SERP_PATH = 'M 160,100 L 1030,100 C 1180,100 1180,420 1030,420 L 160,420 C 20,420 20,740 160,740 L 450,740';

// Node coordinates matching the Journey page SVG_COORDS
const NODE_COORDS_INIT = [
  { x: 160,  y: 100 },
  { x: 450,  y: 100 },
  { x: 740,  y: 100 },
  { x: 1030, y: 100 },
  { x: 1030, y: 420 },
  { x: 740,  y: 420 },
  { x: 450,  y: 420 },
  { x: 160,  y: 420 },
  { x: 160,  y: 740 },
  { x: 450,  y: 740 },
];

const AssamScrollJourney = () => {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const activeTrailRef = useRef(null);
  const boyRef = useRef(null);
  const womanRef = useRef(null);
  const rhinoRef = useRef(null);
  const vegSlowRef = useRef(null);
  const vegMedRef = useRef(null);
  const vegFastRef = useRef(null);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [nodePositions, setNodePositions] = useState(NODE_COORDS_INIT);

  // Recalculate node positions from the actual rendered SVG path after mount
  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;
    const totalLen = pathEl.getTotalLength();

    const positions = STAGES.map((s) => {
      const pt = pathEl.getPointAtLength((s.percent / 100) * totalLen);
      return { x: pt.x, y: pt.y };
    });
    setNodePositions(positions);

    if (activeTrailRef.current) {
      activeTrailRef.current.style.strokeDasharray = `${totalLen}`;
      activeTrailRef.current.style.strokeDashoffset = `${totalLen}`;
    }

    const startPt = pathEl.getPointAtLength(0);
    if (boyRef.current) {
      boyRef.current.setAttribute('transform', `translate(${startPt.x},${startPt.y}) scale(0.65,0.65)`);
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const pathEl = pathRef.current;
      const boyEl = boyRef.current;
      const containerEl = containerRef.current;
      if (!pathEl || !boyEl || !containerEl) return;

      const pathLength = pathEl.getTotalLength();

      if (prefersReducedMotion) {
        const startPt = pathEl.getPointAtLength(0);
        boyEl.setAttribute('transform', `translate(${startPt.x},${startPt.y}) scale(0.65,0.65)`);
        if (activeTrailRef.current) activeTrailRef.current.style.strokeDashoffset = '0';
        return;
      }

      ScrollTrigger.create({
        trigger: containerEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = Math.min(1, Math.max(0, self.progress));
          setScrollProgress(progress);

          // Active trail
          if (activeTrailRef.current) {
            activeTrailRef.current.style.strokeDashoffset = pathLength * (1 - progress);
          }

          // Student position along serpentine path
          const currentDistance = progress * pathLength;
          const currentPoint = pathEl.getPointAtLength(currentDistance);
          const d1 = Math.max(0, currentDistance - 8);
          const d2 = Math.min(pathLength, currentDistance + 8);
          const p1 = pathEl.getPointAtLength(d1);
          const p2 = pathEl.getPointAtLength(d2);
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;

          // Flip horizontally when moving leftwards (Row 2)
          const scaleFactor = 0.65;
          const scaleX = dx < -0.1 ? -scaleFactor : scaleFactor;
          const rawAngle = Math.atan2(dy, Math.abs(dx) || 0.001) * (180 / Math.PI);
          const gentleAngle = Math.max(-15, Math.min(15, rawAngle * 0.3));

          boyEl.setAttribute('transform',
            `translate(${currentPoint.x},${currentPoint.y}) rotate(${gentleAngle}) scale(${scaleX},${scaleFactor})`
          );

          // Parallax for lady, rhino, vegetation
          if (womanRef.current) gsap.set(womanRef.current, { y: (progress - 0.5) * -16, rotate: Math.sin(progress * 6) * 1.2 });
          if (rhinoRef.current) gsap.set(rhinoRef.current, { y: (progress - 0.5) * -12, rotate: Math.cos(progress * 5) * 0.8 });
          if (vegSlowRef.current) gsap.set(vegSlowRef.current, { y: progress * -20 });
          if (vegMedRef.current) gsap.set(vegMedRef.current, { y: progress * -35 });
          if (vegFastRef.current) gsap.set(vegFastRef.current, { y: progress * -50 });

          // Checkpoint: closest to current distance
          let currentIdx = 0;
          let minDiff = Infinity;
          STAGES.forEach((s, i) => {
            const diff = Math.abs((s.percent / 100) * pathLength - currentDistance);
            if (diff < minDiff) { minDiff = diff; currentIdx = i; }
          });
          setActiveStepIndex(currentIdx);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const activeStage = STAGES[activeStepIndex] || STAGES[0];

  return (
    <section
      ref={containerRef}
      id="journey"
      className="relative w-full bg-gradient-to-b from-[#faf8f5] via-[#f3ede3] to-[#faf8f5]"
      style={{ height: '500vh' }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pointer-events-none z-20">

        {/* ── HEADER (Top) ── */}
        <div className="shrink-0 pt-14 sm:pt-16 px-4 text-center z-30 pointer-events-auto max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Scroll-Driven State Innovation Odyssey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Follow the Student Journey Through Assam
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl mx-auto hidden sm:block leading-relaxed">
            Scroll down to watch our student innovator travel through tea gardens, knowledge camps, and zonal hackathons to the state final.
          </p>
          <div className="w-full max-w-lg mx-auto mt-3 h-2 bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 rounded-full transition-all duration-150"
              style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
            />
          </div>
        </div>

        {/* ── BACKGROUND VEGETATION (Z-0) ── */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div ref={vegSlowRef} className="absolute right-0 top-10 opacity-25">
            <svg width="500" height="300" viewBox="0 0 450 260" className="translate-x-12">
              <path d="M 0,260 L 70,110 L 150,180 L 250,70 L 370,190 L 450,130 L 450,260 Z" fill="#7ba3b8" />
              <path d="M 100,260 L 190,140 L 290,210 L 450,120 L 450,260 Z" fill="#9dbfce" opacity="0.6" />
            </svg>
          </div>
          <div ref={vegMedRef} className="absolute right-0 top-1/3 opacity-30">
            <svg width="500" height="360" viewBox="0 0 460 320" className="translate-x-16">
              <path d="M 0,320 Q 140,180 320,230 Q 390,250 460,210 L 460,320 Z" fill="#2d6a4f" opacity="0.8" />
              <circle cx="180" cy="230" r="24" fill="#52b788" opacity="0.7" /><circle cx="220" cy="225" r="28" fill="#40916c" opacity="0.8" />
              <circle cx="260" cy="240" r="26" fill="#2d6a4f" /><circle cx="310" cy="235" r="30" fill="#52b788" opacity="0.8" />
            </svg>
          </div>
          <div ref={vegFastRef} className="absolute -right-16 bottom-0 opacity-30">
            <svg width="500" height="560" viewBox="0 0 450 520" className="overflow-visible">
              <defs><linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#74c69d" /><stop offset="40%" stopColor="#40916c" /><stop offset="100%" stopColor="#1b4332" /></linearGradient></defs>
              <path d="M 200,520 C 150,390 80,290 20,220 C -10,180 60,130 140,160 C 240,200 380,300 450,520 Z" fill="url(#leaf-grad)" filter="drop-shadow(-8px -4px 18px rgba(15,41,66,0.15))" />
              <path d="M 200,520 Q 120,320 70,180" stroke="#a7f3d0" strokeWidth="4" fill="none" opacity="0.6" />
              <path d="M 300,520 C 260,360 200,260 120,200 C 100,180 170,150 240,190 C 330,240 420,360 480,520 Z" fill="#2d6a4f" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* ── MIDDLE MAIN ROW (Lady - Serpentine Road/Card - Rhino) ── */}
        <div className="flex-1 flex flex-row items-center justify-between px-2 sm:px-4 lg:px-8 w-full max-w-[1600px] mx-auto min-h-0 relative z-20 overflow-hidden gap-1 sm:gap-3">

          {/* LADY (Left) */}
          <div ref={womanRef} className="shrink-0 w-28 sm:w-40 lg:w-52 xl:w-60 pointer-events-none select-none z-20 self-end pb-2 sm:pb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full" />
              <svg viewBox="0 0 300 450" className="w-full h-auto drop-shadow-2xl">
                <defs>
                  <linearGradient id="tea-basket" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#b45309" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
                  <linearGradient id="saree-drape" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fdf4dc" /><stop offset="50%" stopColor="#f5e6c4" /><stop offset="100%" stopColor="#e2c892" /></linearGradient>
                  <linearGradient id="muga-red-border" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#dc2626" /><stop offset="100%" stopColor="#991b1b" /></linearGradient>
                </defs>
                <g className="animate-pulse" style={{ animationDuration: '4s' }}>
                  <ellipse cx="110" cy="180" rx="42" ry="58" fill="url(#tea-basket)" stroke="#572208" strokeWidth="3" transform="rotate(-15, 110, 180)" />
                  <path d="M 80,140 Q 110,180 140,220 M 70,180 Q 110,190 150,180 M 80,210 Q 110,210 140,160" stroke="#fcd34d" strokeWidth="1.5" opacity="0.6" />
                  <path d="M 75,130 Q 95,115 115,125 Q 135,110 150,135 Q 130,150 90,145 Z" fill="#2d6a4f" />
                  <circle cx="100" cy="125" r="5" fill="#52b788" /><circle cx="125" cy="120" r="6" fill="#74c69d" /><circle cx="112" cy="132" r="4.5" fill="#40916c" />
                  <path d="M 95,145 C 105,105 130,70 155,75" fill="none" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                </g>
                <g>
                  <circle cx="175" cy="72" r="18" fill="#1e1b18" /><circle cx="186" cy="65" r="4" fill="#ef4444" />
                  <ellipse cx="160" cy="78" rx="16" ry="18" fill="#d4a373" />
                  <path d="M 148,65 Q 165,58 178,68 Q 165,72 152,70 Z" fill="#f87171" opacity="0.9" />
                  <rect x="156" y="94" width="10" height="12" fill="#c68a52" rx="2" />
                  <path d="M 154,102 Q 161,107 168,102" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
                  <path d="M 140,105 Q 160,100 178,110 L 190,165 Q 160,175 135,160 Z" fill="#b91c1c" />
                  <path d="M 142,108 Q 165,135 150,210 L 195,290 Q 210,190 180,115 Z" fill="url(#saree-drape)" stroke="#d97706" strokeWidth="1" />
                  <path d="M 142,108 Q 165,135 150,210" stroke="url(#muga-red-border)" strokeWidth="4" fill="none" />
                  <path d="M 150,210 L 195,290" stroke="url(#muga-red-border)" strokeWidth="4" fill="none" />
                  <path d="M 140,200 L 130,360 Q 170,370 205,355 L 190,210 Z" fill="url(#saree-drape)" />
                  <path d="M 130,352 Q 170,362 205,347" stroke="url(#muga-red-border)" strokeWidth="6" fill="none" />
                  <path d="M 175,120 Q 205,150 200,185 Q 185,188 178,175" fill="none" stroke="#d4a373" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="196" cy="180" r="4" fill="#d4a373" />
                  <path d="M 198,175 Q 210,165 215,172 Q 208,182 198,175 Z" fill="#40916c" />
                  <path d="M 200,174 Q 206,160 212,165 Q 207,175 200,174 Z" fill="#52b788" />
                </g>
                <ellipse cx="160" cy="370" rx="60" ry="12" fill="#1b4332" opacity="0.4" />
              </svg>
              <div className="mt-1 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs text-center">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-950">Tea Garden Heritage</span>
              </div>
            </div>
          </div>

          {/* ROAD + CARD (Center) */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0 mx-auto px-0 h-full pointer-events-none">

            {/* Serpentine SVG — Full Journey page scale */}
            <div className="relative w-full flex items-center justify-center">
              <svg
                viewBox="0 0 1200 940"
                className="w-full h-auto max-h-[50vh] sm:max-h-[55vh] overflow-visible"
                aria-label="Assam Innovation Serpentine Road"
              >
                <defs>
                  <linearGradient id="hp-road-base" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f1ece4" /><stop offset="100%" stopColor="#e5ded2" /></linearGradient>
                  <linearGradient id="hp-active-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#059669" /><stop offset="50%" stopColor="#10b981" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                  <linearGradient id="hp-boy-shirt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0284c7" /><stop offset="100%" stopColor="#0369a1" /></linearGradient>
                  <linearGradient id="hp-boy-skin" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fed7aa" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                  <filter id="hp-road-shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.07" /></filter>
                  <filter id="hp-active-glow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="0.55" /></filter>
                </defs>

                {/* Road layers — matching Journey page stroke widths */}
                <path d={SERP_PATH} fill="none" stroke="url(#hp-road-base)" strokeWidth="56" strokeLinecap="round" filter="url(#hp-road-shadow)" />
                <path d={SERP_PATH} fill="none" stroke="#ffffff" strokeWidth="42" strokeLinecap="round" opacity="0.95" />
                <path ref={pathRef} id="hp-master-path" d={SERP_PATH} fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="10 8" strokeLinecap="round" />
                <path ref={activeTrailRef} id="hp-active-trail" d={SERP_PATH} fill="none" stroke="url(#hp-active-gradient)" strokeWidth="12" strokeLinecap="round" filter="url(#hp-active-glow)" />

                {/* Bend arrows */}
                <g transform="translate(1145, 260) rotate(90)" opacity="0.6">
                  <path d="M -6,-6 L 0,0 L 6,-6" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d="M -6,2 L 0,8 L 6,2" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </g>
                <g transform="translate(55, 580) rotate(90)" opacity="0.6">
                  <path d="M -6,-6 L 0,0 L 6,-6" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d="M -6,2 L 0,8 L 6,2" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Checkpoint nodes — matching Journey page node sizes */}
                {nodePositions.map((pos, idx) => {
                  const isActive = activeStepIndex >= idx;
                  const isCurrent = activeStepIndex === idx;
                  const stepStr = STAGES[idx]?.step || String(idx + 1).padStart(2, '0');
                  return (
                    <g key={stepStr} className="transition-all duration-300">
                      {isCurrent && <circle cx={pos.x} cy={pos.y} r="32" fill="#10b981" opacity="0.22" className="animate-ping" />}
                      <circle cx={pos.x} cy={pos.y} r={isCurrent ? 24 : isActive ? 19 : 15} fill={isCurrent ? '#f59e0b' : isActive ? '#10b981' : '#94a3b8'} opacity={isCurrent ? 0.9 : isActive ? 0.75 : 0.4} />
                      <circle cx={pos.x} cy={pos.y} r={isCurrent ? 15 : isActive ? 12 : 9} fill={isCurrent ? '#064e3b' : isActive ? '#065f46' : '#475569'} stroke="#ffffff" strokeWidth="2.5" />
                      <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#ffffff" fontSize={stepStr.length > 2 ? '8' : '9'} fontWeight="bold" fontFamily="sans-serif">{stepStr}</text>
                    </g>
                  );
                })}

                {/* Student traveler */}
                <g ref={boyRef} id="hp-student-traveler" className="will-change-transform" style={{ transformOrigin: '0px 0px' }}>
                  {/* Shadow */}
                  <ellipse cx="0" cy="-2" rx="18" ry="6" fill="#0f172a" opacity="0.3" />
                  {/* Character Body */}
                  <g transform="translate(0, -6)">
                    {/* Backpack */}
                    <rect x="-18" y="-48" width="12" height="24" rx="4" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
                    <path d="M -16,-42 Q -22,-30 -16,-20" stroke="#b45309" strokeWidth="2" fill="none" />
                    {/* Legs */}
                    <path d="M -6,-20 L -10,0" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 6,-20 L 10,-2" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                    {/* Shoes */}
                    <path d="M -14,0 L -6,0" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 6,-2 L 14,-2" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                    {/* Torso & Uniform */}
                    <path d="M -12,-52 L 12,-52 L 10,-20 L -10,-20 Z" fill="url(#hp-boy-shirt)" />
                    <polygon points="0,-48 -5,-52 5,-52" fill="#ffffff" />
                    <polygon points="-1,-48 1,-48 2,-32 0,-28 -2,-32" fill="#dc2626" />
                    {/* Arms */}
                    <path d="M -12,-46 Q -18,-34 -8,-28" stroke="url(#hp-boy-skin)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                    <path d="M 12,-46 Q 18,-34 8,-28" stroke="url(#hp-boy-skin)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                    <rect x="2" y="-34" width="12" height="15" rx="2" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" transform="rotate(12, 8, -26)" />
                    {/* Head */}
                    <circle cx="0" cy="-62" r="11" fill="url(#hp-boy-skin)" />
                    <path d="M -10,-65 C -10,-76 10,-76 10,-65 C 6,-72 -6,-72 -10,-65 Z" fill="#1e1b18" />
                    <circle cx="-3" cy="-63" r="1.5" fill="#0f172a" />
                    <circle cx="4" cy="-63" r="1.5" fill="#0f172a" />
                    <path d="M -2,-58 Q 0,-55 3,-58" stroke="#b45309" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    {/* Badge */}
                    <g transform="translate(0, -82)">
                      <rect x="-36" y="-8" width="72" height="16" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#fcd34d" fontSize="7.5" fontWeight="bold">Young Innovator</text>
                    </g>
                  </g>
                </g>
              </svg>
            </div>

            {/* Active Stage Info Card — Larger, matching Journey page card style */}
            <div className="pointer-events-auto mt-3 sm:mt-4 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-600/30 shadow-lg p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                        {activeStage.step}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300/60">{activeStage.category}</span>
                      {activeStage.offline && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />OFFLINE
                        </span>
                      )}
                      {activeStage.highlightBadge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 flex items-center gap-0.5">
                          <Trophy className="w-2.5 h-2.5 text-amber-700" />{activeStage.highlightBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                      <Calendar className="w-3 h-3" />
                      {activeStage.date.split(',')[0]}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">{activeStage.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">{activeStage.desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* RHINO (Right) */}
          <div ref={rhinoRef} className="shrink-0 w-32 sm:w-48 lg:w-60 xl:w-72 pointer-events-none select-none z-20 self-end pb-2 sm:pb-6">
            <div className="relative">
              <svg viewBox="0 0 360 260" className="w-full h-auto drop-shadow-2xl overflow-visible">
                <defs>
                  <linearGradient id="rhino-body-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#64748b" /><stop offset="40%" stopColor="#475569" /><stop offset="100%" stopColor="#334155" /></linearGradient>
                  <linearGradient id="rhino-plate-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#526173" /><stop offset="60%" stopColor="#3d4957" /><stop offset="100%" stopColor="#252f3d" /></linearGradient>
                  <linearGradient id="horn-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1e293b" /><stop offset="50%" stopColor="#451a03" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
                  <linearGradient id="grass-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#74c69d" /><stop offset="100%" stopColor="#1b4332" /></linearGradient>
                </defs>
                <ellipse cx="180" cy="235" rx="140" ry="18" fill="#1b4332" opacity="0.35" />
                <g>
                  <path d="M 95,160 L 92,230 L 112,230 L 114,175 Z" fill="#2d3748" />
                  <path d="M 235,165 L 232,230 L 250,230 L 253,175 Z" fill="#2d3748" />
                  <path d="M 68,140 Q 55,160 58,190" stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <path d="M 57,185 Q 54,198 56,204" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 68,135 C 65,95 110,85 170,90 C 230,80 270,95 285,125 C 295,145 285,185 270,195 C 210,205 130,205 75,180 C 65,165 67,145 68,135 Z" fill="url(#rhino-body-grad)" />
                  <path d="M 215,90 C 205,120 205,165 220,195" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.85" />
                  <path d="M 218,92 C 208,122 208,165 223,193" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.5" />
                  <path d="M 155,92 C 145,125 148,165 160,195" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.75" />
                  <path d="M 105,100 C 95,130 98,160 110,185" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
                  <circle cx="85" cy="120" r="2.5" fill="#1e293b" opacity="0.6" /><circle cx="95" cy="130" r="3" fill="#1e293b" opacity="0.6" />
                  <circle cx="88" cy="142" r="2.5" fill="#1e293b" opacity="0.6" /><circle cx="102" cy="115" r="2" fill="#1e293b" opacity="0.6" />
                  <circle cx="235" cy="115" r="2.5" fill="#1e293b" opacity="0.6" /><circle cx="245" cy="125" r="3" fill="#1e293b" opacity="0.6" /><circle cx="240" cy="138" r="2.5" fill="#1e293b" opacity="0.6" />
                  <path d="M 255,160 L 250,235 L 272,235 L 278,170 Z" fill="url(#rhino-plate-grad)" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="254" cy="235" r="3.5" fill="#0f172a" /><circle cx="261" cy="235" r="4" fill="#0f172a" /><circle cx="268" cy="235" r="3.5" fill="#0f172a" />
                  <path d="M 110,155 L 105,235 L 128,235 L 132,170 Z" fill="url(#rhino-plate-grad)" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="110" cy="235" r="3.5" fill="#0f172a" /><circle cx="117" cy="235" r="4" fill="#0f172a" /><circle cx="124" cy="235" r="3.5" fill="#0f172a" />
                  <path d="M 250,110 C 275,115 295,135 305,160 C 285,180 260,175 240,165 Z" fill="url(#rhino-body-grad)" />
                  <path d="M 260,135 Q 275,155 265,172" stroke="#1e293b" strokeWidth="4" fill="none" opacity="0.8" />
                  <path d="M 280,120 C 310,125 335,150 345,175 C 335,190 310,195 285,180 C 275,160 270,135 280,120 Z" fill="url(#rhino-plate-grad)" stroke="#1e293b" strokeWidth="1.5" />
                  <path d="M 336,155 C 344,140 354,115 350,96 C 342,112 334,136 322,158 Z" fill="url(#horn-grad)" stroke="#0f172a" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                  <circle cx="304" cy="142" r="3.5" fill="#0f172a" /><circle cx="305" cy="141" r="1" fill="#ffffff" />
                  <path d="M 299,139 Q 305,136 310,140" stroke="#1e293b" strokeWidth="2" fill="none" />
                  <ellipse cx="340" cy="180" rx="3" ry="4" fill="#0f172a" />
                  <path d="M 282,115 C 285,100 295,95 298,102 C 296,112 290,118 282,115 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
                  <path d="M 286,112 C 288,103 293,101 294,106 Z" fill="#f87171" opacity="0.35" />
                </g>
                <g>
                  <path d="M 80,240 Q 70,180 50,150 Q 75,190 90,240 Z" fill="url(#grass-grad)" opacity="0.9" />
                  <path d="M 120,240 Q 135,170 155,140 Q 138,185 130,240 Z" fill="url(#grass-grad)" opacity="0.85" />
                  <path d="M 270,240 Q 285,160 310,130 Q 288,180 280,240 Z" fill="url(#grass-grad)" opacity="0.95" />
                  <path d="M 290,240 Q 315,170 340,145 Q 315,190 300,240 Z" fill="url(#grass-grad)" opacity="0.9" />
                  <path d="M 220,240 Q 210,195 195,165 Q 215,200 230,240 Z" fill="#2d6a4f" opacity="0.85" />
                  <circle cx="50" cy="148" r="3" fill="#f59e0b" opacity="0.8" /><circle cx="156" cy="138" r="3" fill="#f59e0b" opacity="0.8" /><circle cx="312" cy="128" r="3.5" fill="#f59e0b" opacity="0.8" />
                </g>
              </svg>
              <div className="mt-1 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-300 shadow-xs text-center">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-950 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>One-Horned Rhinoceros</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── BOTTOM HUD ── */}
        <div className="shrink-0 pb-4 sm:pb-6 px-4 sm:px-8 z-30 flex items-center justify-between pointer-events-auto text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Checkpoint {activeStage.step} of 10: {activeStage.title}{activeStage.offline ? ' (Offline)' : ''}{activeStage.highlightBadge ? ' - ' + activeStage.highlightBadge : ''}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-emerald-800 bg-emerald-50/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200">
            <span>Scroll down to advance journey</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </div>

      </div>
    </section>
  );
};

export default AssamScrollJourney;
