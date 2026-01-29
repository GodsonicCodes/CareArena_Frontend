import { useState } from 'react';
import {
  Key,
  Bell,
  Settings as SettingsIcon,
  Globe,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { isApiConfigured, isAdminConfigured, getApiBaseUrl } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useToast,
} from '@/components/ui';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'tw', label: 'Twi' },
  { value: 'ga', label: 'Ga' },
];

const timezoneOptions = [
  { value: 'Africa/Accra', label: 'Ghana (GMT+0)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT+0/+1)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
];

export function Settings() {
  const { addToast } = useToast();

  // API Keys state
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  // Notification settings
  const [emailOnCreated, setEmailOnCreated] = useState(true);
  const [emailOnPending, setEmailOnPending] = useState(true);
  const [emailOnCompleted, setEmailOnCompleted] = useState(true);
  const [emailOnFailed, setEmailOnFailed] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Channel settings
  const [smsSenderId, setSmsSenderId] = useState('CareArena');
  const [smsMaxLength, setSmsMaxLength] = useState(160);
  const [voiceProvider, setVoiceProvider] = useState('elevenlabs');

  // Preferences
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [defaultDryRun, setDefaultDryRun] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [timezone, setTimezone] = useState('Africa/Accra');

  const handleCopyApiKey = async () => {
    const apiKey = import.meta.env.VITE_API_KEY || '';
    const success = await copyToClipboard(apiKey);
    if (success) {
      addToast({ type: 'success', title: 'Copied!', description: 'API key copied to clipboard' });
    }
  };

  const handleSaveNotifications = () => {
    addToast({
      type: 'success',
      title: 'Settings saved',
      description: 'Notification settings have been updated.',
    });
  };

  const handleSaveChannel = () => {
    addToast({
      type: 'success',
      title: 'Settings saved',
      description: 'Channel settings have been updated.',
    });
  };

  const handleSavePreferences = () => {
    addToast({
      type: 'success',
      title: 'Settings saved',
      description: 'Preferences have been updated.',
    });
  };

  const apiKey = import.meta.env.VITE_API_KEY || '';
  const adminKey = import.meta.env.VITE_ADMIN_API_KEY || '';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your API keys, notifications, and application preferences.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="api">
        <TabsList>
          <TabsTrigger value="api">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="channels">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api">
          <div className="space-y-6">
            {/* API Status */}
            <Card>
              <CardHeader>
                <CardTitle>API Configuration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isApiConfigured() ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">API Key</p>
                        <p className="text-sm text-gray-500">Used for all API requests</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isApiConfigured() ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isApiConfigured() ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isAdminConfigured() ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">Admin API Key</p>
                        <p className="text-sm text-gray-500">Required for approval actions</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isAdminConfigured() ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {isAdminConfigured() ? 'Configured' : 'Optional'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Key */}
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                  Your API key is used to authenticate requests to the CareArena API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey || 'Not configured - add to .env file'}
                        readOnly
                        className="pr-20 font-mono"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={handleCopyApiKey}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    API keys are stored in environment variables. Edit your <code>.env</code> file to
                    update.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Admin Key */}
            <Card>
              <CardHeader>
                <CardTitle>Admin API Key</CardTitle>
                <CardDescription>
                  Required for approving/rejecting campaigns and other admin actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type={showAdminKey ? 'text' : 'password'}
                        value={adminKey || 'Not configured'}
                        readOnly
                        className="pr-20 font-mono"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => setShowAdminKey(!showAdminKey)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showAdminKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle>API Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Input value={getApiBaseUrl()} readOnly className="font-mono" />
                  <a
                    href={`${getApiBaseUrl()}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API Docs
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when you want to receive email notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Campaign created', value: emailOnCreated, setter: setEmailOnCreated },
                  {
                    label: 'Campaign pending approval',
                    value: emailOnPending,
                    setter: setEmailOnPending,
                  },
                  { label: 'Campaign completed', value: emailOnCompleted, setter: setEmailOnCompleted },
                  { label: 'Delivery failures', value: emailOnFailed, setter: setEmailOnFailed },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.value}
                      onClick={() => item.setter(!item.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.value ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                ))}

                <div className="pt-4 border-t">
                  <Input
                    label="Webhook URL (optional)"
                    placeholder="https://your-server.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    hint="Receive real-time notifications via webhook"
                  />
                </div>

                <Button onClick={handleSaveNotifications} className="mt-4">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels">
          <div className="space-y-6">
            {/* SMS Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SMS Settings</CardTitle>
                <CardDescription>Configure SMS delivery options via mNotify.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Sender ID"
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    hint="Displayed as the sender name"
                  />
                  <Input
                    label="Max Message Length"
                    type="number"
                    value={smsMaxLength}
                    onChange={(e) => setSmsMaxLength(parseInt(e.target.value))}
                    hint="Characters per SMS segment"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voice Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Settings</CardTitle>
                <CardDescription>Configure voice call and TTS options.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Voice Provider"
                    options={[
                      { value: 'elevenlabs', label: 'ElevenLabs' },
                      { value: 'ghana_nlp', label: 'Ghana NLP' },
                    ]}
                    value={voiceProvider}
                    onChange={(e) => setVoiceProvider(e.target.value)}
                  />
                  <Input
                    label="Max Retry Attempts"
                    type="number"
                    defaultValue={3}
                    hint="For failed calls"
                  />
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Settings */}
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Settings</CardTitle>
                <CardDescription>WhatsApp integration via Chatbots Africa.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">Webhook Connected</p>
                    <p className="text-sm text-green-600">Receiving messages from WhatsApp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveChannel}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Channel Settings
            </Button>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Set default values for campaign creation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Default Language"
                    options={languageOptions}
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                  />
                  <Select
                    label="Time Zone"
                    options={timezoneOptions}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Default Dry Run Mode</span>
                      <p className="text-xs text-gray-500">Generate content without sending messages</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={defaultDryRun}
                      onClick={() => setDefaultDryRun(!defaultDryRun)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        defaultDryRun ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          defaultDryRun ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Require Human Approval
                      </span>
                      <p className="text-xs text-gray-500">Review content before delivery</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={requireApproval}
                      onClick={() => setRequireApproval(!requireApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        requireApproval ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          requireApproval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                <Button onClick={handleSavePreferences} className="mt-4">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
