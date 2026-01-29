import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useCampaigns } from '@/lib/queries';
import { type JobResponse, JobState } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, Select } from '@/components/ui';

const COLORS = ['#0066CC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const dateRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: typeof TrendingUp;
}

function MetricCard({ title, value, change }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-end justify-between mt-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function Analytics() {
  const [dateRange, setDateRange] = useState('30d');
  const { data: campaignsData, isLoading } = useCampaigns(0, 1000);

  // Process data for charts
  const analyticsData = useMemo(() => {
    if (!campaignsData?.jobs) {
      return {
        channelData: [],
        languageData: [],
        statusData: [],
        timelineData: [],
        topDiseases: [],
        metrics: {
          totalCampaigns: 0,
          totalDelivered: 0,
          successRate: 0,
          avgDeliveryRate: 0,
        },
      };
    }

    const jobs = campaignsData.jobs;

    // Channel distribution
    const channelCounts: Record<string, number> = {};
    const channelDelivered: Record<string, number> = {};
    jobs.forEach((job: JobResponse) => {
      channelCounts[job.channel_type] = (channelCounts[job.channel_type] || 0) + 1;
      const delivered = job.delivery_status.filter((d) => d.status === 'delivered').length;
      channelDelivered[job.channel_type] = (channelDelivered[job.channel_type] || 0) + delivered;
    });

    const channelLabels: Record<string, string> = {
      sms: 'SMS',
      ivr_outbound: 'Voice/IVR',
      whatsapp: 'WhatsApp',
      web_platform: 'Web',
      multi: 'Multi-Channel',
    };

    const channelData = Object.entries(channelCounts).map(([channel, count]) => ({
      name: channelLabels[channel] || channel,
      campaigns: count,
      delivered: channelDelivered[channel] || 0,
    }));

    // Language distribution
    const languageCounts: Record<string, number> = {};
    jobs.forEach((job: JobResponse) => {
      languageCounts[job.language] = (languageCounts[job.language] || 0) + 1;
    });

    const languageLabels: Record<string, string> = {
      en: 'English',
      tw: 'Twi',
      ga: 'Ga',
    };

    const languageData = Object.entries(languageCounts).map(([lang, count]) => ({
      name: languageLabels[lang] || lang,
      value: count,
    }));

    // Status distribution
    const statusCounts: Record<string, number> = {};
    jobs.forEach((job: JobResponse) => {
      statusCounts[job.state] = (statusCounts[job.state] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      [JobState.COMPLETED]: 'Completed',
      [JobState.FAILED]: 'Failed',
      [JobState.DELIVERING]: 'Delivering',
      [JobState.PENDING_REVIEW]: 'Pending Review',
      [JobState.APPROVED]: 'Approved',
    };

    const statusData = Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
      }))
      .slice(0, 5);

    // Timeline data (last 30 days)
    const timelineData: Array<{ date: string; campaigns: number; delivered: number }> = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayJobs = jobs.filter((job: JobResponse) => job.created_at.startsWith(dateStr));
      const dayDelivered = dayJobs.reduce(
        (sum: number, job: JobResponse) =>
          sum + job.delivery_status.filter((d) => d.status === 'delivered').length,
        0
      );

      timelineData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        campaigns: dayJobs.length,
        delivered: dayDelivered,
      });
    }

    // Top diseases
    const diseaseCounts: Record<string, number> = {};
    jobs.forEach((job: JobResponse) => {
      diseaseCounts[job.disease_name] = (diseaseCounts[job.disease_name] || 0) + 1;
    });

    const topDiseases = Object.entries(diseaseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Metrics
    const totalDelivered = jobs.reduce(
      (sum: number, job: JobResponse) =>
        sum + job.delivery_status.filter((d) => d.status === 'delivered').length,
      0
    );
    const totalRecipients = jobs.reduce(
      (sum: number, job: JobResponse) => sum + job.delivery_status.length,
      0
    );
    const successRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;

    const completedJobs = jobs.filter((job: JobResponse) => job.state === JobState.COMPLETED);
    const avgDeliveryRate =
      completedJobs.length > 0
        ? Math.round(
            completedJobs.reduce((sum: number, job: JobResponse) => {
              const delivered = job.delivery_status.filter((d) => d.status === 'delivered').length;
              const total = job.delivery_status.length;
              return sum + (total > 0 ? delivered / total : 0);
            }, 0) /
              completedJobs.length *
              100
          )
        : 0;

    return {
      channelData,
      languageData,
      statusData,
      timelineData,
      topDiseases,
      metrics: {
        totalCampaigns: jobs.length,
        totalDelivered,
        successRate,
        avgDeliveryRate,
      },
    };
  }, [campaignsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Campaign performance metrics and delivery insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Campaigns" value={analyticsData.metrics.totalCampaigns} change={12} />
        <MetricCard
          title="Messages Delivered"
          value={analyticsData.metrics.totalDelivered.toLocaleString()}
          change={8}
        />
        <MetricCard title="Success Rate" value={`${analyticsData.metrics.successRate}%`} change={3} />
        <MetricCard
          title="Avg. Delivery Rate"
          value={`${analyticsData.metrics.avgDeliveryRate}%`}
          change={-2}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="campaigns"
                  stroke="#0066CC"
                  strokeWidth={2}
                  dot={false}
                  name="Campaigns"
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  name="Delivered"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="campaigns" fill="#0066CC" name="Campaigns" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="#10B981" name="Delivered" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.languageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Status */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Health Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Top Health Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topDiseases.map((disease, index) => (
                <div key={disease.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{disease.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{disease.count} campaigns</span>
                </div>
              ))}
              {analyticsData.topDiseases.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
