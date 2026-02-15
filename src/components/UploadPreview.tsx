import { Calendar, Database, Layers } from 'lucide-react';
import type { UploadResponse } from '../types/pnl';

interface UploadPreviewProps {
  data: UploadResponse;
}

export function UploadPreview({ data }: UploadPreviewProps) {
  // Guard clause for missing data
  if (!data) return null;

  // Safe access for dateRange with fallback
  const dateRange = data.dateRange || { min: 'N/A', max: 'N/A' };
  const minDate = dateRange.min || 'N/A';
  const maxDate = dateRange.max || 'N/A';

  // Safe access for preview array
  const previewRows = Array.isArray(data.preview) ? data.preview : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upload Preview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 flex items-center space-x-3 border border-blue-100">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Records Inserted</p>
            <p className="text-lg font-bold text-gray-900">
              {(data.recordsInserted || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 flex items-center space-x-3 border border-purple-100">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Date Range</p>
            <p className="text-sm font-bold text-gray-900">
              {minDate} - {maxDate}
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 flex items-center space-x-3 border border-green-100">
          <div className="p-2 bg-green-100 rounded-lg">
            <Layers className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Unique Desks</p>
            <p className="text-lg font-bold text-gray-900">
              {(data.uniqueDesks || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Desk
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                PnL Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewRows.length > 0 ? (
              previewRows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.desk}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium text-gray-900">
                    {typeof row.pnl === 'number'
                      ? row.pnl.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })
                      : row.pnl}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  No preview data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
