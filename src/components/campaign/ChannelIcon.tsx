import { MessageSquare, Phone, MessageCircle, Globe, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelIconProps {
  channel: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const channelConfig: Record<string, { icon: typeof MessageSquare; label: string; color: string }> = {
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-blue-600 bg-blue-100' },
  ivr_outbound: { icon: Phone, label: 'Voice/IVR', color: 'text-green-600 bg-green-100' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp', color: 'text-emerald-600 bg-emerald-100' },
  web_platform: { icon: Globe, label: 'Web', color: 'text-purple-600 bg-purple-100' },
  multi: { icon: Layers, label: 'Multi-Channel', color: 'text-orange-600 bg-orange-100' },
};

export function ChannelIcon({ channel, size = 'md', showLabel = false, className }: ChannelIconProps) {
  const config = channelConfig[channel] || channelConfig.sms;
  const Icon = config.icon;

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  if (showLabel) {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <div className={cn('rounded-lg', containerSizes[size], config.color)}>
          <Icon className={sizes[size]} />
        </div>
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg', containerSizes[size], config.color, className)}>
      <Icon className={sizes[size]} />
    </div>
  );
}
