import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { STAGES } from '../components/home/AssamScrollJourney';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, Trophy, ArrowRight, Award, Flame, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar, Clock, Sparkles, CheckCircle2, Trophy, ArrowRight,
  Code2, Users, BookOpen, BrainCircuit, Award, MapPin,
  ExternalLink, Layers, ChevronRight, Check, AlertCircle,
  FileText, ShieldCheck, Rocket, Globe
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// SINGLE SOURCE OF TRUTH: OFFICIAL 10-STEP SCHEDULE (01 TO 09 WITH 07A & 07B)
// ============================================================================
export const JOURNEY_STAGES = [
  {
    id: '01',
    stepNumber: '01',
    category: 'REGISTRATION',
    title: 'School Registration',
    date: '17th to 30th September, 2026',
    desc: 'Registrations for participating schools/teams.',
    offline: false,
    color: 'emerald',
    icon: SchoolIcon,
    dist: 0
  },
  {
    id: '02',
    stepNumber: '02',
    category: 'ORIENTATION',
    title: 'Team Orientation',
    date: '1st to 10th October, 2026',
    desc: 'Orientation of 2 hours for participating teams through SSA YouTube.',
    detail: '2-hour digital orientation streamed on SSA YouTube channel.',
    offline: false,
    color: 'teal',
    icon: Users,
    dist: 290
  },
  {
    id: '03',
    stepNumber: '03',
    category: 'FOUNDATION LEARNING',
    title: 'Self-Paced Foundation Learning',
    date: '10th to 22nd October, 2026',
    desc: 'Teams complete the self-paced Foundation Learning activities.',
    detail: 'Self-paced foundational learning modules covering design thinking and innovation.',
    offline: false,
    color: 'cyan',
    icon: BookOpen,
    dist: 580
  },
  {
    id: '04',
    stepNumber: '04',
    category: 'ASSESSMENT',
    title: 'MCQ Assessment',
    date: '23rd to 30th October, 2026',
    desc: 'Assessment of participating teams through MCQ.',
    weightageRule: 'Classes 6–8: 70% MCQ weightage toward State Level',
    offline: false,
    color: 'amber',
    icon: BrainCircuit,
    dist: 870
  },
  {
    id: '05',
    stepNumber: '05',
    category: 'DISTRICT SHORTLISTING',
    title: 'District-Level Shortlisting',
    date: '1st to 7th November, 2026',
    desc: 'Shortlisting for the District Level, with teams distributed equally by district (approximately 70 teams per district).',
    detail: 'The teams are to be equally divided by district, approximately 70 teams per district.',
    offline: false,
    color: 'orange',
    icon: MapPin,
    dist: 1372.65
  },
  {
    id: '06',
    stepNumber: '06',
    category: 'ADVANCED LEARNING',
    title: 'Self-Paced Advanced Learning',
    date: '9th November to 6th December',
    desc: 'Teams complete the self-paced Advanced Learning activities.',
    detail: 'Advanced problem formulation, prototyping, and solution development sprint.',
    offline: false,
    color: 'blue',
    icon: Rocket,
    dist: 1662.65
  },
  {
    id: '07A',
    stepNumber: '07A',
    category: 'CODING CHALLENGE',
    title: 'Coding Challenge Assessment',
    date: '14th to 19th December',
    desc: 'Assessment through Coding Challenge for the relevant team category.',
    detail: 'Classes 9–12: Assessment by Coding challenge.',
    weightageRule: 'Classes 9–12: 70% Coding Challenge weightage toward State Level',
    stageGroup: 'Stage 7 Progression',
    offline: false,
    color: 'indigo',
    icon: Code2,
    dist: 1952.65
  },
  {
    id: '07B',
    stepNumber: '07B',
    category: 'JURY ROUND',
    title: 'Jury Round Shortlisting',
    date: '21st to 26th December',
    desc: 'Shortlisting for the Jury Round based on soft skills, with the Top 20 teams per district.',
    detail: 'Top 20 teams per district evaluated on soft skills, presentation, and team dynamics.',
    weightageRule: '30% Jury Round (Soft Skills) weightage toward State Level',
    stageGroup: 'Stage 7 Progression',
    offline: true,
    color: 'purple',
    icon: Award,
    dist: 2242.65
  },
  {
    id: '08',
    stepNumber: '08',
    category: 'HACKATHON',
    title: '72-Hour Hackathon',
    date: '4th to 8th January',
    desc: 'A 5-day offline activity involving assessment through the 72-Hour Hackathon.',
    detail: '5-day immersive offline builder marathon with on-ground mentoring & jury review.',
    offline: true,
    color: 'rose',
    icon: Trophy,
    dist: 2745.30
  },
  {
    id: '09',
    stepNumber: '09',
    category: 'FINAL OUTCOME',
    title: 'Winners',
    date: 'Final Outcome',
    desc: 'Final selection of winners across Assam.',
    highlightBadge: '30 Winners',
    detail: 'Grand declaration and felicitation of 30 Winners across school cohorts.',
    offline: false,
    color: 'emerald',
    icon: Sparkles,
    dist: 3035.30
  }
];

function SchoolIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

// 4 Official Post-Hackathon Pathways from the Image
const OFFICIAL_PATHWAYS = [
  {
    title: 'R&D Publication',
    desc: 'Academic documentation, joint research opportunities, and research paper publications.',
    icon: FileText,
    color: 'emerald'
  },
  {
    title: 'IP Filing',
    desc: 'Intellectual property protection, patent drafting, and student copyright registration support.',
    icon: ShieldCheck,
    color: 'blue'
  },
  {
    title: 'Incubation Pitch',
    desc: 'Direct pitch access to government incubators, seed-stage micro-grants, and lab resources.',
    icon: Rocket,
    color: 'amber'
  },
  {
    title: 'Showcase',
    desc: 'State-wide public innovation galleries and national-level technology exhibitions.',
    icon: Globe,
    color: 'purple'
  }
];

// Node coordinates in SVG 1200x920 grid
const SVG_COORDS = [
  { id: '01', x: 160, y: 100, col: 0, row: 1 },
  { id: '02', x: 450, y: 100, col: 1, row: 1 },
  { id: '03', x: 740, y: 100, col: 2, row: 1 },
  { id: '04', x: 1030, y: 100, col: 3, row: 1 },
  { id: '05', x: 1030, y: 420, col: 3, row: 2 },
  { id: '06', x: 740, y: 420, col: 2, row: 2 },
  { id: '07A', x: 450, y: 420, col: 1, row: 2 },
  { id: '07B', x: 160, y: 420, col: 0, row: 2 },
  { id: '08', x: 160, y: 740, col: 0, row: 3 },
  { id: '09', x: 450, y: 740, col: 1, row: 3 }
];

const Journey = () => {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const activeTrailRef = useRef(null);
  const boyRef = useRef(null);

  // Synchronize Child position along SVG road
  const updateStudentPosition = (distance, pathEl, totalLen) => {
    if (!pathEl || !boyRef.current) return;
    const clampedDist = Math.min(totalLen, Math.max(0, distance));
    const pt = pathEl.getPointAtLength(clampedDist);

    // Calculate tangent vector
    const d1 = Math.max(0, clampedDist - 6);
    const d2 = Math.min(totalLen, clampedDist + 6);
    const p1 = pathEl.getPointAtLength(d1);
    const p2 = pathEl.getPointAtLength(d2);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Flip student horizontally when walking leftwards in Row 2
    const isMovingLeft = dx < -0.1;
    const scaleFactor = 0.65;
    const scaleX = isMovingLeft ? -scaleFactor : scaleFactor;

    // Natural tilt
    const rawAngle = Math.atan2(dy, Math.abs(dx) || 0.001) * (180 / Math.PI);
    const gentleTilt = Math.max(-15, Math.min(15, rawAngle * 0.3));

    boyRef.current.setAttribute(
      'transform',
      `translate(${pt.x}, ${pt.y}) rotate(${gentleTilt}) scale(${scaleX}, ${scaleFactor})`
    );

    // Active trail update
    if (activeTrailRef.current) {
      const remainingOffset = Math.max(0, totalLen - clampedDist);
      activeTrailRef.current.style.strokeDashoffset = remainingOffset;
    }
  };

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;
    const totalLen = pathEl.getTotalLength();

    if (activeTrailRef.current) {
      activeTrailRef.current.style.strokeDasharray = `${totalLen}`;
      activeTrailRef.current.style.strokeDashoffset = `${totalLen}`;
    }

    // Initialize boy at stage 01
    updateStudentPosition(0, pathEl, totalLen);

    // ScrollTrigger synchronization for smooth scrubbing on desktop
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 75%',
        end: 'bottom 85%',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = Math.min(1, Math.max(0, self.progress));
          const currentDist = progress * totalLen;
          updateStudentPosition(currentDist, pathEl, totalLen);

          // Find closest stage
          let closestIdx = 0;
          let minDiff = Infinity;
          JOURNEY_STAGES.forEach((stage, idx) => {
            const diff = Math.abs(stage.dist - currentDist);
            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = idx;
            }
          });
          setActiveStageIdx(closestIdx);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Jump to stage on user click
  const handleStageSelect = (idx) => {
    setActiveStageIdx(idx);
    const pathEl = pathRef.current;
    if (pathEl) {
      const totalLen = pathEl.getTotalLength();
      const targetDist = JOURNEY_STAGES[idx]?.dist ?? 0;
      gsap.to(
        {},
        {
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: function () {
            const ratio = this.progress();
            const currentDist = gsap.utils.interpolate(
              JOURNEY_STAGES[activeStageIdx]?.dist ?? 0,
              targetDist,
              ratio
            );
            updateStudentPosition(currentDist, pathEl, totalLen);
          }
        }
      );
    }
  };

  const activeStage = JOURNEY_STAGES[activeStageIdx] || JOURNEY_STAGES[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-24">
        {/* ================================================================= */}
        {/* 1. HERO & OFFICIAL SCHEDULE HEADER                                */}
        {/* ================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-4 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Official State Competition Roadmap</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            The 9-Stage Innovation Odyssey
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From initial registration across all 33 districts of Assam in September 2026 through foundation learning, district quotas, technical assessments, and the 5-day state hackathon to grand winners with IIT Delhi pathways.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block">Stage 1 Target</span>
              <span className="text-xl font-black text-emerald-800">70,000 Teams</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">23,333 / category</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block">Stage 5 District</span>
              <span className="text-xl font-black text-amber-800">5,000 Teams</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">~70 / district</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block">Stage 7b Jury</span>
              <span className="text-xl font-black text-blue-800">1,980 Teams</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Top 20 / district</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block">Stage 9 Winners</span>
              <span className="text-xl font-black text-purple-800">30 Winners</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">10 / category</span>
            </div>
          </div>
        </section>

        {/* Detailed Timeline List (Stages 1 to 9) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Stage-by-Stage Milestones &amp; Schedule
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Official competition schedule, category quotas, and merit requirements (Stages 1 to 9).
            </p>
          </div>

          <div className="relative border-l-2 border-emerald-600/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
            {STAGES.map((s) => (
              <div key={s.step} className="relative group">
                {/* Node marker */}
                <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-800 text-amber-300 text-xs font-black flex items-center justify-center border-4 border-[#faf8f5] shadow-md group-hover:scale-110 transition-transform">
                  {s.step}
                </div>

                <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                        {s.category}
                      </span>
                      {s.isOffline && (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                          Offline
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{s.date}</span>
                    </div>
                  );
                })}
              </div>

              {/* ROW 2: 07B ← 07A ← 06 ← 05 (Travels Right to Left) */}
              <div className="absolute top-[465px] left-0 right-0 grid grid-cols-4 gap-4 px-2">
                {/* Column 0: 07B (Jury Round Offline) */}
                <div
                  onClick={() => handleStageSelect(7)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 text-left border ${
                    activeStageIdx === 7
                      ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-500/20 scale-[1.02]'
                      : 'bg-white/85 hover:bg-white border-purple-200 hover:border-purple-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                      07B • JURY ROUND
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                      OFFLINE
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    07B. Jury Round Shortlisting
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-tight">
                    Shortlisting based on soft skills (Top 20 teams/district).
                  </p>
                </div>

                {/* Column 1: 07A (Coding Challenge) */}
                <div
                  onClick={() => handleStageSelect(6)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 text-left border ${
                    activeStageIdx === 6
                      ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]'
                      : 'bg-white/85 hover:bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                      07A • CODING
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                      14–19 Dec
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    07A. Coding Challenge
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-tight">
                    Assessment through Coding Challenge (Classes 9–12).
                  </p>
                </div>

                {/* Column 2: 06 (Self-Paced Advanced Learning) */}
                <div
                  onClick={() => handleStageSelect(5)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 text-left border ${
                    activeStageIdx === 5
                      ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20 scale-[1.02]'
                      : 'bg-white/85 hover:bg-white border-slate-200/80 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      06 • ADVANCED
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                      9 Nov – 6 Dec
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    06. Advanced Learning
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-tight">
                    Teams complete self-paced Advanced Learning activities.
                  </p>
                </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Stage {s.stageNumber}: {s.title}
                  </h3>

                  {/* Category Breakdown Table / Pills */}
                  {s.stats && (
                    <div className="my-3 p-3 rounded-2xl bg-[#faf8f5] border border-slate-200 flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-semibold">
                      <div className="text-emerald-900">
                        <span className="text-slate-500 font-normal">Classes 11–12: </span>
                        <span className="font-bold">{s.stats.c11_12}</span>
                      </div>
                      <div className="text-amber-900">
                        <span className="text-slate-500 font-normal">Classes 9–10: </span>
                        <span className="font-bold">{s.stats.c9_10}</span>
                      </div>
                      <div className="text-blue-900">
                        <span className="text-slate-500 font-normal">Classes 6–8: </span>
                        <span className="font-bold">{s.stats.c6_8}</span>
                      </div>
                      <div className="text-purple-950 font-bold ml-auto bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
                        Total: {s.stats.total} Teams
                      </div>
                    </div>
                  )}

                  {/* Criteria Box */}
                  {s.criteria && (
                    <div className="my-2.5 text-xs font-semibold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{s.criteria}</span>
                    </div>
                  )}

                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>

                  {/* Stage 09 Innovation Pathways Showcase */}
                  {s.pathways && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5 mb-2">
                        <Trophy className="w-4 h-4 text-amber-600" />
                        <span>Post-Championship Innovation Pathways:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {s.pathways.map((p, pIdx) => (
                          <div
                            key={p}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white/90 p-2 rounded-xl border border-amber-200/80 shadow-2xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                              {pIdx + 1}
                            </span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 3: 08 (Hackathon) → 09 (Winners) */}
              <div className="absolute top-[785px] left-0 right-0 grid grid-cols-4 gap-4 px-2">
                {/* Column 0: 08 (72-Hour Hackathon) */}
                <div
                  onClick={() => handleStageSelect(8)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 text-left border ${
                    activeStageIdx === 8
                      ? 'bg-white border-rose-600 shadow-md ring-2 ring-rose-500/20 scale-[1.02]'
                      : 'bg-white/85 hover:bg-white border-rose-200 hover:border-rose-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                      08 • HACKATHON
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                      OFFLINE
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    08. 72-Hour Hackathon
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-tight">
                    5-day offline activity: Assessment through 72-Hour Hackathon.
                  </p>
                </div>

                {/* Column 1: 09 (Winners - 30 Winners) */}
                <div
                  onClick={() => handleStageSelect(9)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 text-left border ${
                    activeStageIdx === 9
                      ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400/30 scale-[1.02]'
                      : 'bg-white/85 hover:bg-white border-amber-200 hover:border-amber-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      09 • WINNERS
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-xs">
                      30 WINNERS
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    09. Final Winners
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-tight">
                    Final selection and felicitation of 30 state winners.
                  </p>
                </div>

                {/* Column 2 & 3: Outcome Showcase Summary */}
                <div className="col-span-2 p-4 rounded-2xl bg-linear-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between gap-4 border border-emerald-700/50 shadow-sm">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Culmination of the Challenge</span>
                    </div>
                    <div className="text-sm font-bold">State Champions &amp; Acceleration</div>
                    <p className="text-[11px] text-emerald-100 mt-0.5">
                      Qualifying teams unlock direct mentorship, IP filing grants, and prototype funding.
                    </p>
                  </div>
                  <Link
                    to="/prizes"
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-xs"
                  >
                    View Prizes
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 4. CHRONOLOGICAL LIST (FOR MOBILE & ACCESSIBLE SCROLLING)        */}
          {/* =============================================================== */}
          <div className="lg:hidden mt-8 space-y-4">
            {JOURNEY_STAGES.map((s, idx) => {
              const isCurrent = activeStageIdx === idx;
              return (
                <div
                  key={s.id}
                  onClick={() => handleStageSelect(idx)}
                  className={`p-5 rounded-2xl transition-all border ${
                    isCurrent
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 text-xs font-black flex items-center justify-center">
                        {s.stepNumber}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        {s.category}
                      </span>
                      {s.offline && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          OFFLINE
                        </span>
                      )}
                      {s.highlightBadge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-300 text-slate-950">
                          {s.highlightBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {s.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  {s.weightageRule && (
                    <div className="mt-2 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                      {s.weightageRule}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

          {/* CTA footer */}
          <div className="mt-16 p-8 rounded-3xl bg-emerald-900 text-white text-center shadow-xl">
            <h3 className="text-2xl font-bold">Ready to Begin Your Innovation Journey?</h3>
            <p className="text-emerald-100 text-sm mt-2 max-w-xl mx-auto">
              School registration opens on 17 September 2026 (17th to 30th September, 2026). Register your institution across Assam and receive orientation resources.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OFFICIAL_PATHWAYS.map((p) => {
              const IconComp = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 6. INTERNATIONAL PUBLICATION & EXPOSURE (FROM SCHEDULE IMAGE)     */}
        {/* ================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="rounded-3xl bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 border border-emerald-700/30 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/20">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Global Academic Milestone</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  International Publication &amp; Exposure
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Top performing prototypes and research papers undergo academic peer review for international conference submission and global exposure.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[170px] w-full sm:w-auto">
                  <span className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Target Date
                  </span>
                  <span className="text-sm font-extrabold text-white mt-0.5 block">
                    By 31st December, 2026
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[170px] w-full sm:w-auto">
                  <span className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    Host Institution
                  </span>
                  <span className="text-sm font-extrabold text-white mt-0.5 block">
                    IIT, Delhi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 7. CTA FOOTER                                                     */}
        {/* ================================================================= */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="p-8 rounded-3xl bg-emerald-900 text-white text-center shadow-xl relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold">Ready to Begin Your Innovation Journey?</h3>
              <p className="text-emerald-100 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                School registrations commence on 17th September 2026. Register your institution to receive orientation and foundational learning resources.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register/school"
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all"
                >
                  Register School
                </Link>
                <Link
                  to="/guidelines"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
                >
                  View Guidelines
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Journey;
