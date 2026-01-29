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
} from 'lucide-react';
import {
  useSendTestSMS,
  useMakeTestIVRCall,
  useSendTestWhatsApp,
  useSendBulkVoice,
} from '@/lib/queries';
import { Language } from '@/lib/types';
import { isValidGhanaPhone, toInternationalPhone } from '@/lib/utils';
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

const diseaseOptions = [
  { value: 'Malaria', label: 'Malaria Prevention' },
  { value: 'Diabetes', label: 'Diabetes Management' },
  { value: 'Hypertension', label: 'Hypertension Control' },
  { value: 'COVID-19', label: 'COVID-19 Prevention' },
  { value: 'HIV/AIDS', label: 'HIV/AIDS Awareness' },
  { value: 'Maternal Health', label: 'Maternal Health' },
  { value: 'Child Nutrition', label: 'Child Nutrition' },
];

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
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
      className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
        result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}
    >
      {result.success ? (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      )}
      <div>
        <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          {result.message}
        </p>
        {result.details && (
          <p className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.details}
          </p>
        )}
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
  const sendSMS = useSendTestSMS();

  // Voice/IVR State
  const [voicePhone, setVoicePhone] = useState('');
  const [voiceDisease, setVoiceDisease] = useState('Malaria');
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [voicePatientName, setVoicePatientName] = useState('');
  const [voiceGoals, setVoiceGoals] = useState('');
  const [voiceResult, setVoiceResult] = useState<TestResult | null>(null);
  const makeIVRCall = useMakeTestIVRCall();

  // WhatsApp State
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappResult, setWhatsappResult] = useState<TestResult | null>(null);
  const sendWhatsApp = useSendTestWhatsApp();

  // Bulk Voice State
  const [bulkRecipients, setBulkRecipients] = useState('');
  const [bulkAudioUrl, setBulkAudioUrl] = useState('');
  const [bulkDelay, setBulkDelay] = useState(5);
  const [bulkResult, setBulkResult] = useState<TestResult | null>(null);
  const sendBulkVoice = useSendBulkVoice();

  const validatePhone = (phone: string): boolean => {
    if (!isValidGhanaPhone(phone)) {
      addToast({
        type: 'error',
        title: 'Invalid phone number',
        description: 'Please enter a valid Ghana phone number (+233 or 0XX format)',
      });
      return false;
    }
    return true;
  };

  const handleSendSMS = async () => {
    if (!validatePhone(smsPhone)) return;
    if (!smsMessage.trim()) {
      addToast({ type: 'error', title: 'Message required', description: 'Please enter a message' });
      return;
    }

    try {
      const result = await sendSMS.mutateAsync({
        recipient: toInternationalPhone(smsPhone),
        message: smsMessage,
      });
      setSmsResult({
        success: result.success,
        message: result.success ? 'SMS sent successfully!' : 'Failed to send SMS',
        details: result.message_id ? `Message ID: ${result.message_id}` : result.error,
      });
    } catch (error) {
      setSmsResult({
        success: false,
        message: 'Failed to send SMS',
        details: 'An error occurred. Please try again.',
      });
    }
  };

  const handleMakeCall = async () => {
    if (!validatePhone(voicePhone)) return;

    try {
      const result = await makeIVRCall.mutateAsync({
        phone_number: toInternationalPhone(voicePhone),
        disease_name: voiceDisease,
        patient_name: voicePatientName || undefined,
        language: voiceLanguage as Language,
        campaign_goals: voiceGoals || undefined,
      });
      setVoiceResult({
        success: result.success,
        message: result.success ? 'Call initiated successfully!' : 'Failed to initiate call',
        details: result.call_sid ? `Call SID: ${result.call_sid}` : result.error,
      });
    } catch (error) {
      setVoiceResult({
        success: false,
        message: 'Failed to initiate call',
        details: 'An error occurred. Please try again.',
      });
    }
  };

  const handleSendWhatsApp = async () => {
    if (!validatePhone(whatsappPhone)) return;
    if (!whatsappMessage.trim()) {
      addToast({ type: 'error', title: 'Message required', description: 'Please enter a message' });
      return;
    }

    try {
      const result = await sendWhatsApp.mutateAsync({
        recipient: toInternationalPhone(whatsappPhone),
        message: whatsappMessage,
      });
      setWhatsappResult({
        success: result.success,
        message: result.success ? 'WhatsApp message sent!' : 'Failed to send WhatsApp message',
        details: result.message_id ? `Message ID: ${result.message_id}` : result.error,
      });
    } catch (error) {
      setWhatsappResult({
        success: false,
        message: 'Failed to send WhatsApp message',
        details: 'An error occurred. Please try again.',
      });
    }
  };

  const handleBulkVoice = async () => {
    const phones = bulkRecipients
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p);

    if (phones.length === 0) {
      addToast({
        type: 'error',
        title: 'Recipients required',
        description: 'Please enter at least one phone number',
      });
      return;
    }

    if (!bulkAudioUrl.trim()) {
      addToast({
        type: 'error',
        title: 'Audio URL required',
        description: 'Please enter the audio file URL',
      });
      return;
    }

    const recipients = phones.map((phone) => ({
      phone_number: toInternationalPhone(phone),
    }));

    try {
      const result = await sendBulkVoice.mutateAsync({
        recipients,
        audio_url: bulkAudioUrl,
        delay_between_calls_seconds: bulkDelay,
      });
      setBulkResult({
        success: result.success,
        message: result.success
          ? `Bulk calls initiated: ${result.initiated_calls}/${result.total_recipients}`
          : 'Failed to initiate bulk calls',
        details: result.error,
      });
    } catch (error) {
      setBulkResult({
        success: false,
        message: 'Failed to initiate bulk calls',
        details: 'An error occurred. Please try again.',
      });
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
            numbers you have permission to contact.
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
              placeholder="+233 20 123 4567"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              hint="Ghana phone number format"
            />
            <Textarea
              label="Message"
              placeholder="Enter your test message..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              rows={3}
              maxLength={160}
              showCount
            />
            <Button onClick={handleSendSMS} isLoading={sendSMS.isPending} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
            <ResultDisplay result={smsResult} />
          </div>
        </TestCard>

        {/* Voice/IVR Test */}
        <TestCard
          title="Test Voice/IVR"
          description="Make a test outbound voice call"
          icon={Phone}
          iconColor="bg-green-100 text-green-600"
        >
          <div className="space-y-4">
            <Input
              label="Phone Number"
              placeholder="+233 20 123 4567"
              value={voicePhone}
              onChange={(e) => setVoicePhone(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Disease Topic"
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
              placeholder="John Doe"
              value={voicePatientName}
              onChange={(e) => setVoicePatientName(e.target.value)}
            />
            <Input
              label="Campaign Goals (optional)"
              placeholder="Increase medication adherence..."
              value={voiceGoals}
              onChange={(e) => setVoiceGoals(e.target.value)}
            />
            <Button onClick={handleMakeCall} isLoading={makeIVRCall.isPending} className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Make Call
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
              placeholder="+233 20 123 4567"
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
            <Button
              onClick={handleSendWhatsApp}
              isLoading={sendWhatsApp.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send WhatsApp
            </Button>
            <ResultDisplay result={whatsappResult} />
          </div>
        </TestCard>

        {/* Bulk Voice Test */}
        <TestCard
          title="Bulk Voice Test"
          description="Test bulk voice calls with pre-recorded audio"
          icon={Users}
          iconColor="bg-purple-100 text-purple-600"
        >
          <div className="space-y-4">
            <Textarea
              label="Recipients (one per line)"
              placeholder="+233201234567&#10;+233209876543&#10;..."
              value={bulkRecipients}
              onChange={(e) => setBulkRecipients(e.target.value)}
              rows={3}
            />
            <Input
              label="Audio URL"
              placeholder="https://example.com/audio.mp3"
              value={bulkAudioUrl}
              onChange={(e) => setBulkAudioUrl(e.target.value)}
            />
            <Input
              label="Delay Between Calls (seconds)"
              type="number"
              min={1}
              max={60}
              value={bulkDelay}
              onChange={(e) => setBulkDelay(parseInt(e.target.value) || 5)}
            />
            <Button
              onClick={handleBulkVoice}
              isLoading={sendBulkVoice.isPending}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Start Bulk Calls
            </Button>
            <ResultDisplay result={bulkResult} />
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
              { name: 'mNotify (SMS)', status: 'active' },
              { name: 'Twilio (Voice)', status: 'active' },
              { name: 'WhatsApp', status: 'active' },
              { name: 'ElevenLabs (TTS)', status: 'active' },
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
