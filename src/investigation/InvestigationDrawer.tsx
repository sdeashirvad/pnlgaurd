import { useEffect, useState } from 'react';
import { X, Copy, FileJson, Loader2, AlertTriangle, CheckCircle, AlertOctagon, Check, XCircle, BrainCircuit, Save } from 'lucide-react';
import type { Investigation, AnalystStatus } from './InvestigationStore';
import type { SeverityLevel } from '../types/pnl';

interface InvestigationDrawerProps {
  investigation: Investigation | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: AnalystStatus) => void;
  onCommentChange: (comment: string) => void;
  onCopySuccess: (message: string) => void;
  onError: (message: string) => void;
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

const statusConfig: Record<AnalystStatus, { color: string; label: string }> = {
  PENDING: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Pending Review' },
  ACCEPTED: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Accepted' },
  REJECTED: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
};

export function InvestigationDrawer({
  investigation,
  isLoading,
  isOpen,
  onClose,
  onStatusChange,
  onCommentChange,
  onCopySuccess,
  onError,
}: InvestigationDrawerProps) {
  const [localComment, setLocalComment] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (investigation) {
      setLocalComment(investigation.analystComment || '');
      setHasChanges(false);
    }
  }, [investigation]);

  const handleCopyExplanation = async () => {
    if (!investigation) return;
    const text = `Reason: ${investigation.reason}\n\nSeverity: ${investigation.severity}\n\nSuggested Action: ${investigation.suggestedAction}`;
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess('Explanation copied to clipboard');
    } catch (error) {
      onError('Failed to copy to clipboard');
    }
  };

  const handleCopyJSON = async () => {
    if (!investigation) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(investigation, null, 2));
      onCopySuccess('JSON copied to clipboard');
    } catch (error) {
      onError('Failed to copy JSON');
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalComment(e.target.value);
    setHasChanges(true);
  };

  const handleStatusChange = (status: AnalystStatus) => {
    onStatusChange(status);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (investigation) {
      onCommentChange(localComment);
      onCopySuccess('Investigation saved successfully');
      setHasChanges(false);
    }
  };

  // Close handler with animation delay if needed
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

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
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Anomaly Investigation</h2>
                <p className="text-sm text-gray-500">AI-powered analysis & Analyst Review</p>
              </div>
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
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-100 rounded-lg w-1/3"></div>
                <div className="h-32 bg-gray-100 rounded-xl"></div>
                <div className="h-8 bg-gray-100 rounded-lg w-1/4"></div>
                <div className="h-24 bg-gray-100 rounded-xl"></div>
              </div>
            ) : investigation ? (
              <div className="space-y-8">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                   <div className={`flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig[investigation.analystStatus].color}`}>
                      {statusConfig[investigation.analystStatus].label}
                   </div>
                   <div className="text-xs text-gray-400 font-medium">
                      {new Date(investigation.timestamp).toLocaleString()}
                   </div>
                </div>

                {/* Severity Badge */}
                <div className={`flex items-center p-4 rounded-xl border ${severityConfig[investigation.severity]?.color || severityConfig.MEDIUM.color}`}>
                  {(() => {
                    const config = severityConfig[investigation.severity] || severityConfig.MEDIUM;
                    const Icon = config.icon;
                    return <Icon className="w-6 h-6 mr-3" />;
                  })()}
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider opacity-80 mb-0.5">Severity Level</p>
                    <p className="font-bold text-lg">{severityConfig[investigation.severity]?.label || 'Unknown Severity'}</p>
                  </div>
                </div>

                {/* Reason Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Root Cause Analysis
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-gray-700 leading-relaxed shadow-sm">
                    {investigation.reason}
                  </div>
                </div>

                {/* Action Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Recommended Action
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-blue-900 leading-relaxed shadow-sm">
                    {investigation.suggestedAction}
                  </div>
                </div>

                {/* Analyst Decision Section */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Analyst Decision
                  </h3>

                  <div className="flex space-x-3 mb-4">
                    <button
                      onClick={() => handleStatusChange('ACCEPTED')}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border transition-all font-medium ${
                        investigation.analystStatus === 'ACCEPTED'
                          ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-[1.02]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-200'
                      }`}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange('REJECTED')}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border transition-all font-medium ${
                        investigation.analystStatus === 'REJECTED'
                          ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-[1.02]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:border-red-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>

                  <textarea
                    value={localComment}
                    onChange={handleCommentChange}
                    placeholder="Add analyst notes..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-h-[120px] resize-none transition-shadow shadow-sm"
                  />

                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`w-full mt-4 flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      hasChanges
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Investigation
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          {investigation && !isLoading && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCopyExplanation}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </button>
                <button
                  onClick={handleCopyJSON}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
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
