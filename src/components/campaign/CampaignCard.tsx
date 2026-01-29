import { Link } from 'react-router-dom';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { type JobResponse } from '@/lib/types';
import { formatRelativeTime, languageLabels, calculateDeliveryStats } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { ChannelIcon } from './ChannelIcon';

interface CampaignCardProps {
  campaign: JobResponse;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const deliveryStats = calculateDeliveryStats(campaign.delivery_status);

  return (
    <Link
      to={`/campaigns/${campaign.job_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <ChannelIcon channel={campaign.channel_type} size="md" />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{campaign.disease_name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className="truncate">{languageLabels[campaign.language] || campaign.language}</span>
              <span>•</span>
              <span className="font-mono text-xs">{campaign.job_id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
        <StatusBadge state={campaign.state} showDot />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeTime(campaign.created_at)}</span>
          </div>
          {deliveryStats.total > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{deliveryStats.delivered}/{deliveryStats.total}</span>
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Progress bar for active campaigns */}
      {deliveryStats.total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Delivery Progress</span>
            <span>{deliveryStats.successRate}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${deliveryStats.successRate}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
