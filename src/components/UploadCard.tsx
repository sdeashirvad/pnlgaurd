import { useState, useRef } from 'react';
import { Upload, FileText, Calculator, X, Check, ArrowRight } from 'lucide-react';
import { pnlApi } from '../api/pnl';
import type { UploadResponse, PnlRecord } from '../types/pnl';

interface UploadCardProps {
  onUploadSuccess: (data: UploadResponse) => void;
  onCalculateSuccess: (anomaliesCreated: number) => void;
  onError: (message: string) => void;
}

export function UploadCard({
  onUploadSuccess,
  onCalculateSuccess,
  onError,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PnlRecord[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      handleFileSelection(files[0]);
    } else {
      onError('Please upload a valid CSV file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setFileName(file.name);
    setSelectedFile(file);
    parseCSV(file);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');

      if (lines.length < 2) {
        onError('CSV file is empty or missing headers');
        setFileName(null);
        setSelectedFile(null);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      // Map expected fields to CSV columns
      const fieldMap: Record<string, number> = {
        date: headers.indexOf('date'),
        desk: headers.indexOf('desk'),
        product: headers.indexOf('product'),
        pnl: headers.indexOf('pnl_amount')
      };

      // Check if all required columns exist
      const missingColumns = Object.entries(fieldMap)
        .filter(([_, index]) => index === -1)
        .map(([key]) => key === 'pnl' ? 'pnl_amount' : key);

      if (missingColumns.length > 0) {
        onError(`Invalid CSV format. Missing columns: ${missingColumns.join(', ')}`);
        setFileName(null);
        setSelectedFile(null);
        return;
      }

      const preview: PnlRecord[] = [];
      // Parse first 5 rows for preview
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length === headers.length) {
          const date = currentLine[fieldMap.date]?.trim();
          const desk = currentLine[fieldMap.desk]?.trim();
          const product = currentLine[fieldMap.product]?.trim();
          const pnlStr = currentLine[fieldMap.pnl]?.trim();
          const pnl = parseFloat(pnlStr);

          preview.push({
            date,
            desk,
            product,
            pnl
          });
        }
      }
      setPreviewData(preview);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const confirmUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await pnlApi.uploadCSV(selectedFile);
      onUploadSuccess(response);
      setShowPreview(false);
      setFileName(null);
      setSelectedFile(null);
    } catch (error) {
      onError('Failed to upload CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setShowPreview(false);
    setFileName(null);
    setSelectedFile(null);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCalculateAnomalies = async () => {
    setIsCalculating(true);

    try {
      const response = await pnlApi.calculateAnomalies();
      onCalculateSuccess(response.anomaliesCreated);
    } catch (error) {
      onError('Failed to calculate anomalies');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 relative h-full flex flex-col">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Data Ingestion
        </h2>

        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
        >
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
            <Upload
              className={`w-6 h-6 ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
          </div>

          {fileName ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 inline-flex shadow-sm">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{fileName}</span>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mb-4">
                CSV files only (max 10MB)
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || showPreview}
            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Browse Files'}
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Analysis Actions
        </h3>

        <button
          onClick={handleCalculateAnomalies}
          disabled={isCalculating}
          className="w-full group inline-flex items-center justify-between px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="flex items-center">
            <Calculator className="w-4 h-4 mr-2 text-purple-100" />
            {isCalculating ? 'Processing...' : 'Run Anomaly Detection'}
          </span>
          {!isCalculating && (
            <ArrowRight className="w-4 h-4 text-purple-100 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
      </div>

      {/* Premium Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={cancelUpload}
            ></div>

            {/* Centering trick */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-100">

              {/* Header */}
              <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                    Confirm Data Upload
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review the data from <span className="font-medium text-blue-600">{fileName}</span>
                  </p>
                </div>
                <button
                  onClick={cancelUpload}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 bg-gray-50/50">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Desk</th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">PnL Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.desk}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.product}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                              {typeof row.pnl === 'number' ? row.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : row.pnl}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-4 text-xs text-center text-gray-500">
                  Showing first 5 rows of the dataset. Total rows will be processed upon confirmation.
                </p>
              </div>

              {/* Footer */}
              <div className="bg-white px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmUpload}
                  disabled={isUploading}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
