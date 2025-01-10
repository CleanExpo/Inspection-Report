import { AdminDetails, ClaimType, WaterCategory } from '@/types/admin';

/**
 * Format a phone number to a consistent format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if it's a 10-digit number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // If it's not 10 digits, just return the cleaned number
  return cleaned;
};

/**
 * Format a date string to a localized date string
 */
export const formatDate = (date: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a time string to a 12-hour format
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Calculate the duration between two time strings
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '';

  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  
  if (end < start) return 'Invalid time range';
  
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

/**
 * Get the label for a claim type
 */
export const getClaimTypeLabel = (type: ClaimType): string => {
  switch (type) {
    case 'water': return 'Water Damage';
    case 'fire': return 'Fire Damage';
    case 'storm': return 'Storm Damage';
    case 'impact': return 'Impact Damage';
    case 'other': return 'Other';
    default: return 'Unknown';
  }
};

/**
 * Get the label for a water category
 */
export const getWaterCategoryLabel = (category: WaterCategory): string => {
  switch (category) {
    case '1': return 'Category 1 - Clean Water';
    case '2': return 'Category 2 - Grey Water';
    case '3': return 'Category 3 - Black Water';
    case 'na': return 'Not Applicable';
    default: return 'Unknown';
  }
};

/**
 * Format the admin details for display
 */
export const formatAdminDetails = (details: AdminDetails) => {
  return {
    ...details,
    dateContacted: formatDate(details.dateContacted),
    timeContacted: formatTime(details.timeContacted),
    claimDate: formatDate(details.claimDate),
    phoneNumbers: {
      primary: formatPhoneNumber(details.phoneNumbers.primary),
      other: details.phoneNumbers.other ? formatPhoneNumber(details.phoneNumbers.other) : '',
    },
    meetingOnSite: details.meetingOnSite ? new Date(details.meetingOnSite).toLocaleString() : '',
    timeOnSite: formatTime(details.timeOnSite),
    timeOffSite: formatTime(details.timeOffSite),
    duration: calculateDuration(details.timeOnSite, details.timeOffSite),
    claimTypeLabel: getClaimTypeLabel(details.claimType as ClaimType),
    categoryLabel: getWaterCategoryLabel(details.category as WaterCategory),
  };
};

/**
 * Generate a summary of the admin details
 */
export const generateSummary = (details: AdminDetails): string => {
  const formatted = formatAdminDetails(details);
  return `
Job Details:
- Supplier: ${formatted.jobSupplier}
- Order Number: ${formatted.orderNumber}
- Claim Date: ${formatted.claimDate}
- Type: ${formatted.claimTypeLabel}
${formatted.category ? `- Category: ${formatted.categoryLabel}` : ''}

Client Information:
- Name: ${formatted.clientName}
- Phone: ${formatted.phoneNumbers.primary}
${formatted.phoneNumbers.other ? `- Alt Phone: ${formatted.phoneNumbers.other}` : ''}
${formatted.tenantName ? `- Tenant: ${formatted.tenantName}` : ''}

Site Details:
- Address: ${formatted.siteAddress}
${formatted.otherAddress ? `- Other Address: ${formatted.otherAddress}` : ''}
${formatted.meetingOnSite ? `- Meeting: ${formatted.meetingOnSite}` : ''}

Time Information:
- On Site: ${formatted.timeOnSite}
- Off Site: ${formatted.timeOffSite}
${formatted.duration ? `- Duration: ${formatted.duration}` : ''}

${details.staffMembers.length > 0 ? `Staff Members:\n${details.staffMembers.map(member => `- ${member}`).join('\n')}` : ''}

${details.otherTradesRequired ? `Other Trades Required:\n${details.otherTrades}` : ''}

${details.assessorAssigned.assigned ? `Assessor Information:
- Name: ${details.assessorAssigned.name}
- Contact: ${details.assessorAssigned.contact}` : ''}

${details.jobNotes ? `Notes:\n${details.jobNotes}` : ''}
`.trim();
};

/**
 * Check if the admin details are complete
 */
export const isDetailsComplete = (details: AdminDetails): boolean => {
  const requiredFields: (keyof AdminDetails)[] = [
    'jobSupplier',
    'orderNumber',
    'dateContacted',
    'timeContacted',
    'claimDate',
    'clientName',
    'siteAddress',
    'claimType'
  ];

  return requiredFields.every(field => Boolean(details[field])) &&
    Boolean(details.phoneNumbers.primary);
};
