import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { STAGES } from '../components/home/AssamScrollJourney';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, Trophy, ArrowRight, Award, Flame, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Journey = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
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
            ))}
          </div>

          {/* CTA footer */}
          <div className="mt-16 p-8 rounded-3xl bg-emerald-900 text-white text-center shadow-xl">
            <h3 className="text-2xl font-bold">Ready to Begin Your Innovation Journey?</h3>
            <p className="text-emerald-100 text-sm mt-2 max-w-xl mx-auto">
              School registration opens on 17 September 2026 (17th to 30th September, 2026). Register your institution across Assam and receive orientation resources.
            </p>
            <div className="mt-6 flex justify-center gap-4">
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Journey;