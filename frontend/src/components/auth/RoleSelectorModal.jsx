import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, School, UserCheck, X, ArrowRight, KeyRound,
  Award, Sparkles, MapPin, Compass, ChevronRight
} from 'lucide-react';

const RoleSelectorModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const roles = [
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

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          {/* Header — compact */}
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white relative flex items-center justify-between">
            <div>
              <div className="text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                Assam Future Innovation Program
              </div>
              <h2 className="text-lg font-bold tracking-tight">Select Your Portal</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role List — scrollable, compact rows */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            <div className="p-3 space-y-1.5">
              {roles.map((r, i) => {
                const Icon = r.icon;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect(r.path)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border border-slate-200 border-l-4 ${r.accent} hover:border-emerald-400 hover:bg-emerald-50/40 hover:shadow-sm transition-all cursor-pointer group bg-white`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.iconBg}`}>
                      <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
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
                          onClick={(e) => { e.stopPropagation(); handleSelect(r.registerPath); }}
                          className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-800 transition-colors cursor-pointer"
                        >
                          Register
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(r.path); }}
                        className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition-colors cursor-pointer"
                      >
                        Sign In
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Each portal has a one-click <strong className="text-slate-700">Autofill Demo</strong> button on its login page.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoleSelectorModal;
