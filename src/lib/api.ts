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

// API Configuration
// Always use /api prefix - Render will proxy to backend, avoiding CORS
const API_BASE_URL = '/api';

const API_KEY = import.meta.env.VITE_API_KEY || '';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

// Create axios instance with CORS handling
const createApiClient = (apiKey: string): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'X-API-Key': apiKey }),
    },
    timeout: 60000, // 60 seconds for voice calls
    withCredentials: false, // Don't send credentials for cross-origin requests
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        console.error('Network error - possible CORS issue');
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

// ========== ERROR HANDLING ==========
export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Check for network/CORS errors first
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Unable to connect to the server. This may be a CORS issue or the server is unavailable.';
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { detail?: string; message?: string };
      const detail = data?.detail || data?.message;

      switch (status) {
        case 400:
          return `Invalid request: ${detail || 'Bad request'}`;
        case 401:
          return 'Invalid API key. Please check your credentials in Settings.';
        case 403:
          return 'Access forbidden. Admin key required for this action.';
        case 404:
          return 'Resource not found.';
        case 422:
          return `Validation error: ${detail || 'Invalid data provided'}`;
        case 429:
          return 'Rate limit exceeded. Please try again later.';
        case 500:
          return `Server error: ${detail || 'Please try again later.'}`;
        case 502:
        case 503:
        case 504:
          return 'Server is temporarily unavailable. Please try again in a moment.';
        default:
          return detail || `Error ${status}: Something went wrong.`;
      }
    } else if (error.request) {
      // Request was made but no response received
      return 'No response from server. Please check your connection and try again.';
    }
  }
  return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
};

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

/**
 * Send SMS via mNotify
 * @param request - recipient (phone number) and message
 */
export const sendTestSMS = async (request: SendSMSRequest): Promise<SendSMSResponse> => {
  const response = await apiClient.post<SendSMSResponse>('/test/send-sms', request);
  return response.data;
};

/**
 * Make IVR Call with AI agent (Twilio + ElevenLabs)
 * @param request - phone_number, disease_name, patient_name, language, campaign_goals
 */
export const makeTestIVRCall = async (request: MakeIVRCallRequest): Promise<MakeIVRCallResponse> => {
  const response = await apiClient.post<MakeIVRCallResponse>('/test/make-ivr-call', request);
  return response.data;
};

/**
 * Send bulk voice calls in English (mNotify + ElevenLabs TTS)
 * @param request - recipients (array of phone numbers), message, campaign_name
 */
export const sendBulkVoice = async (request: BulkVoiceRequest): Promise<BulkVoiceResponse> => {
  const response = await apiClient.post<BulkVoiceResponse>('/test/bulk-voice', request);
  return response.data;
};

/**
 * Send WhatsApp message
 * @param request - recipient and message
 */
export const sendTestWhatsApp = async (request: WhatsAppTestRequest): Promise<WhatsAppTestResponse> => {
  const response = await apiClient.post<WhatsAppTestResponse>('/test/whatsapp', request);
  return response.data;
};

// ========== CAMPAIGN ENDPOINTS ==========

/**
 * Create local language voice campaign (mNotify + Ghana NLP)
 * Translates English message to local language and sends voice calls
 * @param request - recipients, message, campaign_name, target_language, etc.
 */
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

// Format phone number to Ghana format
export const formatPhoneNumber = (phone: string): string => {
  let formatted = phone.trim().replace(/\s/g, '');

  // Remove any existing + prefix to normalize
  if (formatted.startsWith('+')) {
    formatted = formatted.substring(1);
  }

  // If starts with 0, convert to 233
  if (formatted.startsWith('0')) {
    formatted = '233' + formatted.substring(1);
  }

  // If doesn't start with 233, add it
  if (!formatted.startsWith('233')) {
    formatted = '233' + formatted;
  }

  // Add + prefix
  return '+' + formatted;
};

export { apiClient, adminApiClient };
