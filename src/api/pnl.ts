import { apiClient } from './client';
import type {
  Anomaly,
  UploadResponse,
  CalculateResponse,
  ExplanationResponse,
  ExplainRequest,
} from '../types/pnl';

export const pnlApi = {
  health: async (): Promise<void> => {
    await apiClient.get('/api/health');
  },

  uploadCSV: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>(
      '/api/pnl/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  calculateAnomalies: async (): Promise<CalculateResponse> => {
    const response = await apiClient.post<CalculateResponse>(
      '/api/pnl/anomalies/calculate'
    );
    return response.data;
  },

  listAnomalies: async (): Promise<Anomaly[]> => {
    const response = await apiClient.get<Anomaly[]>('/api/pnl/anomalies');
    return response.data;
  },

  explainAnomaly: async (
    anomalyId: string
  ): Promise<ExplanationResponse> => {
    const request: ExplainRequest = { anomalyId };
    const response = await apiClient.post<ExplanationResponse>(
      '/api/pnl/anomalies/explain',
      request
    );
    return response.data;
  },
};
