import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCompetition } from '../../context/CompetitionContext';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  Compass, Users, FileText, CheckCircle2, Clock, Sparkles, MessageSquare,
  Award, School, Calendar, ChevronRight, X, Loader2, Star, ShieldCheck,
  Send, ExternalLink, ArrowRight, Bell, AlertCircle, PlusCircle, Upload,
  Trash2, Camera, User, Phone, Mail, Image as ImageIcon, Info
} from 'lucide-react';

const CATEGORY_GRADES = {
  'VI-VIII': ['Class VI', 'Class VII', 'Class VIII'],
  'IX-X': ['Class IX', 'Class X'],
  'XI-XII': ['Class XI', 'Class XII']
};

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
  const { rounds, activeRound, currentStage } = useCompetition();

  const dynamicRoadmap = (rounds && rounds.length > 0 ? rounds : COMPETITION_STAGES).map((r, i) => ({
    id: r.id,
    step: r.step || (i + 1 < 10 ? `0${i + 1}` : `${i + 1}`),
    name: r.name,
    date: r.dates || r.date,
    status: r.status || (r.id === currentStage ? 'active' : 'upcoming')
  }));

  const [activeTab, setActiveTab] = useState('teams');
  const [mentorData, setMentorData] = useState(null);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Team creation modal state (1 team max per mentor)
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [submittingTeam, setSubmittingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({
    team_name: '',
    category: 'IX-X',
    leader_name: '',
    leader_email: '',
    leader_phone: '',
    leader_grade: 'Class IX',
    leader_photo: '',
    leader_father_name: '',
    leader_mother_name: '',
    members: [] // up to 4: { name, email, phone, grade, photo, father_name, mother_name }
  });

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

  const handlePhotoUpload = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file (PNG, JPG, JPEG, WEBP).', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image size must be less than 2MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target.result);
    };
    reader.onerror = () => {
      addToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (newCategory) => {
    const defaultGrade = CATEGORY_GRADES[newCategory]?.[0] || 'Class IX';
    setTeamForm(prev => ({
      ...prev,
      category: newCategory,
      leader_grade: defaultGrade,
      members: prev.members.map(m => ({ ...m, grade: defaultGrade }))
    }));
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();

    if (assignedTeams.length >= 1) {
      addToast('Each mentor can create at most 1 team. Quota reached.', 'error');
      return;
    }

    if (!teamForm.team_name.trim()) {
      addToast('Please enter a team name.', 'error');
      return;
    }

    // Validate Leader mandatory * fields
    if (!teamForm.leader_photo) {
      addToast('Team Leader photo is mandatory (*).', 'error');
      return;
    }
    if (!teamForm.leader_name.trim()) {
      addToast('Team Leader full name is mandatory (*).', 'error');
      return;
    }
    if (!teamForm.leader_grade.trim()) {
      addToast('Team Leader grade is mandatory (*).', 'error');
      return;
    }
    if (!teamForm.leader_father_name.trim()) {
      addToast("Team Leader father's name is mandatory (*).", 'error');
      return;
    }
    if (!teamForm.leader_mother_name.trim()) {
      addToast("Team Leader mother's name is mandatory (*).", 'error');
      return;
    }
    if (!teamForm.leader_phone.trim()) {
      addToast('Team Leader mobile number is mandatory (*).', 'error');
      return;
    }
    if (!teamForm.leader_email.trim()) {
      addToast('Team Leader email ID is mandatory (*).', 'error');
      return;
    }

    // Validate Members mandatory * fields
    for (let i = 0; i < teamForm.members.length; i++) {
      const m = teamForm.members[i];
      const memberLabel = `Member #${i + 1}`;
      if (!m.photo) {
        addToast(`${memberLabel}: Student photo is mandatory (*).`, 'error');
        return;
      }
      if (!m.name.trim()) {
        addToast(`${memberLabel}: Full name is mandatory (*).`, 'error');
        return;
      }
      if (!m.grade.trim()) {
        addToast(`${memberLabel}: Grade is mandatory (*).`, 'error');
        return;
      }
      if (!m.father_name.trim()) {
        addToast(`${memberLabel}: Father's name is mandatory (*).`, 'error');
        return;
      }
      if (!m.mother_name.trim()) {
        addToast(`${memberLabel}: Mother's name is mandatory (*).`, 'error');
        return;
      }
      if (!m.phone.trim()) {
        addToast(`${memberLabel}: Mobile number is mandatory (*).`, 'error');
        return;
      }
      if (!m.email.trim()) {
        addToast(`${memberLabel}: Email ID is mandatory (*).`, 'error');
        return;
      }
    }

    setSubmittingTeam(true);
    try {
      const payload = {
        team_name: teamForm.team_name.trim(),
        category: teamForm.category,
        leader_name: teamForm.leader_name.trim(),
        leader_email: teamForm.leader_email.trim().toLowerCase(),
        leader_phone: teamForm.leader_phone.trim(),
        leader_grade: teamForm.leader_grade.trim(),
        leader_photo: teamForm.leader_photo,
        leader_father_name: teamForm.leader_father_name.trim(),
        leader_mother_name: teamForm.leader_mother_name.trim(),
        members: teamForm.members.map(m => ({
          name: m.name.trim(),
          email: m.email.trim().toLowerCase(),
          phone: m.phone.trim(),
          grade: m.grade.trim(),
          photo: m.photo,
          father_name: m.father_name.trim(),
          mother_name: m.mother_name.trim()
        }))
      };

      const res = await api.post('/teams', payload);
      addToast(res.data.message || 'Competition team registered successfully!', 'success');
      setCreateTeamModalOpen(false);
      setTeamForm({
        team_name: '',
        category: 'IX-X',
        leader_name: '',
        leader_email: '',
        leader_phone: '',
        leader_grade: 'Class IX',
        leader_photo: '',
        leader_father_name: '',
        leader_mother_name: '',
        members: []
      });
      fetchMentorData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to create team.';
      addToast(msg, 'error');
    } finally {
      setSubmittingTeam(false);
    }
  };

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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {assignedTeams.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setCreateTeamModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Form Competition Team (0/1)</span>
                </button>
              ) : (
                <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Team Quota Active (1/1 Max)</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-cyan-300">{stats.assigned_teams_count}</div>
                  <div className="text-xs text-slate-300 font-medium">Assigned Squad</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-emerald-300">{stats.total_students_mentored}</div>
                  <div className="text-xs text-slate-300 font-medium">Mentees</div>
                </div>
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
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Active Stage: Step {activeRound?.step || '01'} • {activeRound?.name || 'School Registration'}
            </span>
          </div>

          <div className="relative">
            <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch gap-2 min-w-max">
                {dynamicRoadmap.map((st, i) => (
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
                    {i < dynamicRoadmap.length - 1 && (
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  My Competition Squad ({assignedTeams.length}/1 Max)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {assignedTeams.length === 0
                    ? "You are authorized to form 1 student innovator team from your school."
                    : "Your assigned competition team is active (1 team maximum per mentor)."}
                </p>
              </div>

              {assignedTeams.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setCreateTeamModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" /> Form Competition Team
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Quota Fulfilled (1/1 Team)
                </span>
              )}
            </div>

            {assignedTeams.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Competition Team Formed Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  As an authorized Teacher Mentor, you can form and mentor 1 student innovator squad (leader + up to 4 members) complete with student profiles.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateTeamModalOpen(true)}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold cursor-pointer inline-flex items-center gap-2 shadow-md transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Form Competition Team (0/1)
                </button>
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
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Team Roster ({team.members?.length || 0} students)</span>
                        </div>
                        <div className="space-y-2">
                          {team.members && team.members.length > 0 ? (
                            team.members.map((m) => (
                              <div key={m._id} className="p-2.5 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {m.photo ? (
                                    <img src={m.photo} alt={m.full_name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-[10px]">
                                      {m.full_name?.charAt(0) || 'S'}
                                    </div>
                                  )}
                                  <div className="truncate">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                      <span className="truncate">{m.full_name}</span>
                                      {m.is_leader && (
                                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase shrink-0">
                                          Leader
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {m.email} • {m.phone || m.mobile_no}
                                    </div>
                                    {(m.father_name || m.mother_name) && (
                                      <div className="text-[10px] text-slate-400 truncate">
                                        F: {m.father_name || 'N/A'} • M: {m.mother_name || 'N/A'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-600 shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                  {m.grade || 'Student'}
                                </span>
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                      Registered Student Innovators ({teamDetail.members?.length || 0})
                    </h4>
                    <div className="space-y-2.5">
                      {teamDetail.members?.map((m) => (
                        <div key={m._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            {m.photo ? (
                              <img src={m.photo} alt={m.full_name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold">
                                {m.full_name?.charAt(0) || 'S'}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm">{m.full_name}</span>
                                {m.is_leader && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase">
                                    Team Leader
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                <strong>Email:</strong> {m.email || 'N/A'} • <strong>Mobile:</strong> {m.phone || m.mobile_no || 'N/A'}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                <strong>Father:</strong> {m.father_name || 'N/A'} • <strong>Mother:</strong> {m.mother_name || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold shrink-0">
                            {m.grade || 'Class X'}
                          </span>
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

      {/* Modal: Form Competition Team (1 Team Quota per Mentor) */}
      <AnimatePresence>
        {createTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                      Mentor Team Registration
                    </span>
                    <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 text-[11px] font-bold rounded-full font-mono">
                      1 Team Maximum Quota
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Form New Competition Team
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mentor: <strong>{mentor.full_name || user?.name}</strong> • Institution: <strong>{mentor.school_name || 'Assam Partner School'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateTeamModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTeamSubmit} className="space-y-6 text-xs">
                {/* Section 1: Team Details */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-700" />
                      <span>1. Squad Identity & Category</span>
                    </h4>
                    <span className="text-[11px] text-rose-500 font-semibold">* All fields mandatory</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Team Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kaziranga AI Innovators"
                        value={teamForm.team_name}
                        onChange={(e) => setTeamForm({ ...teamForm, team_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Competition Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={teamForm.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500 shadow-xs font-semibold"
                      >
                        <option value="VI-VIII">Middle School (Classes VI - VIII)</option>
                        <option value="IX-X">Secondary (Classes IX - X)</option>
                        <option value="XI-XII">Higher Secondary (Classes XI - XII)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Team Leader (Student 1) */}
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-700 text-white rounded-md text-[10px] font-bold uppercase">
                        Primary Leader
                      </span>
                      <h4 className="font-bold text-emerald-950 text-sm">
                        2. Team Leader Dossier
                      </h4>
                    </div>
                    <span className="text-[11px] text-rose-600 font-bold">* All 7 Fields Required</span>
                  </div>

                  {/* Photo Upload with Preview */}
                  <div className="p-4 bg-white rounded-xl border border-emerald-200">
                    <label className="block font-bold uppercase text-[11px] text-emerald-950 mb-2">
                      Student Photo <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-emerald-300 flex items-center justify-center shrink-0 group shadow-xs">
                        {teamForm.leader_photo ? (
                          <>
                            <img src={teamForm.leader_photo} alt="Leader" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setTeamForm({ ...teamForm, leader_photo: '' })}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove photo"
                            >
                              <Trash2 className="w-5 h-5 text-rose-300" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <Camera className="w-6 h-6 text-emerald-600" />
                            <span className="text-[9px] font-bold text-emerald-700">Photo *</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{teamForm.leader_photo ? 'Replace Leader Photo' : 'Upload Student Photo *'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handlePhotoUpload(f, (base64) => setTeamForm({ ...teamForm, leader_photo: base64 }));
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1.5">
                          Passport size or clear face photo (PNG, JPG, WEBP under 2MB).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Leader fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Student Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya Goswami"
                        value={teamForm.leader_name}
                        onChange={(e) => setTeamForm({ ...teamForm, leader_name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Grade / Class <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={teamForm.leader_grade}
                        onChange={(e) => setTeamForm({ ...teamForm, leader_grade: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 shadow-xs font-medium"
                      >
                        {(CATEGORY_GRADES[teamForm.category] || ['Class IX', 'Class X']).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Father's Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mr. Bhaskar Goswami"
                        value={teamForm.leader_father_name}
                        onChange={(e) => setTeamForm({ ...teamForm, leader_father_name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Mother's Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mrs. Monali Goswami"
                        value={teamForm.leader_mother_name}
                        onChange={(e) => setTeamForm({ ...teamForm, leader_mother_name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 94350 XXXXX"
                        value={teamForm.leader_phone}
                        onChange={(e) => setTeamForm({ ...teamForm, leader_phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Email ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="student@school.edu"
                        value={teamForm.leader_email}
                        onChange={(e) => setTeamForm({ ...teamForm, leader_email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Additional Members (Optional, up to 4) */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-cyan-700" />
                        <span>3. Additional Squad Members ({teamForm.members.length}/4)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Squad can include 1 leader + up to 4 additional members (max 5 students total).
                      </p>
                    </div>

                    {teamForm.members.length < 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          const defaultGrade = CATEGORY_GRADES[teamForm.category]?.[0] || 'Class IX';
                          setTeamForm({
                            ...teamForm,
                            members: [
                              ...teamForm.members,
                              {
                                name: '',
                                email: '',
                                phone: '',
                                grade: defaultGrade,
                                photo: '',
                                father_name: '',
                                mother_name: ''
                              }
                            ]
                          });
                        }}
                        className="px-3 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 transition-all shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Member</span>
                      </button>
                    )}
                  </div>

                  {teamForm.members.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                      No additional members added yet. Click <strong>"+ Add Member"</strong> above if this squad has teammates.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamForm.members.map((member, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px] font-bold">
                                {idx + 2}
                              </span>
                              Member #{idx + 1} Dossier
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = teamForm.members.filter((_, i) => i !== idx);
                                setTeamForm({ ...teamForm, members: updated });
                              }}
                              className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>

                          {/* Member Photo */}
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 group shadow-xs">
                              {member.photo ? (
                                <>
                                  <img src={member.photo} alt={`Member ${idx + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...teamForm.members];
                                      updated[idx].photo = '';
                                      setTeamForm({ ...teamForm, members: updated });
                                    }}
                                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove photo"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-300" />
                                  </button>
                                </>
                              ) : (
                                <Camera className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{member.photo ? 'Change Photo' : 'Upload Member Photo *'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      handlePhotoUpload(f, (base64) => {
                                        const updated = [...teamForm.members];
                                        updated[idx].photo = base64;
                                        setTeamForm({ ...teamForm, members: updated });
                                      });
                                    }
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              <p className="text-[10px] text-slate-500 mt-1">Required photo (*)</p>
                            </div>
                          </div>

                          {/* Member inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                                Full Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Student Full Name"
                                value={member.name}
                                onChange={(e) => {
                                  const updated = [...teamForm.members];
                                  updated[idx].name = e.target.value;
                                  setTeamForm({ ...teamForm, members: updated });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                                Grade / Class <span className="text-rose-500">*</span>
                              </label>
                              <select
                                value={member.grade}
                                onChange={(e) => {
                                  const updated = [...teamForm.members];
                                  updated[idx].grade = e.target.value;
                                  setTeamForm({ ...teamForm, members: updated });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                              >
                                {(CATEGORY_GRADES[teamForm.category] || ['Class IX', 'Class X']).map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                                Father's Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Father's Full Name"
                                value={member.father_name}
                                onChange={(e) => {
                                  const updated = [...teamForm.members];
                                  updated[idx].father_name = e.target.value;
                                  setTeamForm({ ...teamForm, members: updated });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                                Mother's Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Mother's Full Name"
                                value={member.mother_name}
                                onChange={(e) => {
                                  const updated = [...teamForm.members];
                                  updated[idx].mother_name = e.target.value;
                                  setTeamForm({ ...teamForm, members: updated });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                                Mobile Number <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="+91 94350 XXXXX"
                                value={member.phone}
                                onChange={(e) => {
                                  const updated = [...teamForm.members];
                                  updated[idx].phone = e.target.value;
                                  setTeamForm({ ...teamForm, members: updated });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">
                                Email ID <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="email"
                                required
                                placeholder="member@school.edu"
                                value={member.email}
                                onChange={(e) => {
                                  const updated = [...teamForm.members];
                                  updated[idx].email = e.target.value;
                                  setTeamForm({ ...teamForm, members: updated });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Squad Total: <strong>{1 + teamForm.members.length} Innovator{teamForm.members.length > 0 ? 's' : ''}</strong> (1 Leader + {teamForm.members.length} Member{teamForm.members.length !== 1 ? 's' : ''})
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateTeamModalOpen(false)}
                      className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingTeam}
                      className="px-7 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {submittingTeam && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Register Team & Innovators</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default MentorDashboard;
