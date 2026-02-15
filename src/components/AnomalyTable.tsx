import { useState, useMemo } from 'react';
import { Search, Download, AlertCircle, Sparkles, Copy, Filter } from 'lucide-react';
import type { Anomaly, SeverityLevel } from '../types/pnl';

interface AnomalyTableProps {
  anomalies: Anomaly[];
  onExplain: (anomalyId: string) => void;
  onCopySummary?: (message: string) => void;
}

const severityStyles: Record<SeverityLevel, string> = {
  HIGH: 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-600/10',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border border-yellow-200 ring-1 ring-yellow-600/10',
  LOW: 'bg-green-50 text-green-700 border border-green-200 ring-1 ring-green-600/10',
};

export function AnomalyTable({ anomalies: rawAnomalies, onExplain, onCopySummary }: AnomalyTableProps) {
  const anomalies = Array.isArray(rawAnomalies) ? rawAnomalies : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'ALL'>(
    'ALL'
  );

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((anomaly) => {
      const matchesSearch = anomaly.desk
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSeverity =
        severityFilter === 'ALL' || anomaly.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [anomalies, searchTerm, severityFilter]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Desk', 'Deviation', 'Severity'];
    const rows = filteredAnomalies.map((a) => [
      a.date,
      a.desk,
      a.deviation.toFixed(2),
      a.severity,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pnlguard_anomalies_export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDeviation = (deviation: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(deviation);
  };

  const handleCopyReportSummary = async () => {
    if (filteredAnomalies.length === 0) return;

    // Find anomaly with highest deviation
    const highestDeviationAnomaly = filteredAnomalies.reduce((prev, current) =>
      Math.abs(current.deviation) > Math.abs(prev.deviation) ? current : prev
    );

    const formattedDeviation = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Math.abs(highestDeviationAnomaly.deviation));

    // Format like $510K if possible, otherwise full number
    const shortDeviation = Math.abs(highestDeviationAnomaly.deviation) >= 1000
      ? `$${(Math.abs(highestDeviationAnomaly.deviation) / 1000).toFixed(0)}K`
      : formattedDeviation;

    const summary = `PnLGuard AI detected ${filteredAnomalies.length} anomalies. Highest deviation: ${shortDeviation} (${highestDeviationAnomaly.desk}).`;

    try {
      await navigator.clipboard.writeText(summary);
      if (onCopySummary) {
        onCopySummary('Report summary copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy summary', error);
    }
  };

  if (anomalies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No anomalies detected yet
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Upload PnL data and calculate anomalies to begin monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
             <h2 className="text-lg font-bold text-gray-900">
              Detected Anomalies
            </h2>
            <p className="text-sm text-gray-500">
              Review and investigate financial irregularities
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyReportSummary}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Copy className="w-4 h-4 mr-2 text-gray-500" />
              Copy Summary
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by desk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as SeverityLevel | 'ALL')
              }
              className="pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-shadow cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Desk
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Deviation
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAnomalies.map((anomaly) => (
              <tr
                key={anomaly.id}
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(anomaly.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {anomaly.desk}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-mono font-medium">
                  {formatDeviation(anomaly.deviation)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      severityStyles[anomaly.severity]
                    }`}
                  >
                    {anomaly.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onExplain(anomaly.id)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-all shadow-sm hover:shadow group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                  >
                    Investigate
                    <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAnomalies.length === 0 && anomalies.length > 0 && (
        <div className="p-12 text-center text-gray-500">
          <p className="text-sm">No anomalies match your filters</p>
        </div>
      )}
    </div>
  );
}
