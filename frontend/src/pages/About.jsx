import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Target, Compass, Sparkles, Sprout, ShieldCheck, Award, HeartHandshake, CheckCircle2, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const outcomes = [
    { title: 'Hands-on Technical Literacy', desc: 'Over 20 hours of structured hands-on STEM, sensor programming, and design thinking pedagogy.' },
    { title: 'Regional Problem Solving', desc: 'Students shift from textbook memorization to diagnosing real climate and economic challenges in Assam.' },
    { title: 'Grassroots Prototyping', desc: 'Top 1,000 teams receive kits and mentorship to translate concepts into working hardware & software.' },
    { title: 'Mentorship by Premier Institutes', desc: 'Direct guidance from researchers at Technology Innovation Hub @ IIT Delhi & premier Assam academia.' },
    { title: 'Divisional Hackathons', desc: '198 teams experience high-energy 48-hour live sprints preparing them for national competitions.' },
    { title: 'Incubation & State Honors', desc: '60 finalists present before state dignitaries and industry investors in Guwahati.' }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-4 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Mission &amp; Strategic Vision</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Building Assam's Next Generation <br />
            <span className="text-emerald-800">of Problem Solvers &amp; Innovators</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            The Assam Future Innovation Program is designed to identify, nurture, and showcase young innovators from schools across Assam. Through structured learning, mentorship, assessments, technical challenges, and hackathons, students are encouraged to transform real-world challenges into practical and innovative solutions.
          </p>
        </section>

        {/* Mission & Vision Cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              To democratize innovation education across all 33 districts of Assam by equipping school students with modern STEM competencies, critical thinking frameworks, and problem-solving mentorship—ensuring no talented child is left behind regardless of geographical or economic boundaries.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              To position Assam as a vibrant epicenter of grassroots technological innovation and sustainable entrepreneurship, where indigenous youth harness modern engineering to preserve natural ecology and accelerate state socio-economic progress.
            </p>
          </div>
        </section>

        {/* Why Assam? */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-xl">
            <div className="max-w-3xl">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Regional Context</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">Why Assam?</h2>
              <p className="mt-4 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                Assam is uniquely endowed with rich biodiversity, majestic waterways like the Brahmaputra, fertile agricultural belts, and the world-renowned tea industry. However, the state simultaneously confronts acute seasonal floods, erosion, rural connectivity bottlenecks, and climate vulnerability.
              </p>
              <p className="mt-3 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                Who better to solve Assam’s challenges than the students who experience them first-hand? AFIP channels student ingenuity toward real regional needs, converting adversity into opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* Who Can Participate & Program Structure */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 w-fit mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Who Can Participate?</h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Enrolled students from <strong>Classes VI to XII</strong> studying in recognized government schools, model schools, provincialized institutions, and affiliated private schools across all 33 districts of Assam.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Institutional Backing</h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Jointly governed by the <strong>Innovation hub for cobotics (IHFC)</strong> and the <strong>Department of School Education / ASOM, Assam</strong>.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-800 w-fit mb-4">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Ecosystem Continuity</h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Top prototypes receive post-competition incubation support, patent filing assistance, and pathways to state science exhibitions and national challenges.
            </p>
          </div>
        </section>

        {/* Measurable Program Outcomes */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Target Program Outcomes</h2>
            <p className="text-sm text-slate-600 mt-2">Tangible pedagogical, technological, and social milestones.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {outcomes.map((o) => (
              <div key={o.title} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{o.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{o.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
