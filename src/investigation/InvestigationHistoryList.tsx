import { Star, Clock, AlertTriangle, CheckCircle, AlertOctagon, ChevronRight, BrainCircuit } from 'lucide-react';
import type { Investigation, AnalystStatus } from './InvestigationStore';

interface InvestigationHistoryListProps {
  investigations: Investigation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const severityConfig: Record<string, { color: string; icon: any }> = {
  HIGH: { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertOctagon },
  MEDIUM: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: AlertTriangle },
  LOW: { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle },
};

const statusConfig: Record<AnalystStatus, { color: string; label: string }> = {
  PENDING: { color: 'bg-gray-100 text-gray-600', label: 'Pending' },
  ACCEPTED: { color: 'bg-green-100 text-green-700', label: 'Accepted' },
  REJECTED: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
};

export function InvestigationHistoryList({
  investigations,
  selectedId,
  onSelect,
  onTogglePin,
}: InvestigationHistoryListProps) {
  if (investigations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white rounded-xl border border-gray-200 border-dashed">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No investigations yet</h3>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          Click <span className="font-bold text-blue-600">Investigate ✨</span> on an anomaly in the Monitor tab to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {investigations.map((inv) => {
        const severity = severityConfig[inv.severity] || severityConfig.MEDIUM;
        const SeverityIcon = severity.icon;
        const isSelected = selectedId === inv.anomalyId;

        return (
          <div
            key={inv.anomalyId}
            onClick={() => onSelect(inv.anomalyId)}
            className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${severity.color}`}>
                  <SeverityIcon className="w-3 h-3 mr-1" />
                  {inv.severity}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusConfig[inv.analystStatus].color}`}>
                  {statusConfig[inv.analystStatus].label}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(inv.anomalyId);
                }}
                className={`p-1 rounded-full transition-colors ${
                  inv.pinned ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                <Star className={`w-4 h-4 ${inv.pinned ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="mb-2">
              <h4 className="text-sm font-bold text-gray-900">{inv.desk}</h4>
              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                <BrainCircuit className="w-3 h-3 mr-1 text-blue-400" />
                {new Date(inv.date).toLocaleDateString()} • {new Date(inv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
              {inv.reason}
            </p>

            {inv.analystComment && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-start">
                <div className="w-0.5 h-full bg-blue-200 mr-2 rounded-full self-stretch"></div>
                <p className="text-xs text-gray-500 italic line-clamp-1">
                  "{inv.analystComment}"
                </p>
              </div>
            )}

            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 transition-opacity ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'}`}>
               <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
