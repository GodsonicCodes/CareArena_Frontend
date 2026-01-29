import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Play,
  Pause,
  Download,
  Check,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useCampaign, useApproveCampaign } from '@/lib/queries';
import { JobState, type DeliveryStatus as DeliveryStatusType } from '@/lib/types';
import {
  formatDate,
  formatRelativeTime,
  languageLabels,
  copyToClipboard,
  maskPhoneNumber,
  calculateDeliveryStats,
} from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Modal,
  Input,
  useToast,
} from '@/components/ui';
import { StatusBadge, ProgressTimeline, ChannelIcon } from '@/components/campaign';

export function CampaignDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const { addToast } = useToast();
  const approveCampaign = useApproveCampaign();

  const { data: campaign, isLoading, refetch } = useCampaign(jobId || '');

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalEmail, setApprovalEmail] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState(true);
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handleCopyJobId = async () => {
    if (jobId) {
      const success = await copyToClipboard(jobId);
      if (success) {
        addToast({ type: 'success', title: 'Copied!', description: 'Job ID copied to clipboard' });
      }
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!jobId || !approvalEmail) return;

    try {
      await approveCampaign.mutateAsync({
        jobId,
        approval: {
          approved,
          approved_by: approvalEmail,
          notes: approvalNotes || undefined,
        },
      });

      addToast({
        type: 'success',
        title: approved ? 'Campaign approved!' : 'Campaign rejected',
        description: approved
          ? 'The campaign will now start delivering messages.'
          : 'The campaign has been rejected.',
      });

      setShowApprovalModal(false);
      setApprovalEmail('');
      setApprovalNotes('');
    } catch {
      addToast({
        type: 'error',
        title: 'Action failed',
        description: 'Could not process approval. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Campaign not found</h2>
        <p className="text-sm text-gray-500 mt-1">The campaign you are looking for does not exist.</p>
        <Link to="/campaigns" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  const deliveryStats = calculateDeliveryStats(campaign.delivery_status);
  const filteredDelivery = campaign.delivery_status.filter(
    (d: DeliveryStatusType) => deliveryFilter === 'all' || d.status === deliveryFilter
  );

  const channelPayload = campaign.channel_payloads?.[campaign.language];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            to="/campaigns"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Campaigns
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.disease_name}</h1>
            <StatusBadge state={campaign.state} size="lg" showDot />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <code className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                {campaign.job_id}
              </code>
              <button onClick={handleCopyJobId} className="text-gray-400 hover:text-gray-600">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <span>Created {formatRelativeTime(campaign.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {campaign.state === JobState.PENDING_REVIEW && (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setIsApproving(false);
                  setShowApprovalModal(true);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsApproving(true);
                  setShowApprovalModal(true);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          {campaign.langsmith_run_url && (
            <a href={campaign.langsmith_run_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                AI Trace
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardContent className="py-6">
          <ProgressTimeline currentState={campaign.state} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Generated Content</TabsTrigger>
          <TabsTrigger value="verification">Claim Verification</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Status</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Channel</dt>
                    <dd className="mt-1">
                      <ChannelIcon channel={campaign.channel_type} showLabel />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Language</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {languageLabels[campaign.language] || campaign.language}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {formatDate(campaign.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Last Updated</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {formatDate(campaign.updated_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Approval Status</dt>
                    <dd className="mt-1">
                      <Badge variant={campaign.approved ? 'success' : 'warning'}>
                        {campaign.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Human Review Required</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {campaign.requires_human_review ? 'Yes' : 'No'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Delivery Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{deliveryStats.successRate}%</p>
                    <p className="text-sm text-gray-500">Success Rate</p>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${deliveryStats.successRate}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{deliveryStats.total}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</p>
                      <p className="text-xs text-gray-500">Delivered</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{deliveryStats.sent}</p>
                      <p className="text-xs text-gray-500">Sent</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{deliveryStats.failed}</p>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Generated Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content ({languageLabels[campaign.language]})</CardTitle>
            </CardHeader>
            <CardContent>
              {channelPayload ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
                    <p className="text-lg font-semibold text-gray-900">{channelPayload.title}</p>
                  </div>

                  {/* Body */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Message Body</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{channelPayload.body}</p>
                    </div>
                  </div>

                  {/* Bullets */}
                  {channelPayload.bullets?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Key Points</h3>
                      <ul className="space-y-2">
                        {channelPayload.bullets.map((bullet: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Emergency Disclaimer */}
                  {channelPayload.emergency_disclaimer && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-amber-800">Emergency Disclaimer</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            {channelPayload.emergency_disclaimer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio Files */}
                  {channelPayload.audio_urls?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Audio Files</h3>
                      <div className="space-y-2">
                        {channelPayload.audio_urls.map((url: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <button
                              onClick={() =>
                                setPlayingAudio(playingAudio === url ? null : url)
                              }
                              className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
                            >
                              {playingAudio === url ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Audio {index + 1}
                              </p>
                              <audio
                                src={url}
                                onEnded={() => setPlayingAudio(null)}
                                ref={(el) => {
                                  if (el && playingAudio === url) {
                                    el.play();
                                  } else if (el) {
                                    el.pause();
                                  }
                                }}
                              />
                            </div>
                            <a
                              href={url}
                              download
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No content generated yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claim Verification Tab */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Claim Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.claim_verifications?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">
                        {campaign.claim_verifications.filter((c: { verified: boolean }) => c.verified).length} Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium">
                        {campaign.claim_verifications.filter((c: { verified: boolean }) => !c.verified).length} Flagged
                      </span>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claim</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>References</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaign.claim_verifications.map((claim: { claim: string; verified: boolean; references: { doc_id: string }[]; notes?: string }, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="max-w-md">
                            <p className="text-sm text-gray-700">{claim.claim}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={claim.verified ? 'success' : 'error'}>
                              {claim.verified ? 'Verified' : 'Flagged'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {claim.references?.length > 0 ? (
                              <span className="text-sm text-gray-600">
                                {claim.references.length} reference(s)
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{claim.notes || '-'}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No claims verified yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Status Tab */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Delivery Status</CardTitle>
              <div className="flex items-center gap-2">
                {['all', 'sent', 'delivered', 'failed'].map((status) => (
                  <Button
                    key={status}
                    variant={deliveryFilter === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDeliveryFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredDelivery.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivered At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDelivery.map((delivery: DeliveryStatusType) => (
                      <TableRow key={delivery.recipient_id}>
                        <TableCell>
                          <code className="text-sm font-mono">
                            {maskPhoneNumber(delivery.phone_number)}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              delivery.status === 'delivered'
                                ? 'success'
                                : delivery.status === 'failed'
                                ? 'error'
                                : 'info'
                            }
                          >
                            {delivery.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {delivery.delivered_at ? formatDate(delivery.delivered_at) : '-'}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {delivery.error_message || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No delivery data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={isApproving ? 'Approve Campaign' : 'Reject Campaign'}
        description={
          isApproving
            ? 'This will start delivering messages to all recipients.'
            : 'This will prevent the campaign from being delivered.'
        }
      >
        <div className="space-y-4">
          <Input
            label="Your Email *"
            type="email"
            placeholder="your.email@healthcare.org"
            value={approvalEmail}
            onChange={(e) => setApprovalEmail(e.target.value)}
          />
          <Input
            label="Notes (optional)"
            placeholder="Any additional notes..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              variant={isApproving ? 'primary' : 'danger'}
              onClick={() => handleApproval(isApproving)}
              disabled={!approvalEmail}
              isLoading={approveCampaign.isPending}
            >
              {isApproving ? 'Approve' : 'Reject'} Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
