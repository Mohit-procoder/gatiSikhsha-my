import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AssamScrollJourney from '../components/home/AssamScrollJourney';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Journey = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        {/* Header & Quick Metrics Bar */}
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

        {/* SWAPPED: Interactive Follow the Student Journey Through Assam */}
        <AssamScrollJourney />

        {/* CTA footer */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="p-8 rounded-3xl bg-emerald-900 text-white text-center shadow-xl">
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