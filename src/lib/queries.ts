import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoot,
  getHealth,
  createCampaign,
  getCampaign,
  getCampaigns,
  approveCampaign,
  sendTestSMS,
  makeTestIVRCall,
  sendBulkVoice,
  sendTestWhatsApp,
  createLocalVoiceCampaign,
} from './api';
import type {
  JobPayload,
  ApprovalRequest,
  SendSMSRequest,
  MakeIVRCallRequest,
  BulkVoiceRequest,
  WhatsAppTestRequest,
  LocalVoiceRequest,
  JobState,
} from './types';

// Query keys
export const queryKeys = {
  root: ['root'] as const,
  health: ['health'] as const,
  campaigns: ['campaigns'] as const,
  campaign: (id: string) => ['campaign', id] as const,
  campaignsList: (skip: number, limit: number) => ['campaigns', 'list', skip, limit] as const,
};

// ========== ROOT & HEALTH ==========
export function useRoot() {
  return useQuery({
    queryKey: queryKeys.root,
    queryFn: getRoot,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: getHealth,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ========== CAMPAIGNS ==========
export function useCampaign(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.campaign(jobId),
    queryFn: () => getCampaign(jobId),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;

      // Poll every 2s if job is actively processing
      const activeStates: JobState[] = [
        'delivering' as JobState,
        'generating_content' as JobState,
        'verifying_claims' as JobState,
        'translating' as JobState,
        'generating_audio' as JobState,
        'classifying' as JobState,
      ];
      if (activeStates.includes(data.state)) {
        return 2000;
      }

      // Poll every 5s if pending review
      if (data.state === 'pending_review') {
        return 5000;
      }

      // Stop polling if completed/failed/cancelled
      return false;
    },
  });
}

export function useCampaigns(skip = 0, limit = 20) {
  return useQuery({
    queryKey: queryKeys.campaignsList(skip, limit),
    queryFn: () => getCampaigns(skip, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JobPayload) => createCampaign(payload),
    onSuccess: () => {
      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
  });
}

export function useApproveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, approval }: { jobId: string; approval: ApprovalRequest }) =>
      approveCampaign(jobId, approval),
    onSuccess: (_, variables) => {
      // Invalidate specific campaign and list
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
  });
}

// ========== TESTING ==========
export function useSendTestSMS() {
  return useMutation({
    mutationFn: (request: SendSMSRequest) => sendTestSMS(request),
  });
}

export function useMakeTestIVRCall() {
  return useMutation({
    mutationFn: (request: MakeIVRCallRequest) => makeTestIVRCall(request),
  });
}

export function useSendBulkVoice() {
  return useMutation({
    mutationFn: (request: BulkVoiceRequest) => sendBulkVoice(request),
  });
}

export function useSendTestWhatsApp() {
  return useMutation({
    mutationFn: (request: WhatsAppTestRequest) => sendTestWhatsApp(request),
  });
}

export function useCreateLocalVoiceCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LocalVoiceRequest) => createLocalVoiceCampaign(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
  });
}

// ========== CUSTOM HOOKS ==========

// Hook for campaign with auto-refetch based on status
export function useCampaignWithPolling(jobId: string) {
  const query = useCampaign(jobId);
  const queryClient = useQueryClient();

  // Prefetch next state data
  const prefetchCampaign = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.campaign(jobId),
      queryFn: () => getCampaign(jobId),
    });
  };

  return {
    ...query,
    prefetchCampaign,
  };
}

// Hook for campaigns list with pagination
export function useCampaignsList(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const query = useCampaigns(skip, pageSize);

  return {
    ...query,
    page,
    pageSize,
    totalPages: query.data ? Math.ceil(query.data.total / pageSize) : 0,
  };
}

// Hook for dashboard metrics
export function useDashboardMetrics() {
  const { data: campaigns, isLoading } = useCampaigns(0, 100);

  const metrics = {
    totalCampaigns: campaigns?.total || 0,
    activeCampaigns: campaigns?.jobs?.filter(
      (job) =>
        job.state === 'delivering' ||
        job.state === 'pending_review' ||
        job.state === 'generating_content'
    ).length || 0,
    completedCampaigns: campaigns?.jobs?.filter((job) => job.state === 'completed').length || 0,
    failedCampaigns: campaigns?.jobs?.filter((job) => job.state === 'failed').length || 0,
    totalDelivered: campaigns?.jobs?.reduce(
      (sum, job) => sum + job.delivery_status.filter((d) => d.status === 'delivered').length,
      0
    ) || 0,
    totalRecipients: campaigns?.jobs?.reduce(
      (sum, job) => sum + job.delivery_status.length,
      0
    ) || 0,
  };

  const successRate =
    metrics.totalRecipients > 0
      ? Math.round((metrics.totalDelivered / metrics.totalRecipients) * 100)
      : 0;

  return {
    isLoading,
    metrics: {
      ...metrics,
      successRate,
    },
  };
}
