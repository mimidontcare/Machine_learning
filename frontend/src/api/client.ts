import type {
  DatasetInfoResponse,
  ModelSummary,
  ModelComparisonItem,
  ModelMetricsResponse,
  PredictRequest,
  PredictResponse,
  ModelName,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `API request error: ${response.status} ${response.statusText}`;
        try {
          const jsonError = JSON.parse(errorText);
          if (jsonError.detail) message = jsonError.detail;
        } catch {
          if (errorText) message = errorText;
        }
        throw new Error(message);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      console.error(`Error requesting ${url}:`, err);
      throw err;
    }
  }

  async checkHealth(): Promise<{ status: string; loaded_models: string[]; models_count: number }> {
    return this.request('/api/health');
  }

  async getDatasetInfo(): Promise<DatasetInfoResponse> {
    return this.request<DatasetInfoResponse>('/api/dataset/info');
  }

  async getModels(): Promise<ModelSummary[]> {
    return this.request<ModelSummary[]>('/api/models');
  }

  async getModelComparison(): Promise<ModelComparisonItem[]> {
    return this.request<ModelComparisonItem[]>('/api/models/comparison');
  }

  async getModelMetrics(modelName: ModelName): Promise<ModelMetricsResponse> {
    return this.request<ModelMetricsResponse>(`/api/models/${modelName}/metrics`);
  }

  async predict(data: PredictRequest): Promise<PredictResponse> {
    return this.request<PredictResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
