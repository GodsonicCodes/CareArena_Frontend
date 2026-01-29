import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useCampaignsList } from '@/lib/queries';
import { JobState, type JobResponse } from '@/lib/types';
import { formatTableDate, languageLabels, copyToClipboard, calculateDeliveryStats } from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  useToast,
} from '@/components/ui';
import { StatusBadge, ChannelIcon } from '@/components/campaign';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: JobState.CREATED, label: 'Created' },
  { value: JobState.PENDING_REVIEW, label: 'Pending Review' },
  { value: JobState.APPROVED, label: 'Approved' },
  { value: JobState.DELIVERING, label: 'Delivering' },
  { value: JobState.COMPLETED, label: 'Completed' },
  { value: JobState.FAILED, label: 'Failed' },
];

const channelOptions = [
  { value: 'all', label: 'All Channels' },
  { value: 'sms', label: 'SMS' },
  { value: 'ivr_outbound', label: 'Voice/IVR' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'web_platform', label: 'Web Platform' },
];

const languageOptions = [
  { value: 'all', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'tw', label: 'Twi' },
  { value: 'ga', label: 'Ga' },
];

export function CampaignsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  const { data, isLoading, totalPages } = useCampaignsList(page, 20);

  // Filter campaigns
  const filteredCampaigns = data?.jobs?.filter((campaign: JobResponse) => {
    const matchesSearch =
      !searchQuery ||
      campaign.disease_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.job_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || campaign.state === statusFilter;
    const matchesChannel = channelFilter === 'all' || campaign.channel_type === channelFilter;
    const matchesLanguage = languageFilter === 'all' || campaign.language === languageFilter;

    return matchesSearch && matchesStatus && matchesChannel && matchesLanguage;
  });

  const handleCopyJobId = async (jobId: string) => {
    const success = await copyToClipboard(jobId);
    if (success) {
      addToast({ type: 'success', title: 'Copied!', description: 'Job ID copied to clipboard' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all your patient education campaigns.
          </p>
        </div>
        <Link to="/campaigns/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by disease name or job ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap gap-3">
              <div className="w-40">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
              <div className="w-40">
                <Select
                  options={channelOptions}
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                />
              </div>
              <div className="w-36">
                <Select
                  options={languageOptions}
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                />
              </div>
              <Button variant="outline" size="md">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading
              ? 'Loading...'
              : `${filteredCampaigns?.length || 0} Campaigns`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : filteredCampaigns?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm">
                {searchQuery || statusFilter !== 'all' || channelFilter !== 'all'
                  ? 'Try adjusting your filters to find what you are looking for.'
                  : 'Get started by creating your first campaign.'}
              </p>
              {!searchQuery && statusFilter === 'all' && channelFilter === 'all' && (
                <Link to="/campaigns/create" className="mt-4">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Disease/Topic</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns?.map((campaign: JobResponse) => {
                    const stats = calculateDeliveryStats(campaign.delivery_status);
                    return (
                      <TableRow key={campaign.job_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {campaign.job_id.slice(0, 8)}...
                            </code>
                            <button
                              onClick={() => handleCopyJobId(campaign.job_id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900">{campaign.disease_name}</span>
                        </TableCell>
                        <TableCell>
                          <ChannelIcon channel={campaign.channel_type} size="sm" showLabel />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {languageLabels[campaign.language] || campaign.language}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge state={campaign.state} showDot />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatTableDate(campaign.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {stats.total > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${stats.successRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {stats.delivered}/{stats.total}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/campaigns/${campaign.job_id}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
