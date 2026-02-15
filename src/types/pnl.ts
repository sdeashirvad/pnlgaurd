export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Anomaly {
  id: string;
  date: string;
  desk: string;
  deviation: number;
  severity: SeverityLevel;
}

export interface PnlRecord {
  date: string;
  desk: string;
  product: string;
  pnl: number;
}

export interface UploadResponse {
  recordsInserted: number;
  preview: PnlRecord[];
  dateRange: { min: string; max: string };
  uniqueDesks: number;
}

export interface CalculateResponse {
  anomaliesCreated: number;
}

export interface ExplanationResponse {
  reason: string;
  severity: SeverityLevel;
  suggestedAction: string;
}

export interface ExplainRequest {
  anomalyId: string;
}
