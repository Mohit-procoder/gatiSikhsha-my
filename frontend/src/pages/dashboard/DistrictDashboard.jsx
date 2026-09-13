import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  MapPin, School, Users, FileText, CheckCircle2, Clock, AlertCircle,
  Sparkles, Search, Filter, ChevronRight, X, Loader2, Eye, Award,
  Compass, ExternalLink, ShieldCheck, ArrowRight
} from 'lucide-react';

const DistrictDashboard = () => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolStatusFilter, setSchoolStatusFilter] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');
  const [teamCategoryFilter, setTeamCategoryFilter] = useState('all');
  const [teamStageFilter, setTeamStageFilter] = useState('all');

  // Modals
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [loadingSchoolDetails, setLoadingSchoolDetails] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [loadingTeamDetails, setLoadingTeamDetails] = useState(false);

  const fetchDistrictData = async () => {
    setLoading(true);
    try {
      const [statsRes, schoolsRes, teamsRes, projectsRes] = await Promise.all([
        api.get('/districts/stats'),
        api.get('/districts/schools'),
        api.get('/districts/teams'),
        api.get('/districts/projects')
      ]);
      setStats(statsRes.data.data);
      setSchools(schoolsRes.data.data || []);
      setTeams(teamsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load district data:', err);
      addToast('Failed to load district data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictData();
  }, []);

  const handleViewSchool = async (schoolId) => {
    setSchoolModalOpen(true);
    setLoadingSchoolDetails(true);
    try {
      const res = await api.get(`/districts/schools/${schoolId}`);
      setSelectedSchool(res.data.data);
    } catch (err) {
      addToast('Failed to load school details.', 'error');
      setSchoolModalOpen(false);
    } finally {
      setLoadingSchoolDetails(false);
    }
  };

  const handleViewTeam = async (teamId) => {
    setTeamModalOpen(true);
    setLoadingTeamDetails(true);
    try {
      const res = await api.get(`/districts/teams/${teamId}`);
      setSelectedTeam(res.data.data);
    } catch (err) {
      addToast('Failed to load team details.', 'error');
      setTeamModalOpen(false);
    } finally {
      setLoadingTeamDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-teal-700 animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Loading District Innovation Portal…</span>
        </div>
      </div>
    );
  }

  const districtName = stats?.district_name || user?.district || 'Kamrup';
  const districtId = stats?.district_id || 'AFIP-DIST-KAM';

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.school_name?.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      s.udise_school_id?.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      s.block?.toLowerCase().includes(schoolSearch.toLowerCase());
    const matchesStatus = schoolStatusFilter === 'all' || s.status === schoolStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.team_name?.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.team_code?.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.school_name?.toLowerCase().includes(teamSearch.toLowerCase());
    const matchesCategory = teamCategoryFilter === 'all' || t.category === teamCategoryFilter;
    const matchesStage = teamStageFilter === 'all' || t.competition_stage === teamStageFilter;
    return matchesSearch && matchesCategory && matchesStage;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* District Officer Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/20 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> District Portal
                </span>
                <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-mono font-bold">
                  {districtId}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {districtName} District Innovation Portal
              </h1>
              <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                <span>Officer: {user?.name || 'District Innovation Officer'}</span>
                <span className="text-teal-400">•</span>
                <span>Government of Assam / Samagra Shiksha</span>
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 min-w-[90px]">
                <div className="text-xl font-black text-teal-300">{stats?.total_schools || 0}</div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Schools</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 min-w-[90px]">
                <div className="text-xl font-black text-cyan-300">{stats?.total_teams || 0}</div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Teams</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 min-w-[90px]">
                <div className="text-xl font-black text-emerald-300">{stats?.submitted_projects || 0}</div>
                <div className="text-[10px] text-slate-300 uppercase font-bold">Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'District Overview', icon: Sparkles },
            { key: 'schools', label: 'Schools Directory', icon: School, count: schools.length },
            { key: 'teams', label: 'District Teams', icon: Users, count: teams.length },
            { key: 'projects', label: 'Submitted Projects', icon: FileText, count: projects.length },
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
                    ? 'bg-teal-900 text-white shadow-sm'
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

        {/* Tab 1: District Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Schools', value: stats?.total_schools || 0, sub: `${stats?.approved_schools || 0} Approved` },
                { label: 'Active Teams', value: stats?.active_teams || 0, sub: `${stats?.total_teams || 0} Registered` },
                { label: 'Total Innovators', value: stats?.total_students || 0, sub: 'Class VI-XII' },
                { label: 'Active Mentors', value: stats?.total_mentors || 0, sub: 'School Guides' },
                { label: 'Projects Submitted', value: stats?.submitted_projects || 0, sub: 'Prototypes' },
                { label: 'Shortlisted Teams', value: stats?.shortlisted_teams || 0, sub: 'Zonal Ready' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{c.label}</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{c.value}</div>
                  <div className="text-[11px] text-teal-700 font-semibold mt-0.5">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Participation Breakdown Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                District Mission Governance & Verification
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                As the District Innovation Officer for <strong>{districtName}</strong>, your mandate is to monitor institutional participation, ensure verified UDISE school data, encourage cross-category student participation (VI-VIII, IX-X, XI-XII), and facilitate access to innovation labs across all educational blocks in {districtName}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
                  <div className="text-xs font-bold text-teal-900 uppercase">UDISE Integrity</div>
                  <p className="text-xs text-teal-800 mt-1">All {districtName} institutions validated against State UDISE registry prefix 18.</p>
                </div>
                <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-100">
                  <div className="text-xs font-bold text-cyan-900 uppercase">Zonal Shortlisting</div>
                  <p className="text-xs text-cyan-800 mt-1">{stats?.shortlisted_teams || 0} teams currently qualifying for the Regional Hackathon.</p>
                </div>
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                  <div className="text-xs font-bold text-amber-900 uppercase">Jury Remarks</div>
                  <p className="text-xs text-amber-800 mt-1">Only official RELEASED feedback from evaluators is visible for district oversight.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Schools Directory */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by school name, UDISE ID, or block..."
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={schoolStatusFilter}
                  onChange={(e) => setSchoolStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Schools Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">School Details</th>
                      <th className="px-6 py-4">UDISE & Code</th>
                      <th className="px-6 py-4">Block</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Teams</th>
                      <th className="px-6 py-4 text-center">Students</th>
                      <th className="px-6 py-4 text-center">Mentors</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-slate-400 italic">
                          No schools found in {districtName} matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSchools.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{s.school_name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{s.official_email}</div>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            <div className="font-bold text-slate-800">{s.udise_school_id}</div>
                            <div className="text-[11px] text-slate-500">{s.school_code || 'Pending approval'}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{s.block || 'Central'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              s.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-900">{s.teams_count || 0}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-900">{s.students_count || 0}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-900">{s.mentors_count || 0}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewSchool(s._id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
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

        {/* Tab 3: District Teams */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search team name, team ID, or school..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={teamCategoryFilter}
                  onChange={(e) => setTeamCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Categories</option>
                  <option value="VI-VIII">VI-VIII</option>
                  <option value="IX-X">IX-X</option>
                  <option value="XI-XII">XI-XII</option>
                </select>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTeams.length === 0 ? (
                <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">No Teams Found</h3>
                  <p className="text-sm text-slate-500">No teams in {districtName} match the current search filters.</p>
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <div key={team._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-md text-[11px] font-bold font-mono">
                              {team.team_custom_id || team.team_code}
                            </span>
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                              {team.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">{team.team_name}</h3>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold capitalize">
                          {team.qualification_status || 'Qualified'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mb-4 space-y-1">
                        <div><strong>School:</strong> {team.school_name || team.school?.school_name}</div>
                        <div><strong>Mentor:</strong> {team.mentor_name || 'Assigned School Mentor'}</div>
                        <div><strong>Members:</strong> {team.members_count || team.members?.length || 0} students</div>
                      </div>

                      {team.project && (
                        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs mb-4">
                          <div className="font-bold text-teal-950 truncate">{team.project.title}</div>
                          <div className="text-teal-800 line-clamp-1 mt-0.5">{team.project.problem_statement}</div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewTeam(team._id)}
                      className="w-full mt-2 px-4 py-2 bg-slate-100 hover:bg-teal-900 hover:text-white text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Team Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Submitted Projects & Remarks */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {projects.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">No Projects Found</h3>
                  <p className="text-sm text-slate-500">Student teams from {districtName} have not submitted projects yet.</p>
                </div>
              ) : (
                projects.map((proj) => (
                  <div key={proj._id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-md text-xs font-bold font-mono">
                            {proj.project_custom_id || 'AFIP-PRJ'}
                          </span>
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">
                            {proj.theme || 'Innovation'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{proj.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {proj.school?.school_name} • Team: {proj.team?.team_name}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
                        {proj.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Problem Statement</h4>
                        <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                          {proj.problem_statement}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Proposed Solution</h4>
                        <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                          {proj.proposed_solution}
                        </p>
                      </div>
                    </div>

                    {/* Official RELEASED Jury Remarks */}
                    {proj.jury_remarks && proj.jury_remarks.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> Released Jury Evaluation Remarks
                        </h4>
                        <div className="space-y-2">
                          {proj.jury_remarks.map((rem, idx) => (
                            <div key={idx} className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-950">
                              <span className="font-bold">{rem.author_name || 'State Evaluator'}:</span> {rem.remark}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* School Details Modal */}
      <AnimatePresence>
        {schoolModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              {loadingSchoolDetails ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
                  <span className="text-xs font-semibold text-slate-500">Loading school details…</span>
                </div>
              ) : selectedSchool ? (
                <div>
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                      <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded text-xs font-bold font-mono">
                        {selectedSchool.school_code || selectedSchool.school_custom_id}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedSchool.school_name}</h3>
                      <p className="text-xs text-slate-500">UDISE: {selectedSchool.udise_school_id} • Block: {selectedSchool.block}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSchoolModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div><strong>Type:</strong> {selectedSchool.school_type || 'Government Model School'}</div>
                      <div><strong>Board:</strong> {selectedSchool.board || 'SEBA'}</div>
                      <div><strong>Email:</strong> {selectedSchool.official_email}</div>
                      <div><strong>Phone:</strong> {selectedSchool.official_phone}</div>
                      <div><strong>Principal:</strong> {selectedSchool.principal?.name}</div>
                      <div><strong>Coordinator:</strong> {selectedSchool.coordinator?.name}</div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                        Registered Teams ({selectedSchool.teams?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {selectedSchool.teams?.map((t) => (
                          <div key={t._id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-slate-900">{t.team_name}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{t.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-5 border-t border-slate-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setSchoolModalOpen(false)}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Details Modal */}
      <AnimatePresence>
        {teamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              {loadingTeamDetails ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
                  <span className="text-xs font-semibold text-slate-500">Loading team details…</span>
                </div>
              ) : selectedTeam ? (
                <div>
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                      <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded text-xs font-bold font-mono">
                        {selectedTeam.team_custom_id || selectedTeam.team_code}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedTeam.team_name}</h3>
                      <p className="text-xs text-slate-500">{selectedTeam.school?.school_name} • Category: {selectedTeam.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTeamModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Student Members */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Registered Student Innovators ({selectedTeam.members?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {selectedTeam.members?.map((m) => (
                        <div key={m._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{m.full_name}</span>
                            {m.is_leader && (
                              <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase">
                                Leader
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-600">{m.grade || 'Class X'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Details */}
                  {selectedTeam.project && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Project Submission
                      </h4>
                      <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs">
                        <div className="font-bold text-teal-950 text-sm">{selectedTeam.project.title}</div>
                        <p className="text-teal-900 mt-1">{selectedTeam.project.problem_statement}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setTeamModalOpen(false)}
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

export default DistrictDashboard;
