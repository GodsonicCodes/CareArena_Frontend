import { useState } from 'react';
import {
  MessageSquare,
  Phone,
  MessageCircle,
  Users,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Globe,
} from 'lucide-react';
import {
  sendTestSMS,
  makeTestIVRCall,
  sendTestWhatsApp,
  sendBulkVoice,
  createLocalVoiceCampaign,
  handleAPIError,
  formatPhoneNumber as formatPhone,
} from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Textarea,
  Select,
  useToast,
} from '@/components/ui';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'tw', label: 'Twi' },
  { value: 'ga', label: 'Ga' },
];

const localLanguageOptions = [
  { value: 'tw', label: 'Twi (Akan)' },
  { value: 'ee', label: 'Ewe' },
  { value: 'aka', label: 'Ga' },
  { value: 'dag', label: 'Dagbani' },
  { value: 'fat', label: 'Fante' },
];

const diseaseOptions = [
  { value: 'Malaria', label: 'Malaria Prevention' },
  { value: 'Diabetes', label: 'Diabetes Management' },
  { value: 'Hypertension', label: 'Hypertension Control' },
  { value: 'Pre-eclampsia', label: 'Pre-eclampsia' },
  { value: 'COVID-19', label: 'COVID-19 Prevention' },
  { value: 'HIV/AIDS', label: 'HIV/AIDS Awareness' },
  { value: 'Maternal Health', label: 'Maternal Health' },
  { value: 'Child Nutrition', label: 'Child Nutrition' },
];

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  audioUrl?: string;
}

function TestCard({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  description: string;
  icon: typeof MessageSquare;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ResultDisplay({ result }: { result: TestResult | null }) {
  if (!result) return null;

  return (
    <div
      className={`mt-4 p-4 rounded-lg ${
        result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {result.success ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
          {result.details && (
            <div className="mt-2 space-y-1">
              {Object.entries(result.details).map(([key, value]) => (
                <p key={key} className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  <strong>{key}:</strong>{' '}
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </p>
              ))}
            </div>
          )}
          {result.audioUrl && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Preview audio:</p>
              <audio controls src={result.audioUrl} className="w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TestingTools() {
  const { addToast } = useToast();

  // SMS State
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsResult, setSmsResult] = useState<TestResult | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);

  // Voice/IVR State
  const [voicePhone, setVoicePhone] = useState('');
  const [voiceDisease, setVoiceDisease] = useState('Malaria');
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [voicePatientName, setVoicePatientName] = useState('');
  const [voiceGoals, setVoiceGoals] = useState('');
  const [voiceResult, setVoiceResult] = useState<TestResult | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);

  // WhatsApp State
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappResult, setWhatsappResult] = useState<TestResult | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  // Bulk Voice State (English)
  const [bulkRecipients, setBulkRecipients] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkCampaignName, setBulkCampaignName] = useState('Test Voice Campaign');
  const [bulkResult, setBulkResult] = useState<TestResult | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Local Voice State (Ghana NLP)
  const [localRecipients, setLocalRecipients] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [localCampaignName, setLocalCampaignName] = useState('');
  const [localLanguage, setLocalLanguage] = useState('tw');
  const [localResult, setLocalResult] = useState<TestResult | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSendSMS = async () => {
    if (!smsPhone || !smsMessage) {
      addToast({ type: 'error', title: 'Missing fields', description: 'Please fill in all fields' });
      return;
    }

    setSmsLoading(true);
    setSmsResult(null);

    try {
      const response = await sendTestSMS({
        recipient: smsPhone,
        message: smsMessage,
      });
      setSmsResult({
        success: response.success,
        message: response.success ? 'SMS sent successfully!' : (response.message || 'Failed to send SMS'),
        details: response.result ? { response: response.result } : undefined,
      });
      if (response.success) {
        setSmsPhone('');
        setSmsMessage('');
      }
    } catch (error) {
      setSmsResult({
        success: false,
        message: handleAPIError(error),
      });
    } finally {
      setSmsLoading(false);
    }
  };

  const handleMakeCall = async () => {
    if (!voicePhone || !voiceDisease) {
      addToast({ type: 'error', title: 'Missing fields', description: 'Please fill in required fields' });
      return;
    }

    setVoiceLoading(true);
    setVoiceResult(null);

    try {
      const formattedPhone = formatPhone(voicePhone);
      const response = await makeTestIVRCall({
        phone_number: formattedPhone,
        disease_name: voiceDisease,
        patient_name: voicePatientName || undefined,
        language: voiceLanguage,
        campaign_goals: voiceGoals || undefined,
      });
      setVoiceResult({
        success: response.success,
        message: response.success ? 'Call initiated successfully!' : (response.message || 'Failed to initiate call'),
        details: {
          'Call SID': response.call_sid || 'N/A',
          'Status': response.status || 'N/A',
          'Phone': response.phone_number || formattedPhone,
          'Topic': response.disease_name || voiceDisease,
          'Language': response.language || voiceLanguage,
          ...(response.patient_name && { 'Patient': response.patient_name }),
        },
      });
    } catch (error) {
      setVoiceResult({
        success: false,
        message: handleAPIError(error),
      });
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!whatsappPhone || !whatsappMessage) {
      addToast({ type: 'error', title: 'Missing fields', description: 'Please fill in all fields' });
      return;
    }

    setWhatsappLoading(true);
    setWhatsappResult(null);

    try {
      const response = await sendTestWhatsApp({
        recipient: whatsappPhone,
        message: whatsappMessage,
      });
      setWhatsappResult({
        success: response.success,
        message: response.success ? 'WhatsApp message sent!' : (response.message || 'Failed to send WhatsApp message'),
        details: response.message_id ? { 'Message ID': response.message_id } : undefined,
      });
      if (response.success) {
        setWhatsappPhone('');
        setWhatsappMessage('');
      }
    } catch (error) {
      setWhatsappResult({
        success: false,
        message: handleAPIError(error),
      });
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleBulkVoice = async () => {
    const phones = bulkRecipients
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter((p) => p);

    if (phones.length === 0 || !bulkMessage) {
      addToast({
        type: 'error',
        title: 'Missing fields',
        description: 'Please enter recipients and a message',
      });
      return;
    }

    setBulkLoading(true);
    setBulkResult(null);

    try {
      const response = await sendBulkVoice({
        recipients: phones,
        message: bulkMessage,
        campaign_name: bulkCampaignName,
      });
      setBulkResult({
        success: response.success,
        message: response.success
          ? `Bulk voice calls initiated: ${response.recipients_count} recipients`
          : (response.message || 'Failed to initiate bulk calls'),
        details: {
          'Voice ID': response.voice_id || 'N/A',
          'Recipients': response.recipients_count,
        },
        audioUrl: response.audio_url,
      });
    } catch (error) {
      setBulkResult({
        success: false,
        message: handleAPIError(error),
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleLocalVoice = async () => {
    const phones = localRecipients
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter((p) => p);

    if (phones.length === 0 || !localMessage || !localCampaignName) {
      addToast({
        type: 'error',
        title: 'Missing fields',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setLocalLoading(true);
    setLocalResult(null);

    try {
      const response = await createLocalVoiceCampaign({
        recipients: phones,
        message: localMessage,
        campaign_name: localCampaignName,
        target_language: localLanguage,
        is_schedule: false,
      });
      setLocalResult({
        success: response.success,
        message: response.success
          ? `Local language campaign created: ${response.recipients_count} recipients`
          : (response.message || 'Failed to create campaign'),
        details: {
          'Campaign ID': response.campaign_id || 'N/A',
          'Voice ID': response.voice_id || 'N/A',
          'Language': response.target_language || localLanguage,
          'Recipients': response.recipients_count,
          ...(response.translated_message && { 'Translated': response.translated_message }),
        },
        audioUrl: response.audio_url,
      });
    } catch (error) {
      setLocalResult({
        success: false,
        message: handleAPIError(error),
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Testing Tools</h1>
        <p className="mt-1 text-sm text-gray-500">
          Test individual delivery channels before creating full campaigns.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Testing Mode</p>
          <p className="text-sm text-amber-700 mt-1">
            These tools send real messages to real phone numbers. Use for testing purposes only with
            numbers you have permission to contact. Voice calls will incur Twilio charges.
          </p>
        </div>
      </div>

      {/* Test cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMS Test */}
        <TestCard
          title="Test SMS"
          description="Send a test SMS message via mNotify"
          icon={MessageSquare}
          iconColor="bg-blue-100 text-blue-600"
        >
          <div className="space-y-4">
            <Input
              label="Recipient Phone"
              placeholder="0241234567 or 233241234567"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              hint="Ghana phone number format"
            />
            <Textarea
              label={`Message (${smsMessage.length}/160)`}
              placeholder="Enter your health message..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              rows={3}
              maxLength={160}
            />
            <Button onClick={handleSendSMS} isLoading={smsLoading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
            <ResultDisplay result={smsResult} />
          </div>
        </TestCard>

        {/* Voice/IVR Test */}
        <TestCard
          title="Interactive IVR Call"
          description="Make AI-powered voice call with real-time conversation"
          icon={Phone}
          iconColor="bg-green-100 text-green-600"
        >
          <div className="space-y-4">
            <Input
              label="Phone Number *"
              placeholder="+233241234567 or 0241234567"
              value={voicePhone}
              onChange={(e) => setVoicePhone(e.target.value)}
              hint="E.164 format: +233XXXXXXXXX"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Health Topic *"
                options={diseaseOptions}
                value={voiceDisease}
                onChange={(e) => setVoiceDisease(e.target.value)}
              />
              <Select
                label="Language"
                options={languageOptions}
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
              />
            </div>
            <Input
              label="Patient Name (optional)"
              placeholder="e.g., Akua Mensah"
              value={voicePatientName}
              onChange={(e) => setVoicePatientName(e.target.value)}
              hint="AI will personalize the conversation"
            />
            <Input
              label="Campaign Goals (optional)"
              placeholder="e.g., Educate about warning signs..."
              value={voiceGoals}
              onChange={(e) => setVoiceGoals(e.target.value)}
            />
            <Button onClick={handleMakeCall} isLoading={voiceLoading} className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Make IVR Call
            </Button>
            <ResultDisplay result={voiceResult} />
          </div>
        </TestCard>

        {/* WhatsApp Test */}
        <TestCard
          title="Test WhatsApp"
          description="Send a test WhatsApp message"
          icon={MessageCircle}
          iconColor="bg-emerald-100 text-emerald-600"
        >
          <div className="space-y-4">
            <Input
              label="Recipient Phone"
              placeholder="+233241234567"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              hint="WhatsApp registered number"
            />
            <Textarea
              label="Message"
              placeholder="Enter your test message..."
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSendWhatsApp} isLoading={whatsappLoading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send WhatsApp
            </Button>
            <ResultDisplay result={whatsappResult} />
          </div>
        </TestCard>

        {/* Bulk Voice Test (English) */}
        <TestCard
          title="Bulk Voice (English)"
          description="Send voice messages to multiple recipients using AI TTS"
          icon={Users}
          iconColor="bg-purple-100 text-purple-600"
        >
          <div className="space-y-4">
            <Input
              label="Campaign Name"
              placeholder="e.g., Malaria Prevention Test"
              value={bulkCampaignName}
              onChange={(e) => setBulkCampaignName(e.target.value)}
            />
            <Textarea
              label="Recipients (one per line)"
              placeholder="233241234567&#10;233201234567&#10;0555551234"
              value={bulkRecipients}
              onChange={(e) => setBulkRecipients(e.target.value)}
              rows={3}
            />
            <Textarea
              label="Voice Message (keep under 150 words)"
              placeholder="Hello! This is a health reminder about malaria prevention..."
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              rows={4}
            />
            <Button onClick={handleBulkVoice} isLoading={bulkLoading} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Send Bulk Voice
            </Button>
            <ResultDisplay result={bulkResult} />
          </div>
        </TestCard>

        {/* Local Language Voice */}
        <TestCard
          title="Local Language Voice"
          description="Send voice messages in Ghanaian local languages (Twi, Ewe, Ga)"
          icon={Globe}
          iconColor="bg-orange-100 text-orange-600"
        >
          <div className="space-y-4">
            <Input
              label="Campaign Name *"
              placeholder="e.g., Malaria Prevention - Twi"
              value={localCampaignName}
              onChange={(e) => setLocalCampaignName(e.target.value)}
            />
            <Select
              label="Target Language *"
              options={localLanguageOptions}
              value={localLanguage}
              onChange={(e) => setLocalLanguage(e.target.value)}
            />
            <Textarea
              label="Recipients (one per line)"
              placeholder="233241234567&#10;233201234567"
              value={localRecipients}
              onChange={(e) => setLocalRecipients(e.target.value)}
              rows={3}
            />
            <Textarea
              label="Message in English *"
              placeholder="Hello, remember to take your malaria medication today..."
              value={localMessage}
              onChange={(e) => setLocalMessage(e.target.value)}
              rows={4}
              hint="Message will be translated to the selected local language"
            />
            <Button onClick={handleLocalVoice} isLoading={localLoading} className="w-full">
              <Globe className="h-4 w-4 mr-2" />
              Send Local Voice
            </Button>
            <ResultDisplay result={localResult} />
          </div>
        </TestCard>
      </div>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'mNotify (SMS/Voice)', status: 'active' },
              { name: 'Twilio (IVR)', status: 'active' },
              { name: 'ElevenLabs (TTS)', status: 'active' },
              { name: 'Ghana NLP (Translation)', status: 'active' },
            ].map((channel) => (
              <div key={channel.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    channel.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">{channel.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
