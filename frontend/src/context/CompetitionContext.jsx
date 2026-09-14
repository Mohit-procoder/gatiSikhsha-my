import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export const DEFAULT_COMPETITION_ROUNDS = [
  { id: 'school_registration', step: '01', name: 'School Registration', dates: '17th - 30th Sep, 2026', desc: 'State-wide school onboarding across all 33 districts of Assam.', category: 'Registration' },
  { id: 'mentor_onboarding', step: '02', name: 'Mentor Onboarding', dates: '1st - 10th Oct, 2026', desc: 'Faculty and innovation teacher onboarding & orientation.', category: 'Orientation' },
  { id: 'team_formation', step: '03', name: 'Team Formation', dates: '10th - 15th Oct, 2026', desc: 'Mentor-led squad creation with student dossiers & photos.', category: 'Squad Formation' },
  { id: 'online_bootcamp', step: '04', name: '20h Online Bootcamp', dates: '15th - 22nd Oct, 2026', desc: 'Self-paced foundation learning in design thinking & STEM.', category: 'Foundation Learning' },
  { id: 'mcq_assessment', step: '05', name: 'MCQ Assessment', dates: '23rd - 30th Oct, 2026', desc: 'Standardized benchmark assessment across registered teams.', category: 'Benchmark' },
  { id: 'top_1000', step: '06', name: 'Top 1,000 Shortlist', dates: '1st - 7th Nov, 2026', desc: 'District-level shortlisting of high-potential innovator squads.', category: 'District Shortlist' },
  { id: 'advanced_bootcamp', step: '07', name: 'Advanced Bootcamp', dates: '9th Nov - 6th Dec, 2026', desc: 'Specialized training in IoT, robotics, embedded systems & coding.', category: 'Advance Learning' },
  { id: 'coding_challenge', step: '08', name: 'Coding Challenge', dates: '14th - 19th Dec, 2026', desc: 'Technical evaluation & algorithmic problem solving challenge.', category: 'Technical Challenge' },
  { id: 'shortlist_198', step: '09', name: '198 Teams Shortlist', dates: '21st - 26th Dec, 2026', desc: 'Zonal jury assessment and technical scoring panel.', category: 'Zonal Selection' },
  { id: 'zonal_hackathon', step: '10', name: 'Zonal 48h Hackathon', dates: '27th - 30th Dec, 2026', desc: 'Regional 48-hour prototype demonstration & pitch defense.', category: 'Zonal Hackathon' },
  { id: 'finalist_preparation', step: '11', name: 'Finalist Prep', dates: '1st - 3rd Jan, 2027', desc: 'Finalist squad boot-camp & prototype hardening.', category: 'Finalist Prep' },
  { id: 'state_final', step: '12', name: 'State Final', dates: '4th - 8th Jan, 2027', desc: '5-Day State Grand Finale, State Hackathon & IIT Delhi Incubation.', category: 'Grand Finale' }
];

export const annotateRoundsWithStatus = (roundsList, activeStageId) => {
  const list = roundsList && roundsList.length > 0 ? roundsList : DEFAULT_COMPETITION_ROUNDS;
  let activeIdx = list.findIndex(r => r.id === activeStageId);
  if (activeIdx === -1) activeIdx = 0;

  return list.map((r, idx) => {
    let status = 'upcoming';
    if (idx < activeIdx) status = 'completed';
    else if (idx === activeIdx) status = 'active';

    return {
      ...r,
      status
    };
  });
};

const CompetitionContext = createContext(null);

export const CompetitionProvider = ({ children }) => {
  const [currentStage, setCurrentStage] = useState('school_registration');
  const [rounds, setRounds] = useState(() => annotateRoundsWithStatus(DEFAULT_COMPETITION_ROUNDS, 'school_registration'));
  const [activeRound, setActiveRound] = useState(() => DEFAULT_COMPETITION_ROUNDS[0]);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef(null);

  const applyRoundsData = useCallback((rList, stageId, activeObj) => {
    const effectiveStage = stageId || 'school_registration';
    const rawList = rList && rList.length > 0 ? rList : DEFAULT_COMPETITION_ROUNDS;
    const annotated = annotateRoundsWithStatus(rawList, effectiveStage);

    setRounds(annotated);
    setCurrentStage(effectiveStage);
    setActiveRound(activeObj || annotated.find(r => r.id === effectiveStage) || annotated[0]);
  }, []);

  const fetchRounds = useCallback(async () => {
    try {
      const res = await api.get('/competition/rounds');
      if (res.data?.data) {
        const { rounds: rList, current_stage, active_round } = res.data.data;
        applyRoundsData(rList, current_stage, active_round);
      }
    } catch (err) {
      console.warn('Network notice: using cached/default competition rounds');
    } finally {
      setLoading(false);
    }
  }, [applyRoundsData]);

  // Real-time synchronization across browser tabs and polling
  useEffect(() => {
    fetchRounds();

    // BroadcastChannel for instant cross-tab sync
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel('afip_competition_sync');
        channelRef.current.onmessage = (ev) => {
          if (ev.data === 'sync') {
            fetchRounds();
          }
        };
      }
    } catch (e) {
      // BroadcastChannel not available
    }

    // LocalStorage storage event fallback
    const handleStorage = (e) => {
      if (e.key === 'afip_competition_sync_time') {
        fetchRounds();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3-second heartbeat polling so all open pages (School, Mentor, Home) stay in strict lock-step
    const interval = setInterval(fetchRounds, 3000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [fetchRounds]);

  const notifyOtherTabs = () => {
    try {
      localStorage.setItem('afip_competition_sync_time', Date.now().toString());
      if (channelRef.current) {
        channelRef.current.postMessage('sync');
      }
    } catch (e) {
      // Ignored
    }
  };

  const alterActiveRound = async (roundId) => {
    let res;
    try {
      res = await api.patch('/admin/rounds/active', { active_round_id: roundId });
    } catch (err) {
      // Fail-safe: try competition mirror endpoint
      res = await api.patch('/competition/rounds/active', { active_round_id: roundId });
    }

    if (res.data?.data) {
      const { rounds: rList, current_stage, active_round } = res.data.data;
      applyRoundsData(rList, current_stage, active_round);
      notifyOtherTabs();
    }
    return res.data;
  };

  const updateRoundDates = async (roundId, dates, name = null) => {
    const payload = { round_id: roundId, dates };
    if (name) payload.name = name;

    let res;
    try {
      res = await api.patch('/admin/rounds/dates', payload);
    } catch (err) {
      // Fail-safe: try competition mirror endpoint
      res = await api.patch('/competition/rounds/dates', payload);
    }

    if (res.data?.data) {
      const { rounds: rList, current_stage, active_round } = res.data.data;
      applyRoundsData(rList, current_stage, active_round);
      notifyOtherTabs();
    }
    return res.data;
  };

  return (
    <CompetitionContext.Provider
      value={{
        rounds,
        currentStage,
        activeRound,
        loading,
        refreshRounds: fetchRounds,
        alterActiveRound,
        updateRoundDates
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
};
