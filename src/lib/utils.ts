import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { JobState } from './types';

// Merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mask phone number for privacy: +233201234567 → +233***4567
export function maskPhoneNumber(phone: string): string {
  return phone.replace(/(\+\d{3})(\d+)(\d{4})/, '$1***$3');
}

// Format phone number for display: +233201234567 → +233 20 123 4567
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('233') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

// Format date to human-readable string
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

// Format date to relative time (e.g., "2 hours ago")
export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
}

// Format date for display in tables
export function formatTableDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

// Status colors for job states
export const statusColors: Record<JobState, string> = {
  [JobState.CREATED]: 'bg-gray-200 text-gray-800',
  [JobState.CLASSIFYING]: 'bg-blue-200 text-blue-800',
  [JobState.GENERATING_CONTENT]: 'bg-blue-300 text-blue-900',
  [JobState.VERIFYING_CLAIMS]: 'bg-yellow-200 text-yellow-800',
  [JobState.TRANSLATING]: 'bg-purple-200 text-purple-800',
  [JobState.GENERATING_AUDIO]: 'bg-indigo-200 text-indigo-800',
  [JobState.PENDING_REVIEW]: 'bg-amber-200 text-amber-800',
  [JobState.APPROVED]: 'bg-green-200 text-green-800',
  [JobState.DELIVERING]: 'bg-cyan-200 text-cyan-800',
  [JobState.COMPLETED]: 'bg-green-300 text-green-900',
  [JobState.FAILED]: 'bg-red-200 text-red-800',
  [JobState.CANCELLED]: 'bg-gray-300 text-gray-700',
};

// Human-readable status names
export const statusLabels: Record<JobState, string> = {
  [JobState.CREATED]: 'Created',
  [JobState.CLASSIFYING]: 'Classifying',
  [JobState.GENERATING_CONTENT]: 'Generating Content',
  [JobState.VERIFYING_CLAIMS]: 'Verifying Claims',
  [JobState.TRANSLATING]: 'Translating',
  [JobState.GENERATING_AUDIO]: 'Generating Audio',
  [JobState.PENDING_REVIEW]: 'Pending Review',
  [JobState.APPROVED]: 'Approved',
  [JobState.DELIVERING]: 'Delivering',
  [JobState.COMPLETED]: 'Completed',
  [JobState.FAILED]: 'Failed',
  [JobState.CANCELLED]: 'Cancelled',
};

// Channel icons and labels
export const channelInfo: Record<string, { label: string; icon: string }> = {
  sms: { label: 'SMS', icon: 'MessageSquare' },
  ivr_outbound: { label: 'Voice/IVR', icon: 'Phone' },
  whatsapp: { label: 'WhatsApp', icon: 'MessageCircle' },
  web_platform: { label: 'Web', icon: 'Globe' },
  multi: { label: 'Multi-Channel', icon: 'Layers' },
};

// Language labels
export const languageLabels: Record<string, string> = {
  en: 'English',
  tw: 'Twi',
  ga: 'Ga',
};

// Calculate delivery stats
export function calculateDeliveryStats(deliveryStatus: Array<{ status: string }>) {
  const total = deliveryStatus.length;
  const sent = deliveryStatus.filter((d) => d.status === 'sent').length;
  const delivered = deliveryStatus.filter((d) => d.status === 'delivered').length;
  const failed = deliveryStatus.filter((d) => d.status === 'failed').length;
  const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return { total, sent, delivered, failed, successRate };
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate phone number (Ghana format)
export function isValidGhanaPhone(phone: string): boolean {
  // Accepts: +233XXXXXXXXX or 0XXXXXXXXX
  const pattern = /^(\+233|0)\d{9}$/;
  return pattern.test(phone.replace(/\s/g, ''));
}

// Convert local phone to international format
export function toInternationalPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('0')) {
    return '+233' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('+')) {
    return '+233' + cleaned;
  }
  return cleaned;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Parse CSV content
export function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%';
}

// Format number with commas
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

// Check if job is in progress
export function isJobInProgress(state: JobState): boolean {
  const inProgressStates: JobState[] = [
    JobState.CREATED,
    JobState.CLASSIFYING,
    JobState.GENERATING_CONTENT,
    JobState.VERIFYING_CLAIMS,
    JobState.TRANSLATING,
    JobState.GENERATING_AUDIO,
    JobState.DELIVERING,
  ];
  return inProgressStates.includes(state);
}

// Check if job needs approval
export function needsApproval(state: JobState): boolean {
  return state === JobState.PENDING_REVIEW;
}

// Get progress percentage based on state
export function getProgressPercentage(state: JobState): number {
  const stateOrder: JobState[] = [
    JobState.CREATED,
    JobState.CLASSIFYING,
    JobState.GENERATING_CONTENT,
    JobState.VERIFYING_CLAIMS,
    JobState.TRANSLATING,
    JobState.GENERATING_AUDIO,
    JobState.PENDING_REVIEW,
    JobState.APPROVED,
    JobState.DELIVERING,
    JobState.COMPLETED,
  ];

  const index = stateOrder.indexOf(state);
  if (index === -1) return 0;
  if (state === JobState.FAILED || state === JobState.CANCELLED) return 100;
  return Math.round((index / (stateOrder.length - 1)) * 100);
}
