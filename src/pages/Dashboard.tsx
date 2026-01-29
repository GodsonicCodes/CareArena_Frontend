import { Link } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  Users,
  CheckCircle,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useDashboardMetrics, useCampaigns, useHealth } from '@/lib/queries';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CampaignCard } from '@/components/campaign';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: typeof Activity;
  trend?: { value: number; isPositive: boolean };
  color: string;
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { metrics, isLoading: metricsLoading, isError: metricsError } = useDashboardMetrics();
  const { data: campaignsData, isLoading: campaignsLoading, isError: campaignsError, refetch } = useCampaigns(0, 5);
  const { data: healthData, isError: healthError } = useHealth();

  const isLoading = metricsLoading || campaignsLoading;
  const hasError = metricsError || campaignsError;

  // Determine API status
  const apiStatus = healthData?.status === 'healthy' ? 'operational' : healthError ? 'error' : 'unknown';

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your patient education campaigns and delivery performance.
          </p>
        </div>
        <Link to="/campaigns/create">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Connection Error Alert */}
      {hasError && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">Connection Issue</p>
            <p className="text-sm text-amber-700 mt-1">
              Unable to connect to the API server. Some features may be unavailable.
              Please check if the backend server is running.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Campaigns"
          value={isLoading ? '-' : metrics.totalCampaigns}
          icon={Activity}
          color="bg-primary-100 text-primary-600"
        />
        <MetricCard
          title="Active Campaigns"
          value={isLoading ? '-' : metrics.activeCampaigns}
          icon={TrendingUp}
          color="bg-amber-100 text-amber-600"
        />
        <MetricCard
          title="Messages Delivered"
          value={isLoading ? '-' : metrics.totalDelivered.toLocaleString()}
          icon={Users}
          color="bg-green-100 text-green-600"
        />
        <MetricCard
          title="Success Rate"
          value={isLoading ? '-' : `${metrics.successRate}%`}
          icon={CheckCircle}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          to="/campaigns/create"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white hover:from-primary-700 hover:to-primary-800 transition-all"
        >
          <div className="p-3 bg-white/20 rounded-lg">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Create New Campaign</h3>
            <p className="text-sm text-primary-100">Start a patient education campaign</p>
          </div>
        </Link>

        <Link
          to="/testing"
          className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
        >
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Test Delivery Channels</h3>
            <p className="text-sm text-gray-500">SMS, Voice, WhatsApp testing</p>
          </div>
        </Link>

        <Link
          to="/analytics"
          className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
        >
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-500">Performance insights & reports</p>
          </div>
        </Link>
      </div>

      {/* Recent campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Campaigns</CardTitle>
          <Link
            to="/campaigns"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : campaignsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Unable to load campaigns</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm">
                Could not connect to the server. Please check your connection.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : campaignsData?.jobs?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No campaigns yet</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm">
                Get started by creating your first patient education campaign.
              </p>
              <Link to="/campaigns/create" className="mt-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaignsData?.jobs?.slice(0, 6).map((campaign) => (
                <CampaignCard key={campaign.job_id} campaign={campaign} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus === 'operational' ? 'bg-green-500 animate-pulse' :
                apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900">API Server</p>
                <p className="text-xs text-gray-500">
                  {apiStatus === 'operational' ? 'Operational' :
                   apiStatus === 'error' ? 'Connection Error' : 'Checking...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">SMS Gateway</p>
                <p className="text-xs text-gray-500">mNotify Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">Voice Service</p>
                <p className="text-xs text-gray-500">Twilio Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">AI Engine</p>
                <p className="text-xs text-gray-500">Claude Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
