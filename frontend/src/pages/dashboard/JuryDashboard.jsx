import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  Award, Users, FileText, CheckCircle2, Clock, Sparkles, MessageSquare,
  School, Calendar, ChevronRight, X, Loader2, Star, ShieldCheck, ShieldAlert,
  Send, ExternalLink, ArrowRight, Bell, AlertCircle, Eye, EyeOff, Save, Lock
} from 'lucide-react';

const JuryDashboard = () => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('assignments');
  const [juryProfile, setJuryProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Evaluation Modal
  const [activeAssign, setActiveAssign] = useState(null);
  const [scores, setScores] = useState({});
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('Recommended');
  const [remarksVisibility, setRemarksVisibility] = useState('RELEASED');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Conflict of Interest Modal
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictAssign, setConflictAssign] = useState(null);
  const [conflictReason, setConflictReason] = useState('');
  const [submittingConflict, setSubmittingConflict] = useState(false);

  const fetchJuryData = async () => {
    setLoading(true);
    try {
      const [profRes, assignRes, rubRes] = await Promise.all([
        api.get('/jury/me'),
        api.get('/jury/assignments'),
        api.get('/jury/rubric')
      ]);
      setJuryProfile(profRes.data.data);
      setAssignments(assignRes.data.data || []);
      setRubric(rubRes.data.data);
    } catch (err) {
      console.error('Failed to load jury data:', err);
      addToast('Failed to load jury assignments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuryData();
  }, []);

  const openEvaluationModal = (assign) => {
    // Check Conflict of Interest first
    if (!assign.conflict_status || assign.conflict_status === 'pending') {
      setConflictAssign(assign);
      setConflictReason('');
      setConflictModalOpen(true);
      return;
    }
    if (assign.conflict_status === 'conflict_declared') {
      addToast('Conflict of interest was declared on this team. Access is blocked.', 'error');
      return;
    }

    setActiveAssign(assign);
    const existing = assign.evaluation;
    if (existing) {
      setScores(existing.scores || {});
      setStrengths(existing.strengths || '');
      setImprovements(existing.areas_for_improvement || '');
      setComments(existing.comments || '');
      setRecommendation(existing.recommendation || 'Recommended');
      setRemarksVisibility(existing.remarks_visibility || 'RELEASED');
    } else {
      // Default initial criteria values
      const initScores = {};
      const criteriaList = rubric?.criteria || [
        { key: 'innovation_originality', max: 25 },
        { key: 'regional_impact', max: 20 },
        { key: 'technical_feasibility', max: 20 },
        { key: 'presentation_pitch', max: 15 },
        { key: 'team_dynamics', max: 10 },
        { key: 'scalability_market', max: 10 }
      ];
      criteriaList.forEach(c => {
        initScores[c.key] = Math.round(c.max * 0.75);
      });
      setScores(initScores);
      setStrengths('');
      setImprovements('');
      setComments('');
      setRecommendation('Recommended');
      setRemarksVisibility('RELEASED');
    }
  };

  const handleScoreChange = (key, val, max) => {
    const num = Math.min(max, Math.max(0, parseFloat(val) || 0));
    setScores(prev => ({
      ...prev,
      [key]: num
    }));
  };

  const calculatedTotal = Object.entries(scores).reduce((acc, [k, v]) => {
    if (k === 'total') return acc;
    return acc + (parseFloat(v) || 0);
  }, 0);

  const handleSubmitEvaluation = async (isDraft) => {
    if (!activeAssign) return;
    setSubmittingEval(true);
    try {
      const payload = {
        assignment_id: activeAssign._id,
        team_id: activeAssign.team?._id || activeAssign.team_id,
        is_draft: isDraft,
        scores: scores,
        strengths: strengths,
        areas_for_improvement: improvements,
        comments: comments,
        recommendation: recommendation,
        remarks_visibility: remarksVisibility
      };

      const res = await api.post('/jury/evaluate', payload);
      addToast(res.data.message || (isDraft ? 'Review draft saved.' : 'Jury evaluation submitted!'), 'success');
      setActiveAssign(null);
      fetchJuryData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to submit evaluation.';
      addToast(msg, 'error');
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleConfirmConflictDecision = async (decision) => {
    if (!conflictAssign) return;
    setSubmittingConflict(true);
    try {
      const res = await api.post(`/jury/assignments/${conflictAssign._id}/conflict`, {
        decision: decision,
        reason: conflictReason
      });
      addToast(res.data.message || 'Conflict status updated.', 'success');
      setConflictModalOpen(false);
      fetchJuryData();
      if (decision === 'no_conflict') {
        // Proceed directly to evaluation modal
        conflictAssign.conflict_status = 'no_conflict';
        openEvaluationModal(conflictAssign);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to record conflict decision.';
      addToast(msg, 'error');
    } finally {
      setSubmittingConflict(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-700 animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Loading Zonal Jury Portal…</span>
        </div>
      </div>
    );
  }

  const stats = juryProfile?.stats || {
    assigned: assignments.length,
    pending: assignments.filter(a => !a.evaluation || a.evaluation.status === 'draft').length,
    completed: assignments.filter(a => a.evaluation && a.evaluation.status === 'submitted').length,
    conflicts: assignments.filter(a => a.conflict_status === 'conflict_declared').length
  };

  const criteriaList = rubric?.criteria || [
    { key: 'innovation_originality', label: 'Innovation & Originality', max: 25, desc: 'Originality of concept, problem novelty, out-of-the-box thinking.' },
    { key: 'regional_impact', label: 'Community & Regional Impact', max: 20, desc: 'Significance of impact on Assam communities, ecology, or livelihoods.' },
    { key: 'technical_feasibility', label: 'Technical Feasibility & Viability', max: 20, desc: 'Practicality of prototype execution, durability in Assam field environments.' },
    { key: 'presentation_pitch', label: 'Student Presentation & Demonstration', max: 15, desc: 'Pitch clarity, demonstration quality, articulate Q&A defense.' },
    { key: 'team_dynamics', label: 'Team Synergy & Inclusive Collaboration', max: 10, desc: 'Evidence of genuine student teamwork, division of labor, shared leadership.' },
    { key: 'scalability_market', label: 'Scalability & Deployment Potential', max: 10, desc: 'Potential to deploy at district/state scale or commercialize.' }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Jury Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Zonal & Category Jury Panel
                </span>
                <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-mono">
                  {juryProfile?.user_id || 'AFIP-JUR-000001'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {juryProfile?.name || user?.name || 'Honorable Jury Member'}
              </h1>
              <p className="text-slate-300 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span>Subject Jury & Innovation Assessment Panel</span>
                <span className="text-indigo-400">•</span>
                <span>Assam Future Innovation Program</span>
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-black text-indigo-300">{stats.assigned}</div>
                <div className="text-xs text-slate-300 font-medium">Assigned Squads</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-black text-amber-300">{stats.pending}</div>
                <div className="text-xs text-slate-300 font-medium">Pending Reviews</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-black text-emerald-300">{stats.completed}</div>
                <div className="text-xs text-slate-300 font-medium">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Assigned Competition Squads
            </h2>
            <span className="text-xs text-slate-500">{assignments.length} squads assigned</span>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Teams Currently Assigned</h3>
              <p className="text-xs text-slate-500 mt-1">The administration will allocate student innovator squads to your jury panel soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(assign => {
                const team = assign.team;
                const project = assign.project;
                const school = assign.school;
                const isCompleted = assign.evaluation && assign.evaluation.status === 'submitted';
                const isConflict = assign.conflict_status === 'conflict_declared';

                return (
                  <div
                    key={assign._id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                      isConflict
                        ? 'border-rose-200 bg-rose-50/20'
                        : isCompleted
                        ? 'border-emerald-200'
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 font-mono">
                            {team?.team_custom_id || team?.team_code || 'TEAM'}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Class {team?.category || 'IX-X'}
                          </span>
                        </div>
                        {isConflict ? (
                          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Conflict
                          </span>
                        ) : isCompleted ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Score: {assign.evaluation?.total_score}/100
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{team?.team_name || 'Innovator Squad'}</h3>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        <strong>Project:</strong> {project?.title || 'Innovation Prototype'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{school?.school_name || team?.school_name || 'Assam Partner School'}</span>
                        <span>•</span>
                        <span>{school?.district || team?.district || 'Kamrup'}</span>
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        Assigned: {new Date(assign.assigned_at).toLocaleDateString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => openEvaluationModal(assign)}
                        disabled={isConflict}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-indigo-700 hover:bg-indigo-600 text-white shadow-xs'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-500" /> View Evaluation
                          </>
                        ) : (
                          <>
                            <Star className="w-3.5 h-3.5" /> Evaluate Squad
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Conflict of Interest Declaration Modal */}
      <AnimatePresence>
        {conflictModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <ShieldAlert className="w-7 h-7" />
                <h3 className="text-lg font-bold text-slate-900">Conflict of Interest Confirmation</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Before evaluating squad <strong>{conflictAssign?.team?.team_name || 'the assigned squad'}</strong> from <strong>{conflictAssign?.team?.school_name}</strong>, please confirm that you have no personal, academic, or familial conflict of interest.
              </p>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">If conflict exists, please specify reason:</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. I have a relative in this team / school faculty association"
                    value={conflictReason}
                    onChange={(e) => setConflictReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={submittingConflict}
                    onClick={() => handleConfirmConflictDecision('no_conflict')}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> I Have No Conflict
                  </button>
                  <button
                    type="button"
                    disabled={submittingConflict || !conflictReason.trim()}
                    onClick={() => handleConfirmConflictDecision('conflict_declared')}
                    className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" /> Declare Conflict
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Jury Evaluation Scoring Modal */}
      <AnimatePresence>
        {activeAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      {activeAssign.team?.team_custom_id || activeAssign.team?.team_code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Class {activeAssign.team?.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{activeAssign.team?.team_name}</h3>
                  <p className="text-xs text-slate-500">{activeAssign.project?.title} • {activeAssign.school?.school_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAssign(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeAssign.evaluation?.status === 'submitted' && !activeAssign.evaluation?.is_unlocked && (
                <div className="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Locked Evaluation:</strong> This evaluation is submitted and locked. Contact Administrator to request reopening.</span>
                </div>
              )}

              {/* Rubric Criteria Grid */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>{rubric?.title || 'Zonal Jury Rubric (Max 100)'}</span>
                    <span className="text-indigo-700 font-mono text-sm font-black">
                      Score: {calculatedTotal.toFixed(1)} / 100
                    </span>
                  </h4>

                  <div className="space-y-3">
                    {criteriaList.map(c => {
                      const val = scores[c.key] ?? Math.round(c.max * 0.75);
                      const isLocked = activeAssign.evaluation?.status === 'submitted' && !activeAssign.evaluation?.is_unlocked;

                      return (
                        <div key={c.key} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="font-bold text-slate-900">{c.label}</span>
                              <span className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                                Max {c.max}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{c.desc}</p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <input
                              type="number"
                              min="0"
                              max={c.max}
                              step="0.5"
                              disabled={isLocked}
                              value={val}
                              onChange={(e) => handleScoreChange(c.key, e.target.value, c.max)}
                              className="w-20 px-3 py-1.5 text-center font-bold text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                            />
                            <span className="text-xs text-slate-400 font-medium">/ {c.max}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Qualitative Remarks & Visibility */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Key Strengths & Merits</label>
                    <textarea
                      rows={2}
                      placeholder="Highlight what the student team executed exceptionally well..."
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      disabled={activeAssign.evaluation?.status === 'submitted' && !activeAssign.evaluation?.is_unlocked}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Areas for Improvement & Guidance</label>
                    <textarea
                      rows={2}
                      placeholder="Constructive technical/presentation guidance for next stages..."
                      value={improvements}
                      onChange={(e) => setImprovements(e.target.value)}
                      disabled={activeAssign.evaluation?.status === 'submitted' && !activeAssign.evaluation?.is_unlocked}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Overall Jury Comments</label>
                    <textarea
                      rows={2}
                      placeholder="Final comments & justification of score..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      disabled={activeAssign.evaluation?.status === 'submitted' && !activeAssign.evaluation?.is_unlocked}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jury Recommendation</label>
                      <select
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        disabled={activeAssign.evaluation?.status === 'submitted' && !activeAssign.evaluation?.is_unlocked}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs disabled:bg-slate-100"
                      >
                        <option value="Strongly Recommended">Strongly Recommended (Top Tier)</option>
                        <option value="Recommended">Recommended</option>
                        <option value="Qualified with Modifications">Qualified with Modifications</option>
                        <option value="Not Recommended">Not Recommended</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Remarks Visibility</label>
                      <select
                        value={remarksVisibility}
                        onChange={(e) => setRemarksVisibility(e.target.value)}
                        disabled={activeAssign.evaluation?.status === 'submitted' && !activeAssign.evaluation?.is_unlocked}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs disabled:bg-slate-100"
                      >
                        <option value="RELEASED">RELEASED (Visible to District, School & Team)</option>
                        <option value="PRIVATE">PRIVATE (Confidential to Admin & Jury Only)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveAssign(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:text-slate-800"
                  >
                    Close
                  </button>

                  {(!activeAssign.evaluation || activeAssign.evaluation.status !== 'submitted' || activeAssign.evaluation.is_unlocked) && (
                    <>
                      <button
                        type="button"
                        disabled={submittingEval}
                        onClick={() => handleSubmitEvaluation(true)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> Save Draft
                      </button>
                      <button
                        type="button"
                        disabled={submittingEval}
                        onClick={() => handleSubmitEvaluation(false)}
                        className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {submittingEval && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Send className="w-4 h-4" /> Finalize & Lock Score
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default JuryDashboard;
