// ========== CONSTANTS ==========
export const ChannelType = {
  SMS: 'sms',
  IVR_OUTBOUND: 'ivr_outbound',
  WHATSAPP: 'whatsapp',
  WEB_PLATFORM: 'web_platform',
} as const;

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const JobState = {
  CREATED: 'created',
  CLASSIFYING: 'classifying',
  GENERATING_CONTENT: 'generating_content',
  VERIFYING_CLAIMS: 'verifying_claims',
  TRANSLATING: 'translating',
  GENERATING_AUDIO: 'generating_audio',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type JobState = (typeof JobState)[keyof typeof JobState];

export const Language = {
  ENGLISH: 'en',
  TWI: 'tw',
  GA: 'ga',
} as const;

export type Language = (typeof Language)[keyof typeof Language];

// ========== CAMPAIGN METADATA ==========
export interface CampaignMetadata {
  preferred_time: string; // HH:MM format
  frequency: string; // once, daily, weekly, monthly
  owner_email: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string; // ISO datetime
  dry_run: boolean;
  target_audience?: string;
  campaign_goals?: string;
  channels?: string[]; // For multi-channel campaigns
}

// ========== REFERENCE & VERIFICATION ==========
export interface Reference {
  doc_id: string;
  snippet_index: number;
  snippet_text: string;
  confidence: number; // 0.0 to 1.0
}

export interface ClaimVerification {
  claim: string;
  verified: boolean;
  references: Reference[];
  notes?: string;
}

// ========== CHANNEL CONTENT ==========
export interface ChannelConstraints {
  max_chars?: number;
  tone: string;
  media_types: string[];
  call_flow_template?: string;
  requires_opt_in: boolean;
}

export interface IVRScriptNode {
  node_id: string;
  audio_url?: string;
  prompt_text: string;
  expected_intents: string[];
  dtmf_options: Record<string, string>; // e.g., {"1": "repeat", "2": "next"}
  fallback_action: string;
  next_node_id?: string;
}

export interface ChannelPayload {
  channel_type: ChannelType;
  language: Language;
  title: string;
  body: string;
  bullets: string[];
  references: Reference[];
  audio_urls: string[];
  ivr_script_nodes: IVRScriptNode[];
  media_urls: string[];
  requires_human_review: boolean;
  review_notes?: string;
  constraints: ChannelConstraints;
  emergency_disclaimer?: string;
}

// ========== DELIVERY STATUS ==========
export interface DeliveryStatus {
  recipient_id: string;
  phone_number: string; // Display as masked: +233***1234
  status: string; // sent, delivered, failed
  provider_message_id?: string;
  delivered_at?: string; // ISO datetime
  error_message?: string;
}

// ========== JOB PAYLOAD (Create Campaign) ==========
export interface JobPayload {
  disease_name: string;
  channel_type: string; // sms | ivr_outbound | whatsapp | web_platform | multi
  language: Language;
  patient_database_url?: string; // CSV/Excel file path or URL
  supporting_docs: string[]; // Document URLs or file uploads
  campaign_metadata: CampaignMetadata;
  additional_instructions?: string;
}

// ========== JOB RESPONSE (Campaign Status) ==========
export interface JobResponse {
  job_id: string;
  state: JobState;
  disease_name: string;
  channel_type: string;
  language: Language;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  channel_payloads: Record<string, ChannelPayload>; // Key: language code
  claim_verifications: ClaimVerification[];
  requires_human_review: boolean;
  approved: boolean;
  approval_link?: string;
  delivery_status: DeliveryStatus[];
  error_message?: string;
  langsmith_run_url?: string; // Link to AI trace logs
  artifacts: Record<string, unknown>;
}

// ========== API RESPONSES ==========
export interface JobCreateResponse {
  job_id: string;
  status: string;
  message: string;
  dry_run: boolean;
}

export interface ApprovalRequest {
  approved: boolean;
  approved_by: string; // Email
  notes?: string;
}

export interface JobsListResponse {
  jobs: JobResponse[];
  total: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
}

export interface RootResponse {
  service: string;
  version: string;
  status: string;
  docs_url: string;
  health_check: string;
}

// ========== TEST ENDPOINTS ==========
export interface SendSMSRequest {
  recipient: string; // Phone number
  message: string;
}

export interface SendSMSResponse {
  success: boolean;
  message_id?: string;
  provider_response?: unknown;
  error?: string;
}

export interface MakeIVRCallRequest {
  phone_number: string;
  disease_name: string;
  patient_name?: string;
  language?: Language;
  campaign_goals?: string;
}

export interface MakeIVRCallResponse {
  success: boolean;
  call_sid?: string;
  websocket_url?: string;
  error?: string;
}

export interface BulkVoiceRequest {
  recipients: Array<{
    phone_number: string;
    patient_name?: string;
  }>;
  audio_url: string;
  delay_between_calls_seconds?: number;
}

export interface BulkVoiceResponse {
  success: boolean;
  total_recipients: number;
  initiated_calls: number;
  error?: string;
}

export interface LocalVoiceRequest {
  recipients: Array<{
    phone_number: string;
    patient_name?: string;
  }>;
  disease_name: string;
  language: Language; // tw, ga only
  campaign_goals?: string;
  dry_run?: boolean;
}

export interface LocalVoiceResponse {
  success: boolean;
  job_id?: string;
  total_recipients: number;
  audio_urls?: string[];
  error?: string;
}

export interface WhatsAppTestRequest {
  recipient: string; // WhatsApp number
  message: string;
}

export interface WhatsAppTestResponse {
  success: boolean;
  message_id?: string;
  provider_response?: unknown;
  error?: string;
}

// ========== ElevenLabs ENDPOINTS ==========
export interface CreateAgentRequest {
  agent_name: string;
  first_message: string;
  system_prompt: string;
  language?: Language;
}

export interface CreateAgentResponse {
  success: boolean;
  agent_id?: string;
  agent_url?: string;
  error?: string;
}

export interface OutboundCallRequest {
  phone_number: string;
  agent_id?: string;
}

export interface OutboundCallResponse {
  success: boolean;
  call_id?: string;
  status?: string;
  error?: string;
}

export interface BulkOutboundCallRequest {
  recipients: string[];
  agent_id?: string;
  delay_between_calls_seconds?: number;
}

export interface BulkOutboundCallResponse {
  success: boolean;
  total_calls: number;
  initiated_calls: number;
  error?: string;
}

// ========== FORM TYPES ==========
export interface CampaignFormData {
  // Step 1: Basic Information
  disease_name: string;
  target_audience: string;
  campaign_goals: string;
  owner_email: string;

  // Step 2: Channel Selection
  channel_type: string;
  language: Language;

  // Step 3: Content & Documents
  additional_instructions: string;
  supporting_docs: File[];

  // Step 4: Recipient Data
  patient_database: File | null;
  manual_recipients: Array<{
    phone_number: string;
    patient_name?: string;
  }>;

  // Step 5: Delivery Settings
  preferred_time: string;
  frequency: string;
  dry_run: boolean;
  require_approval: boolean;
}

// ========== UI TYPES ==========
export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: string;
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface FilterOption {
  value: string;
  label: string;
}
