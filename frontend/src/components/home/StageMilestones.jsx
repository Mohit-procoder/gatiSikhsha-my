import React from 'react';
import { STAGES } from './AssamScrollJourney';
import { Calendar, Sparkles, Trophy } from 'lucide-react';

const StageMilestones = () => {
  return (
    <section className="py-20 bg-[#faf8f5] border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Official Competition Schedule</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Stage-by-Stage Milestones &amp; Schedule
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl mx-auto">
            From state-wide school registrations in September 2026 to the 5-day state hackathon and Grand Finale.
          </p>
        </div>

        {/* Detailed Timeline List (Stages 1 to 9) */}
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
      </div>
    </section>
  );
};

export default StageMilestones;
