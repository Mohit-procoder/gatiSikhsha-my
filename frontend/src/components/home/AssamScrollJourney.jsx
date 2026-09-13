import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar, Award, BookOpen, BrainCircuit,
  Code2, Sparkles, ArrowDown
} from 'lucide-react';


gsap.registerPlugin(ScrollTrigger);

// SchoolIcon must be defined BEFORE STAGES array to avoid hoisting issues
function SchoolIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

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
    title: 'Self-Paced Foundation Learning',
    date: '10 – 22 October, 2026',
    desc: 'Self-paced foundational learning modules for all registered teams covering design thinking, problem framing, and core STEM principles.',
    category: 'Foundation Learning',
    icon: BookOpen,
    color: 'green',
    percent: 25,
    cohort: '70,000 Teams'
  },
  {
    step: '03',
    stageNumber: '3',
    title: 'Assessment by MCQ',
    date: '23 – 30 October, 2026',
    desc: 'Standardized state-wide MCQ benchmark evaluating mastery of foundational learning concepts to qualify teams for district quotas.',
    category: 'Assessment',
    icon: BrainCircuit,
    color: 'amber',
    percent: 42,
    cohort: '70,000 Teams Benchmark'
  },
  {
    step: '04',
    stageNumber: '4',
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
    step: '05',
    stageNumber: '5',
    title: 'Technical Challenge',
    date: '14 – 19 December, 2026',
    desc: 'Rigorous technical benchmark: Classes 9–12 assessed via Coding Challenge; Classes 6–8 assessed via MCQ challenge.',
    category: 'Technical Challenge',
    icon: Code2,
    color: 'blue',
    percent: 75,
    cohort: '5,000 Teams',
    criteria: '9–12: Coding Challenge • 6–8: MCQ'
  },
  {
    step: '06',
    stageNumber: '6',
    title: '5-Day State Hackathon & Grand Winners',
    date: '4 – 8 January, 2027',
    desc: '5-day offline 72-Hour Hackathon for 150 elite finalists (50 per category), followed by grand felicitation of the top 30 State Champions with long-term Innovation Acceleration Pathways.',
    category: 'Hackathon & Winners',
    isOffline: true,
    icon: Award,
    color: 'amber',
    percent: 93,
    cohort: '150 Finalists → 30 State Champions',
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
  const [nodePositions, setNodePositions] = useState(() =>
    STAGES.map((s) => ({ x: 200, y: (s.percent / 100) * 6000 }))
  );

  // Calculate precise milestone node coordinates once path is mounted
  useEffect(() => {
    if (pathRef.current) {
      const pathEl = pathRef.current;
      const totalLen = pathEl.getTotalLength();
      const positions = STAGES.map((s) => {
        const pt = pathEl.getPointAtLength((s.percent / 100) * totalLen);
        return { x: pt.x, y: pt.y };
      });
      setNodePositions(positions);

      // Initialize active trail strokeDash
      if (activeTrailRef.current) {
        activeTrailRef.current.style.strokeDasharray = `${totalLen}`;
        activeTrailRef.current.style.strokeDashoffset = `${totalLen}`;
      }
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

      // If reduced motion is preferred, initialize student at stage 1 without heavy scroll scrubbing
      if (prefersReducedMotion) {
        const startPt = pathEl.getPointAtLength(0);
        boyEl.setAttribute('transform', `translate(${startPt.x}, ${startPt.y})`);
        if (activeTrailRef.current) {
          activeTrailRef.current.style.strokeDashoffset = '0';
        }
        return;
      }

      // Master ScrollTrigger: Unified Single Source of Truth for Road & Child
      ScrollTrigger.create({
        trigger: containerEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = Math.min(1, Math.max(0, self.progress));
          setScrollProgress(progress);

          // 1. Synchronized Active Road Trail Drawing
          if (activeTrailRef.current) {
            const currentOffset = pathLength * (1 - progress);
            activeTrailRef.current.style.strokeDashoffset = currentOffset;
          }

          // 2. Mathematically Synchronized Student Position & Tangent Orientation
          const currentDistance = progress * pathLength;
          const currentPoint = pathEl.getPointAtLength(currentDistance);

          // Calculate trajectory vector using nearby points
          const sampleDist1 = Math.max(0, currentDistance - 6);
          const sampleDist2 = Math.min(pathLength, currentDistance + 6);
          const p1 = pathEl.getPointAtLength(sampleDist1);
          const p2 = pathEl.getPointAtLength(sampleDist2);

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
          // Gentle tilt bounded between [-12deg, +12deg] for natural posture
          const gentleAngle = Math.max(-12, Math.min(12, rawAngle * 0.25));

          boyEl.setAttribute(
            'transform',
            `translate(${currentPoint.x}, ${currentPoint.y}) rotate(${gentleAngle})`
          );

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

          // 6. Checkpoint Activation synchronized with progress
          let currentIdx = 0;
          for (let i = 0; i < STAGES.length; i++) {
            const prevPercent = i === 0 ? 0 : STAGES[i - 1].percent;
            const currPercent = STAGES[i].percent;
            const threshold = (prevPercent + currPercent) / 2;
            if (progress * 100 >= threshold) {
              currentIdx = i;
            }
          }
          setActiveStepIndex(currentIdx);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="journey"
      className="relative w-full bg-gradient-to-b from-[#faf8f5] via-[#f3ede3] to-[#faf8f5] overflow-hidden"
      style={{ height: '700vh' }}
    >
      {/* ==================================================================== */}
      {/* STICKY JOURNEY FRAME: HEADERS, PARALLAX SCENERY & HUD */}
      {/* ==================================================================== */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pointer-events-none z-20">
        {/* Top Header Banner */}
        <div className="pt-20 px-4 text-center z-30 pointer-events-auto max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold mb-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Scroll-Driven State Innovation Odyssey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Follow the Student Journey Through Assam
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
            Scroll down to watch our student innovator travel through tea gardens, knowledge camps, and zonal hackathons to the state final.
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto mt-2.5 h-1.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
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

          {/* Layer 2: Rolling Assam Tea Garden Terraces */}
          <div ref={vegMedRef} className="absolute right-0 top-1/4 will-change-transform">
            <svg width="460" height="320" viewBox="0 0 460 320" className="translate-x-16">
              <path d="M 0,320 Q 140,180 320,230 Q 390,250 460,210 L 460,320 Z" fill="#2d6a4f" opacity="0.8" />
              <circle cx="180" cy="230" r="24" fill="#52b788" opacity="0.7" />
              <circle cx="220" cy="225" r="28" fill="#40916c" opacity="0.8" />
              <circle cx="260" cy="240" r="26" fill="#2d6a4f" />
              <circle cx="310" cy="235" r="30" fill="#52b788" opacity="0.8" />
            </svg>
          </div>



          {/* Layer 4: Giant Tropical Elephant-Ear Leaves extending DELIBERATELY OUTSIDE viewport edge */}
          <div ref={vegFastRef} className="absolute -right-16 bottom-0 will-change-transform pointer-events-none">
            <svg width="450" height="520" viewBox="0 0 450 520" className="overflow-visible">
              <defs>
                <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#74c69d" />
                  <stop offset="40%" stopColor="#40916c" />
                  <stop offset="100%" stopColor="#1b4332" />
                </linearGradient>
              </defs>
              <path
                d="M 200,520 C 150,390 80,290 20,220 C -10,180 60,130 140,160 C 240,200 380,300 450,520 Z"
                fill="url(#leaf-grad)"
                filter="drop-shadow(-8px -4px 18px rgba(15,41,66,0.15))"
              />
              <path d="M 200,520 Q 120,320 70,180" stroke="#a7f3d0" strokeWidth="4" fill="none" opacity="0.6" />
              <path
                d="M 300,520 C 260,360 200,260 120,200 C 100,180 170,150 240,190 C 330,240 420,360 480,520 Z"
                fill="#2d6a4f"
                opacity="0.9"
              />
            </svg>
          </div>
        </div>

        {/* BOTTOM HUD Indicator */}
        <div className="pb-6 px-6 z-30 flex items-center justify-between pointer-events-auto text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Stage {STAGES[activeStepIndex]?.step || String(activeStepIndex + 1).padStart(2, '0')} of 09: {STAGES[activeStepIndex]?.title}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-emerald-800 bg-emerald-50/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200">
            <span>Scroll down to advance journey</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
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
