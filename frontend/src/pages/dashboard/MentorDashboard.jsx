import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  Compass, Users, FileText, CheckCircle2, Clock, Sparkles, MessageSquare,
  Award, School, Calendar, ChevronRight, X, Loader2, Star, ShieldCheck,
  Send, ExternalLink, ArrowRight, Bell, AlertCircle
} from 'lucide-react';

const COMPETITION_STAGES = [
  { id: 'registration', step: '01', name: 'School Registration', date: '17th - 30th Sep', status: 'completed' },
  { id: 'orientation', step: '02', name: 'Team Orientation', date: '1st - 10th Oct', status: 'completed' },
  { id: 'foundation_learning', step: '03', name: 'Foundation Learning', date: '10th - 22nd Oct', status: 'completed' },
  { id: 'mcq_assessment', step: '04', name: 'MCQ Assessment', date: '23rd - 30th Oct', status: 'completed' },
  { id: 'district_shortlisting', step: '05', name: 'District Shortlisting', date: '1st - 7th Nov', status: 'active' },
  { id: 'advanced_learning', step: '06', name: 'Advanced Learning', date: '9th Nov - 6th Dec', status: 'locked' },
  { id: 'coding_challenge', step: '07A', name: 'Coding Challenge', date: '14th - 19th Dec', status: 'locked' },
  { id: 'jury_round', step: '07B', name: 'Jury Round', date: '21st - 26th Dec', status: 'locked' },
  { id: 'hackathon', step: '08', name: '72-Hour Hackathon', date: '4th - 8th Jan', status: 'locked' },
  { id: 'winners', step: '09', name: 'State Winners', date: 'Final Outcome', status: 'locked' },
];

const MentorDashboard = () => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('teams');
  const [mentorData, setMentorData] = useState(null);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    comments: '',
    areas_of_guidance: '',
    milestone_rating: 5
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Team detail modal
  const [viewTeamModalOpen, setViewTeamModalOpen] = useState(false);
  const [teamDetail, setTeamDetail] = useState(null);
  const [loadingTeamDetail, setLoadingTeamDetail] = useState(false);

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const [profileRes, teamsRes] = await Promise.all([
        api.get('/mentors/me'),
        api.get('/mentors/assigned-teams')
      ]);
      setMentorData(profileRes.data.data);
      setAssignedTeams(teamsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load mentor dashboard data:', err);
      addToast('Failed to load assigned teams.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  const openFeedbackModal = (team) => {
    setSelectedTeam(team);
    setFeedbackForm({
      comments: '',
      areas_of_guidance: '',
      milestone_rating: 5
    });
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comments.trim()) {
      addToast('Please provide feedback comments.', 'error');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/mentors/teams/${selectedTeam._id}/feedback`, feedbackForm);
      addToast(res.data.message || 'Feedback submitted successfully!', 'success');
      setFeedbackModalOpen(false);
      fetchMentorData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to submit feedback.';
      addToast(msg, 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleViewTeam = async (teamId) => {
    setViewTeamModalOpen(true);
    setLoadingTeamDetail(true);
    try {
      const res = await api.get(`/mentors/teams/${teamId}`);
      setTeamDetail(res.data.data);
    } catch (err) {
      addToast('Failed to load team details.', 'error');
      setViewTeamModalOpen(false);
    } finally {
      setLoadingTeamDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-cyan-700 animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Loading Mentor Portal…</span>
        </div>
      </div>
    );
  }

  const mentor = mentorData || profile?.mentor || {};
  const stats = mentorData?.stats || {
    assigned_teams_count: assignedTeams.length,
    total_students_mentored: 0,
    submitted_projects_count: 0,
    feedback_given_count: 0
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Mentor Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-500/20 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-500/30 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Innovation Mentor Portal
                </span>
                <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-mono">
                  {mentor.mentor_custom_id || user?.user_id || 'AFIP-MEN-000001'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {mentor.full_name || user?.name || 'Mentor'}
              </h1>
              <p className="text-slate-300 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span>{mentor.designation || 'STEM Faculty & Innovation Mentor'}</span>
                <span className="text-cyan-400">•</span>
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  {mentor.school_name || mentor.school?.school_name || 'Assam Partner Institution'}
                </span>
                <span className="text-cyan-400">•</span>
                <span>District: {mentor.district || mentor.school?.district || 'Kamrup'}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                <div className="text-2xl font-black text-cyan-300">{stats.assigned_teams_count}</div>
                <div className="text-xs text-slate-300 font-medium">Assigned Teams</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                <div className="text-2xl font-black text-emerald-300">{stats.total_students_mentored}</div>
                <div className="text-xs text-slate-300 font-medium">Mentees</div>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Stage Competition Roadmap */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> State Competition Journey
            </h3>
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Active Stage: Step 05 • District Shortlisting
            </span>
          </div>

          <div className="relative">
            <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch gap-2 min-w-max">
                {COMPETITION_STAGES.map((st, i) => (
                  <div key={st.id} className="flex items-center">
                    <div
                      className={`w-36 p-3 rounded-xl text-center border transition-all flex flex-col justify-between ${
                        st.status === 'completed'
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                          : st.status === 'active'
                          ? 'bg-cyan-700 text-white font-bold shadow-md ring-2 ring-cyan-400/40'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1">
                        <span className={st.status === 'active' ? 'text-cyan-100' : st.status === 'completed' ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                          Step {st.step}
                        </span>
                        {st.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {st.status === 'active' && <Clock className="w-3.5 h-3.5 text-cyan-200 shrink-0 animate-pulse" />}
                      </div>
                      <div className="text-xs font-bold leading-tight line-clamp-2 min-h-[32px] flex items-center justify-center">
                        {st.name}
                      </div>
                      <div className={`text-[10px] mt-1 truncate ${st.status === 'active' ? 'text-cyan-100' : 'text-slate-400'}`}>
                        {st.date}
                      </div>
                    </div>
                    {i < COMPETITION_STAGES.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-300 mx-1 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          {[
            { key: 'teams', label: 'My Assigned Teams', icon: Users, count: assignedTeams.length },
            { key: 'projects', label: 'Prototype Submissions', icon: FileText, count: assignedTeams.filter(t => t.project).length },
            { key: 'journey', label: 'Milestones & Deadlines', icon: Calendar },
          ].map((t) => {
            const TabIcon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-cyan-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: My Assigned Teams */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {assignedTeams.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Teams Currently Assigned</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Your school coordinator will assign student innovator teams to your profile as new squads are formed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignedTeams.map((team) => (
                  <div
                    key={team._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-md text-[11px] font-bold font-mono">
                              {team.team_custom_id || team.team_code}
                            </span>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                              Category: {team.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">{team.team_name}</h3>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold capitalize">
                          {team.qualification_status || 'Active'}
                        </span>
                      </div>

                      {/* Team Members */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 mb-4">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Team Roster ({team.members?.length || 0} students)</span>
                        </div>
                        <div className="space-y-1.5">
                          {team.members && team.members.length > 0 ? (
                            team.members.map((m) => (
                              <div key={m._id} className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  {m.is_leader && (
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase">
                                      Leader
                                    </span>
                                  )}
                                  {m.full_name}
                                </span>
                                <span className="text-slate-500">{m.grade || 'Student'}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-slate-400 italic">No members assigned yet.</div>
                          )}
                        </div>
                      </div>

                      {/* Project Status */}
                      <div className="mb-4">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Project Submission
                        </div>
                        {team.project ? (
                          <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100">
                            <div className="text-sm font-bold text-cyan-950 truncate">
                              {team.project.title}
                            </div>
                            <div className="text-xs text-cyan-800 line-clamp-2 mt-0.5">
                              {team.project.problem_statement}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Project submission pending from student leader.</span>
                          </div>
                        )}
                      </div>

                      {/* Latest Mentor Feedback */}
                      {team.latest_feedback && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
                            <span>Latest Guidance Given</span>
                            <div className="flex items-center text-amber-500">
                              {[...Array(team.latest_feedback.milestone_rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-700 italic">"{team.latest_feedback.comments}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleViewTeam(team._id)}
                        className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        View Full Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openFeedbackModal(team)}
                        className="flex-1 px-4 py-2.5 bg-cyan-800 hover:bg-cyan-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Provide Feedback</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Prototype Submissions */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {assignedTeams.filter(t => t.project).length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Projects Submitted Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  When your assigned teams submit their problem statements and prototypes, they will appear here for your review and guidance.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {assignedTeams.filter(t => t.project).map((team) => {
                  const proj = team.project;
                  return (
                    <div key={proj._id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-md text-xs font-bold font-mono">
                              {proj.project_custom_id || team.team_custom_id}
                            </span>
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">
                              Team: {team.team_name}
                            </span>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">
                              {proj.theme || 'Innovation'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">{proj.title}</h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => openFeedbackModal(team)}
                          className="px-4 py-2 bg-cyan-800 hover:bg-cyan-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Mentor Guidance
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Problem Statement
                          </h4>
                          <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                            {proj.problem_statement}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Proposed Solution & Prototype
                          </h4>
                          <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                            {proj.proposed_solution}
                          </p>
                        </div>
                      </div>

                      {/* Prototype Links */}
                      {(proj.repo_link || proj.demo_link || proj.video_link || proj.presentation_link) && (
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase">Resources:</span>
                          {proj.demo_link && (
                            <a
                              href={proj.demo_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Working Demo
                            </a>
                          )}
                          {proj.repo_link && (
                            <a
                              href={proj.repo_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Source Code
                            </a>
                          )}
                          {proj.video_link && (
                            <a
                              href={proj.video_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Video Demonstration
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Milestones & Deadlines */}
        {activeTab === 'journey' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Key Competition Milestones & Mentor Deadlines</h3>
            <div className="space-y-4">
              {[
                { title: 'District Ideation & Prototype Submissions', date: 'October 25, 2026', desc: 'Ensure all assigned teams have submitted problem statement, video demo, and prototype schematics.', status: 'Active' },
                { title: 'District Level Shortlisting Reviews', date: 'November 10, 2026', desc: 'District Innovation Officers review submissions to shortlist top 10 squads per category for zonal evaluation.', status: 'Upcoming' },
                { title: 'Zonal Hackathon & Prototype Mentorship', date: 'December 05, 2026', desc: 'Physical hackathon and live hardware/software building with academic mentors and state jury.', status: 'Upcoming' },
                { title: 'Assam State Grand Finale at Guwahati', date: 'January 15, 2027', desc: 'Top finalist teams pitch live to Hon’ble Ministers, IIT Delhi faculty, and industry leaders.', status: 'Upcoming' }
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{m.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-100 text-cyan-800">
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{m.desc}</p>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                    {m.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Feedback Submission Modal */}
      <AnimatePresence>
        {feedbackModalOpen && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Provide Mentor Guidance</h3>
                  <p className="text-xs text-slate-500">Team: {selectedTeam.team_name} ({selectedTeam.team_custom_id || selectedTeam.team_code})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Milestone Readiness Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, milestone_rating: star })}
                        className="p-1.5 rounded-lg hover:bg-amber-50 cursor-pointer transition-all"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackForm.milestone_rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">
                      {feedbackForm.milestone_rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Key Guidance & Constructive Feedback *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackForm.comments}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                    placeholder="Provide actionable advice to improve prototype feasibility, safety, or design..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Specific Areas for Improvement (Optional)
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.areas_of_guidance}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, areas_of_guidance: e.target.value })}
                    placeholder="e.g. Battery housing, telemetry fallback, presentation clarity"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-6 py-2.5 bg-cyan-800 hover:bg-cyan-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {submittingFeedback ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Submit Guidance</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Team Modal */}
      <AnimatePresence>
        {viewTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              {loadingTeamDetail ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-cyan-700 animate-spin" />
                  <span className="text-xs font-semibold text-slate-500">Loading team details…</span>
                </div>
              ) : teamDetail ? (
                <div>
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded text-xs font-bold font-mono">
                          {teamDetail.team_custom_id || teamDetail.team_code}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold">
                          Category: {teamDetail.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{teamDetail.team_name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{teamDetail.school?.school_name} • {teamDetail.district}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewTeamModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Student Members */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Registered Student Innovators
                    </h4>
                    <div className="space-y-2">
                      {teamDetail.members?.map((m) => (
                        <div key={m._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{m.full_name}</span>
                            {m.is_leader && (
                              <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase">
                                Team Leader
                              </span>
                            )}
                            <div className="text-[11px] text-slate-500 mt-0.5">{m.email || 'No email provided'}</div>
                          </div>
                          <span className="font-mono text-slate-600">{m.grade || 'Class X'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback History */}
                  {teamDetail.feedback_history && teamDetail.feedback_history.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Guidance Log ({teamDetail.feedback_history.length})
                      </h4>
                      <div className="space-y-2.5 max-h-48 overflow-y-auto">
                        {teamDetail.feedback_history.map((fb) => (
                          <div key={fb._id} className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 text-xs">
                            <div className="flex items-center justify-between text-cyan-900 font-bold mb-1">
                              <span>Rating: {fb.milestone_rating} / 5</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(fb.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700">{fb.comments}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setViewTeamModalOpen(false)}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default MentorDashboard;
