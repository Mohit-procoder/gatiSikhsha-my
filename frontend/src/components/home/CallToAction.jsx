import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, School } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/20 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-600 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Assam Future Innovation Program</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Empowering Young Innovators <br />
          <span className="text-amber-400">for a Brighter Assam</span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
          Whether you are a school principal, a passionate science teacher, or a student with an idea to protect your community from floods or improve tea farming, this state-wide stage is yours.
        </p>

        <div className="mt-9 flex items-center justify-center">
          <Link
            to="/register/school"
            className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <School className="w-4 h-4 text-emerald-950" />
            <span>Register Your School Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
