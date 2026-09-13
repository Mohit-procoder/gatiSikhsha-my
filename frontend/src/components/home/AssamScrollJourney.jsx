import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar, CheckCircle, Award, Users, BookOpen, BrainCircuit,
  Code2, Trophy, MapPin, Sparkles, ArrowDown, Flame
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
  {
    step: '01',
    stageNumber: '1',
    title: 'Registrations',
    date: '17th to 30th September, 2026',
    desc: 'State-wide school and student team registrations across all 33 districts of Assam. Mandatory onboarding for Classes 6–8, 9–10, and 11–12.',
    category: 'Registration',
    icon: SchoolIcon,
    color: 'emerald',
    percent: 8,
    cohort: '70,000 Teams (23,333 / Category)',
    stats: { c11_12: '23,333', c9_10: '23,333', c6_8: '23,333', total: '70,000' }
  },
  {
    step: '02',
    stageNumber: '2',
    title: 'Orientation on SSA YouTube',
    date: '1st to 10th October, 2026',
    desc: '2-hour comprehensive digital orientation for all student teams, principals, and teacher mentors live streamed on SSA YouTube channel.',
    category: 'Orientation',
    icon: Users,
    color: 'teal',
    percent: 18,
    cohort: '70,000 Teams (2-Hour Stream)'
  },
  {
    step: '03',
    stageNumber: '3',
    title: 'Self-Paced Foundation Learning',
    date: '10 – 22 October, 2026',
    desc: 'Self-paced foundational learning modules for all registered teams covering design thinking, problem framing, and core STEM principles.',
    category: 'Foundation Learning',
    icon: BookOpen,
    color: 'green',
    percent: 28,
    cohort: '70,000 Teams'
  },
  {
    step: '04',
    stageNumber: '4',
    title: 'Assessment by MCQ',
    date: '23 – 30 October, 2026',
    desc: 'Standardized state-wide MCQ benchmark evaluating mastery of foundational learning concepts to qualify teams for district quotas.',
    category: 'Assessment',
    icon: BrainCircuit,
    color: 'amber',
    percent: 38,
    cohort: '70,000 Teams Benchmark'
  },
  {
    step: '05',
    stageNumber: '5',
    title: 'Shortlisting for District Level',
    date: '1 – 7 November, 2026',
    desc: 'Merit-based selection of top 5,000 teams equally divided across all 33 districts of Assam (~70 teams per district; 1,666 per category).',
    category: 'District Shortlist',
    icon: Trophy,
    color: 'orange',
    percent: 48,
    cohort: '5,000 Teams (~70 / District)',
    stats: { c11_12: '1,666', c9_10: '1,666', c6_8: '1,666', total: '5,000' }
  },
  {
    step: '06',
    stageNumber: '6',
    title: 'Self-Paced Advance Learning',
    date: '9 November – 6 December, 2026',
    desc: 'Advanced specialized learning modules for the 5,000 qualifying teams with hands-on mentoring in embedded coding, IoT, robotics, and hardware prototyping.',
    category: 'Advance Learning',
    icon: Code2,
    color: 'emerald',
    percent: 58,
    cohort: '5,000 Teams (1,666 / Category)'
  },
  {
    step: '07A',
    stageNumber: '7a',
    title: 'Technical Challenge',
    date: '14 – 19 December, 2026',
    desc: 'Rigorous technical benchmark: Classes 9–12 assessed via Coding Challenge; Classes 6–8 assessed via MCQ challenge.',
    category: 'Technical Challenge',
    icon: Code2,
    color: 'blue',
    percent: 68,
    cohort: '5,000 Teams',
    criteria: '9–12: Coding Challenge • 6–8: MCQ'
  },
  {
    step: '07B',
    stageNumber: '7b',
    title: 'Jury Round (Soft Skills)',
    date: '21 – 26 December, 2026',
    desc: 'Offline Jury evaluation focusing on soft skills and project defense. Top 20 teams selected per district (660 per category, 1,980 total).',
    category: 'Offline Jury Round',
    isOffline: true,
    icon: CheckCircle,
    color: 'teal',
    percent: 78,
    cohort: '1,980 Teams (Top 20 / District)',
    stats: { c11_12: '660', c9_10: '660', c6_8: '660', total: '1,980' }
  },
  {
    step: '08',
    stageNumber: '8',
    title: '5-Day State Hackathon',
    date: '4 – 8 January, 2027',
    desc: '5-day offline assessment featuring a 72-Hour live Hackathon for 150 elite teams (50 per category). Evaluation weightage: 70% Coding/MCQ + 30% Jury round.',
    category: 'State Hackathon',
    isOffline: true,
    icon: Flame,
    color: 'indigo',
    percent: 88,
    cohort: '150 Finalists (50 / Category)',
    criteria: '70% Coding/MCQ + 30% Jury Weightage'
  },
  {
    step: '09',
    stageNumber: '9',
    title: 'Grand Winners & Pathways',
    date: 'January 2027 / By 31 Dec 2026',
    desc: 'Top 30 state winners (10 per category) awarded championships and inducted into long-term Innovation Acceleration Pathways.',
    category: 'Winners & Pathways',
    icon: Award,
    color: 'amber',
    percent: 97,
    cohort: '30 State Champions (10 / Category)',
    stats: { c11_12: '10', c9_10: '10', c6_8: '10', total: '30' },
    pathways: [
      'R&D Publication',
      'IP Filing (Patents & Claims)',
      'Incubation Pitch',
      'Grand Showcase',
      'International Exposure (IIT Delhi by 31 Dec 2026)'
    ]
  }
];

const AssamScrollJourney = () => {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const activeTrailRef = useRef(null);
  const boyRef = useRef(null);
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

          // 3. Environmental Vegetation Multi-Depth Parallax
          if (vegSlowRef.current) {
            gsap.set(vegSlowRef.current, { y: progress * 120 });
          }
          if (vegMedRef.current) {
            gsap.set(vegMedRef.current, { y: progress * 280 });
          }
          if (vegFastRef.current) {
            gsap.set(vegFastRef.current, { y: progress * 480 });
          }

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



        {/* ------------------------------------------------------------------ */}
        {/* ZONE 3 (RIGHT): KAZIRANGA WILDLIFE OASIS — ONE-HORNED RHINOCEROS & VEGETATION */}
        {/* ------------------------------------------------------------------ */}
        <div className="absolute right-0 top-0 bottom-0 pointer-events-none z-10 w-full sm:w-1/2 max-w-lg select-none overflow-hidden sm:overflow-visible">
          {/* Layer 1: Distant Misty Himalayan & Patkai Mountain Ranges */}
          <div ref={vegSlowRef} className="absolute right-0 top-16 opacity-35 will-change-transform">
            <svg width="450" height="260" viewBox="0 0 450 260" className="translate-x-12">
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



        </div>

        {/* ── BOTTOM HUD ── */}
        <div className="shrink-0 pb-4 sm:pb-6 px-4 sm:px-8 z-30 flex items-center justify-between pointer-events-auto text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Stage {STAGES[activeStepIndex]?.step || String(activeStepIndex + 1).padStart(2, '0')} of 09: {STAGES[activeStepIndex]?.title}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-emerald-800 bg-emerald-50/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200">
            <span>Scroll down to advance journey</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </div>

      {/* ==================================================================== */}
      {/* ZONE 2 (CENTER): SCROLLING PATHWAY & MATHEMATICALLY BOUND STUDENT */}
      {/* ==================================================================== */}
      <div className="absolute inset-x-0 top-0 w-full h-full flex justify-center pointer-events-none z-10">
        <svg
          className="w-full h-full max-w-2xl overflow-visible pointer-events-none"
          viewBox="0 0 400 6000"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Illuminated active trail gradient */}
            <linearGradient id="active-path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#059669" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <filter id="road-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#064e3b" floodOpacity="0.25" />
            </filter>
            <filter id="active-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10b981" floodOpacity="0.6" />
            </filter>

            {/* Student Uniform Gradients */}
            <linearGradient id="boy-shirt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="boy-skin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#d4a373" />
            </linearGradient>
          </defs>

          {/* Road / trail foundation base */}
          <path
            d="M 200,0 
               C 280,300 120,600 200,900
               C 290,1200 90,1500 220,1800
               C 320,2100 110,2400 190,2700
               C 300,3000 80,3300 210,3600
               C 310,3900 100,4200 200,4500
               C 290,4800 120,5100 220,5400
               C 300,5700 170,5900 200,6000"
            fill="none"
            stroke="#e5dbcc"
            strokeWidth="52"
            strokeLinecap="round"
            filter="url(#road-glow)"
          />

          {/* Stepping trail inner border */}
          <path
            d="M 200,0 
               C 280,300 120,600 200,900
               C 290,1200 90,1500 220,1800
               C 320,2100 110,2400 190,2700
               C 300,3000 80,3300 210,3600
               C 310,3900 100,4200 200,4500
               C 290,4800 120,5100 220,5400
               C 300,5700 170,5900 200,6000"
            fill="none"
            stroke="#ffffff"
            strokeWidth="42"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Inactive trail dash background */}
          <path
            ref={pathRef}
            id="master-travel-path"
            d="M 200,0 
               C 280,300 120,600 200,900
               C 290,1200 90,1500 220,1800
               C 320,2100 110,2400 190,2700
               C 300,3000 80,3300 210,3600
               C 310,3900 100,4200 200,4500
               C 290,4800 120,5100 220,5400
               C 300,5700 170,5900 200,6000"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="6"
            strokeDasharray="12 10"
            strokeLinecap="round"
          />

          {/* ACTIVE ILLUMINATED TRAIL: Dynamically revealed with strokeDashoffset */}
          <path
            ref={activeTrailRef}
            id="active-illuminated-trail"
            d="M 200,0 
               C 280,300 120,600 200,900
               C 290,1200 90,1500 220,1800
               C 320,2100 110,2400 190,2700
               C 300,3000 80,3300 210,3600
               C 310,3900 100,4200 200,4500
               C 290,4800 120,5100 220,5400
               C 300,5700 170,5900 200,6000"
            fill="none"
            stroke="url(#active-path-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#active-glow)"
          />

          {/* Milestone Checkpoint Nodes along the Path */}
          {nodePositions.map((pos, idx) => {
            const isActive = activeStepIndex >= idx;
            const isCurrent = activeStepIndex === idx;
            const stepNum = STAGES[idx]?.step || String(idx + 1).padStart(2, '0');
            return (
              <g key={STAGES[idx].step} className="transition-all duration-300">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isCurrent ? 24 : isActive ? 20 : 14}
                  fill={isCurrent ? '#f59e0b' : isActive ? '#10b981' : '#94a3b8'}
                  opacity={isCurrent ? 0.45 : isActive ? 0.35 : 0.2}
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isCurrent ? 15 : isActive ? 13 : 9}
                  fill={isCurrent ? '#064e3b' : isActive ? '#1b4332' : '#64748b'}
                  stroke={isCurrent ? '#f59e0b' : '#ffffff'}
                  strokeWidth="3"
                />
                <text
                  x={pos.x}
                  y={pos.y + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {stepNum}
                </text>
              </g>
            );
          })}

          {/* ================================================================ */}
          {/* THE STUDENT TRAVELER (Directly inside SVG coordinate system)       */}
          {/* Guarantees 100% mathematical synchronization with road progression */}
          {/* ================================================================ */}
          <g
            ref={boyRef}
            id="student-traveler-group"
            className="will-change-transform"
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Trail shadow right on road surface */}
            <ellipse cx="0" cy="-2" rx="16" ry="5" fill="#0f172a" opacity="0.35" />

            {/* School student character scaled to road proportions */}
            <g transform="translate(0, -6) scale(0.65)">
              {/* Backpack on student's back */}
              <rect x="-18" y="-48" width="12" height="24" rx="4" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
              <path d="M -16,-42 Q -22,-30 -16,-20" stroke="#b45309" strokeWidth="2" fill="none" />

              {/* Legs in dynamic walking stride */}
              <path d="M -6,-20 L -10,0" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
              <path d="M 6,-20 L 10,-2" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              {/* Shoes */}
              <path d="M -14,0 L -6,0" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <path d="M 6,-2 L 14,-2" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />

              {/* Torso & School Uniform */}
              <path d="M -12,-52 L 12,-52 L 10,-20 L -10,-20 Z" fill="url(#boy-shirt)" rx="3" />
              <polygon points="0,-48 -5,-52 5,-52" fill="#ffffff" />
              <polygon points="-1,-48 1,-48 2,-32 0,-28 -2,-32" fill="#dc2626" />

              {/* Arms (holding prototype tablet) */}
              <path d="M -12,-46 Q -18,-34 -8,-28" stroke="url(#boy-skin)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 12,-46 Q 18,-34 8,-28" stroke="url(#boy-skin)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <rect x="2" y="-34" width="12" height="15" rx="2" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" transform="rotate(12, 8, -26)" />

              {/* Head & Smart Hairstyle */}
              <circle cx="0" cy="-62" r="11" fill="url(#boy-skin)" />
              <path d="M -10,-65 C -10,-76 10,-76 10,-65 C 6,-72 -6,-72 -10,-65 Z" fill="#1e1b18" />
              {/* Eyes & Cheerful Smile */}
              <circle cx="-3" cy="-63" r="1.5" fill="#0f172a" />
              <circle cx="4" cy="-63" r="1.5" fill="#0f172a" />
              <path d="M -2,-58 Q 0,-55 3,-58" stroke="#b45309" strokeWidth="1.2" fill="none" strokeLinecap="round" />

              {/* Floating Young Innovator Badge */}
              <g transform="translate(0, -82)">
                <rect x="-34" y="-8" width="68" height="15" rx="7.5" fill="#064e3b" stroke="#10b981" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))" />
                <text x="0" y="3" textAnchor="middle" fill="#fcd34d" fontSize="7.5" fontWeight="bold">
                  Young Innovator
                </text>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* ==================================================================== */}
      {/* 12 TIMELINE CHECKPOINT INFORMATION CARDS (Positioned along road)     */}
      {/* ==================================================================== */}
      <div className="absolute inset-0 w-full pointer-events-none z-30">
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 h-full">
          {STAGES.map((stage, idx) => {
            const isLeft = idx % 2 === 0;
            const isActive = activeStepIndex >= idx;
            const isCurrent = activeStepIndex === idx;
            const pos = nodePositions[idx] || { y: (stage.percent / 100) * 6000 };
            const topPercent = (pos.y / 6000) * 100;

            return (
              <div
                key={stage.step}
                className="absolute left-4 right-4 sm:left-6 sm:right-6 flex items-center justify-between"
                style={{
                  top: `${topPercent}%`,
                  transform: idx === 0 ? 'translateY(-20%)' : 'translateY(-50%)'
                }}
              >
                {/* Left Side Slot */}
                <div
                  className={`w-full sm:w-5/12 ${isLeft ? 'block' : 'hidden sm:block sm:invisible'} ${stage.step === '01' ? 'sm:translate-x-8 lg:translate-x-12' : ''
                    }`}
                >
                  {isLeft && (
                    <motion.div
                      initial={{ opacity: 1, x: 0 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: isCurrent ? 1.03 : 1
                      }}
                      transition={{ duration: 0.2 }}
                      className={`pointer-events-auto p-5 sm:p-6 rounded-3xl border transition-all ${isCurrent
                        ? 'glass-card border-emerald-500 shadow-2xl shadow-emerald-950/15 ring-2 ring-emerald-500/30 bg-white'
                        : 'bg-white border-slate-200/90 shadow-md'
                        }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-emerald-800 tracking-tight">
                            {stage.step}
                          </span>
                          {stage.isOffline && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                              Offline
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300/60">
                          {stage.category}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {stage.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{stage.date}</span>
                        </div>
                        {stage.cohort && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {stage.cohort}
                          </span>
                        )}
                      </div>

                      {stage.criteria && (
                        <div className="mt-2 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {stage.criteria}
                        </div>
                      )}

                      <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {stage.desc}
                      </p>

                      {stage.pathways && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1.5">
                            Post-Championship Pathways:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.pathways.map((p) => (
                              <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-950 border border-amber-300/80">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Center Spacer for Pathway */}
                <div className="hidden sm:block w-2/12" />

                {/* Right Side Slot */}
                <div
                  className={`w-full sm:w-5/12 ${!isLeft ? 'block' : 'hidden sm:block sm:invisible'} ${stage.step === '04' || stage.step === '09'
                    ? 'sm:translate-x-10 lg:translate-x-14'
                    : ''
                    }`}
                >
                  {!isLeft && (
                    <motion.div
                      initial={{ opacity: 1, x: 0 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: isCurrent ? 1.03 : 1
                      }}
                      transition={{ duration: 0.2 }}
                      className={`pointer-events-auto p-5 sm:p-6 rounded-3xl border transition-all ${isCurrent
                        ? 'glass-card border-amber-500 shadow-2xl shadow-amber-950/15 ring-2 ring-amber-500/30 bg-white'
                        : 'bg-white border-slate-200/90 shadow-md'
                        }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-amber-800 tracking-tight">
                            {stage.step}
                          </span>
                          {stage.isOffline && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                              Offline
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/60">
                          {stage.category}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {stage.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{stage.date}</span>
                        </div>
                        {stage.cohort && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {stage.cohort}
                          </span>
                        )}
                      </div>

                      {stage.criteria && (
                        <div className="mt-2 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {stage.criteria}
                        </div>
                      )}

                      <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {stage.desc}
                      </p>

                      {stage.pathways && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1.5">
                            Post-Championship Pathways:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.pathways.map((p) => (
                              <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-950 border border-amber-300/80">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AssamScrollJourney;
