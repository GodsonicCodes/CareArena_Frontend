import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  X,
  FileText,
  Plus,
  Trash2,
  MessageSquare,
  Phone,
  MessageCircle,
  Globe,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useCreateCampaign } from '@/lib/queries';
import { Language, type JobPayload } from '@/lib/types';
import { cn, formatFileSize, isValidGhanaPhone, toInternationalPhone } from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Select,
  useToast,
} from '@/components/ui';

// Form validation schema
const campaignSchema = z.object({
  // Step 1
  disease_name: z.string().min(3, 'Disease name must be at least 3 characters'),
  target_audience: z.string().min(10, 'Please describe your target audience'),
  campaign_goals: z.string().min(10, 'Please describe your campaign goals'),
  owner_email: z.string().email('Please enter a valid email'),

  // Step 2
  channel_type: z.string().min(1, 'Please select a channel'),
  language: z.nativeEnum(Language),

  // Step 3
  additional_instructions: z.string().optional(),

  // Step 5
  preferred_time: z.string().regex(/^\d{2}:\d{2}$/, 'Please enter a valid time (HH:MM)'),
  frequency: z.string().min(1, 'Please select a frequency'),
  dry_run: z.boolean(),
  require_approval: z.boolean(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface Recipient {
  phone_number: string;
  patient_name?: string;
}

const steps = [
  { title: 'Basic Information', description: 'Campaign details' },
  { title: 'Channel Selection', description: 'Delivery method' },
  { title: 'Content & Documents', description: 'Supporting materials' },
  { title: 'Recipients', description: 'Patient database' },
  { title: 'Delivery Settings', description: 'Scheduling options' },
  { title: 'Review & Submit', description: 'Final confirmation' },
];

const channelOptions = [
  { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message delivery' },
  { value: 'ivr_outbound', label: 'Voice/IVR', icon: Phone, description: 'Automated voice calls' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'WhatsApp messages' },
  { value: 'web_platform', label: 'Web Platform', icon: Globe, description: 'Web-based content' },
  { value: 'multi', label: 'Multi-Channel', icon: Layers, description: 'Multiple channels' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'tw', label: 'Twi (Ghanaian)' },
  { value: 'ga', label: 'Ga (Ghanaian)' },
];

const frequencyOptions = [
  { value: 'once', label: 'One-time delivery' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function CreateCampaign() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const createCampaign = useCreateCampaign();

  const [currentStep, setCurrentStep] = useState(0);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [patientDatabase, setPatientDatabase] = useState<File | null>(null);
  const [manualRecipients, setManualRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({ phone_number: '', patient_name: '' });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      disease_name: '',
      target_audience: '',
      campaign_goals: '',
      owner_email: '',
      channel_type: '',
      language: Language.ENGLISH,
      additional_instructions: '',
      preferred_time: '09:00',
      frequency: 'once',
      dry_run: false,
      require_approval: true,
    },
  });

  const formValues = watch();

  // Document dropzone
  const onDropDocs = useCallback((acceptedFiles: File[]) => {
    setSupportingDocs((prev) => [...prev, ...acceptedFiles].slice(0, 5));
  }, []);

  const { getRootProps: getDocsRootProps, getInputProps: getDocsInputProps, isDragActive: isDocsDragActive } =
    useDropzone({
      onDrop: onDropDocs,
      accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt'],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    });

  // Patient database dropzone
  const onDropDatabase = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPatientDatabase(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getDbRootProps, getInputProps: getDbInputProps, isDragActive: isDbDragActive } =
    useDropzone({
      onDrop: onDropDatabase,
      accept: {
        'text/csv': ['.csv'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      },
      maxSize: 10 * 1024 * 1024,
      maxFiles: 1,
    });

  const addManualRecipient = () => {
    if (!newRecipient.phone_number) return;

    if (!isValidGhanaPhone(newRecipient.phone_number)) {
      addToast({
        type: 'error',
        title: 'Invalid phone number',
        description: 'Please enter a valid Ghana phone number (+233 or 0XX format)',
      });
      return;
    }

    setManualRecipients((prev) => [
      ...prev,
      {
        phone_number: toInternationalPhone(newRecipient.phone_number),
        patient_name: newRecipient.patient_name || undefined,
      },
    ]);
    setNewRecipient({ phone_number: '', patient_name: '' });
  };

  const removeRecipient = (index: number) => {
    setManualRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = async (): Promise<boolean> => {
    const fieldsToValidate: Record<number, (keyof CampaignFormData)[]> = {
      0: ['disease_name', 'target_audience', 'campaign_goals', 'owner_email'],
      1: ['channel_type', 'language'],
      2: [],
      3: [],
      4: ['preferred_time', 'frequency'],
      5: [],
    };

    const fields = fieldsToValidate[currentStep];
    if (fields.length === 0) return true;

    const result = await trigger(fields);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const payload: JobPayload = {
        disease_name: data.disease_name,
        channel_type: data.channel_type,
        language: data.language,
        supporting_docs: [], // Would upload files to storage first
        campaign_metadata: {
          preferred_time: data.preferred_time,
          frequency: data.frequency,
          owner_email: data.owner_email,
          approved: false,
          dry_run: data.dry_run,
          target_audience: data.target_audience,
          campaign_goals: data.campaign_goals,
        },
        additional_instructions: data.additional_instructions,
      };

      const result = await createCampaign.mutateAsync(payload);

      addToast({
        type: 'success',
        title: 'Campaign created!',
        description: `Campaign ${result.job_id} has been created successfully.`,
      });

      navigate(`/campaigns/${result.job_id}`);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to create campaign',
        description: 'Please try again or contact support.',
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Input
              label="Disease/Health Topic *"
              placeholder="e.g., Malaria Prevention, Diabetes Management"
              error={errors.disease_name?.message}
              {...register('disease_name')}
            />
            <Textarea
              label="Target Audience *"
              placeholder="Describe who this campaign is for (e.g., pregnant women in rural areas, elderly diabetic patients)"
              rows={3}
              error={errors.target_audience?.message}
              {...register('target_audience')}
            />
            <Textarea
              label="Campaign Goals *"
              placeholder="What do you want to achieve? (e.g., increase awareness of malaria prevention, improve medication adherence)"
              rows={3}
              error={errors.campaign_goals?.message}
              {...register('campaign_goals')}
            />
            <Input
              label="Owner Email *"
              type="email"
              placeholder="your.email@healthcare.org"
              error={errors.owner_email?.message}
              {...register('owner_email')}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Delivery Channel *
              </label>
              <Controller
                name="channel_type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {channelOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                          field.value === option.value
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            field.value === option.value
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          <option.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.channel_type && (
                <p className="mt-2 text-sm text-red-600">{errors.channel_type.message}</p>
              )}
            </div>

            <Select
              label="Language *"
              options={languageOptions}
              error={errors.language?.message}
              {...register('language')}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Textarea
              label="Additional Instructions"
              placeholder="Any specific instructions for the AI to consider when generating content (optional)"
              rows={4}
              {...register('additional_instructions')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Supporting Documents
              </label>
              <div
                {...getDocsRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDocsDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <input {...getDocsInputProps()} />
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX, TXT (max 10MB each, up to 5 files)
                </p>
              </div>

              {supportingDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {supportingDocs.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSupportingDocs((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Patient Database (CSV/Excel)
              </label>
              <div
                {...getDbRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDbDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <input {...getDbInputProps()} />
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Upload patient database (phone_number, patient_name columns)
                </p>
                <p className="text-xs text-gray-400 mt-1">CSV or Excel file (max 10MB)</p>
              </div>

              {patientDatabase && (
                <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patientDatabase.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(patientDatabase.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPatientDatabase(null)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or add recipients manually</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Manual Recipients
              </label>
              <div className="flex gap-3">
                <Input
                  placeholder="Phone (+233...)"
                  value={newRecipient.phone_number}
                  onChange={(e) =>
                    setNewRecipient((prev) => ({ ...prev, phone_number: e.target.value }))
                  }
                />
                <Input
                  placeholder="Name (optional)"
                  value={newRecipient.patient_name}
                  onChange={(e) =>
                    setNewRecipient((prev) => ({ ...prev, patient_name: e.target.value }))
                  }
                />
                <Button type="button" onClick={addManualRecipient}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {manualRecipients.length > 0 && (
                <div className="mt-4 space-y-2">
                  {manualRecipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {recipient.phone_number}
                        </p>
                        {recipient.patient_name && (
                          <p className="text-xs text-gray-500">{recipient.patient_name}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecipient(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Input
              label="Preferred Delivery Time *"
              type="time"
              error={errors.preferred_time?.message}
              {...register('preferred_time')}
            />

            <Select
              label="Delivery Frequency *"
              options={frequencyOptions}
              error={errors.frequency?.message}
              {...register('frequency')}
            />

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  {...register('dry_run')}
                />
                <div>
                  <p className="font-medium text-gray-900">Dry Run Mode</p>
                  <p className="text-sm text-gray-500">
                    Generate content without actually sending messages
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  {...register('require_approval')}
                />
                <div>
                  <p className="font-medium text-gray-900">Require Human Approval</p>
                  <p className="text-sm text-gray-500">
                    Content must be approved before delivery starts
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Campaign Summary</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Disease/Topic</p>
                  <p className="font-medium text-gray-900">{formValues.disease_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Channel</p>
                  <p className="font-medium text-gray-900">
                    {channelOptions.find((c) => c.value === formValues.channel_type)?.label || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Language</p>
                  <p className="font-medium text-gray-900">
                    {languageOptions.find((l) => l.value === formValues.language)?.label || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium text-gray-900">{formValues.owner_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Time</p>
                  <p className="font-medium text-gray-900">{formValues.preferred_time || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Frequency</p>
                  <p className="font-medium text-gray-900">
                    {frequencyOptions.find((f) => f.value === formValues.frequency)?.label || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recipients</p>
                  <p className="font-medium text-gray-900">
                    {patientDatabase
                      ? `File: ${patientDatabase.name}`
                      : manualRecipients.length > 0
                      ? `${manualRecipients.length} manual`
                      : 'None added'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mode</p>
                  <p className="font-medium text-gray-900">
                    {formValues.dry_run ? 'Dry Run' : 'Live'}
                  </p>
                </div>
              </div>

              {formValues.target_audience && (
                <div>
                  <p className="text-sm text-gray-500">Target Audience</p>
                  <p className="text-sm text-gray-700 mt-1">{formValues.target_audience}</p>
                </div>
              )}

              {formValues.campaign_goals && (
                <div>
                  <p className="text-sm text-gray-500">Campaign Goals</p>
                  <p className="text-sm text-gray-700 mt-1">{formValues.campaign_goals}</p>
                </div>
              )}

              {supportingDocs.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Supporting Documents</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {supportingDocs.map((f) => f.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {formValues.dry_run && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">Dry Run Mode Enabled</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Content will be generated but no messages will be sent.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="hidden sm:block mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      index === currentStep ? 'text-primary-600' : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 sm:w-20 h-0.5 mx-2',
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-sm text-gray-500">{steps[currentStep].description}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStep()}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" isLoading={createCampaign.isPending}>
                  <Check className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
