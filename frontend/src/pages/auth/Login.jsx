import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, School, GraduationCap, UserCheck, Lock, Mail, ArrowRight, KeyRound, Loader2, Sparkles, Award, MapPin, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const roleMeta = {
  admin: {
    title: 'Administrator Console',
    desc: 'State governance, school approvals, assignments & controls',
    icon: ShieldCheck,
    color: 'from-slate-900 to-emerald-950',
    accent: 'text-slate-800 bg-slate-100',
    demo: { email: 'admin@afip.demo', pass: 'Admin@123' },
    redirect: '/admin/dashboard'
  },
  school: {
    title: 'School & Institution Portal',
    desc: 'Register institution, track UDISE approval & team milestones',
    icon: School,
    color: 'from-emerald-900 to-teal-950',
    accent: 'text-emerald-800 bg-emerald-100',
    demo: { email: 'school@afip.demo', pass: 'School@123' },
    redirect: '/school/dashboard',
    registerLink: '/register/school'
  },
  mentor: {
    title: 'Teacher & Innovation Mentor',
    desc: 'Guide student innovator teams, provide milestone feedback & track projects',
    icon: Compass,
    color: 'from-cyan-900 to-slate-950',
    accent: 'text-cyan-800 bg-cyan-100',
    demo: { email: 'mentor@afip.demo', pass: 'Mentor@123' },
    redirect: '/mentor/dashboard'
  },
  evaluator: {
    title: 'Technical Evaluator Panel',
    desc: 'Review assigned student prototypes & submit official scores',
    icon: UserCheck,
    color: 'from-blue-900 to-slate-950',
    accent: 'text-blue-800 bg-blue-100',
    demo: { email: 'evaluator@afip.demo', pass: 'Evaluator@123' },
    redirect: '/evaluator/dashboard',
    registerLink: '/register/evaluator'
  },
  district: {
    title: 'District Innovation Officer',
    desc: 'Monitor district-wide school participation, teams & innovation metrics',
    icon: MapPin,
    color: 'from-teal-900 to-emerald-950',
    accent: 'text-teal-800 bg-teal-100',
    demo: { email: 'district@afip.demo', pass: 'District@123' },
    redirect: '/district/dashboard'
  },
  jury: {
    title: 'Zonal & Subject Jury Panel',
    desc: 'Assess zonal hackathon teams and interview student finalists',
    icon: Award,
    color: 'from-indigo-900 to-slate-950',
    accent: 'text-indigo-800 bg-indigo-100',
    demo: { email: 'jury@afip.demo', pass: 'Jury@123' },
    redirect: '/jury/dashboard'
  },
  state_jury: {
    title: 'State Grand Jury',
    desc: 'Evaluate top state finalists and determine government awards',
    icon: Sparkles,
    color: 'from-amber-950 via-slate-900 to-emerald-950',
    accent: 'text-amber-800 bg-amber-100',
    demo: { email: 'statejury@afip.demo', pass: 'StateJury@123' },
    redirect: '/state-jury/dashboard'
  },
  student: {
    title: 'Student & Team Portal',
    desc: 'Knowledge assessment, team workspace & prototype submission',
    icon: GraduationCap,
    color: 'from-teal-900 to-slate-950',
    accent: 'text-teal-800 bg-teal-100',
    demo: { email: 'student@afip.demo', pass: 'Student@123' },
    redirect: '/student/dashboard',
    registerLink: '/register/student'
  }
};

const Login = () => {
  const { role = 'school' } = useParams();
  const currentMeta = roleMeta[role] || roleMeta.school;
  const Icon = currentMeta.icon;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password, role);
      addToast(`Welcome back to the ${currentMeta.title}!`, 'success');
      navigate(currentMeta.redirect);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Login failed. Please verify credentials.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const autofillDemo = () => {
    setEmail(currentMeta.demo.email);
    setPassword(currentMeta.demo.pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Role Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl mb-6 max-w-2xl w-full border border-slate-300/60 shadow-xs">
          {[
            { key: 'school', label: 'School' },
            { key: 'admin', label: 'Admin' },
            { key: 'mentor', label: 'Mentor' },
            { key: 'evaluator', label: 'Evaluator' },
            { key: 'district', label: 'District' },
            { key: 'jury', label: 'Jury' },
            { key: 'state_jury', label: 'State Jury' }
          ].map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setErrorMessage('');
                navigate(`/login/${r.key}`);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                role === r.key
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden"
        >
          {/* Header Banner */}
          <div className={`p-8 bg-gradient-to-br ${currentMeta.color} text-white relative`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <Icon className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/20">
                Official Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{currentMeta.title}</h1>
            <p className="text-xs text-emerald-100/80 mt-1">{currentMeta.desc}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@institution.assam.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Autofill Demo Credentials */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={autofillDemo}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Autofill Demo Account ({currentMeta.demo.email})</span>
              </button>
            </div>

            {/* Registration option if applicable */}
            {currentMeta.registerLink && (
              <div className="text-center pt-2 text-xs text-slate-500">
                Don't have an approved account yet?{' '}
                <Link to={currentMeta.registerLink} className="text-emerald-800 font-bold hover:underline">
                  Submit Registration
                </Link>
              </div>
            )}
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
