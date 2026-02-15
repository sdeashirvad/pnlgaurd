import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { UploadCard } from '../components/UploadCard';
import { AnomalyTable } from '../components/AnomalyTable';
import { InvestigationDrawer } from '../investigation/InvestigationDrawer';
import { InvestigationWorkspace } from '../investigation/InvestigationWorkspace';
import { useInvestigationStore } from '../investigation/InvestigationStore';
import { Toast, ToastType } from '../components/Toast';
import { Tabs } from '../components/Tabs';
import { KPICards } from '../components/KPICards';
import { pnlApi } from '../api/pnl';
import type { Anomaly, UploadResponse } from '../types/pnl';
import { FileText, Activity, BrainCircuit, CheckCircle, Github, ExternalLink, Download } from 'lucide-react';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(
    null
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  // Investigation Store
  const {
    getInvestigation,
    startInvestigation,
    updateInvestigationStatus,
    updateInvestigationComment,
    isLoading: isInvestigationLoading,
    error: investigationError,
  } = useInvestigationStore();

  // KPI States
  const [recordsUploaded, setRecordsUploaded] = useState(0);
  const [lastCalculationRun, setLastCalculationRun] = useState<string | null>(
    null
  );

  const showToast = (message: string, type: ToastType) => {
    const id = toastIdCounter;
    setToastIdCounter((prev) => prev + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadAnomalies = async () => {
    try {
      const data = await pnlApi.listAnomalies();
      setAnomalies(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load anomalies', 'error');
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  useEffect(() => {
    if (investigationError) {
      showToast(investigationError, 'error');
    }
  }, [investigationError]);

  const handleUploadSuccess = (data: UploadResponse) => {
    setRecordsUploaded((prev) => prev + data.recordsInserted);
    showToast(`Successfully inserted ${data.recordsInserted} records`, 'success');
  };

  const handleCalculateSuccess = async (anomaliesCreated: number) => {
    setLastCalculationRun(new Date().toLocaleString());
    showToast(`Created ${anomaliesCreated} anomalies`, 'success');
    await loadAnomalies();
  };

  const handleError = (message: string) => {
    showToast(message, 'error');
  };

  const handleCopySuccess = (message: string) => {
    showToast(message, 'success');
  };

  const handleExplain = async (anomalyId: string) => {
    setSelectedAnomalyId(anomalyId);
    const anomaly = anomalies.find((a) => a.id === anomalyId);
    if (anomaly) {
      await startInvestigation(
        anomaly.id,
        anomaly.date,
        anomaly.desk,
        anomaly.deviation
      );
    }
  };

  const handleCloseDrawer = () => {
    setSelectedAnomalyId(null);
  };

  const tabs = [
    { id: 'monitor', label: 'Monitor' },
    { id: 'investigate', label: 'Investigate' },
    { id: 'about', label: 'About' },
  ];

  // Calculate Max Deviation from anomalies
  const maxDeviation = anomalies.reduce(
    (max, anomaly) => Math.max(max, Math.abs(anomaly.deviation)),
    0
  );

  const currentInvestigation = selectedAnomalyId
    ? getInvestigation(selectedAnomalyId) || null
    : null;

  const handleResumeDownload = () => {
    const link = document.createElement('a');
    link.href = '/Resume_Ashirvad_Kumar_Pandey.pdf';
    link.download = 'Resume_Ashirvad_Kumar_Pandey.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Financial Anomaly Monitor
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Upload PnL data, detect anomalies, and get AI-powered insights to mitigate financial risk.
          </p>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'monitor' && (
          <div className="animate-fade-in">
            <KPICards
              recordsUploaded={recordsUploaded}
              anomaliesDetected={anomalies.length}
              maxDeviation={maxDeviation}
              lastCalculationRun={lastCalculationRun}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                <UploadCard
                  onUploadSuccess={handleUploadSuccess}
                  onCalculateSuccess={handleCalculateSuccess}
                  onError={handleError}
                />
              </div>

              <div className="lg:col-span-2">
                <AnomalyTable
                  anomalies={anomalies}
                  onExplain={handleExplain}
                  onCopySummary={handleCopySuccess}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investigate' && (
          <div className="animate-fade-in">
            <InvestigationWorkspace onCopySuccess={handleCopySuccess} />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">About PnLGuard AI</h2>
                  <p className="text-gray-500">Enterprise-grade Financial Anomaly Detection Platform</p>
                </div>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                PnLGuard AI is an intelligent financial monitoring platform designed to detect unusual patterns in daily profit and loss data. By leveraging advanced statistical analysis and AI-powered explanations, it helps financial analysts identify, investigate, and mitigate potential risks in real-time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">CSV Ingestion & Monitoring</h3>
                  </div>
                  <p className="text-sm text-gray-600">Seamlessly upload large datasets and visualize PnL trends across multiple trading desks.</p>
                </div>

                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <Activity className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Automated Anomaly Detection</h3>
                  </div>
                  <p className="text-sm text-gray-600">Instantly flag deviations that exceed statistical thresholds to prevent financial loss.</p>
                </div>

                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <BrainCircuit className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Explanations</h3>
                  </div>
                  <p className="text-sm text-gray-600">Get instant root cause analysis and suggested actions generated by AI for every anomaly.</p>
                </div>

                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Analyst Workflow</h3>
                  </div>
                  <p className="text-sm text-gray-600">Review, accept, or reject findings with a complete audit trail and analyst notes.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <a
                  href="https://github.com/sdeashirvad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View GitHub Repo
                </a>
                <a
                  href="https://portfolio.ashirvad.work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Portfolio
                </a>
                <button
                  onClick={handleResumeDownload}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <InvestigationDrawer
        investigation={currentInvestigation}
        isLoading={isInvestigationLoading}
        isOpen={!!selectedAnomalyId}
        onClose={handleCloseDrawer}
        onStatusChange={(status) =>
          selectedAnomalyId && updateInvestigationStatus(selectedAnomalyId, status)
        }
        onCommentChange={(comment) =>
          selectedAnomalyId && updateInvestigationComment(selectedAnomalyId, comment)
        }
        onCopySuccess={handleCopySuccess}
        onError={handleError}
      />

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
