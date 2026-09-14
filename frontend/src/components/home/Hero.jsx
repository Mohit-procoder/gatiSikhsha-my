import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Trophy, Compass, ShieldCheck, MapPin, Leaf, Shield } from 'lucide-react';
import ihfcLogo from '../../assets/logos/ihfc-logo.svg';
import samagraLogo from '../../assets/logos/samagra-shiksha-assam.svg';
import rhinoImg from '../../assets/rhino-kaziranga.jpg';

const Hero = () => {
  return (
    <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden bg-gradient-to-b from-[#f5f0e6] via-[#faf8f5] to-[#faf8f5]">
      {/* Decorative ambient radial glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-500/10 via-amber-500/15 to-teal-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-700/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-40 left-10 w-96 h-96 bg-amber-700/5 blur-3xl rounded-full pointer-events-none" />

      {/* ------------------------------------------------------------------ */}
      {/* LEFT FLANK (DESKTOP): ASSAMESE TEA-GARDEN LADY IN MEKHELA SADOR    */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        style={{ width: 'clamp(280px, 23vw, 420px)' }}
        className="hidden xl:flex flex-col items-end absolute left-0 bottom-0 z-20 pointer-events-auto select-none"
      >
        <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-[1.03] w-full">
          {/* Subtle glow behind figure */}
          <div className="absolute -inset-6 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <svg viewBox="0 0 300 450" className="w-full h-auto drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="hero-tea-basket" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="hero-saree-drape" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdf4dc" />
                <stop offset="50%" stopColor="#f5e6c4" />
                <stop offset="100%" stopColor="#e2c892" />
              </linearGradient>
              <linearGradient id="hero-muga-red-border" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              {/* Foliage gradients for environment */}
              <linearGradient id="hero-foliage-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#40916c" />
                <stop offset="100%" stopColor="#1b4332" />
              </linearGradient>
            </defs>

            {/* Tea garden ground vegetation */}
            <g opacity="0.85">
              <ellipse cx="155" cy="430" rx="130" ry="22" fill="#2d6a4f" opacity="0.4" />
              {/* Tea bushes at base */}
              <circle cx="40" cy="410" r="32" fill="#40916c" opacity="0.7" />
              <circle cx="70" cy="405" r="26" fill="#52b788" opacity="0.6" />
              <circle cx="250" cy="415" r="28" fill="#2d6a4f" opacity="0.65" />
              <circle cx="220" cy="408" r="22" fill="#40916c" opacity="0.55" />
              {/* Grass blades */}
              <path d="M 30,440 Q 33,415 28,400" stroke="#52b788" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 40,442 Q 46,420 52,408" stroke="#40916c" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 240,440 Q 244,418 240,405" stroke="#52b788" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 252,442 Q 258,422 264,410" stroke="#74c69d" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>

            {/* Bamboo basket (Tokari) on her back */}
            <g id="hero-tea-basket-group" className="animate-pulse" style={{ animationDuration: '5s' }}>
              <ellipse cx="110" cy="180" rx="42" ry="58" fill="url(#hero-tea-basket)" stroke="#572208" strokeWidth="3" transform="rotate(-15, 110, 180)" />
              <path d="M 80,140 Q 110,180 140,220 M 70,180 Q 110,190 150,180 M 80,210 Q 110,210 140,160" stroke="#fcd34d" strokeWidth="1.5" opacity="0.6" />
              {/* Plucked tea leaves inside basket */}
              <path d="M 75,130 Q 95,115 115,125 Q 135,110 150,135 Q 130,150 90,145 Z" fill="#2d6a4f" />
              <circle cx="100" cy="125" r="5" fill="#52b788" />
              <circle cx="125" cy="120" r="6" fill="#74c69d" />
              <circle cx="112" cy="132" r="4.5" fill="#40916c" />
              {/* Strap across shoulder */}
              <path d="M 95,145 C 105,105 130,70 155,75" fill="none" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
            </g>

            {/* Lady Character in traditional Mekhela Sador */}
            <g id="hero-woman-body">
              {/* Hair bun with red floral adornment */}
              <circle cx="175" cy="72" r="18" fill="#1e1b18" />
              <circle cx="186" cy="65" r="4" fill="#ef4444" />
              {/* Face */}
              <ellipse cx="160" cy="78" rx="16" ry="18" fill="#d4a373" />
              {/* Traditional red forehead bindi */}
              <circle cx="150" cy="74" r="2.5" fill="#dc2626" />
              <path d="M 148,65 Q 165,58 178,68 Q 165,72 152,70 Z" fill="#f87171" opacity="0.9" />
              {/* Neck & gold choker */}
              <rect x="156" y="94" width="10" height="12" fill="#c68a52" rx="2" />
              <path d="M 154,102 Q 161,107 168,102" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
              {/* Red blouse (Riha) */}
              <path d="M 140,105 Q 160,100 178,110 L 190,165 Q 160,175 135,160 Z" fill="#b91c1c" />
              {/* Sador (Muga silk drape over shoulder) */}
              <path d="M 142,108 Q 165,135 150,210 L 195,290 Q 210,190 180,115 Z" fill="url(#hero-saree-drape)" stroke="#d97706" strokeWidth="1" />
              {/* Characteristic red Kingkhap borders */}
              <path d="M 142,108 Q 165,135 150,210" stroke="url(#hero-muga-red-border)" strokeWidth="4" fill="none" />
              <path d="M 150,210 L 195,290" stroke="url(#hero-muga-red-border)" strokeWidth="4" fill="none" />
              {/* Mekhela (Pleated skirt) */}
              <path d="M 140,200 L 130,360 Q 170,370 205,355 L 190,210 Z" fill="url(#hero-saree-drape)" />
              <path d="M 130,352 Q 170,362 205,347" stroke="url(#hero-muga-red-border)" strokeWidth="6" fill="none" />
              {/* Arm reaching forward to pluck two leaves and a bud */}
              <path d="M 175,120 Q 205,150 200,185 Q 185,188 178,175" fill="none" stroke="#d4a373" strokeWidth="10" strokeLinecap="round" />
              <circle cx="196" cy="180" r="4" fill="#d4a373" />
              {/* Fresh tea leaves in hand */}
              <path d="M 198,175 Q 210,165 215,172 Q 208,182 198,175 Z" fill="#40916c" />
              <path d="M 200,174 Q 206,160 212,165 Q 207,175 200,174 Z" fill="#52b788" />
            </g>
            {/* Ground shadow */}
            <ellipse cx="160" cy="438" rx="85" ry="10" fill="#1b4332" opacity="0.28" />
          </svg>

          {/* Heritage Tag */}
          <div className="mt-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-md text-center flex items-center gap-1.5 justify-center">
            <Leaf className="w-3 h-3 text-emerald-700" />
            <span className="text-[11px] font-extrabold text-emerald-950">Tea Garden Heritage</span>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT FLANK (DESKTOP): KAZIRANGA ONE-HORNED RHINOCEROS — PHOTO     */}
      {/* ------------------------------------------------------------------ */}
      {/* SVG chroma-key filter defined once in the DOM */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="rhino-remove-white" x="0%" y="0%" width="100%" height="100%">
            {/* Convert near-white pixels to transparent */}
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                     -8 -8 -8 20 -5"
            />
          </filter>
        </defs>
      </svg>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
        style={{ width: 'clamp(400px, 34vw, 640px)' }}
        className="hidden xl:flex flex-col items-center absolute right-0 bottom-0 z-20 pointer-events-auto select-none"
      >
        <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-[1.02] w-full">
          {/* Soft ambient glow behind rhino */}
          <div className="absolute -inset-8 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none" />

          {/* Vegetation framing — subtle grass blades behind rhino */}
          <div className="absolute bottom-[52px] left-0 right-0 flex items-end justify-between px-2 pointer-events-none overflow-hidden" style={{ height: '80px' }}>
            {/* Left grass cluster */}
            <svg viewBox="0 0 80 80" style={{ width: '28%', height: 'auto' }} className="opacity-80">
              <path d="M 10,80 Q 8,50 5,30" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 18,80 Q 20,55 28,38" stroke="#40916c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 28,80 Q 32,58 40,42" stroke="#52b788" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 5,80 Q 2,60 -2,45" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="16" cy="68" r="14" fill="#40916c" opacity="0.5" />
              <circle cx="35" cy="72" r="10" fill="#52b788" opacity="0.4" />
            </svg>
            {/* Right grass cluster */}
            <svg viewBox="0 0 80 80" style={{ width: '28%', height: 'auto' }} className="opacity-80">
              <path d="M 70,80 Q 72,50 75,30" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 62,80 Q 60,55 52,38" stroke="#40916c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 52,80 Q 48,58 40,42" stroke="#52b788" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 75,80 Q 78,60 82,45" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="64" cy="68" r="14" fill="#40916c" opacity="0.5" />
              <circle cx="45" cy="72" r="10" fill="#52b788" opacity="0.4" />
            </svg>
          </div>

          {/* RHINO PHOTO — SVG filter removes white bg pixels regardless of stacking context */}
          <div className="relative w-full" style={{
            zIndex: "-1",
            position:"relative",
            left: "5%"
          }}>
            <img
              src={rhinoImg}
              alt="Kaziranga One-Horned Rhinoceros"
              className="w-full h-auto object-contain"
              style={{
                filter: 'url(#rhino-remove-white) contrast(1.05) saturate(1.08)',
                
              }}
              draggable={false}
            />
            {/* Subtle ground shadow beneath the rhino */}
            <div
              className="absolute bottom-[52px] left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: '75%',
                height: '18px',
                background: 'radial-gradient(ellipse at center, rgba(27,67,50,0.30) 0%, transparent 72%)',
                filter: 'blur(4px)',
              }}
            />
          </div>

          {/* Heritage Tag */}
          <div className="mt-1 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-md text-center flex items-center gap-1.5 justify-center">
            <Shield className="w-3 h-3 text-emerald-700" />
            <span className="text-[11px] font-extrabold text-emerald-950">One-Horned Rhino • Kaziranga</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Official Partnership Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 border border-slate-200/90 shadow-sm mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">
              Joint Initiative of <strong className="text-emerald-900 font-bold">Innovation hub for cobotics (IHFC)</strong> &amp; <strong className="text-amber-800 font-bold">ASOM, Assam</strong>
            </span>
          </motion.div>

          {/* Main Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-amber-700 mb-3">
              Student Innovation Challenge
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Brahmaputra Innovation Challenge <br />
              <span className="bg-gradient-to-r from-emerald-800 via-teal-700 to-amber-600 bg-clip-text text-transparent text-2xl sm:text-4xl lg:text-5xl block mt-2">
                Viksit Assam and Viksit Bharat 2047
              </span>
            </h1>
          </motion.div>

          {/* Tagline & Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            A state-wide innovation journey empowering students from <strong className="text-slate-900 font-semibold">Classes VI–XII</strong> across all 33 districts of Assam to identify real problems, develop practical solutions, build prototypes, learn from experts, and showcase ideas for a stronger Assam.
          </motion.p>

          {/* Cultural & Wildlife Recognition Pill Strip (Visible on all viewports, especially mobile & tablet) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.23 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300/80 shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assam Tea Heritage</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300/80 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-slate-700" />
              <span>Kaziranga One-Horned Rhino</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300/80 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>33 Assam Districts</span>
            </span>
          </motion.div>

          {/* Key Eligibility Category Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600"
          >
            <span className="px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300/80">
              Category 1: Classes VI–VIII
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80">
              Category 2: Classes IX–X
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-100/90 text-blue-900 border border-blue-300/80">
              Category 3: Classes XI–XII
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to="/register/school"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/20 hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2.5 group"
            >
              <span>Register Your School</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#journey"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-sm hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>Explore the Journey</span>
            </a>

            <Link
              to="/leaderboard"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm sm:text-base border border-amber-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-700" />
              <span>State Leaderboard</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

