import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar, CheckCircle, Award, Users, BookOpen, BrainCircuit,
  Code2, Trophy, MapPin, Sparkles, ArrowDown
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
    title: 'School Registration',
    date: '20–30 September 2026',
    desc: 'Schools across all 33 districts of Assam register with their mandatory 11-digit UDISE ID and receive portal access.',
    category: 'Registration',
    icon: SchoolIcon,
    color: 'emerald',
    percent: 8.5
  },
  {
    step: '02',
    title: 'Principal & Mentor Digital Onboarding',
    date: '1–5 October 2026',
    desc: '5-day comprehensive digital onboarding providing school leadership and teacher coordinators with orientation and resources.',
    category: 'Orientation',
    icon: Users,
    color: 'teal',
    percent: 14
  },
  {
    step: '03',
    title: 'Team Formation',
    date: '6–12 October 2026',
    desc: 'Schools facilitate student team formation across three official categories: VI–VIII, IX–X, and XI–XII.',
    category: 'Teams',
    icon: Users,
    color: 'green',
    percent: 22
  },
  {
    step: '04',
    title: '20-Hour Online Bootcamp',
    date: '13–27 October 2026',
    desc: '15-day foundational learning program encompassing 20 structured hours in design thinking, problem framing, and technology fundamentals.',
    category: 'Learning',
    icon: BookOpen,
    color: 'amber',
    percent: 31
  },
  {
    step: '05',
    title: 'MCQ / Knowledge Assessment',
    date: '28–30 October 2026',
    desc: 'State-wide standardized online assessment testing concepts mastered during the bootcamp to shortlist high-performing student teams.',
    category: 'Assessment',
    icon: BrainCircuit,
    color: 'orange',
    percent: 40
  },
  {
    step: '06',
    title: 'Top 1,000 Teams Shortlisted',
    date: '31 October 2026',
    desc: '1,000 high-potential teams across Assam qualify for the specialized advanced acceleration phase based on assessment merit.',
    category: 'Milestone',
    icon: Trophy,
    color: 'amber',
    percent: 49
  },
  {
    step: '07',
    title: '30-Day Advanced Level Bootcamp',
    date: '1–25 November 2026',
    desc: 'Intensive immersion across cohorts of 1,000 teams with dedicated IIT & industry mentors focusing on coding and prototyping.',
    category: 'Advanced Learning',
    icon: Code2,
    color: 'emerald',
    percent: 58
  },
  {
    step: '08',
    title: 'Coding / Technical Challenge',
    date: '20–25 November 2026',
    desc: 'Teams apply hands-on skills in a rigorous technical benchmark evaluating solution functionality and software implementation.',
    category: 'Challenge',
    icon: Code2,
    color: 'blue',
    percent: 67
  },
  {
    step: '09',
    title: 'Shortlisting of 198 Teams',
    date: '26 Nov – 5 Dec 2026',
    desc: 'Merit-based zonal selection yielding exactly 198 teams: 33 districts × 3 age categories × 2 top performing teams.',
    category: 'Shortlist',
    icon: CheckCircle,
    color: 'teal',
    percent: 76
  },
  {
    step: '10',
    title: 'Zonal / Divisional 48h Hackathons',
    date: '6–20 December 2026',
    desc: '198 teams compete across divisional venues in a 48-hour live building sprint with expert on-ground mentoring and jury evaluation.',
    category: 'Hackathon',
    icon: MapPin,
    color: 'indigo',
    percent: 85
  },
  {
    step: '11',
    title: 'Finalist Selection & Preparation',
    date: '21 Dec 2026 – 5 Jan 2027',
    desc: 'Consolidation of zonal results to select the top 60 State Finalists (20 per category), backed by pitch polish and prototype refinement.',
    category: 'Preparation',
    icon: Sparkles,
    color: 'purple',
    percent: 93
  },
  {
    step: '12',
    title: 'State-Level Grand Final',
    date: 'January 2027',
    desc: '60 finalist teams present live working demonstrations before state dignitaries, academic leaders, and industry panels. State champions awarded.',
    category: 'Grand Finale',
    icon: Award,
    color: 'amber',
    percent: 98
  }
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

          // 3. Left Zone: Tea Garden Worker subtle parallax sway
          if (womanRef.current) {
            gsap.set(womanRef.current, {
              y: progress * 300,
              rotate: Math.sin(progress * 12) * 1.2
            });
          }

          // 4. Right Zone: One-Horned Rhinoceros subtle breathing & elevation drift
          if (rhinoRef.current) {
            gsap.set(rhinoRef.current, {
              y: progress * 240,
              rotate: Math.cos(progress * 8) * 0.8
            });
          }

          // 5. Environmental Vegetation Multi-Depth Parallax
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
        {/* ZONE 1 (LEFT): TASTEFUL ASSAMESE TEA GARDEN WORKER */}
        {/* ------------------------------------------------------------------ */}
        <div
          ref={womanRef}
          className="absolute left-2 sm:left-4 lg:left-6 bottom-10 sm:bottom-14 z-20 w-36 sm:w-44 lg:w-48 pointer-events-none select-none transition-transform"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full" />

            <svg viewBox="0 0 300 450" className="w-full h-auto drop-shadow-2xl">
              <defs>
                <linearGradient id="tea-basket" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="saree-drape" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fdf4dc" />
                  <stop offset="50%" stopColor="#f5e6c4" />
                  <stop offset="100%" stopColor="#e2c892" />
                </linearGradient>
                <linearGradient id="muga-red-border" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
              </defs>

              {/* Basket on her back (Tokari / Dala) */}
              <g id="tea-basket-group" className="animate-pulse" style={{ animationDuration: '4s' }}>
                <ellipse cx="110" cy="180" rx="42" ry="58" fill="url(#tea-basket)" stroke="#572208" strokeWidth="3" transform="rotate(-15, 110, 180)" />
                <path d="M 80,140 Q 110,180 140,220 M 70,180 Q 110,190 150,180 M 80,210 Q 110,210 140,160" stroke="#fcd34d" strokeWidth="1.5" opacity="0.6" />
                <path d="M 75,130 Q 95,115 115,125 Q 135,110 150,135 Q 130,150 90,145 Z" fill="#2d6a4f" />
                <circle cx="100" cy="125" r="5" fill="#52b788" />
                <circle cx="125" cy="120" r="6" fill="#74c69d" />
                <circle cx="112" cy="132" r="4.5" fill="#40916c" />
                <path d="M 95,145 C 105,105 130,70 155,75" fill="none" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
              </g>

              {/* Woman Character in Mekhela Sador */}
              <g id="woman-body">
                <circle cx="175" cy="72" r="18" fill="#1e1b18" />
                <circle cx="186" cy="65" r="4" fill="#ef4444" />
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

            <div className="mt-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs text-center">
              <span className="text-[10px] font-bold text-emerald-950">Tea Garden Heritage of Assam</span>
            </div>
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

          {/* Layer 3: AUTHENTIC ONE-HORNED INDIAN RHINOCEROS (Rhinoceros unicornis) */}
          <div
            ref={rhinoRef}
            className="absolute right-4 sm:right-10 bottom-24 z-20 w-52 sm:w-72 lg:w-80 pointer-events-none select-none transition-transform"
          >
            <div className="relative">
              {/* Natural Kaziranga Sanctuary Vector Graphic */}
              <svg viewBox="0 0 360 260" className="w-full h-auto drop-shadow-2xl overflow-visible">
                <defs>
                  <linearGradient id="rhino-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="40%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <linearGradient id="rhino-plate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#526173" />
                    <stop offset="60%" stopColor="#3d4957" />
                    <stop offset="100%" stopColor="#252f3d" />
                  </linearGradient>
                  <linearGradient id="horn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#451a03" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="grass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#74c69d" />
                    <stop offset="100%" stopColor="#1b4332" />
                  </linearGradient>
                </defs>

                {/* Ground river turf & mud shadow */}
                <ellipse cx="180" cy="235" rx="140" ry="18" fill="#1b4332" opacity="0.35" />

                {/* THE ONE-HORNED RHINOCEROS GROUP with gentle idle breathing animation */}
                <g id="rhino-character" className="origin-bottom">
                  {/* Back legs (Far side) */}
                  <path d="M 95,160 L 92,230 L 112,230 L 114,175 Z" fill="#2d3748" />
                  <path d="M 235,165 L 232,230 L 250,230 L 253,175 Z" fill="#2d3748" />

                  {/* Tail with tuft of hair */}
                  <path d="M 68,140 Q 55,160 58,190" stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <path d="M 57,185 Q 54,198 56,204" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

                  {/* Massive Quadruped Torso & Pelvic Armor Shield */}
                  <path
                    d="M 68,135 C 65,95 110,85 170,90 C 230,80 270,95 285,125 C 295,145 285,185 270,195 C 210,205 130,205 75,180 C 65,165 67,145 68,135 Z"
                    fill="url(#rhino-body-grad)"
                  />

                  {/* Prominent Characteristic Indian Rhino Armor Skin Folds & Plates */}
                  {/* Scapular / Shoulder Fold (deep groove) */}
                  <path
                    d="M 215,90 C 205,120 205,165 220,195"
                    stroke="#1e293b"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.85"
                  />
                  <path
                    d="M 218,92 C 208,122 208,165 223,193"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.5"
                  />

                  {/* Flank / Rib Armor Pleat */}
                  <path
                    d="M 155,92 C 145,125 148,165 160,195"
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.75"
                  />

                  {/* Pelvic / Rump Fold */}
                  <path
                    d="M 105,100 C 95,130 98,160 110,185"
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                  />

                  {/* Studded Skin Tubercles (Characteristic bumpy armor texture) */}
                  <circle cx="85" cy="120" r="2.5" fill="#1e293b" opacity="0.6" />
                  <circle cx="95" cy="130" r="3" fill="#1e293b" opacity="0.6" />
                  <circle cx="88" cy="142" r="2.5" fill="#1e293b" opacity="0.6" />
                  <circle cx="102" cy="115" r="2" fill="#1e293b" opacity="0.6" />
                  <circle cx="235" cy="115" r="2.5" fill="#1e293b" opacity="0.6" />
                  <circle cx="245" cy="125" r="3" fill="#1e293b" opacity="0.6" />
                  <circle cx="240" cy="138" r="2.5" fill="#1e293b" opacity="0.6" />

                  {/* Front Legs (Near side) - Sturdy columnar legs with 3-toed hooves */}
                  <path d="M 255,160 L 250,235 L 272,235 L 278,170 Z" fill="url(#rhino-plate-grad)" stroke="#1e293b" strokeWidth="2" />
                  {/* Three distinct rounded toe hooves */}
                  <circle cx="254" cy="235" r="3.5" fill="#0f172a" />
                  <circle cx="261" cy="235" r="4" fill="#0f172a" />
                  <circle cx="268" cy="235" r="3.5" fill="#0f172a" />

                  {/* Hind Legs (Near side) */}
                  <path d="M 110,155 L 105,235 L 128,235 L 132,170 Z" fill="url(#rhino-plate-grad)" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="110" cy="235" r="3.5" fill="#0f172a" />
                  <circle cx="117" cy="235" r="4" fill="#0f172a" />
                  <circle cx="124" cy="235" r="3.5" fill="#0f172a" />

                  {/* RHINO HEAD & NECK - Angled naturally in grazing posture */}
                  <g id="rhino-head">
                    {/* Thick muscular neck with deep skin throat folds */}
                    <path d="M 250,110 C 275,115 295,135 305,160 C 285,180 260,175 240,165 Z" fill="url(#rhino-body-grad)" />
                    <path d="M 260,135 Q 275,155 265,172" stroke="#1e293b" strokeWidth="4" fill="none" opacity="0.8" />

                    {/* Massive Head Silhouette */}
                    <path
                      d="M 280,120 C 310,125 335,150 345,175 C 335,190 310,195 285,180 C 275,160 270,135 280,120 Z"
                      fill="url(#rhino-plate-grad)"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />

                    {/* THE PROMINENT SINGLE BLACK HORN (Rhinoceros unicornis identifier) */}
                    <path
                      d="M 336,155 C 344,140 354,115 350,96 C 342,112 334,136 322,158 Z"
                      fill="url(#horn-grad)"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                    />

                    {/* Small keen eye with dark fold */}
                    <circle cx="304" cy="142" r="3.5" fill="#0f172a" />
                    <circle cx="305" cy="141" r="1" fill="#ffffff" />
                    <path d="M 299,139 Q 305,136 310,140" stroke="#1e293b" strokeWidth="2" fill="none" />

                    {/* Nostril & prehensile upper lip for grazing */}
                    <ellipse cx="340" cy="180" rx="3" ry="4" fill="#0f172a" />

                    {/* Fringed, tubular twitching ear */}
                    <g id="rhino-ear">
                      <path d="M 282,115 C 285,100 295,95 298,102 C 296,112 290,118 282,115 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
                      <path d="M 286,112 C 288,103 293,101 294,106 Z" fill="#f87171" opacity="0.35" />
                    </g>
                  </g>
                </g>

                {/* Lush Assam Riverine Elephant Grass & Reeds naturally surrounding the rhino */}
                <g id="kaziranga-grass">
                  {/* Foreground tall grass stalks swaying gently */}
                  <path d="M 80,240 Q 70,180 50,150 Q 75,190 90,240 Z" fill="url(#grass-grad)" opacity="0.9" />
                  <path d="M 120,240 Q 135,170 155,140 Q 138,185 130,240 Z" fill="url(#grass-grad)" opacity="0.85" />
                  <path d="M 270,240 Q 285,160 310,130 Q 288,180 280,240 Z" fill="url(#grass-grad)" opacity="0.95" />
                  <path d="M 290,240 Q 315,170 340,145 Q 315,190 300,240 Z" fill="url(#grass-grad)" opacity="0.9" />
                  <path d="M 220,240 Q 210,195 195,165 Q 215,200 230,240 Z" fill="#2d6a4f" opacity="0.85" />

                  {/* Golden wild cane seed heads */}
                  <circle cx="50" cy="148" r="3" fill="#f59e0b" opacity="0.8" />
                  <circle cx="156" cy="138" r="3" fill="#f59e0b" opacity="0.8" />
                  <circle cx="312" cy="128" r="3.5" fill="#f59e0b" opacity="0.8" />
                </g>
              </svg>

              {/* Authentic Cultural Label Badge */}
              <div className="mt-1 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-300 shadow-sm text-center">
                <span className="text-[10px] font-bold text-emerald-950 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>State Heritage • One-Horned Rhinoceros (Kaziranga)</span>
                </span>
              </div>
            </div>
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
            <span>Checkpoint {STAGES[activeStepIndex]?.step || String(activeStepIndex + 1).padStart(2, '0')} of 12: {STAGES[activeStepIndex]?.title}</span>
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
                  className={`w-full sm:w-5/12 ${isLeft ? 'block' : 'hidden sm:block sm:invisible'} ${
                    stage.step === '01' ? 'sm:translate-x-8 lg:translate-x-12' : ''
                  }`}
                >
                  {isLeft && (
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{
                        opacity: isCurrent ? 1 : isActive ? 0.8 : 0.25,
                        x: isActive ? 0 : -20,
                        scale: isCurrent ? 1.03 : 0.98
                      }}
                      transition={{ duration: 0.3 }}
                      className={`pointer-events-auto p-5 sm:p-7 rounded-3xl border transition-all ${
                        isCurrent
                          ? 'glass-card border-emerald-500 shadow-2xl shadow-emerald-950/15 ring-2 ring-emerald-500/30 bg-white'
                          : isActive
                          ? 'bg-white/95 border-emerald-200/90 shadow-lg'
                          : 'bg-white/80 border-slate-200/80 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-2xl font-black text-emerald-800 tracking-tight">
                          {stage.step}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300/60">
                          {stage.category}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {stage.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-amber-700">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{stage.date}</span>
                      </div>

                      <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {stage.desc}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Center Spacer for Pathway */}
                <div className="hidden sm:block w-2/12" />

                {/* Right Side Slot */}
                <div
                  className={`w-full sm:w-5/12 ${!isLeft ? 'block' : 'hidden sm:block sm:invisible'} ${
                    stage.step === '04' || stage.step === '12'
                      ? 'sm:translate-x-12 lg:translate-x-16'
                      : ''
                  }`}
                >
                  {!isLeft && (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{
                        opacity: isCurrent ? 1 : isActive ? 0.8 : 0.25,
                        x: isActive ? 0 : 20,
                        scale: isCurrent ? 1.03 : 0.98
                      }}
                      transition={{ duration: 0.3 }}
                      className={`pointer-events-auto p-5 sm:p-7 rounded-3xl border transition-all ${
                        isCurrent
                          ? 'glass-card border-amber-500 shadow-2xl shadow-amber-950/15 ring-2 ring-amber-500/30 bg-white'
                          : isActive
                          ? 'bg-white/95 border-amber-200/90 shadow-lg'
                          : 'bg-white/80 border-slate-200/80 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-2xl font-black text-amber-800 tracking-tight">
                          {stage.step}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/60">
                          {stage.category}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {stage.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-700">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{stage.date}</span>
                      </div>

                      <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {stage.desc}
                      </p>
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
