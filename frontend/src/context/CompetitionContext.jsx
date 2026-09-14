import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CompetitionContext = createContext(null);

export const CompetitionProvider = ({ children }) => {
  const [rounds, setRounds] = useState([]);
  const [currentStage, setCurrentStage] = useState('school_registration');
  const [activeRound, setActiveRound] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRounds = useCallback(async () => {
    try {
      const res = await api.get('/competition/rounds');
      if (res.data?.data) {
        const { rounds: rList, current_stage, active_round } = res.data.data;
        setRounds(rList || []);
        setCurrentStage(current_stage || 'school_registration');
        setActiveRound(active_round || null);
      }
    } catch (err) {
      console.error('Failed to load competition rounds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  const alterActiveRound = async (roundId) => {
    const res = await api.patch('/admin/rounds/active', { active_round_id: roundId });
    if (res.data?.data) {
      const { rounds: rList, current_stage, active_round } = res.data.data;
      setRounds(rList || []);
      setCurrentStage(current_stage);
      setActiveRound(active_round);
    }
    return res.data;
  };

  const updateRoundDates = async (roundId, dates, name = null) => {
    const payload = { round_id: roundId, dates };
    if (name) payload.name = name;
    const res = await api.patch('/admin/rounds/dates', payload);
    if (res.data?.data) {
      const { rounds: rList, current_stage, active_round } = res.data.data;
      setRounds(rList || []);
      setCurrentStage(current_stage);
      setActiveRound(active_round);
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
