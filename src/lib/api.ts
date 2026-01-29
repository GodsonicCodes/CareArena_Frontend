import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  JobPayload,
  JobCreateResponse,
  JobResponse,
  JobsListResponse,
  ApprovalRequest,
  SendSMSRequest,
  SendSMSResponse,
  MakeIVRCallRequest,
  MakeIVRCallResponse,
  BulkVoiceRequest,
  BulkVoiceResponse,
  WhatsAppTestRequest,
  WhatsAppTestResponse,
  LocalVoiceRequest,
  LocalVoiceResponse,
  HealthResponse,
  RootResponse,
} from './types';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://carearena-mai-3svi.onrender.com';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

// Create axios instance
const createApiClient = (apiKey: string): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    timeout: 30000,
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        console.error('Invalid API key');
      } else if (error.response?.status === 403) {
        console.error('Admin access required');
      } else if (error.response?.status === 404) {
        console.error('Resource not found');
      } else if (error.response?.status === 429) {
        console.error('Rate limit exceeded');
      } else if (error.response?.status && error.response.status >= 500) {
        console.error('Server error');
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Default API client
const apiClient = createApiClient(API_KEY);

// Admin API client
const adminApiClient = createApiClient(ADMIN_API_KEY);

// ========== HEALTH & ROOT ==========
export const getRoot = async (): Promise<RootResponse> => {
  const response = await apiClient.get<RootResponse>('/');
  return response.data;
};

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

// ========== CAMPAIGNS ==========
export const createCampaign = async (payload: JobPayload): Promise<JobCreateResponse> => {
  const response = await apiClient.post<JobCreateResponse>('/jobs/create', payload);
  return response.data;
};

export const getCampaign = async (jobId: string): Promise<JobResponse> => {
  const response = await apiClient.get<JobResponse>(`/jobs/${jobId}/status`);
  return response.data;
};

export const getCampaigns = async (skip = 0, limit = 20): Promise<JobsListResponse> => {
  const response = await apiClient.get<JobsListResponse>('/jobs', {
    params: { skip, limit },
  });
  return response.data;
};

export const approveCampaign = async (
  jobId: string,
  approval: ApprovalRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await adminApiClient.post(`/admin/approve/${jobId}`, approval);
  return response.data;
};

// ========== TESTING ENDPOINTS ==========
export const sendTestSMS = async (request: SendSMSRequest): Promise<SendSMSResponse> => {
  const response = await apiClient.post<SendSMSResponse>('/test/send-sms', request);
  return response.data;
};

export const makeTestIVRCall = async (request: MakeIVRCallRequest): Promise<MakeIVRCallResponse> => {
  const response = await apiClient.post<MakeIVRCallResponse>('/test/make-ivr-call', request);
  return response.data;
};

export const sendBulkVoice = async (request: BulkVoiceRequest): Promise<BulkVoiceResponse> => {
  const response = await apiClient.post<BulkVoiceResponse>('/test/bulk-voice', request);
  return response.data;
};

export const sendTestWhatsApp = async (request: WhatsAppTestRequest): Promise<WhatsAppTestResponse> => {
  const response = await apiClient.post<WhatsAppTestResponse>('/test/whatsapp', request);
  return response.data;
};

// ========== BULK CAMPAIGN ENDPOINTS ==========
export const createBulkVoiceCampaign = async (
  request: BulkVoiceRequest & { disease_name: string; language: string; campaign_goals?: string }
): Promise<BulkVoiceResponse & { job_id?: string; audio_urls?: string[] }> => {
  const response = await apiClient.post('/campaigns/bulk-voice', request);
  return response.data;
};

export const createLocalVoiceCampaign = async (
  request: LocalVoiceRequest
): Promise<LocalVoiceResponse> => {
  const response = await apiClient.post<LocalVoiceResponse>('/campaigns/local-voice', request);
  return response.data;
};

// ========== ELEVENLABS ENDPOINTS ==========
export const createElevenLabsAgent = async (request: {
  agent_name: string;
  first_message: string;
  system_prompt: string;
  language?: string;
}): Promise<{ success: boolean; agent_id?: string; agent_url?: string }> => {
  const response = await apiClient.post('/elevenlabs/agents/create', request);
  return response.data;
};

export const makeOutboundCall = async (request: {
  phone_number: string;
  agent_id?: string;
}): Promise<{ success: boolean; call_id?: string; status?: string }> => {
  const response = await apiClient.post('/elevenlabs/calls/outbound', request);
  return response.data;
};

export const makeBulkOutboundCalls = async (request: {
  recipients: string[];
  agent_id?: string;
  delay_between_calls_seconds?: number;
}): Promise<{ success: boolean; total_calls: number; initiated_calls: number }> => {
  const response = await apiClient.post('/elevenlabs/calls/bulk-outbound', request);
  return response.data;
};

// ========== UTILITY FUNCTIONS ==========

// Check if API is configured
export const isApiConfigured = (): boolean => {
  return !!API_KEY && API_KEY !== 'your-api-key-here';
};

// Check if admin API is configured
export const isAdminConfigured = (): boolean => {
  return !!ADMIN_API_KEY && ADMIN_API_KEY !== 'your-admin-api-key-here';
};

// Get API base URL
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

// Get WebSocket URL
export const getWebSocketUrl = (): string => {
  return import.meta.env.VITE_WS_BASE_URL || 'wss://carearena-mai-3svi.onrender.com';
};

export { apiClient, adminApiClient };
