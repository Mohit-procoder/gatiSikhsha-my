import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, School, UserCheck, X, ArrowRight, ArrowLeft, KeyRound,
  Award, Sparkles, MapPin, Compass, ChevronRight
} from 'lucide-react';

const RoleSelectorModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  // selectedCategory: null (shows only 2 categories) | 'admin' | 'school_mentor'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Reset to category selection screen whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const adminRoles = [
    {
      id: 'admin',
      title: 'Administrator',
      desc: 'State governance, approvals & controls',
      path: '/login/admin',
      registerPath: null,
      icon: ShieldCheck,
      iconBg: 'bg-slate-100 text-slate-700',
      accent: 'border-l-slate-500',
      badge: 'State Directorate'
    },
    {
      id: 'evaluator',
      title: 'Technical Evaluator',
      desc: 'Score prototypes using the 7-criteria rubric',
      path: '/login/evaluator',
      registerPath: '/register/evaluator',
      icon: UserCheck,
      iconBg: 'bg-blue-100 text-blue-700',
      accent: 'border-l-blue-500',
      badge: 'Expert Panel'
    },
    {
      id: 'district',
      title: 'District Officer',
      desc: 'Monitor district schools, teams & innovation metrics',
      path: '/login/district',
      registerPath: null,
      icon: MapPin,
      iconBg: 'bg-orange-100 text-orange-700',
      accent: 'border-l-orange-500',
      badge: 'District Level'
    },
    {
      id: 'jury',
      title: 'Zonal Jury',
      desc: 'Assess hackathon teams & submit jury remarks',
      path: '/login/jury',
      registerPath: null,
      icon: Award,
      iconBg: 'bg-indigo-100 text-indigo-700',
      accent: 'border-l-indigo-500',
      badge: 'Jury Round'
    },
    {
      id: 'state_jury',
      title: 'State Grand Jury',
      desc: 'Evaluate state finalists & determine winners',
      path: '/login/state_jury',
      registerPath: null,
      icon: Sparkles,
      iconBg: 'bg-amber-100 text-amber-700',
      accent: 'border-l-amber-500',
      badge: 'State Final'
    }
  ];

  const schoolMentorRoles = [
    {
      id: 'school',
      title: 'School Portal',
      desc: 'Manage institution, teams & mentor onboarding',
      path: '/login/school',
      registerPath: '/register/school',
      icon: School,
      iconBg: 'bg-emerald-100 text-emerald-700',
      accent: 'border-l-emerald-500',
      badge: 'School Admin'
    },
    {
      id: 'mentor',
      title: 'Teacher Mentor',
      desc: 'Guide teams, review projects & milestones',
      path: '/login/mentor',
      registerPath: null,
      icon: Compass,
      iconBg: 'bg-cyan-100 text-cyan-700',
      accent: 'border-l-cyan-500',
      badge: 'STEM Mentor'
    }
  ];

  const handleSelectRole = (path) => {
    setSelectedCategory(null);
    onClose();
    navigate(path);
  };

  const handleClose = () => {
    setSelectedCategory(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white relative flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="mr-1 p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Back to categories"
                  aria-label="Back to categories"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <div className="text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                  Assam Future Innovation Program
                </div>
                <h2 className="text-lg font-bold tracking-tight">
                  {selectedCategory === 'admin'
                    ? 'Admin Login Portals'
                    : selectedCategory === 'school_mentor'
                    ? 'School & Mentor Portals'
                    : 'Select Your Portal'}
                </h2>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Close portal selector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="overflow-y-auto flex-1 p-4" style={{ maxHeight: 'calc(100vh - 170px)' }}>
            <AnimatePresence mode="wait">
              {/* SCREEN 1: ONLY SHOW THE TWO CATEGORIES */}
              {!selectedCategory ? (
                <motion.div
                  key="categories-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 py-2"
                >
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Please choose a category to view its portals:
                    </p>
                  </div>

                  {/* CATEGORY 1 CARD: ADMIN LOGIN */}
                  <div
                    onClick={() => setSelectedCategory('admin')}
                    className="p-5 rounded-2xl border-2 border-slate-200/90 hover:border-emerald-600 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 hover:shadow-lg hover:shadow-emerald-950/5 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-200 group-hover:scale-105 group-hover:bg-emerald-900 group-hover:text-amber-300 transition-all shadow-xs">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                              Admin Login
                            </h3>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-100 group-hover:text-emerald-950 transition-colors">
                              5 Portals
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            State governance, technical evaluations, district monitoring, and state jury panels.
                          </p>

                          {/* List preview of included logins */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              Administrator
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              Technical Evaluator
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              District Officer
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              Zonal Jury
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              State Grand Jury
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-emerald-800 text-slate-400 group-hover:text-white transition-all shrink-0 mt-1">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY 2 CARD: SCHOOL / MENTOR LOGIN */}
                  <div
                    onClick={() => setSelectedCategory('school_mentor')}
                    className="p-5 rounded-2xl border-2 border-slate-200/90 hover:border-emerald-600 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 hover:shadow-lg hover:shadow-emerald-950/5 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center shrink-0 border border-teal-200 group-hover:scale-105 group-hover:bg-emerald-900 group-hover:text-teal-200 transition-all shadow-xs">
                          <School className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                              School / Mentor Login
                            </h3>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-100 group-hover:text-emerald-950 transition-colors">
                              2 Portals
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Institution administration, student teams creation, and teacher STEM mentor guidance.
                          </p>

                          {/* List preview of included logins */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              School Portal
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              Teacher Mentor
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-emerald-800 text-slate-400 group-hover:text-white transition-all shrink-0 mt-1">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* SCREEN 2: LOGINS INSIDE THE SELECTED CATEGORY */
                <motion.div
                  key={`roles-${selectedCategory}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2.5"
                >
                  {/* Category switcher breadcrumb header */}
                  <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Categories</span>
                    </button>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {selectedCategory === 'admin' ? '5 Admin Portals' : '2 School Portals'}
                    </span>
                  </div>

                  {/* List of portals */}
                  {(selectedCategory === 'admin' ? adminRoles : schoolMentorRoles).map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelectRole(r.path)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-slate-200 border-l-4 ${r.accent} hover:border-emerald-400 hover:bg-emerald-50/40 hover:shadow-sm transition-all cursor-pointer group bg-white`}
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.iconBg}`}>
                          <Icon className="w-[18px] h-[18px]" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{r.title}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hidden sm:inline">
                              {r.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{r.desc}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {r.registerPath && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSelectRole(r.registerPath); }}
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                              Register
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelectRole(r.path); }}
                            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            Sign In
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer hint */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
            <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Each portal has a one-click <strong className="text-slate-700">Autofill Demo</strong> button on its login page.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoleSelectorModal;
