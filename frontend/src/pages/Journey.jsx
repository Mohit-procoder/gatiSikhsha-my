import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { STAGES } from '../components/home/AssamScrollJourney';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
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
            <span>State Competition Roadmap</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            The 12-Stage Innovation Odyssey
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From initial school registration in September 2026 through foundational bootcamps and divisional hackathons to the state final in Guwahati in January 2027.
          </p>
        </section>

        {/* Detailed Timeline List (Stages 1 to 12) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Stage-by-Stage Milestones &amp; Schedule
            </h2>
            <p className="text-sm text-slate-500 mt-1">Official competition calendar and delivery requirements.</p>
          </div>

          <div className="relative border-l-2 border-emerald-600/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
            {STAGES.map((s, idx) => (
              <div key={s.step} className="relative group">
                {/* Node marker */}
                <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-800 text-amber-300 text-xs font-black flex items-center justify-center border-4 border-[#faf8f5] shadow-md group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>

                <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      {s.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{s.date}</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA footer */}
          <div className="mt-16 p-8 rounded-3xl bg-emerald-900 text-white text-center shadow-xl">
            <h3 className="text-2xl font-bold">Ready to Begin Your Innovation Journey?</h3>
            <p className="text-emerald-100 text-sm mt-2 max-w-xl mx-auto">
              School registration opens on 20 September 2026. Register your institution and receive orientation resources.
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
