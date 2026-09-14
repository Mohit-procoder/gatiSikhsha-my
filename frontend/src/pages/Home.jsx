import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import StageMilestones from '../components/home/StageMilestones';
import FunnelVisualization from '../components/home/FunnelVisualization';
import StatsSection from '../components/home/StatsSection';
import InnovationThemes from '../components/home/InnovationThemes';
import PrizesPreview from '../components/home/PrizesPreview';
import LeaderboardPreview from '../components/home/LeaderboardPreview';
import CallToAction from '../components/home/CallToAction';
import InnovationPathways from '../components/home/InnovationPathways';
import { ShieldCheck, BookOpen, Users, Compass, ArrowRight, Lightbulb, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO */}
        <Hero />

        {/* 2. PROGRAM OVERVIEW & INTRO */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>State Innovation Mandate</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Nurturing Grassroots Innovation Across Assam's Schools
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  The Assam Future Innovation Program (AFIP) is an unprecedented initiative by the <strong>Innovation hub for cobotics (IHFC)</strong> in partnership with <strong>ASOM, Assam</strong>.
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Rather than a conventional theoretical exam, this state-wide competition invites students from rural, tea garden, island (char), and urban schools to identify tangible local bottlenecks—such as annual Brahmaputra flooding, tea plucking ergonomics, and bamboo upcycling—and engineer functioning hardware and software prototypes.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>IIT Delhi Mentorship</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>20h + 30d Bootcamps</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200">
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>33 Districts Participation</span>
                  </div>
                </div>
              </div>

              {/* Category Cards Column */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-3xl bg-[#faf8f5] border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Category 1</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Classes VI–VIII</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Fostering early scientific curiosity, foundational electronics, and creative community observation.
                    </p>
                    <div className="mt-3.5 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-xs">
                      <span className="font-black text-emerald-950 block">🏆 ₹7.5L Pool (10 Teams)</span>
                      <span className="text-emerald-800 text-[11px] block mt-0.5 font-medium">Top 5: ₹1L each • Next 5: ₹50k</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-emerald-700">
                    Junior Innovators
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#faf8f5] border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Category 2</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Classes IX–X</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Applied microcontroller systems, design thinking, sensory devices, and local environmental problem solving.
                    </p>
                    <div className="mt-3.5 p-2.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-xs">
                      <span className="font-black text-amber-950 block">🏆 ₹15L Pool (10 Teams)</span>
                      <span className="text-amber-800 text-[11px] block mt-0.5 font-medium">Top 5: ₹2L each • Next 5: ₹1L</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-amber-700">
                    Intermediate Innovators
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#faf8f5] border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Category 3</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Classes XI–XII</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Advanced coding, IoT, AI models, hardware mechanics, and scalable venture prototyping.
                    </p>
                    <div className="mt-3.5 p-2.5 rounded-2xl bg-blue-50 border border-blue-200/90 text-xs">
                      <span className="font-black text-blue-950 block">🏆 ₹30L Pool (10 Teams)</span>
                      <span className="text-blue-800 text-[11px] block mt-0.5 font-medium">Top 5: ₹4L each • Next 5: ₹2L</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-blue-700">
                    Senior Innovators
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INNOVATION ACCELERATION PATHWAYS & HIGHLIGHTED STATE PRIZE POOL */}
        <InnovationPathways />

        {/* SWAPPED: STAGE-BY-STAGE MILESTONES & SCHEDULE ON HOME PAGE */}
        <StageMilestones />

        {/* 4. PROGRAM IMPACT / NUMBERS */}
        <StatsSection />

        {/* 5. FUNNEL VISUALIZATION */}
        <FunnelVisualization />

        {/* 6. LIST OF 15 INNOVATION THEMES (SSA) */}
        <InnovationThemes />

        {/* 7. PRIZES & AWARDS */}
        <PrizesPreview />

        {/* 8. STATE LEADERBOARD PREVIEW */}
        <LeaderboardPreview />

        {/* 9. CALL TO ACTION */}
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
