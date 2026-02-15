import { useState, useCallback, useEffect } from 'react';
import { pnlApi } from '../api/pnl';
import type { ExplanationResponse } from '../types/pnl';

export type AnalystStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type Investigation = {
  anomalyId: string;
  date: string;
  desk: string;
  severity: string;
  reason: string;
  suggestedAction: string;
  analystStatus: AnalystStatus;
  analystComment: string;
  pinned: boolean;
  timestamp: number;
};

// Create a singleton store outside the hook
const globalInvestigations = new Map<string, Investigation>();
let listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export function useInvestigationStore() {
  // Initialize state from the global store
  const [investigations, setInvestigations] = useState<Map<string, Investigation>>(new Map(globalInvestigations));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to changes
  useEffect(() => {
    const listener = () => {
      setInvestigations(new Map(globalInvestigations));
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getInvestigation = useCallback((anomalyId: string) => {
    return globalInvestigations.get(anomalyId);
  }, []);

  const startInvestigation = useCallback(async (
    anomalyId: string,
    date: string,
    desk: string,
    deviation: number
  ) => {
    // Check if already exists in global store
    if (globalInvestigations.has(anomalyId)) {
      return globalInvestigations.get(anomalyId);
    }

    setIsLoading(true);
    setError(null);

    try {
      const explanation: ExplanationResponse = await pnlApi.explainAnomaly(anomalyId);

      const newInvestigation: Investigation = {
        anomalyId,
        date,
        desk,
        severity: explanation.severity,
        reason: explanation.reason,
        suggestedAction: explanation.suggestedAction,
        analystStatus: 'PENDING',
        analystComment: '',
        pinned: false,
        timestamp: Date.now(),
      };

      // Update global store
      globalInvestigations.set(anomalyId, newInvestigation);
      notifyListeners();

      return newInvestigation;
    } catch (err) {
      setError('Failed to fetch explanation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateInvestigationStatus = useCallback((anomalyId: string, status: AnalystStatus) => {
    const investigation = globalInvestigations.get(anomalyId);
    if (!investigation) return;

    globalInvestigations.set(anomalyId, { ...investigation, analystStatus: status });
    notifyListeners();
  }, []);

  const updateInvestigationComment = useCallback((anomalyId: string, comment: string) => {
    const investigation = globalInvestigations.get(anomalyId);
    if (!investigation) return;

    globalInvestigations.set(anomalyId, { ...investigation, analystComment: comment });
    notifyListeners();
  }, []);

  return {
    investigations,
    isLoading,
    error,
    getInvestigation,
    startInvestigation,
    updateInvestigationStatus,
    updateInvestigationComment,
  };
}
