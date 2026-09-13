import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import ihfcLogo from '../../assets/logos/ihfc-logo.svg';
import samagraLogo from '../../assets/logos/samagra-shiksha-assam.svg';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 overflow-hidden relative">
      {/* Decorative Assam tea leaves background silhouette */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-20 translate-y-20">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50,10 C70,30 80,60 50,90 C20,60 30,30 50,10 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1 & 2: Branding & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4 bg-white/95 p-3 rounded-2xl w-fit">
              <img src={ihfcLogo} alt="IHFC IIT Delhi" className="h-8 w-auto object-contain" />
              <div className="h-6 w-px bg-slate-300" />
              <img src={samagraLogo} alt="Samagra Shiksha Assam" className="h-8 w-auto object-contain" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Assam Future Innovation Program
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A state-wide innovation journey empowering students from Classes VI–XII across all 33 districts of Assam to identify real problems, develop practical solutions, and engineer prototypes for sustainable regional growth.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technology Innovation Hub @ IIT Delhi &amp; Samagra Shiksha, Assam</span>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About the Program</Link></li>
              <li><Link to="/journey" className="hover:text-emerald-400 transition-colors">Competition Journey</Link></li>
              <li><Link to="/guidelines" className="hover:text-emerald-400 transition-colors">Rules &amp; Guidelines</Link></li>
              <li><Link to="/prizes" className="hover:text-emerald-400 transition-colors">Prizes &amp; Recognition</Link></li>
              <li><Link to="/leaderboard" className="hover:text-emerald-400 transition-colors">State Leaderboard</Link></li>
              <li><Link to="/innovations" className="hover:text-emerald-400 transition-colors">Innovation Showcase</Link></li>
            </ul>
          </div>

          {/* Column 4: Portals */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Portals &amp; Login
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login/school" className="hover:text-amber-400 transition-colors">School &amp; Mentor Portal</Link></li>
              <li><Link to="/register/school" className="hover:text-amber-400 transition-colors">Register Your School</Link></li>
              <li><Link to="/login/evaluator" className="hover:text-amber-400 transition-colors">Evaluator Panel</Link></li>
              <li><Link to="/register/evaluator" className="hover:text-amber-400 transition-colors">Join as Evaluator</Link></li>
              <li><Link to="/login/admin" className="hover:text-rose-400 transition-colors">Administrative Console</Link></li>
            </ul>
          </div>

          {/* Column 5: Support & Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Secretariat Support
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>support.afip@assam.gov.in</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>+91 (0361) 223-7055 / 1800-345-3522</span>
              </div>
              <p className="pt-2 text-[11px] text-slate-500">
                Mission Directorate, Samagra Shiksha, Kahilipara, Guwahati, Assam 781019
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Assam Future Innovation Program. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-400 font-medium italic">
            <span>"Ideas Today. A Stronger Assam Tomorrow."</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
