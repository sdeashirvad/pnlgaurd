import { useState, useMemo } from 'react';
import { Copy, Star, Check, XCircle, AlertTriangle, AlertOctagon, CheckCircle, BrainCircuit, UserCheck } from 'lucide-react';
import { useInvestigationStore } from './InvestigationStore';
import { InvestigationHistoryList } from './InvestigationHistoryList';
import type { AnalystStatus } from './InvestigationStore';

interface InvestigationWorkspaceProps {
  onCopySuccess: (message: string) => void;
}

const severityConfig: Record<string, { color: string; icon: any; label: string }> = {
  HIGH: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertOctagon,
    label: 'High Severity'
  },
  MEDIUM: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: AlertTriangle,
    label: 'Medium Severity'
  },
  LOW: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Low Severity'
  },
};

const statusConfig: Record<AnalystStatus, { color: string; label: string; icon: any }> = {
  PENDING: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Pending Review', icon: BrainCircuit },
  ACCEPTED: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Accepted', icon: Check },
  REJECTED: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected', icon: XCircle },
};

export function InvestigationWorkspace({ onCopySuccess }: InvestigationWorkspaceProps) {
  const { investigations } = useInvestigationStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const handleTogglePin = (id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sortedInvestigations = useMemo(() => {
    const list = Array.from(investigations.values());
    return list.map(inv => ({ ...inv, pinned: pinnedIds.has(inv.anomalyId) })).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.timestamp - a.timestamp;
    });
  }, [investigations, pinnedIds]);

  const selectedInvestigation = useMemo(() => {
    if (!selectedId) return null;
    const inv = investigations.get(selectedId);
    return inv ? { ...inv, pinned: pinnedIds.has(inv.anomalyId) } : null;
  }, [investigations, selectedId, pinnedIds]);

  const handleCopyRiskBrief = async () => {
    const today = new Date().toLocaleDateString();
    const todaysInvestigations = sortedInvestigations.filter(inv =>
      new Date(inv.timestamp).toLocaleDateString() === today
    );

    if (todaysInvestigations.length === 0) {
      onCopySuccess('No investigations found for today.');
      return;
    }

    const count = todaysInvestigations.length;
    const highestSeverity = todaysInvestigations.find(inv => inv.severity === 'HIGH')
      ? 'HIGH'
      : todaysInvestigations.find(inv => inv.severity === 'MEDIUM')
        ? 'MEDIUM'
        : 'LOW';

    const desk = todaysInvestigations.find(inv => inv.severity === highestSeverity)?.desk || 'Unknown Desk';

    const summary = `PnLGuard investigated ${count} anomalies today. Highest severity: ${highestSeverity} in ${desk}.`;

    try {
      await navigator.clipboard.writeText(summary);
      onCopySuccess('Daily Risk Brief copied to clipboard');
    } catch (error) {
      console.error('Failed to copy brief', error);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-6">
      {/* Left Panel: History List */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900">Investigation History</h2>
          <button
            onClick={handleCopyRiskBrief}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow"
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copy Risk Brief
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
          <InvestigationHistoryList
            investigations={sortedInvestigations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onTogglePin={handleTogglePin}
          />
        </div>
      </div>

      {/* Right Panel: Detail View */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
        {selectedInvestigation ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-white shrink-0">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedInvestigation.desk}</h2>
                  <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                    {new Date(selectedInvestigation.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center">
                  <BrainCircuit className="w-4 h-4 mr-1.5 text-blue-500" />
                  Investigated at {new Date(selectedInvestigation.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleTogglePin(selectedInvestigation.anomalyId)}
                className={`p-2 rounded-full transition-colors ${
                  pinnedIds.has(selectedInvestigation.anomalyId) ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:bg-gray-50'
                }`}
              >
                <Star className={`w-6 h-6 ${pinnedIds.has(selectedInvestigation.anomalyId) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Severity Badge */}
              <div className={`flex items-center p-5 rounded-xl border ${severityConfig[selectedInvestigation.severity]?.color || severityConfig.MEDIUM.color}`}>
                {(() => {
                  const config = severityConfig[selectedInvestigation.severity] || severityConfig.MEDIUM;
                  const Icon = config.icon;
                  return <Icon className="w-8 h-8 mr-4" />;
                })()}
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider opacity-80 mb-0.5">Severity Level</p>
                  <p className="font-bold text-xl">{severityConfig[selectedInvestigation.severity]?.label || 'Unknown Severity'}</p>
                </div>
              </div>

              {/* Reason Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Root Cause Analysis
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-gray-700 leading-relaxed shadow-sm text-base">
                  {selectedInvestigation.reason}
                </div>
              </div>

              {/* Action Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Recommended Action
                </h3>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-blue-900 leading-relaxed shadow-sm text-base">
                  {selectedInvestigation.suggestedAction}
                </div>
              </div>

              {/* Analyst Decision Section (Read-Only) */}
              <div className="pt-8 border-t border-gray-100 pb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <UserCheck className="w-5 h-5 text-gray-500" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Analyst Decision Record
                  </h3>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${statusConfig[selectedInvestigation.analystStatus].color}`}>
                      {(() => {
                        const Icon = statusConfig[selectedInvestigation.analystStatus].icon;
                        return <Icon className="w-4 h-4 mr-2" />;
                      })()}
                      {statusConfig[selectedInvestigation.analystStatus].label}
                    </div>
                    <span className="text-xs text-gray-400">
                      Last updated: {new Date(selectedInvestigation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-gray-500 font-medium mb-2">Analyst Notes:</p>
                    {selectedInvestigation.analystComment ? (
                      <p className="text-gray-700 leading-relaxed italic">
                        "{selectedInvestigation.analystComment}"
                      </p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        No additional notes provided.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/30 h-full">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 border border-gray-100">
              <BrainCircuit className="w-10 h-10 text-blue-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select an investigation</h3>
            <p className="text-gray-500 max-w-md leading-relaxed">
              Choose an item from the history list to view full AI analysis, severity details, and take analyst action.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
