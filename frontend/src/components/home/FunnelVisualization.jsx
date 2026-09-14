import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, School, Users, Laptop, Brain, Rocket, Award, ShieldAlert } from 'lucide-react';

const funnelSteps = [
  { label: 'Stage 1: State Registrations', count: '70,000 Teams (23,333 / Category)', width: 'w-full', bg: 'bg-emerald-900', text: 'text-white' },
  { label: 'Stage 2: 2h SSA YouTube Orientation', count: '70,000 Teams Streamed', width: 'w-[92%]', bg: 'bg-emerald-800', text: 'text-emerald-50' },
  { label: 'Stage 3: Self-Paced Foundation Learning', count: '70,000 Teams', width: 'w-[84%]', bg: 'bg-teal-800', text: 'text-teal-50' },
  { label: 'Stage 4: MCQ Benchmark Assessment', count: '70,000 Teams Evaluated', width: 'w-[76%]', bg: 'bg-teal-700', text: 'text-white' },
  { label: 'Stage 5: District Level Shortlisting', count: '5,000 Teams (~70 / District)', width: 'w-[68%]', bg: 'bg-amber-600', text: 'text-white' },
  { label: 'Stage 6: Self-Paced Advance Learning', count: '5,000 Teams Prototyping', width: 'w-[60%]', bg: 'bg-amber-700', text: 'text-amber-50' },
  { label: 'Stage 7: Coding (9–12) & MCQ (6–8)', count: '5,000 Teams Benchmarked', width: 'w-[52%]', bg: 'bg-amber-800', text: 'text-white' },
  { label: 'Stage 8: Offline Jury Round (Soft Skills)', count: '1,980 Teams (Top 20 / District)', width: 'w-[44%]', bg: 'bg-blue-800', text: 'text-blue-50' },
  { label: 'Stage 9: 5-Day State Hackathon (72h Live)', count: '150 Finalists (50 / Category)', width: 'w-[34%]', bg: 'bg-indigo-800', text: 'text-white' },
  { label: 'Stage 10: State Champions & Pathways', count: '30 Winners (10 / Category)', width: 'w-[24%]', bg: 'bg-gradient-to-r from-amber-500 to-amber-600', text: 'text-slate-950 font-extrabold' }
];

const FunnelVisualization = () => {
  return (
    <section className="py-20 bg-[#f7f4ed] border-y border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300/70">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Merit-Driven Progressive Selection</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          The AFIP Competition Funnel
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto mt-2">
          From broad grassroot participation to intense divisional hackathons and the state grand finale.
        </p>

        {/* Funnel Stack */}
        <div className="mt-12 flex flex-col items-center gap-2.5">
          {funnelSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={`${step.width} min-w-[260px] ${step.bg} ${step.text} py-3 px-4 rounded-xl shadow-md flex items-center justify-between transition-transform hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold tracking-tight">
                    {step.label}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-semibold opacity-90 px-2 py-0.5 rounded bg-black/15">
                  {step.count}
                </span>
              </motion.div>
              {idx < funnelSteps.length - 1 && (
                <ChevronDown className="w-4 h-4 text-slate-400 my--1 opacity-60" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FunnelVisualization;
