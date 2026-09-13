import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  ShieldCheck, School, Users, UserCheck, Trophy, Settings, FileText,
  Activity, Search, Filter, CheckCircle2, XCircle, AlertCircle, Loader2,
  Clock, Plus, ToggleLeft, ToggleRight, Sparkles, MapPin, Building, Eye, X, Award,
  Lock, Unlock, ShieldAlert, Sliders, ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Schools list state
  const [schools, setSchools] = useState([]);
  const [schoolStatusFilter, setSchoolStatusFilter] = useState('all');
  const [schoolSearch, setSchoolSearch] = useState('');

  // School Detail Modal
  const [viewSchoolModalOpen, setViewSchoolModalOpen] = useState(false);
  const [viewingSchool, setViewingSchool] = useState(null);

  // Rejection Modal with Mandatory Reason
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingSchool, setRejectingSchool] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Evaluators list state
  const [evaluators, setEvaluators] = useState([]);

  // Projects list state
  const [projects, setProjects] = useState([]);

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEvaluator, setSelectedEvaluator] = useState('');
  const [assignRole, setAssignRole] = useState('evaluator');
  const [assigning, setAssigning] = useState(false);

  // Milestone 3: Evaluations & Shortlisting State
  const [evaluationsList, setEvaluationsList] = useState([]);
  const [evaluationAssignments, setEvaluationAssignments] = useState([]);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenTarget, setReopenTarget] = useState(null);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenSubmitting, setReopenSubmitting] = useState(false);

  // Shortlisting Config
  const [shortlistStage, setShortlistStage] = useState('DISTRICT_SHORTLIST');
  const [quizWeight, setQuizWeight] = useState(70);
  const [evalWeight, setEvalWeight] = useState(30);
  const [shortlistQuota, setShortlistQuota] = useState(70);
  const [shortlistPreview, setShortlistPreview] = useState([]);
  const [calculatingShortlist, setCalculatingShortlist] = useState(false);
  const [publishingShortlist, setPublishingShortlist] = useState(false);
  const [publishingWinners, setPublishingWinners] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchSchools = async () => {
    try {
      let url = `/admin/schools?status=${schoolStatusFilter}&search=${schoolSearch}`;
      const res = await api.get(url);
      setSchools(res.data.data || []);
    } catch (err) {
      console.error('Failed to load schools', err);
    }
  };

  const fetchEvaluators = async () => {
    try {
      const res = await api.get('/admin/evaluators');
      setEvaluators(res.data.data || []);
    } catch (err) {
      console.error('Failed to load evaluators', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/admin/projects');
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchEvaluationsData = async () => {
    try {
      const [evalRes, assignRes] = await Promise.allSettled([
        api.get('/admin/evaluations'),
        api.get('/admin/evaluations/assignments')
      ]);
      if (evalRes.status === 'fulfilled') {
        setEvaluationsList(evalRes.value.data.data || []);
      }
      if (assignRes.status === 'fulfilled') {
        setEvaluationAssignments(assignRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load evaluations', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setAuditLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    }
  };

  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchSchools(),
      fetchEvaluators(),
      fetchProjects(),
      fetchEvaluationsData(),
      fetchAuditLogs()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [schoolStatusFilter, schoolSearch]);

  const handleApproveSchool = async (schoolId) => {
    try {
      const res = await api.post(`/admin/schools/${schoolId}/approve`);
      addToast(res.data.message || 'School approved successfully', 'success');
      fetchSchools();
      fetchStats();
      if (viewingSchool && (viewingSchool.id === schoolId || viewingSchool._id === schoolId)) {
        setViewSchoolModalOpen(false);
        setViewingSchool(null);
      }
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Approval failed', 'error');
    }
  };

  const handleOpenRejectModal = (school) => {
    setRejectingSchool(school);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleSubmitRejectSchool = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      addToast('A rejection reason is strictly mandatory.', 'error');
      return;
    }
    setRejectSubmitting(true);
    try {
      const schoolId = rejectingSchool.id || rejectingSchool._id;
      const res = await api.post(`/admin/schools/${schoolId}/reject`, {
        rejection_reason: rejectionReason.trim()
      });
      addToast(res.data.message || 'School application rejected', 'info');
      setRejectModalOpen(false);
      setRejectingSchool(null);
      setRejectionReason('');
      fetchSchools();
      fetchStats();
      if (viewingSchool && (viewingSchool.id === schoolId || viewingSchool._id === schoolId)) {
        setViewSchoolModalOpen(false);
        setViewingSchool(null);
      }
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Rejection failed', 'error');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleOpenViewSchoolModal = (school) => {
    setViewingSchool(school);
    setViewSchoolModalOpen(true);
  };

  const handleUpdateSchoolStatus = async (schoolId, newStatus) => {
    try {
      const res = await api.patch(`/admin/schools/${schoolId}/status`, { status: newStatus });
      addToast(res.data.message || `School status set to ${newStatus}`, 'success');
      fetchSchools();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Update failed', 'error');
    }
  };

  const handleUpdateUdiseStatus = async (schoolId, newStatus) => {
    try {
      const res = await api.patch(`/admin/schools/${schoolId}/udise-status`, { udise_verification_status: newStatus });
      addToast(res.data.message || `UDISE status updated to ${newStatus}`, 'success');
      fetchSchools();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'UDISE update failed', 'error');
    }
  };

  const handleUpdateEvaluatorStatus = async (evalId, newStatus) => {
    try {
      const res = await api.patch(`/admin/evaluators/${evalId}/status`, { status: newStatus });
      addToast(res.data.message || `Evaluator set to ${newStatus}`, 'success');
      fetchEvaluators();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Update failed', 'error');
    }
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedEvaluator) return;
    setAssigning(true);
    try {
      await api.post('/admin/evaluations/assignments', {
        project_id: selectedProject,
        user_id: selectedEvaluator,
        role: assignRole
      });
      addToast(`Project assigned to ${assignRole} successfully!`, 'success');
      setAssignModalOpen(false);
      reloadAll();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Assignment failed', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenReopenModal = (ev) => {
    setReopenTarget(ev);
    setReopenReason('');
    setReopenModalOpen(true);
  };

  const handleSubmitReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      addToast('A reason for reopening the evaluation score is mandatory for audit compliance.', 'error');
      return;
    }
    setReopenSubmitting(true);
    try {
      await api.post(`/admin/evaluations/${reopenTarget.id}/reopen`, {
        reason: reopenReason.trim()
      });
      addToast('Evaluation unlocked and score reopened. Auditor record created.', 'success');
      setReopenModalOpen(false);
      setReopenTarget(null);
      setReopenReason('');
      fetchEvaluationsData();
      fetchAuditLogs();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to reopen score', 'error');
    } finally {
      setReopenSubmitting(false);
    }
  };

  const handleLockScore = async (evaluationId) => {
    try {
      await api.post(`/admin/evaluations/${evaluationId}/lock`);
      addToast('Evaluation score locked successfully.', 'success');
      fetchEvaluationsData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to lock score', 'error');
    }
  };

  const handleGenerateShortlist = async () => {
    setCalculatingShortlist(true);
    try {
      const res = await api.post('/admin/shortlists/generate', {
        stage: shortlistStage,
        quiz_weight: parseFloat(quizWeight) / 100,
        eval_weight: parseFloat(evalWeight) / 100,
        quota: parseInt(shortlistQuota, 10)
      });
      setShortlistPreview(res.data.data?.shortlisted || []);
      addToast(`Generated shortlist preview: ${res.data.data?.total_shortlisted || 0} teams eligible.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to generate shortlist', 'error');
    } finally {
      setCalculatingShortlist(false);
    }
  };

  const handlePublishShortlist = async () => {
    if (shortlistPreview.length === 0) {
      addToast('Generate a shortlist calculation first before publishing.', 'warning');
      return;
    }
    setPublishingShortlist(true);
    try {
      const teamIds = shortlistPreview.map(t => t.team_id || t.id);
      await api.post('/admin/shortlists/publish', {
        stage: shortlistStage,
        team_ids: teamIds
      });
      addToast(`Published shortlist of ${teamIds.length} teams to stage ${shortlistStage}!`, 'success');
      fetchStats();
      fetchProjects();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to publish shortlist', 'error');
    } finally {
      setPublishingShortlist(false);
    }
  };

  const handlePublishWinners = async () => {
    if (!window.confirm('Are you sure you want to publish and lock the final State Innovation Winners? This will freeze state rankings.')) {
      return;
    }
    setPublishingWinners(true);
    try {
      await api.post('/admin/winners/publish', {
        stage: 'STATE_FINAL'
      });
      addToast('State Innovation Program Winners published & locked permanently!', 'success');
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to publish winners', 'error');
    } finally {
      setPublishingWinners(false);
    }
  };

  const handleUpdateStage = async (newStage) => {
    try {
      await api.post('/admin/stage', { stage: newStage });
      addToast(`Active competition stage updated to '${newStage}'`, 'success');
      fetchStats();
    } catch (err) {
      addToast('Failed to update stage', 'error');
    }
  };

  const handleToggleLeaderboard = async () => {
    const current = stats?.leaderboard_public ?? true;
    try {
      await api.patch('/admin/leaderboard-visibility', { is_public: !current });
      addToast(`Leaderboard is now ${!current ? 'PUBLIC' : 'HIDDEN'}`, 'info');
      fetchStats();
    } catch (err) {
      addToast('Failed to toggle leaderboard visibility', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Admin Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                State Directorate
              </span>
              <span className="text-xs text-slate-300">Central Control Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Assam Future Innovation Program Administration
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Live district monitoring, approvals, jury allocation, weighted shortlisting, and competition phase governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAssignModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Project to Jury / Evaluator</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-slate-200 mb-8 scrollbar-none">
          {[
            { id: 'overview', label: 'Program Overview', icon: Activity },
            { id: 'schools', label: `Schools (${stats?.pending_schools ? `${stats.pending_schools} Pending` : stats?.total_schools || 0})`, icon: School },
            { id: 'evaluations', label: `Evaluations & Shortlist (${evaluationsList.length})`, icon: Trophy },
            { id: 'evaluators', label: `Evaluators (${evaluators.length})`, icon: UserCheck },
            { id: 'projects', label: `Submissions (${projects.length})`, icon: FileText },
            { id: 'settings', label: 'Stages & Governance', icon: Settings },
            { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold">Total Registered Schools</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats?.total_schools || 0}</div>
                <div className="text-xs text-amber-700 font-medium mt-1">{stats?.pending_schools || 0} awaiting approval</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold">Active Student Teams</span>
                <div className="text-3xl font-black text-emerald-800 mt-1">{stats?.total_teams || 0}</div>
                <div className="text-xs text-slate-400 mt-1">Across 35 Assam districts</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold">Total Evaluations</span>
                <div className="text-3xl font-black text-blue-900 mt-1">{evaluationsList.length || stats?.completed_evaluations || 0}</div>
                <div className="text-xs text-blue-700 font-medium mt-1">Multi-tier jury scoring</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold">State Finalists</span>
                <div className="text-3xl font-black text-amber-600 mt-1">{stats?.state_finalists || 0}</div>
                <div className="text-xs text-slate-400 mt-1">Qualified for state jury</div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold">State Competition Control</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Current Active Stage: <span className="font-bold underline uppercase">{stats?.current_stage?.replace(/_/g, ' ') || 'Registration'}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('evaluations')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Manage Shortlists &amp; Jury
                </button>
                <button
                  onClick={() => setActiveTab('schools')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all"
                >
                  Review Pending Schools
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHOOLS */}
        {activeTab === 'schools' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Registered Educational Institutions</h2>
                <p className="text-xs text-slate-500">Review applications and issue verified Assam School Identification Codes.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by school, UDISE or district..."
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-700 w-56"
                />
                <select
                  value={schoolStatusFilter}
                  onChange={(e) => setSchoolStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {schools.map((sch) => {
                const uStatus = sch.udise_verification_status || 'format_valid';
                return (
                  <div
                    key={sch.id || sch._id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-[#faf8f5] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{sch.school_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sch.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          sch.status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sch.status}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          uStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : uStatus === 'format_valid'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {uStatus === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>UDISE: {uStatus === 'verified' ? '✓ Verified' : uStatus.toUpperCase()}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>UDISE: <strong className="font-mono text-emerald-900">{sch.udise_school_id || 'Not recorded'}</strong></span>
                        <span>•</span>
                        <span>Code: <strong className="font-mono text-emerald-800">{sch.school_code || 'Unassigned'}</strong></span>
                        <span>•</span>
                        <span>District: <strong>{sch.district}</strong></span>
                        <span>•</span>
                        <span>Type: {sch.school_type}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenViewSchoolModal(sch)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>View</span>
                      </button>

                      {uStatus !== 'verified' && (
                        <button
                          onClick={() => handleUpdateUdiseStatus(sch.id || sch._id, 'verified')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verify UDISE</span>
                        </button>
                      )}

                      {sch.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveSchool(sch.id || sch._id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(sch)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: EVALUATIONS & SHORTLISTING */}
        {activeTab === 'evaluations' && (
          <div className="space-y-8">
            {/* Top Engine Card: Automated Shortlisting & Weightage Engine */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Sliders className="w-3 h-3" /> State Weightage Engine
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">Multi-Tier Composite Shortlisting</h2>
                  <p className="text-xs text-slate-500">
                    Calculate composite qualifying scores combining MCQ / Technical evaluations with dynamic stage quotas.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleGenerateShortlist}
                    disabled={calculatingShortlist}
                    className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {calculatingShortlist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
                    <span>Calculate Shortlist</span>
                  </button>

                  <button
                    onClick={handlePublishShortlist}
                    disabled={publishingShortlist || shortlistPreview.length === 0}
                    className="px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {publishingShortlist ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Publish Shortlist ({shortlistPreview.length})</span>
                  </button>

                  <button
                    onClick={handlePublishWinners}
                    disabled={publishingWinners}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Publish &amp; Lock State Winners</span>
                  </button>
                </div>
              </div>

              {/* Weightage Sliders & Config */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Competition Stage</label>
                  <select
                    value={shortlistStage}
                    onChange={(e) => setShortlistStage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="DISTRICT_SHORTLIST">District Top 70 (~70/District)</option>
                    <option value="ZONAL_HACKATHON">Zonal Hackathon Qualifiers (198 Teams)</option>
                    <option value="STATE_FINALIST">State Finalists (Top 20 Teams)</option>
                    <option value="STATE_WINNER">State Innovation Winners (Top 30)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MCQ / Coding Weight ({quizWeight}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={quizWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setQuizWeight(val);
                      setEvalWeight(100 - val);
                    }}
                    className="w-full accent-emerald-700 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jury / Eval Weight ({evalWeight}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evalWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setEvalWeight(val);
                      setQuizWeight(100 - val);
                    }}
                    className="w-full accent-blue-700 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District / Stage Quota</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={shortlistQuota}
                    onChange={(e) => setShortlistQuota(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Shortlist Preview Table */}
              {shortlistPreview.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Calculated Ranking Preview ({shortlistPreview.length} Qualifiers)</span>
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#faf8f5] text-slate-600 font-bold uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Team</th>
                          <th className="py-2.5 px-3">School / District</th>
                          <th className="py-2.5 px-3">Quiz Score</th>
                          <th className="py-2.5 px-3">Jury Score</th>
                          <th className="py-2.5 px-3">Composite Score</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {shortlistPreview.map((item, idx) => (
                          <tr key={item.team_id || idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">#{item.rank || idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900">{item.team_name}</span>
                              <span className="block font-mono text-[10px] text-slate-400">{item.team_code}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{item.school_name} ({item.district})</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{item.quiz_score ?? 'N/A'}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{item.eval_score ?? 'N/A'}</td>
                            <td className="py-2.5 px-3 font-black text-emerald-800 text-sm">{item.composite_score?.toFixed(2) ?? 'N/A'}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {item.status || 'QUALIFIED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Live Evaluations Grid with Score Reopening */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submitted &amp; Draft Evaluations</h2>
                  <p className="text-xs text-slate-500">Official scoring records across Technical Evaluators, Zonal Jury, and State Jury.</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total Records: <strong>{evaluationsList.length}</strong>
                </span>
              </div>

              {evaluationsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No evaluation records submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf8f5] text-slate-600 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Evaluation ID</th>
                        <th className="py-3 px-4">Team / Project</th>
                        <th className="py-3 px-4">Rubric Tier</th>
                        <th className="py-3 px-4">Evaluator / Jury</th>
                        <th className="py-3 px-4">Total Marks</th>
                        <th className="py-3 px-4">Status &amp; Lock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {evaluationsList.map((ev) => {
                        const isLocked = ev.status === 'submitted' || ev.is_locked;
                        const isUnlocked = ev.is_unlocked;
                        return (
                          <tr key={ev.id || ev._id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{ev.evaluation_id || ev.id}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900">{ev.project?.title || 'Project Submission'}</span>
                              <span className="block font-mono text-[10px] text-slate-500">{ev.team?.team_code || ev.team_id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ev.rubric_type === 'STATE_JURY'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : ev.rubric_type === 'JURY'
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}>
                                {ev.rubric_type || 'TECHNICAL'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-semibold">{ev.evaluator_name || ev.evaluator_id || 'State Reviewer'}</td>
                            <td className="py-3 px-4 font-black text-slate-900 text-sm">
                              {ev.total_score || ev.scores?.total || 0} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                            </td>
                            <td className="py-3 px-4">
                              {isUnlocked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                                  <Unlock className="w-3 h-3" /> Reopened
                                </span>
                              ) : isLocked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3" /> Draft
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isLocked && !isUnlocked ? (
                                <button
                                  onClick={() => handleOpenReopenModal(ev)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ml-auto"
                                >
                                  <Unlock className="w-3 h-3 text-amber-700" />
                                  <span>Reopen Score</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleLockScore(ev.id || ev._id)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ml-auto"
                                >
                                  <Lock className="w-3 h-3 text-slate-600" />
                                  <span>Lock Score</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assignments & Conflict of Interest Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Review Allocations &amp; Conflict Declarations</h2>
                  <p className="text-xs text-slate-500">Track evaluator and jury assignments and inspect any flagged conflict of interest alerts.</p>
                </div>
              </div>

              <div className="space-y-3">
                {evaluationAssignments.map((asgn) => {
                  const hasConflict = asgn.conflict_declared || asgn.status === 'conflict_declared';
                  return (
                    <div
                      key={asgn.id || asgn._id}
                      className="p-4 rounded-2xl bg-[#faf8f5] border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{asgn.project?.title || asgn.project_title || 'Assigned Project'}</span>
                          <span className="font-mono text-[10px] text-slate-500">[{asgn.team?.team_code || asgn.team_id}]</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                            {asgn.role?.toUpperCase() || 'EVALUATOR'}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          Assigned to: <strong>{asgn.user_name || asgn.evaluator_name || asgn.user_id}</strong> • School: {asgn.school?.school_name || asgn.school_name} ({asgn.school?.district || asgn.district})
                        </div>
                        {hasConflict && (
                          <div className="text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-xl text-[11px] font-semibold mt-1">
                            <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-rose-600" />
                            <strong>Conflict Declared:</strong> {asgn.conflict_reason || 'Personal / Institutional affiliation with school.'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          hasConflict
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : asgn.status === 'completed' || asgn.status === 'locked'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {hasConflict ? 'RECUSED (CONFLICT)' : (asgn.status || 'ASSIGNED').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVALUATORS */}
        {activeTab === 'evaluators' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Expert Evaluation Panel</h2>
            <div className="divide-y divide-slate-100">
              {evaluators.map((ev) => (
                <div key={ev.id || ev._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{ev.full_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ev.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ev.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {ev.organization} • {ev.designation} • Expertise: <strong>{ev.domain_expertise}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ev.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateEvaluatorStatus(ev.id || ev._id, 'approved')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-800 text-white text-xs font-bold cursor-pointer"
                      >
                        Approve Evaluator
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">All Submitted Student Innovations</h2>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id || p._id} className="p-4 rounded-2xl bg-[#faf8f5] border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                    <div className="text-slate-500 mt-0.5">
                      Team: <strong>{p.team?.team_name}</strong> • School: <strong>{p.school?.school_name}</strong> ({p.school?.district})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      {p.theme}
                    </span>
                    <span className="text-slate-500">{p.evaluation_count} Evaluations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & COMPETITION STAGE */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Competition Phase Governance</h2>
              <p className="text-xs text-slate-500">Manage the active state stage displayed across all student and school dashboards.</p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'school_registration', label: '1. School Registration' },
                  { id: 'mentor_onboarding', label: '2. Mentor Onboarding' },
                  { id: 'team_formation', label: '3. Team Formation' },
                  { id: 'online_bootcamp', label: '4. 20h Online Bootcamp' },
                  { id: 'mcq_assessment', label: '5. MCQ Assessment' },
                  { id: 'top_1000', label: '6. Top 1,000 Shortlist' },
                  { id: 'advanced_bootcamp', label: '7. Advanced Bootcamp' },
                  { id: 'coding_challenge', label: '8. Coding Challenge' },
                  { id: 'shortlist_198', label: '9. 198 Teams Shortlist' },
                  { id: 'zonal_hackathon', label: '10. Zonal 48h Hackathon' },
                  { id: 'finalist_preparation', label: '11. Finalist Prep' },
                  { id: 'state_final', label: '12. State Final' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleUpdateStage(st.id)}
                    className={`p-3 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                      stats?.current_stage === st.id
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-[#faf8f5] text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Visibility */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Public Leaderboard Visibility</h3>
                <p className="text-xs text-slate-500">When disabled, public ranks are masked with an official review notice.</p>
              </div>

              <button
                onClick={handleToggleLeaderboard}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  stats?.leaderboard_public
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {stats?.leaderboard_public ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                <span>{stats?.leaderboard_public ? 'LEADERBOARD IS PUBLIC' : 'LEADERBOARD IS HIDDEN'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">System Audit Trail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8f5] text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Resource</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id || log._id}>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">{log.action}</td>
                      <td className="py-2.5 px-4 text-slate-600 uppercase font-semibold">{log.actor_role}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{log.resource_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Assign Project to Evaluator or Jury */}
        {assignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Assign Project to Reviewer</h3>
                <button onClick={() => setAssignModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reviewer Role</label>
                  <select
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 font-bold text-slate-800"
                  >
                    <option value="evaluator">Technical Evaluator (District)</option>
                    <option value="jury">Zonal / Category Jury</option>
                    <option value="state_jury">State Grand Jury (Finals)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Project</label>
                  <select
                    required
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200"
                  >
                    <option value="">-- Choose Project Proposal --</option>
                    {projects.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.title} ({p.theme})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Reviewer</label>
                  <select
                    required
                    value={selectedEvaluator}
                    onChange={(e) => setSelectedEvaluator(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200"
                  >
                    <option value="">-- Choose Reviewer Account --</option>
                    {evaluators.filter(e => e.status === 'approved').map((ev) => (
                      <option key={ev.user_id || ev.id || ev._id} value={ev.user_id || ev.id || ev._id}>
                        {ev.full_name} ({ev.domain_expertise || 'General STEM'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-60 mt-2"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Mandatory Reopen Score Reason */}
        {reopenModalOpen && reopenTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-lg w-full p-6 sm:p-8">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Unlock className="w-5 h-5 text-amber-600" />
                  <span>Reopen &amp; Unlock Evaluation Score</span>
                </div>
                <button onClick={() => setReopenModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReopen} className="mt-4 space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500">Target Evaluation:</span>
                  <div className="font-bold text-slate-900">{reopenTarget.project?.title || 'Student Project'}</div>
                  <div className="font-mono text-slate-500 text-[11px]">Evaluation ID: {reopenTarget.id} • Current Score: {reopenTarget.total_score || reopenTarget.scores?.total || 0}/100</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Administrative Reason for Reopening (Strictly Mandatory) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific administrative/grievance justification (e.g. video demo format corruption during evaluation, jury clerical score revision request, state committee appeal)..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 border border-amber-300 focus:bg-white focus:outline-amber-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    An immutable audit log will be registered with your admin credentials and this justification.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReopenModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reopenSubmitting || !reopenReason.trim()}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {reopenSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reopening...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Confirm Unlock &amp; Reopen</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View School Details */}
        {viewSchoolModalOpen && viewingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Institutional Record
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{viewingSchool.school_name}</h3>
                </div>
                <button onClick={() => setViewSchoolModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium">UDISE School Code:</span>
                    <div className="font-mono font-bold text-sm text-emerald-900 mt-0.5">{viewingSchool.udise_school_id}</div>
                    <div className="text-[10px] text-emerald-700 mt-1">Status: {viewingSchool.udise_verification_status || 'format_valid'}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium">Assigned School Code:</span>
                    <div className="font-mono font-bold text-sm text-slate-900 mt-0.5">{viewingSchool.school_code || 'Pending Admin Approval'}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Status: {viewingSchool.status?.toUpperCase()}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">District &amp; Block:</span>
                    <div className="font-semibold text-slate-900">{viewingSchool.district} • {viewingSchool.block || 'Central Block'}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Institution Type &amp; Board:</span>
                    <div className="font-semibold text-slate-900">{viewingSchool.school_type} • {viewingSchool.board || 'SEBA'}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Address:</span>
                    <div className="font-semibold text-slate-900">{viewingSchool.address_line_1 || viewingSchool.address}, {viewingSchool.address_line_2} (PIN: {viewingSchool.pin_code})</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Official Contact:</span>
                    <div className="font-semibold text-slate-900">{viewingSchool.official_email} • {viewingSchool.official_phone}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Principal / Head:</span>
                    <div className="font-semibold text-slate-900">{viewingSchool.principal?.name} ({viewingSchool.principal?.email || viewingSchool.principal?.phone})</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Innovation Coordinator / Mentor:</span>
                    <div className="font-semibold text-slate-900">{viewingSchool.coordinator?.name} ({viewingSchool.coordinator?.email || viewingSchool.coordinator?.phone})</div>
                  </div>
                </div>

                {viewingSchool.rejection_reason && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <strong>Recorded Rejection Reason:</strong> {viewingSchool.rejection_reason}
                  </div>
                )}
              </div>

              {/* Action buttons inside View Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setViewSchoolModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
                {viewingSchool.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleOpenRejectModal(viewingSchool)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveSchool(viewingSchool.id || viewingSchool._id)}
                      className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow transition-all cursor-pointer"
                    >
                      Approve &amp; Issue Code
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Mandatory Rejection Reason */}
        {rejectModalOpen && rejectingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-lg w-full p-6 sm:p-8">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>Reject School Application</span>
                </div>
                <button onClick={() => setRejectModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRejectSchool} className="mt-4 space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500">Target School:</span>
                  <div className="font-bold text-slate-900">{rejectingSchool.school_name}</div>
                  <div className="font-mono text-slate-500 text-[11px]">UDISE: {rejectingSchool.udise_school_id} • {rejectingSchool.district}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Rejection Reason (Strictly Mandatory) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific institutional reasons (e.g. invalid UDISE jurisdiction, incomplete principal authorization, non-Assam address mismatch)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 border border-rose-200 focus:bg-white focus:outline-rose-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    This official reason will be stored in the institutional record and communicated securely to the school.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rejectSubmitting || !rejectionReason.trim()}
                    className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {rejectSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Confirm Rejection</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
