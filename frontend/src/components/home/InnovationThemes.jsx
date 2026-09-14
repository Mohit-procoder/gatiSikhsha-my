import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Bot, MessageSquareQuote, Landmark, ShieldAlert, Sprout,
  Truck, Cpu, Leaf, Compass, Zap, ShieldCheck, GraduationCap,
  Radar, Rocket, ArrowRight, Sparkles, Calendar, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const themes = [
  {
    code: 'PMH1',
    name: 'Artificial Intelligence',
    desc: 'Machine learning algorithms, computer vision, natural language processing & predictive neural systems.',
    icon: Brain,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200 group-hover:border-indigo-400',
    tagBg: 'bg-indigo-100 text-indigo-800'
  },
  {
    code: 'PMH2',
    name: 'AI agents',
    desc: 'Autonomous multi-agent architectures, goal-oriented task planning & intelligent workflow automation.',
    icon: Bot,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200 group-hover:border-cyan-400',
    tagBg: 'bg-cyan-100 text-cyan-800'
  },
  {
    code: 'PMH3',
    name: 'Motivational Chatbot',
    desc: 'Conversational student wellness companions, vernacular guidance coaches & interactive motivation mentors.',
    icon: MessageSquareQuote,
    color: 'text-violet-600 bg-violet-50 border-violet-200 group-hover:border-violet-400',
    tagBg: 'bg-violet-100 text-violet-800'
  },
  {
    code: 'PMH4',
    name: 'Heritage & Culture',
    desc: 'Digital preservation of Assam folklore, textile archives, virtual heritage walkthroughs & artisan platforms.',
    icon: Landmark,
    color: 'text-amber-700 bg-amber-50 border-amber-200 group-hover:border-amber-400',
    tagBg: 'bg-amber-100 text-amber-900'
  },
  {
    code: 'PMH5',
    name: 'Disaster Management',
    desc: 'Early flood telemetry, riverbank erosion prediction, emergency alerting & rescue response logistics.',
    icon: ShieldAlert,
    color: 'text-rose-600 bg-rose-50 border-rose-200 group-hover:border-rose-400',
    tagBg: 'bg-rose-100 text-rose-800'
  },
  {
    code: 'PMH6',
    name: 'Agriculture, FoodTech & Rural Development',
    desc: 'Precision farming, tea garden productivity tech, decentralized cold storage & rural artisan livelihoods.',
    icon: Sprout,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200 group-hover:border-emerald-400',
    tagBg: 'bg-emerald-100 text-emerald-800'
  },
  {
    code: 'PMH7',
    name: 'Transportation & Logistics',
    desc: 'Brahmaputra riverway smart navigation, rural hill connectivity, cold chain tracking & public EV transit.',
    icon: Truck,
    color: 'text-blue-600 bg-blue-50 border-blue-200 group-hover:border-blue-400',
    tagBg: 'bg-blue-100 text-blue-800'
  },
  {
    code: 'PMH8',
    name: 'Robotics and Drones',
    desc: 'Autonomous patrol aerial drones, agricultural crop scouting rovers & industrial robotics applications.',
    icon: Cpu,
    color: 'text-teal-600 bg-teal-50 border-teal-200 group-hover:border-teal-400',
    tagBg: 'bg-teal-100 text-teal-800'
  },
  {
    code: 'PMH9',
    name: 'Clean & Green Technology',
    desc: 'Plastic pyrolysis, water hyacinth biomass valorization, zero-discharge recycling & circular economy models.',
    icon: Leaf,
    color: 'text-green-600 bg-green-50 border-green-200 group-hover:border-green-400',
    tagBg: 'bg-green-100 text-green-800'
  },
  {
    code: 'PMH10',
    name: 'Tourism',
    desc: 'Eco-tourism trail guides, smart homestay booking networks & immersive AR cultural travel experiences.',
    icon: Compass,
    color: 'text-orange-600 bg-orange-50 border-orange-200 group-hover:border-orange-400',
    tagBg: 'bg-orange-100 text-orange-800'
  },
  {
    code: 'PMH11',
    name: 'Renewable/ sustainable Energy',
    desc: 'Solar micro-grids for riverine char islands, micro-hydro generators & biomass-to-electricity solutions.',
    icon: Zap,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200 group-hover:border-yellow-400',
    tagBg: 'bg-yellow-100 text-yellow-800'
  },
  {
    code: 'PMH12',
    name: 'Block chain & Cyber security',
    desc: 'Immutable tea supply chain provenance, tamper-proof academic credentials & resilient cyber defense tools.',
    icon: ShieldCheck,
    color: 'text-slate-800 bg-slate-100 border-slate-300 group-hover:border-slate-500',
    tagBg: 'bg-slate-200 text-slate-900'
  },
  {
    code: 'PMH13',
    name: 'Smart Education',
    desc: 'Multilingual vernacular STEM learning tools, low-bandwidth smart classrooms & gamified science labs.',
    icon: GraduationCap,
    color: 'text-sky-600 bg-sky-50 border-sky-200 group-hover:border-sky-400',
    tagBg: 'bg-sky-100 text-sky-800'
  },
  {
    code: 'PMH14',
    name: 'Remote Sensing',
    desc: 'Satellite multispectral imagery analysis, forest canopy monitoring & Brahmaputra siltation telemetry.',
    icon: Radar,
    color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200 group-hover:border-fuchsia-400',
    tagBg: 'bg-fuchsia-100 text-fuchsia-800'
  },
  {
    code: 'PMH15',
    name: 'Space Technology',
    desc: 'CubeSat payloads, atmospheric sensor pods, astronomical observation tech & aerospace rocketry concepts.',
    icon: Rocket,
    color: 'text-purple-700 bg-purple-50 border-purple-200 group-hover:border-purple-400',
    tagBg: 'bg-purple-100 text-purple-900'
  }
];

const InnovationThemes = () => {
  return (
    <section id="themes" className="scroll-mt-24 py-24 bg-gradient-to-b from-[#faf8f5] via-white to-[#f4f7f5] relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Assam Problem Statements • Thematic Focus</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              List of 15 Themes
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-2xl font-medium">
              Proposed by <strong className="text-emerald-900">SSA</strong> (Samagra Shiksha, Assam) but it's open for discussions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/innovations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-800 hover:text-emerald-800 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <span>Browse Showcased Innovations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Informative Notice Banner as specified */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 border border-amber-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-amber-900 block sm:inline mr-2">
                Please Note:
              </span>
              <span className="text-sm font-semibold text-slate-800">
                Category-wise mapping of themes will be announced by <strong>Monday</strong>.
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-100/80 text-amber-900 text-xs font-bold shrink-0 self-start sm:self-auto border border-amber-200">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Category Mapping: Monday</span>
          </div>
        </motion.div>

        {/* 15 Themes Grid (3 cols on lg, 5 cols on 2xl) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {themes.map((t, idx) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.code}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (idx % 3) * 0.05 }}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle gradient corner highlight */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/80 rounded-bl-full pointer-events-none -z-0 group-hover:scale-110 transition-transform duration-300" />

                <div className="relative z-10">
                  {/* Top Bar: Icon + Code Pill */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`p-3 rounded-2xl border transition-all duration-300 ${t.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono tracking-wider shadow-2xs ${t.tagBg}`}>
                      {t.code}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {t.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                {/* Footer status link */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors relative z-10">
                  <span>Assam & Viksit Bharat 2047</span>
                  <span className="font-mono text-[10px] text-slate-400">Theme #{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InnovationThemes;
