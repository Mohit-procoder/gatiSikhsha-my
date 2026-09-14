import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Trophy, Award, Medal, Sparkles, Info, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Prizes = () => {
  const prizeStructure = [
    {
      category: 'Category 1: Classes VI–VIII',
      subtitle: 'Junior Innovation League',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      tiers: [
        {
          place: 'State Winner',
          title: 'Governor’s Gold Trophy & Citation',
          perks: ['Gold Trophy & State Merit Certificate', 'Science Museum VIP Experience', 'Advanced STEM Maker Kit'],
          icon: Trophy,
          iconColor: 'text-amber-500 bg-amber-50'
        },
        {
          place: 'First Runner-Up',
          title: 'State Silver Trophy & Citation',
          perks: ['Silver Trophy & State Merit Certificate', 'Robotics Learning Workshop Access'],
          icon: Medal,
          iconColor: 'text-slate-400 bg-slate-50'
        },
        {
          place: 'Special Recognition',
          title: 'Ecological & Community Impact Honor',
          perks: ['State Commendation Badge & Certificate', 'Feature in State Innovation Gazette'],
          icon: Award,
          iconColor: 'text-emerald-600 bg-emerald-50'
        }
      ]
    },
    {
      category: 'Category 2: Classes IX–X',
      subtitle: 'Intermediate Innovation League',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      tiers: [
        {
          place: 'State Winner',
          title: 'Chief Minister’s Gold Trophy & Incubation',
          perks: ['Gold Trophy & State Merit Citation', 'Hardware Prototype Incubation Support', 'Educational Tour to IIT Delhi & Tech Hubs'],
          icon: Trophy,
          iconColor: 'text-amber-500 bg-amber-50'
        },
        {
          place: 'First Runner-Up',
          title: 'State Silver Trophy & Citation',
          perks: ['Silver Trophy & State Merit Certificate', 'Assam Premier Maker Lab Access'],
          icon: Medal,
          iconColor: 'text-slate-400 bg-slate-50'
        },
        {
          place: 'Special Recognition',
          title: 'Engineering Novelty Honor',
          perks: ['State Commendation Badge & Citation', 'Prototype Showcase at Assam Tech Summit'],
          icon: Award,
          iconColor: 'text-amber-600 bg-amber-50'
        }
      ]
    },
    {
      category: 'Category 3: Classes XI–XII',
      subtitle: 'Senior Innovation League',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      tiers: [
        {
          place: 'State Winner',
          title: 'Grand Champion Gold Trophy & Fellowship',
          perks: ['Gold Trophy & Premier State Citation', 'Direct Research Mentorship by IIT Delhi Faculty', 'Patent Search & Provisional Filing Guidance'],
          icon: Trophy,
          iconColor: 'text-amber-500 bg-amber-50'
        },
        {
          place: 'First Runner-Up',
          title: 'State Silver Trophy & Citation',
          perks: ['Silver Trophy & State Merit Certificate', 'Industry Internship & Lab Access'],
          icon: Medal,
          iconColor: 'text-slate-400 bg-slate-50'
        },
        {
          place: 'Special Recognition',
          title: 'Commercial Scalability & Startup Honor',
          perks: ['State Commendation Badge & Citation', 'Incubator Showcase & Investor Pitch Day'],
          icon: Award,
          iconColor: 'text-blue-600 bg-blue-50'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-4 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Excellence Recognized</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Prizes, Accolades &amp; Incubation
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Honoring student visionaries who demonstrate exemplary courage, technological ingenuity, and practical passion for Assam's progress.
          </p>

          {/* Official Prize Pool Banner */}
          <div className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50 to-blue-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 block">
                  State Innovation Prize Pool: ₹52.5 Lakhs
                </span>
                <span className="text-xs text-slate-600">
                  Awarded to 30 Teams (10 Teams / Category) across Assam
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200">
              <span>3 Categories • 30 Winners</span>
            </div>
          </div>
        </section>

        {/* Prize Category Cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-12">
          {prizeStructure.map((cat, idx) => {
            const prizeBreakdowns = [
              { total: '₹7.5 Lakhs', top5: '₹1 Lakh each (Top 5)', next5: '₹50,000 each (Next 5)' },
              { total: '₹15 Lakhs', top5: '₹2 Lakhs each (Top 5)', next5: '₹1 Lakh each (Next 5)' },
              { total: '₹30 Lakhs', top5: '₹4 Lakhs each (Top 5)', next5: '₹2 Lakhs each (Next 5)' },
            ];
            const currentPool = prizeBreakdowns[idx];

            return (
              <div key={cat.category} className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${cat.badgeColor}`}>
                      {cat.category}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-2">{cat.subtitle}</h2>
                  </div>
                  {currentPool && (
                    <div className="p-3 rounded-2xl bg-[#faf8f5] border border-slate-200 flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block">Total Category Pool</span>
                        <span className="text-base font-black text-slate-900">{currentPool.total}</span>
                      </div>
                      <div className="border-l border-slate-200 pl-4 space-y-0.5">
                        <div className="font-bold text-emerald-800">🏆 {currentPool.top5}</div>
                        <div className="font-semibold text-slate-600">🎖️ {currentPool.next5}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cat.tiers.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.place} className="p-6 rounded-2xl bg-[#faf8f5] border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                              {t.place}
                            </span>
                            <div className={`p-2.5 rounded-xl ${t.iconColor}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {t.title}
                          </h3>

                          <ul className="mt-4 space-y-2 text-xs text-slate-600">
                            {t.perks.map((p, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Certificate for all participants */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Certificate of Participation for All Students</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Every verified student who completes the 20-Hour Bootcamp and participates in the online assessment receives an official Certificate of Participation from Innovation hub for cobotics (IHFC) and ASOM, Assam.
              </p>
            </div>
            <Link
              to="/register/school"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shrink-0 shadow-lg transition-all"
            >
              Enroll Your School
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Prizes;
