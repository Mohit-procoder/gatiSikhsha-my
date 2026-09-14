import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCompetition } from '../../context/CompetitionContext';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  School, Users, PlusCircle, Award, CheckCircle2, Clock,
  Sparkles, Layers, FileText, ChevronRight, ChevronLeft, X, Loader2, AlertCircle, ArrowRight,
  Compass, UserPlus, Edit, Trash2, Search, Filter, ShieldCheck, Mail, Phone, MapPin,
  Lock, Eye, EyeOff, KeyRound, Info
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

const SchoolDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const { rounds, activeRound, currentStage } = useCompetition();

  const dynamicRoadmap = (rounds && rounds.length > 0 ? rounds : COMPETITION_STAGES).map((r, i) => ({
    id: r.id,
    step: r.step || (i + 1 < 10 ? `0${i + 1}` : `${i + 1}`),
    name: r.name,
    date: r.dates || r.date,
    status: r.status || (r.id === currentStage ? 'active' : 'upcoming')
  }));

  const [activeTab, setActiveTab] = useState('overview');
  const [school, setSchool] = useState(null);
  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createMentorOpen, setCreateMentorOpen] = useState(false);
  const [viewTeamOpen, setViewTeamOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Password visibility toggles
  const [showMentorModalPassword, setShowMentorModalPassword] = useState(false);

  // Form states
  const [mentorForm, setMentorForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Innovation Mentor',
    password: ''
  });
  const [submittingMentor, setSubmittingMentor] = useState(false);

  const [profileForm, setProfileForm] = useState({
    official_phone: '',
    website: '',
    address_line_1: '',
    address_line_2: '',
    pin_code: '',
    principal_name: '',
    principal_email: '',
    principal_phone: '',
    coordinator_name: '',
    coordinator_email: '',
    coordinator_phone: '',
    coordinator_designation: ''
  });
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentTeamFilter, setStudentTeamFilter] = useState('all');

  const fetchSchoolData = async () => {
    setLoading(true);
    try {
      const [schoolRes, teamsRes, mentorsRes, studentsRes] = await Promise.all([
        api.get('/schools/me'),
        api.get('/schools/my-teams'),
        api.get('/schools/mentors'),
        api.get('/schools/students')
      ]);
      const sData = schoolRes.data.data;
      setSchool(sData);
      setTeams(teamsRes.data.data || []);
      setMentors(mentorsRes.data.data || []);
      setStudents(studentsRes.data.data || []);

      if (sData) {
        setProfileForm({
          official_phone: sData.official_phone || '',
          website: sData.website || '',
          address_line_1: sData.address_line_1 || '',
          address_line_2: sData.address_line_2 || '',
          pin_code: sData.pin_code || '',
          principal_name: sData.principal?.name || '',
          principal_email: sData.principal?.email || '',
          principal_phone: sData.principal?.phone || '',
          coordinator_name: sData.coordinator?.name || '',
          coordinator_email: sData.coordinator?.email || '',
          coordinator_phone: sData.coordinator?.phone || '',
          coordinator_designation: sData.coordinator?.designation || ''
        });
      }
    } catch (err) {
      console.error('Failed to load school dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();
  }, []);



  const handleCreateMentor = async (e) => {
    e.preventDefault();
    setSubmittingMentor(true);
    try {
      const mentorPayload = {
        ...mentorForm,
        password: mentorForm.password || 'Mentor@123'
      };
      const res = await api.post('/schools/mentors', mentorPayload);
      addToast(res.data.message || 'Mentor registered successfully!', 'success');
      setCreateMentorOpen(false);
      setMentorForm({
        name: '',
        email: '',
        phone: '',
        designation: 'Innovation Mentor',
        password: ''
      });
      fetchSchoolData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to register mentor.';
      addToast(msg, 'error');
    } finally {
      setSubmittingMentor(false);
    }
  };



  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      const res = await api.delete(`/schools/students/${studentId}`);
      addToast(res.data.message || 'Student removed successfully.', 'success');
      fetchSchoolData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to remove student.', 'error');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    try {
      const payload = {
        official_phone: profileForm.official_phone,
        website: profileForm.website,
        address_line_1: profileForm.address_line_1,
        address_line_2: profileForm.address_line_2,
        pin_code: profileForm.pin_code,
        principal: {
          name: profileForm.principal_name,
          email: profileForm.principal_email,
          phone: profileForm.principal_phone
        },
        coordinator: {
          name: profileForm.coordinator_name,
          email: profileForm.coordinator_email,
          phone: profileForm.coordinator_phone,
          designation: profileForm.coordinator_designation
        }
      };
      const res = await api.put('/schools/profile', payload);
      addToast(res.data.message || 'School profile updated successfully.', 'success');
      setEditProfileOpen(false);
      fetchSchoolData();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmittingProfile(false);
    }
  };

  if (loading && !school) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Loading School Portal…</span>
        </div>
      </div>
    );
  }

  const isApproved = school?.status === 'approved';

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.grade?.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesTeam = studentTeamFilter === 'all' ||
                        (studentTeamFilter === 'assigned' && s.team_id) ||
                        (studentTeamFilter === 'unassigned' && !s.team_id);
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Status Notice if Pending or Rejected */}
        {!isApproved && (
          <div className={`rounded-3xl p-6 mb-8 border shadow-xs ${
            school?.status === 'rejected'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold">
                  {school?.status === 'rejected'
                    ? 'Registration Application Rejected'
                    : 'Institutional Review in Progress'}
                </h3>
                <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                  {school?.status === 'rejected'
                    ? `Reason: ${school?.rejection_reason || 'Incomplete documentation'}. Please contact State AFIP Administration.`
                    : 'Your 11-digit UDISE format has been logged. Upon State Admin approval, your official School Code will be assigned to unlock full team participation.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Institution Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5" /> Institutional Portal
                </span>
                <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-mono">
                  UDISE: {school?.udise_school_id || '18XXXXXXXXX'}
                </span>
                {school?.school_code && (
                  <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-xs font-mono font-bold">
                    {school?.school_code}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {school?.school_name || 'Assam Educational Institution'}
              </h1>
              <p className="text-slate-300 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span>{school?.school_type || 'Government Model School'}</span>
                <span className="text-emerald-400">•</span>
                <span>District: {school?.district || 'Kamrup'}</span>
                <span className="text-emerald-400">•</span>
                <span>Block: {school?.block || 'Central'}</span>
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateMentorOpen(true)}
                disabled={!isApproved}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Onboard Teacher Mentor</span>
              </button>
            </div>
          </div>
        </div>

        {/* 10-Stage Competition Roadmap */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> State Competition Journey
            </h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
                          ? 'bg-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1">
                        <span className={st.status === 'active' ? 'text-emerald-100' : st.status === 'completed' ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                          Step {st.step}
                        </span>
                        {st.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {st.status === 'active' && <Clock className="w-3.5 h-3.5 text-emerald-200 shrink-0 animate-pulse" />}
                      </div>
                      <div className="text-xs font-bold leading-tight line-clamp-2 min-h-[32px] flex items-center justify-center">
                        {st.name}
                      </div>
                      <div className={`text-[10px] mt-1 truncate ${st.status === 'active' ? 'text-emerald-100' : 'text-slate-400'}`}>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: Sparkles },
            { key: 'teams', label: 'Teams', icon: Users, count: teams.length },
            { key: 'mentors', label: 'Mentors', icon: Compass, count: mentors.length },
            { key: 'students', label: 'Student Directory', icon: UserPlus, count: students.length },
            { key: 'profile', label: 'School Profile', icon: School }
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
                    ? 'bg-emerald-900 text-white shadow-sm'
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

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Teams', value: teams.length, desc: 'Across VI-XII categories', icon: Users },
                { label: 'Mentors', value: mentors.length, desc: 'Faculty Guides', icon: Compass },
                { label: 'Registered Students', value: students.length, desc: 'Student Innovators', icon: UserPlus },
                { label: 'Projects Submitted', value: teams.filter(t => t.project).length, desc: 'Prototypes Logged', icon: FileText }
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{c.label}</span>
                    <c.icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{c.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">School Innovation Controls</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">
                Onboard faculty mentors to guide student teams, monitor competition squads, and manage official institutional records.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCreateMentorOpen(true)}
                  disabled={!isApproved}
                  className="p-5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  <Compass className="w-6 h-6 text-cyan-700 mb-2" />
                  <div className="font-bold text-sm text-cyan-950">Onboard Faculty Mentor</div>
                  <div className="text-xs text-cyan-800 mt-0.5">Generate Mentor ID and credentials for team creation and guidance.</div>
                </button>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left">
                  <ShieldCheck className="w-6 h-6 text-emerald-700 mb-2" />
                  <div className="font-bold text-sm text-emerald-950">Mentor-Led Team Registration</div>
                  <div className="text-xs text-emerald-800 mt-0.5">Team creation and student registration are managed directly by your school's Teacher Mentors (1 team max per mentor).</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Teams */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Competition Teams ({teams.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Formed and mentored by your school's faculty mentors (1 team max per mentor)</p>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Teams Formed Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Onboard faculty mentors from your school. Mentors log in to form their squad and register students with required dossiers.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateMentorOpen(true)}
                  disabled={!isApproved}
                  className="px-5 py-2.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" /> Onboard Faculty Mentor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <div key={team._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-bold font-mono">
                              {team.team_custom_id || team.team_code}
                            </span>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                              {team.category}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mt-2">{team.team_name}</h4>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold capitalize">
                          {team.qualification_status || 'Qualified'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mb-4 space-y-1">
                        <div><strong>Mentor:</strong> {team.mentor_name || 'Assigned Mentor'}</div>
                        <div><strong>Students:</strong> {team.members_detail?.length || 0} enrolled</div>
                      </div>

                      {/* Members list preview */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 space-y-1">
                        {team.members_detail?.map(m => (
                          <div key={m._id} className="text-xs flex items-center justify-between">
                            <span className="font-medium text-slate-800">{m.full_name} {m.is_leader && '(Leader)'}</span>
                            <span className="text-slate-500">{m.grade}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeam(team);
                        setViewTeamOpen(true);
                      }}
                      className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Manage Team Members
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Mentors */}
        {activeTab === 'mentors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">School Faculty Mentors ({mentors.length})</h3>
              <button
                type="button"
                onClick={() => setCreateMentorOpen(true)}
                disabled={!isApproved}
                className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Compass className="w-4 h-4" /> Add Mentor
              </button>
            </div>

            {mentors.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Mentors Added Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Add teacher coordinators or STEM faculty mentors who will guide teams and submit progress feedback.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateMentorOpen(true)}
                  disabled={!isApproved}
                  className="px-5 py-2.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" /> Add First Mentor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentors.map((m) => (
                  <div key={m._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded text-[11px] font-bold font-mono">
                          {m.mentor_custom_id}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 mt-1">{m.full_name}</h4>
                        <div className="text-xs text-slate-500">{m.designation}</div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold capitalize">
                        {m.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 mb-4">
                      <div><strong>Email:</strong> {m.email}</div>
                      <div><strong>Phone:</strong> {m.phone || 'Not provided'}</div>
                      <div><strong>Assigned Teams:</strong> {m.assigned_teams_count || 0}</div>
                    </div>

                    {m.assigned_teams && m.assigned_teams.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Teams Mentored</div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.assigned_teams.map(t => (
                            <span key={t._id} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px] font-medium">
                              {t.team_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Student Directory */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Directory ({students.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Official student innovator roster enrolled by your school's Teacher Mentors</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or grade..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={studentTeamFilter}
                onChange={(e) => setStudentTeamFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
              >
                <option value="all">All Students</option>
                <option value="assigned">Enrolled in Team</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Student ID</th>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4">Team Association</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                          No students found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{s.full_name}</div>
                            <div className="text-[11px] text-slate-500">{s.email || 'No email registered'}</div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-700">
                            {s.student_custom_id}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">{s.grade}</td>
                          <td className="px-6 py-4">
                            {s.team ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[11px]">
                                {s.team.team_name}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(s._id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: School Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Institutional Record</h3>
                <p className="text-xs text-slate-500">Official contact & administrative credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">School Information</h4>
                <div><strong>Institution:</strong> {school?.school_name}</div>
                <div><strong>UDISE ID:</strong> {school?.udise_school_id}</div>
                <div><strong>Official Code:</strong> {school?.school_code || 'Pending'}</div>
                <div><strong>School Type:</strong> {school?.school_type}</div>
                <div><strong>Board:</strong> {school?.board}</div>
                <div><strong>District:</strong> {school?.district}</div>
                <div><strong>Block:</strong> {school?.block}</div>
                <div><strong>Address:</strong> {school?.address_line_1}, {school?.address_line_2}</div>
                <div><strong>PIN Code:</strong> {school?.pin_code}</div>
              </div>

              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Administration & Contacts</h4>
                <div><strong>Official Email:</strong> {school?.official_email}</div>
                <div><strong>Official Phone:</strong> {school?.official_phone}</div>
                <div><strong>Website:</strong> {school?.website || 'Not specified'}</div>
                <div className="pt-2 border-t border-slate-200">
                  <div><strong>Principal Name:</strong> {school?.principal?.name}</div>
                  <div><strong>Principal Email:</strong> {school?.principal?.email}</div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div><strong>Coordinator Name:</strong> {school?.coordinator?.name}</div>
                  <div><strong>Designation:</strong> {school?.coordinator?.designation}</div>
                  <div><strong>Coordinator Email:</strong> {school?.coordinator?.email}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>


      {/* Modal: Create Mentor */}
      <AnimatePresence>
        {createMentorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-lg font-bold text-slate-900">Onboard Faculty Mentor</h3>
                <button
                  type="button"
                  onClick={() => setCreateMentorOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMentor} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Mentor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Subhash Sarma"
                    value={mentorForm.name}
                    onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Official Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    placeholder="mentor@school.edu"
                    value={mentorForm.email}
                    onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Mentor Login Password *</label>
                  <div className="relative">
                    <input
                      type={showMentorModalPassword ? 'text' : 'password'}
                      required
                      placeholder="Set login password (e.g. Mentor@123)"
                      value={mentorForm.password}
                      onChange={(e) => setMentorForm({ ...mentorForm, password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMentorModalPassword(!showMentorModalPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {showMentorModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">The mentor will use their email and this password to log in at <code className="font-bold text-slate-700">/login/mentor</code>.</p>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 94350 XXXXX"
                    value={mentorForm.phone}
                    onChange={(e) => setMentorForm({ ...mentorForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="Senior Science Teacher / ATAL Incharge"
                    value={mentorForm.designation}
                    onChange={(e) => setMentorForm({ ...mentorForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateMentorOpen(false)}
                    className="px-4 py-2 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingMentor}
                    className="px-6 py-2.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingMentor && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Register Mentor</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Modal: Edit Profile */}
      <AnimatePresence>
        {editProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-xl font-bold text-slate-900">Edit School Profile</h3>
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Official Phone</label>
                    <input
                      type="text"
                      value={profileForm.official_phone}
                      onChange={(e) => setProfileForm({ ...profileForm, official_phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Website URL</label>
                    <input
                      type="text"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={profileForm.address_line_1}
                    onChange={(e) => setProfileForm({ ...profileForm, address_line_1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Principal Name</label>
                    <input
                      type="text"
                      value={profileForm.principal_name}
                      onChange={(e) => setProfileForm({ ...profileForm, principal_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Coordinator Name</label>
                    <input
                      type="text"
                      value={profileForm.coordinator_name}
                      onChange={(e) => setProfileForm({ ...profileForm, coordinator_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(false)}
                    className="px-4 py-2 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submittingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
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

export default SchoolDashboard;
