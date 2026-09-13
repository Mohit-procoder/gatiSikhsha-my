import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  Sparkles, Award, Trophy, Users, FileText, CheckCircle2, Clock,
  School, ChevronRight, X, Loader2, Star, ShieldCheck, ShieldAlert,
  Send, Save, Lock, AlertCircle, Eye, Building
} from 'lucide-react';

const StateJuryDashboard = () => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [juryProfile, setJuryProfile] = useState(null);
  const [finalists, setFinalists] = useState([]);
  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Finalist Evaluation Modal
  const [activeFinalist, setActiveFinalist] = useState(null);
  const [scores, setScores] = useState({});
  const [recommendedRank, setRecommendedRank] = useState(1);
  const [awardNomination, setAwardNomination] = useState('State Gold Innovator');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comments, setComments] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Conflict Modal
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictTeam, setConflictTeam] = useState(null);
  const [conflictReason, setConflictReason] = useState('');
  const [submittingConflict, setSubmittingConflict] = useState(false);

  const fetchStateJuryData = async () => {
    setLoading(true);
    try {
      const [profRes, finRes, rubRes] = await Promise.all([
        api.get('/state-jury/me'),
        api.get('/state-jury/finalists'),
        api.get('/state-jury/rubric')
      ]);
      setJuryProfile(profRes.data.data);
      setFinalists(finRes.data.data || []);
      setRubric(rubRes.data.data);
    } catch (err) {
      console.error('Failed to load state jury data:', err);
      addToast('Failed to load state finalists.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStateJuryData();
  }, []);

  const openEvaluationModal = (finalist) => {
    if (finalist.conflict_status === 'conflict_declared') {
      addToast('Conflict of interest declared for this finalist. Access blocked.', 'error');
      return;
    }

    setActiveFinalist(finalist);
    const existing = finalist.state_evaluation;
    if (existing) {
      setScores(existing.scores || {});
      setRecommendedRank(existing.recommended_rank || 1);
      setAwardNomination(existing.award_nomination || 'State Gold Innovator');
      setStrengths(existing.strengths || '');
      setImprovements(existing.areas_for_improvement || '');
      setComments(existing.comments || '');
    } else {
      const initScores = {};
      const criteriaList = rubric?.criteria || [
        { key: 'transformative_impact', max: 25 },
        { key: 'innovation_breakthrough', max: 25 },
        { key: 'execution_excellence', max: 20 },
        { key: 'defense_articulation', max: 15 },
        { key: 'state_scalability', max: 15 }
      ];
      criteriaList.forEach(c => {
        initScores[c.key] = Math.round(c.max * 0.8);
      });
      setScores(initScores);
      setRecommendedRank(1);
      setAwardNomination('State Gold Innovator');
      setStrengths('');
      setImprovements('');
      setComments('');
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
    if (!activeFinalist) return;
    setSubmittingEval(true);
    try {
      const payload = {
        team_id: activeFinalist._id,
        is_draft: isDraft,
        scores: scores,
        recommended_rank: recommendedRank,
        award_nomination: awardNomination,
        strengths: strengths,
        areas_for_improvement: improvements,
        comments: comments
      };

      const res = await api.post('/state-jury/evaluate', payload);
      addToast(res.data.message || 'State jury evaluation submitted successfully!', 'success');
      setActiveFinalist(null);
      fetchStateJuryData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to submit state evaluation.';
      addToast(msg, 'error');
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleConfirmConflict = async (decision) => {
    if (!conflictTeam) return;
    setSubmittingConflict(true);
    try {
      const res = await api.post(`/state-jury/finalists/${conflictTeam._id}/conflict`, {
        decision: decision,
        reason: conflictReason
      });
      addToast(res.data.message || 'Conflict status updated.', 'success');
      setConflictModalOpen(false);
      fetchStateJuryData();
      if (decision === 'no_conflict') {
        openEvaluationModal(conflictTeam);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to update conflict.';
      addToast(msg, 'error');
    } finally {
      setSubmittingConflict(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Loading State Grand Jury Portal…</span>
        </div>
      </div>
    );
  }

  const stats = juryProfile?.stats || {
    finalists: finalists.length,
    evaluated: finalists.filter(f => f.state_evaluation && f.state_evaluation.status === 'submitted').length,
    pending: finalists.filter(f => !f.state_evaluation || f.state_evaluation.status === 'draft').length
  };

  const criteriaList = rubric?.criteria || [
    { key: 'transformative_impact', label: 'Transformative State & Social Impact', max: 25, desc: 'Potential to transform Assam agriculture, flood mitigation, tea industry, or public health.' },
    { key: 'innovation_breakthrough', label: 'Breakthrough Innovation & IP Potential', max: 25, desc: 'Original technological novelty, patentability, unique hardware/software architecture.' },
    { key: 'execution_excellence', label: 'Prototype Maturity & Execution Rigor', max: 20, desc: 'Functional robustness, real-world stress test performance, clean build.' },
    { key: 'defense_articulation', label: 'Grand Jury Defense & Q&A Mastery', max: 15, desc: 'Command over technology, handling rigorous technical cross-examination.' },
    { key: 'state_scalability', label: 'Commercialization & State Deployment Road', max: 15, desc: 'Viable deployment roadmap across all 35 Assam districts.' }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Grand Jury Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/20 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> State Grand Jury & Awards Council
                </span>
                <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-mono">
                  {juryProfile?.user_id || 'AFIP-STJ-000001'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {juryProfile?.name || user?.name || 'Grand Jury Member'}
              </h1>
              <p className="text-slate-300 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span>Final State Championship Assessment & Government Awards Selection</span>
                <span className="text-amber-400">•</span>
                <span>Assam Future Innovation Program</span>
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-black text-amber-300">{stats.finalists}</div>
                <div className="text-xs text-slate-300 font-medium">State Finalists</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-black text-cyan-300">{stats.pending}</div>
                <div className="text-xs text-slate-300 font-medium">Pending</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                <div className="text-2xl font-black text-emerald-300">{stats.evaluated}</div>
                <div className="text-xs text-slate-300 font-medium">Evaluated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Finalist Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" /> State Qualified Finalists
            </h2>
            <span className="text-xs text-slate-500">Exclusively qualified teams eligible for State Grand Jury</span>
          </div>

          {finalists.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Finalists Queued Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Teams will appear here once qualified through the Zonal Jury and Hackathon rounds.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalists.map(team => {
                const project = team.project;
                const school = team.school;
                const isEvaluated = team.state_evaluation && team.state_evaluation.status === 'submitted';
                const isConflict = team.conflict_status === 'conflict_declared';

                return (
                  <div
                    key={team._id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                      isConflict
                        ? 'border-rose-200 bg-rose-50/20'
                        : isEvaluated
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-mono">
                          {team.team_custom_id || team.team_code}
                        </span>
                        {isEvaluated ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Score: {team.state_evaluation?.total_score}/100
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Ready for Review
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{team.team_name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        <strong>Project:</strong> {project?.title || 'Innovation Prototype'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{school?.school_name || team.school_name}</span>
                        <span>•</span>
                        <span>{school?.district || team.district}</span>
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400">Technical Score:</span>
                          <span className="font-bold text-slate-700 ml-1">{team.evaluation_score || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Quiz Marks:</span>
                          <span className="font-bold text-slate-700 ml-1">{team.quiz_score || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setConflictTeam(team);
                          setConflictReason('');
                          setConflictModalOpen(true);
                        }}
                        className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3 h-3" /> Check Conflict
                      </button>

                      <button
                        type="button"
                        onClick={() => openEvaluationModal(team)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isEvaluated
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-amber-700 hover:bg-amber-600 text-white shadow-xs'
                        }`}
                      >
                        {isEvaluated ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-500" /> View Evaluation
                          </>
                        ) : (
                          <>
                            <Star className="w-3.5 h-3.5" /> Grand Jury Review
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

      {/* Conflict Modal */}
      <AnimatePresence>
        {conflictModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">Conflict of Interest</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm your relationship with finalist team <strong>{conflictTeam?.team_name}</strong>.
              </p>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason (if declaring conflict):</label>
                  <textarea
                    rows={2}
                    placeholder="Provide conflict explanation..."
                    value={conflictReason}
                    onChange={(e) => setConflictReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={submittingConflict}
                    onClick={() => handleConfirmConflict('no_conflict')}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> No Conflict
                  </button>
                  <button
                    type="button"
                    disabled={submittingConflict || !conflictReason.trim()}
                    onClick={() => handleConfirmConflict('conflict_declared')}
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

      {/* State Grand Jury Scoring Modal */}
      <AnimatePresence>
        {activeFinalist && (
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
                    <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {activeFinalist.team_custom_id || activeFinalist.team_code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Class {activeFinalist.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{activeFinalist.team_name}</h3>
                  <p className="text-xs text-slate-500">{activeFinalist.project?.title} • {activeFinalist.school?.school_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFinalist(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeFinalist.state_evaluation?.status === 'submitted' && !activeFinalist.state_evaluation?.is_unlocked && (
                <div className="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Locked Grand Jury Evaluation:</strong> This score is submitted. Contact Administrator to request reopening.</span>
                </div>
              )}

              {/* Rubric Criteria Grid */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>{rubric?.title || 'State Grand Jury Rubric (Max 100)'}</span>
                    <span className="text-amber-700 font-mono text-sm font-black">
                      Score: {calculatedTotal.toFixed(1)} / 100
                    </span>
                  </h4>

                  <div className="space-y-3">
                    {criteriaList.map(c => {
                      const val = scores[c.key] ?? Math.round(c.max * 0.8);
                      const isLocked = activeFinalist.state_evaluation?.status === 'submitted' && !activeFinalist.state_evaluation?.is_unlocked;

                      return (
                        <div key={c.key} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="font-bold text-slate-900">{c.label}</span>
                              <span className="text-[11px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
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
                              className="w-20 px-3 py-1.5 text-center font-bold text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                            />
                            <span className="text-xs text-slate-400 font-medium">/ {c.max}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rank & Award Nomination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                  <div>
                    <label className="block font-bold text-amber-950 mb-1">Recommended State Rank</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={recommendedRank}
                      onChange={(e) => setRecommendedRank(parseInt(e.target.value) || 1)}
                      disabled={activeFinalist.state_evaluation?.status === 'submitted' && !activeFinalist.state_evaluation?.is_unlocked}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs disabled:bg-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-950 mb-1">Award Category Nomination</label>
                    <select
                      value={awardNomination}
                      onChange={(e) => setAwardNomination(e.target.value)}
                      disabled={activeFinalist.state_evaluation?.status === 'submitted' && !activeFinalist.state_evaluation?.is_unlocked}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs disabled:bg-slate-100"
                    >
                      <option value="State Gold Innovator (Rank 1)">State Gold Innovator (Rank 1)</option>
                      <option value="State Silver Innovator (Rank 2)">State Silver Innovator (Rank 2)</option>
                      <option value="State Bronze Innovator (Rank 3)">State Bronze Innovator (Rank 3)</option>
                      <option value="Best Rural Impact Innovation">Best Rural Impact Innovation</option>
                      <option value="Best Flood & Climate Resilience Tech">Best Flood & Climate Resilience Tech</option>
                      <option value="Best Tea Garden Automation Solution">Best Tea Garden Automation Solution</option>
                      <option value="Top 30 Assam State Winner">Top 30 Assam State Winner</option>
                    </select>
                  </div>
                </div>

                {/* Qualitative Remarks */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Grand Jury Commendations & Citations</label>
                    <textarea
                      rows={2}
                      placeholder="Official citation for state award..."
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      disabled={activeFinalist.state_evaluation?.status === 'submitted' && !activeFinalist.state_evaluation?.is_unlocked}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Government & Deployment Recommendations</label>
                    <textarea
                      rows={2}
                      placeholder="Suggestions for district administration / incubation support..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      disabled={activeFinalist.state_evaluation?.status === 'submitted' && !activeFinalist.state_evaluation?.is_unlocked}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveFinalist(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:text-slate-800"
                  >
                    Close
                  </button>

                  {(!activeFinalist.state_evaluation || activeFinalist.state_evaluation.status !== 'submitted' || activeFinalist.state_evaluation.is_unlocked) && (
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
                        className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {submittingEval && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Send className="w-4 h-4" /> Submit & Lock Evaluation
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

export default StateJuryDashboard;
