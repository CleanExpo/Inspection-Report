import { useState } from 'react';
import { 
  AdminDetails, 
  FormErrors, 
  REQUIRED_FIELDS, 
  PHONE_REGEX,
  SaveDetailsResponse 
} from '@/types/admin';
import { isDetailsComplete } from '@/utils/adminHelpers';

interface UseAdminFormReturn {
  formState: AdminDetails;
  errors: FormErrors;
  isSubmitting: boolean;
  submitSuccess: boolean;
  showPreview: boolean;
  updateField: (field: keyof AdminDetails, value: any) => void;
  addStaffMember: () => void;
  removeStaffMember: (index: number) => void;
  updateStaffMember: (index: number, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  togglePreview: () => void;
  confirmAndSubmit: () => Promise<void>;
}

const initialState: AdminDetails = {
  jobSupplier: "",
  orderNumber: "",
  dateContacted: "",
  timeContacted: "",
  claimDate: "",
  clientName: "",
  phoneNumbers: {
    primary: "",
    other: "",
  },
  tenantName: "",
  meetingOnSite: "",
  siteAddress: "",
  otherAddress: "",
  staffMembers: [],
  timeOnSite: "",
  timeOffSite: "",
  claimType: "",
  category: "",
  policyNumber: "",
  propertyReference: "",
  causeOfLoss: "",
  otherTradesRequired: false,
  otherTrades: "",
  assessorAssigned: {
    assigned: false,
    name: "",
    contact: "",
  },
  jobNotes: "",
};

export const useAdminForm = (): UseAdminFormReturn => {
  const [formState, setFormState] = useState<AdminDetails>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Required fields validation
    REQUIRED_FIELDS.forEach(field => {
      if (!formState[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    // Phone number format validation
    if (!PHONE_REGEX.test(formState.phoneNumbers.primary)) {
      newErrors.primaryPhone = "Invalid phone number format";
    }
    if (formState.phoneNumbers.other && !PHONE_REGEX.test(formState.phoneNumbers.other)) {
      newErrors.otherPhone = "Invalid phone number format";
    }

    // Time validation
    if (formState.timeOnSite && formState.timeOffSite) {
      const onSiteTime = new Date(`1970-01-01T${formState.timeOnSite}`);
      const offSiteTime = new Date(`1970-01-01T${formState.timeOffSite}`);
      if (offSiteTime < onSiteTime) {
        newErrors.timeOffSite = "Time off site must be after time on site";
      }
    }

    setErrors(newErrors);
    
    // In test environment, don't try to scroll
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      const firstError = document.querySelector('[data-error]');
      if (firstError && 'scrollIntoView' in firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof AdminDetails, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addStaffMember = () => {
    setFormState(prev => ({
      ...prev,
      staffMembers: [...prev.staffMembers, ""]
    }));
  };

  const removeStaffMember = (index: number) => {
    setFormState(prev => ({
      ...prev,
      staffMembers: prev.staffMembers.filter((_, i) => i !== index)
    }));
  };

  const updateStaffMember = (index: number, value: string) => {
    setFormState(prev => {
      const updatedStaff = [...prev.staffMembers];
      updatedStaff[index] = value;
      return {
        ...prev,
        staffMembers: updatedStaff
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show preview if form is valid
    setShowPreview(true);
  };

  const confirmAndSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/admin/save-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const result: SaveDetailsResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save details');
      }

      setSubmitSuccess(true);
      setShowPreview(false);

      // Update form state with the returned ID if provided
      if (result.data?.id) {
        setFormState(prev => ({
          ...prev,
          id: result.data?.id
        }));
      }
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save details. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormState(initialState);
    setErrors({});
    setSubmitSuccess(false);
    setShowPreview(false);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return {
    formState,
    errors,
    isSubmitting,
    submitSuccess,
    showPreview,
    updateField,
    addStaffMember,
    removeStaffMember,
    updateStaffMember,
    handleSubmit,
    resetForm,
    togglePreview,
    confirmAndSubmit,
  };
};
