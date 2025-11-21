import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Domain,
  Model,
  ModelRanking,
  Battle,
  Evaluation,
  User,
  Organization,
  EvaluationFormData,
  ModelStats,
  EloHistory,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.delete(url, config);
  }

  // Domains
  async getDomains(): Promise<ApiResponse<Domain[]>> {
    return this.get('/domains');
  }

  async getDomain(idOrSlug: string): Promise<ApiResponse<Domain>> {
    return this.get(`/domains/${idOrSlug}`);
  }

  // Models
  async getModels(params?: { domainId?: string }): Promise<ApiResponse<Model[]>> {
    return this.get('/models', { params });
  }

  async getModel(idOrSlug: string): Promise<ApiResponse<Model>> {
    return this.get(`/models/${idOrSlug}`);
  }

  async getModelStats(modelId: string, domainId?: string): Promise<ApiResponse<ModelStats>> {
    return this.get(`/models/${modelId}/stats`, { params: { domainId } });
  }

  async getModelEloHistory(modelId: string, domainId: string): Promise<ApiResponse<EloHistory>> {
    return this.get(`/models/${modelId}/elo-history`, { params: { domainId } });
  }

  // Rankings
  async getRankings(
    domainId: string,
    params?: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: any;
    }
  ): Promise<ApiResponse<PaginatedResponse<ModelRanking>>> {
    return this.get(`/domains/${domainId}/rankings`, { params });
  }

  // Battles
  async getBattle(battleId: string): Promise<ApiResponse<Battle>> {
    return this.get(`/battles/${battleId}`);
  }

  async getBattles(params?: {
    evaluationId?: string;
    modelId?: string;
    domainId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Battle>>> {
    return this.get('/battles', { params });
  }

  async submitBattleVote(
    battleId: string,
    data: {
      vote: 'A' | 'B' | 'Tie';
      reasoning: string;
      criteria: Record<string, boolean>;
    }
  ): Promise<ApiResponse<Battle>> {
    return this.post(`/battles/${battleId}/vote`, data);
  }

  // Evaluations
  async createEvaluation(data: EvaluationFormData): Promise<ApiResponse<Evaluation>> {
    return this.post('/evaluations', data);
  }

  async getEvaluation(evaluationId: string): Promise<ApiResponse<Evaluation>> {
    return this.get(`/evaluations/${evaluationId}`);
  }

  async getEvaluations(params?: {
    organizationId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Evaluation>>> {
    return this.get('/evaluations', { params });
  }

  async deleteEvaluation(evaluationId: string): Promise<ApiResponse<void>> {
    return this.delete(`/evaluations/${evaluationId}`);
  }

  async getEvaluationResults(evaluationId: string): Promise<ApiResponse<Evaluation>> {
    return this.get(`/evaluations/${evaluationId}/results`);
  }

  // Arena
  async getNextBattle(evaluationId: string): Promise<ApiResponse<Battle>> {
    return this.get(`/evaluations/${evaluationId}/next-battle`);
  }

  async getArenaStandings(evaluationId: string): Promise<ApiResponse<any>> {
    return this.get(`/evaluations/${evaluationId}/standings`);
  }

  // Blockchain
  async verifyBattle(battleId: string): Promise<ApiResponse<any>> {
    return this.post(`/battles/${battleId}/verify`);
  }

  async getBattleVerification(battleId: string): Promise<ApiResponse<any>> {
    return this.get(`/battles/${battleId}/verification`);
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.post('/auth/login', { email, password });
  }

  async signup(data: { name: string; email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.post('/auth/signup', data);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.post('/auth/logout');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get('/auth/me');
  }

  // Organization
  async getOrganization(organizationId: string): Promise<ApiResponse<Organization>> {
    return this.get(`/organizations/${organizationId}`);
  }

  async updateOrganization(organizationId: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return this.put(`/organizations/${organizationId}`, data);
  }

  async getOrganizationUsage(organizationId: string): Promise<ApiResponse<any>> {
    return this.get(`/organizations/${organizationId}/usage`);
  }

  // Export
  async exportResults(evaluationId: string, format: 'pdf' | 'csv' | 'json'): Promise<any> {
    const response = await this.client.get(`/evaluations/${evaluationId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  // Search
  async search(query: string, type?: 'models' | 'domains' | 'all'): Promise<ApiResponse<any>> {
    return this.get('/search', { params: { q: query, type } });
  }
}

export const api = new ApiClient();
export default api;

