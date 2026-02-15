import { useEffect, useState } from 'react';
import { X, Copy, FileJson, Loader2, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { pnlApi } from '../api/pnl';
import type { ExplanationResponse, SeverityLevel } from '../types/pnl';

interface ExplainDrawerProps {
  anomalyId: string | null;
  onClose: () => void;
  onError: (message: string) => void;
  onCopySuccess: (message: string) => void;
  explanationCache: Map<string, ExplanationResponse>;
  setExplanationCache: (
    cache: Map<string, ExplanationResponse>
  ) => void;
}

const severityConfig: Record<SeverityLevel, { color: string; icon: any; label: string }> = {
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

export function ExplainDrawer({
  anomalyId,
  onClose,
  onError,
  onCopySuccess,
  explanationCache,
  setExplanationCache,
}: ExplainDrawerProps) {
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (anomalyId) {
      setIsOpen(true);
      loadExplanation(anomalyId);
    } else {
      setIsOpen(false);
      setExplanation(null);
    }
  }, [anomalyId]);

  const loadExplanation = async (id: string) => {
    // Check cache first
    const cached = explanationCache.get(id);
    if (cached) {
      setExplanation(cached);
      return;
    }

    setIsLoading(true);
    try {
      const response = await pnlApi.explainAnomaly(id);
      setExplanation(response);

      // Update cache
      const newCache = new Map(explanationCache);
      newCache.set(id, response);
      setExplanationCache(newCache);
    } catch (error) {
      onError('Failed to fetch explanation');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyExplanation = async () => {
    if (!explanation) return;
    const text = `Reason: ${explanation.reason}\n\nSeverity: ${explanation.severity}\n\nSuggested Action: ${explanation.suggestedAction}`;
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess('Explanation copied to clipboard');
    } catch (error) {
      onError('Failed to copy to clipboard');
    }
  };

  const handleCopyJSON = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(explanation, null, 2));
      onCopySuccess('JSON copied to clipboard');
    } catch (error) {
      onError('Failed to copy JSON');
    }
  };

  // Close handler with animation delay if needed
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Match transition duration
  };

  if (!anomalyId && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Anomaly Investigation</h2>
              <p className="text-sm text-gray-500 mt-1">AI-powered analysis</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ) : explanation ? (
              <div className="space-y-8">
                {/* Severity Badge */}
                <div className={`flex items-center p-4 rounded-xl border ${severityConfig[explanation.severity].color}`}>
                  {(() => {
                    const Icon = severityConfig[explanation.severity].icon;
                    return <Icon className="w-6 h-6 mr-3" />;
                  })()}
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider opacity-90">Severity Level</p>
                    <p className="font-semibold text-lg">{severityConfig[explanation.severity].label}</p>
                  </div>
                </div>

                {/* Reason Section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Root Cause Analysis
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-gray-700 leading-relaxed">
                    {explanation.reason}
                  </div>
                </div>

                {/* Action Section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Recommended Action
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-blue-900 leading-relaxed">
                    {explanation.suggestedAction}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          {explanation && !isLoading && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCopyExplanation}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </button>
                <button
                  onClick={handleCopyJSON}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Copy JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
