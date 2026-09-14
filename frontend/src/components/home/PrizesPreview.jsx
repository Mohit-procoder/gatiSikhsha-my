import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Medal, Sparkles, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const prizeCategories = [
  {
    category: 'Category 1: Classes VI–VIII',
    poolBadge: '₹7.5L Pool (10 Teams)',
    color: 'border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white',
    badgeColor: 'bg-emerald-100 text-emerald-900',
    awards: [
      { title: 'Top 5 Teams', type: '₹1 Lakh each + Gold Accolades', icon: Trophy, color: 'text-amber-500' },
      { title: 'Next 5 Teams', type: '₹50,000 each + Merit Citation', icon: Medal, color: 'text-slate-400' },
      { title: 'Special Recognition', type: 'Ecology & Community Award', icon: Award, color: 'text-emerald-600' }
    ]
  },
  {
    category: 'Category 2: Classes IX–X',
    poolBadge: '₹15L Pool (10 Teams)',
    color: 'border-amber-200 bg-gradient-to-b from-amber-50/50 to-white',
    badgeColor: 'bg-amber-100 text-amber-900',
    awards: [
      { title: 'Top 5 Teams', type: '₹2 Lakhs each + Incubation', icon: Trophy, color: 'text-amber-500' },
      { title: 'Next 5 Teams', type: '₹1 Lakh each + Merit Citation', icon: Medal, color: 'text-slate-400' },
      { title: 'Special Recognition', type: 'Engineering Novelty Award', icon: Award, color: 'text-amber-600' }
    ]
  },
  {
    category: 'Category 3: Classes XI–XII',
    poolBadge: '₹30L Pool (10 Teams)',
    color: 'border-blue-200 bg-gradient-to-b from-blue-50/50 to-white',
    badgeColor: 'bg-blue-100 text-blue-900',
    awards: [
      { title: 'Top 5 Teams', type: '₹4 Lakhs each + IIT Delhi Mentorship', icon: Trophy, color: 'text-amber-500' },
      { title: 'Next 5 Teams', type: '₹2 Lakhs each + State Citation', icon: Medal, color: 'text-slate-400' },
      { title: 'Special Recognition', type: 'Commercial Scalability Award', icon: Award, color: 'text-blue-600' }
    ]
  }
];

const PrizesPreview = () => {
  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Honors &amp; State Accolades</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Prizes &amp; Recognition
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Recognizing excellence, creativity, and impactful regional engineering across Assam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prizeCategories.map((cat, idx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`p-6 sm:p-7 rounded-3xl border shadow-sm ${cat.color}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${cat.badgeColor}`}>
                  {cat.category}
                </span>
                <span className="text-[11px] font-black text-slate-800 bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {cat.poolBadge}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {cat.awards.map((aw) => {
                  const Icon = aw.icon;
                  return (
                    <div key={aw.title} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                      <div className={`p-2 rounded-xl bg-slate-50 ${aw.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{aw.title}</div>
                        <div className="text-xs text-slate-500">{aw.type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Official Note as requested */}
        <div className="mt-8 max-w-3xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50 to-blue-50 border border-amber-300 flex items-center justify-between gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              <strong className="text-amber-950 font-bold">State Innovation Prize Pool: ₹52.5 Lakhs</strong> awarded to 30 Winning Teams (10 per category) across Assam.
            </span>
          </div>
          <Link to="/prizes" className="text-emerald-800 hover:text-emerald-950 font-bold shrink-0 flex items-center gap-1">
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PrizesPreview;
