import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { PDFDocument, StandardFonts } from 'pdf-lib';

interface FormData {
  jobSupplier: string;
  orderNumber: string;
  dateContacted: string;
  timeContacted: string;
  claimDate: string;
  clientName: string;
  phoneNumbers: {
    primary: string;
    other: string;
  };
  tenantName: string;
  meetingOnSite: string;
  siteAddress: string;
  otherAddress: string;
  staffMembers: string[];
  timeOnSite: string;
  timeOffSite: string;
  claimType: string;
  category: string;
  policyNumber: string;
  propertyReference: string;
  causeOfLoss: string;
  otherTradesRequired: boolean;
  otherTrades: string;
  assessorAssigned: {
    assigned: boolean;
    name: string;
    contact: string;
  };
  jobNotes: string;
}

export async function processDocxTemplate(templateBuffer: ArrayBuffer, data: FormData): Promise<Blob> {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Format dates and times for the template
  const formattedData = {
    ...data,
    dateContacted: new Date(data.dateContacted).toLocaleDateString(),
    claimDate: new Date(data.claimDate).toLocaleDateString(),
    staffMembersList: data.staffMembers.join(', '),
    otherTradesSection: data.otherTradesRequired ? data.otherTrades : 'Not Required',
    assessorSection: data.assessorAssigned.assigned 
      ? `${data.assessorAssigned.name} (${data.assessorAssigned.contact})`
      : 'No Assessor Assigned'
  };

  // Apply the data to the template
  doc.render(formattedData);

  // Generate the filled document
  const output = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  return output;
}

export async function processPdfTemplate(templateBuffer: ArrayBuffer, data: FormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  // Map form data to PDF fields
  const fieldMapping: Record<string, string> = {
    'jobSupplier': data.jobSupplier,
    'orderNumber': data.orderNumber,
    'dateContacted': new Date(data.dateContacted).toLocaleDateString(),
    'timeContacted': data.timeContacted,
    'claimDate': new Date(data.claimDate).toLocaleDateString(),
    'clientName': data.clientName,
    'phonePrimary': data.phoneNumbers.primary,
    'phoneOther': data.phoneNumbers.other,
    'tenantName': data.tenantName,
    'siteAddress': data.siteAddress,
    'otherAddress': data.otherAddress,
    'staffMembers': data.staffMembers.join(', '),
    'timeOnSite': data.timeOnSite,
    'timeOffSite': data.timeOffSite,
    'claimType': data.claimType,
    'category': data.category,
    'policyNumber': data.policyNumber,
    'propertyReference': data.propertyReference,
    'causeOfLoss': data.causeOfLoss,
    'otherTrades': data.otherTradesRequired ? data.otherTrades : 'Not Required',
    'assessorInfo': data.assessorAssigned.assigned 
      ? `${data.assessorAssigned.name} (${data.assessorAssigned.contact})`
      : 'No Assessor Assigned',
    'jobNotes': data.jobNotes
  };

  // Fill in the form fields
  fields.forEach(field => {
    const fieldName = field.getName();
    if (fieldMapping[fieldName]) {
      if (field.constructor.name === 'PDFCheckBox') {
        // @ts-ignore
        field.check();
      } else {
        // @ts-ignore
        field.setText(fieldMapping[fieldName]);
      }
    }
  });

  // Flatten the form (make it non-editable)
  form.flatten();

  // Save the filled PDF
  return await pdfDoc.save();
}

export async function validateTemplate(file: File): Promise<{
  isValid: boolean;
  message: string;
}> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  try {
    const buffer = await file.arrayBuffer();

    if (fileType === 'docx') {
      // Validate DOCX structure
      const zip = new PizZip(buffer);
      new Docxtemplater(zip);
      return { isValid: true, message: 'Valid DOCX template' };
    } else if (fileType === 'pdf') {
      // Validate PDF structure and form fields
      const pdfDoc = await PDFDocument.load(buffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      if (fields.length === 0) {
        return { 
          isValid: false, 
          message: 'PDF template must contain form fields' 
        };
      }
      return { isValid: true, message: 'Valid PDF template' };
    }

    return { 
      isValid: false, 
      message: 'Unsupported file format. Please use DOCX or PDF' 
    };
  } catch (error) {
    return { 
      isValid: false, 
      message: 'Invalid template file structure' 
    };
  }
}

export function getTemplateFields(templateName: string): string[] {
  // Return the list of available template fields
  return [
    'jobSupplier',
    'orderNumber',
    'dateContacted',
    'timeContacted',
    'claimDate',
    'clientName',
    'phonePrimary',
    'phoneOther',
    'tenantName',
    'siteAddress',
    'otherAddress',
    'staffMembers',
    'timeOnSite',
    'timeOffSite',
    'claimType',
    'category',
    'policyNumber',
    'propertyReference',
    'causeOfLoss',
    'otherTrades',
    'assessorInfo',
    'jobNotes'
  ];
}
