import React from 'react';
import { AdminDetails } from '@/types/admin';
import { formatAdminDetails, generateSummary } from '@/utils/adminHelpers';

interface AdminDetailsPreviewProps {
  details: AdminDetails;
  onClose: () => void;
  onConfirm: () => void;
}

const AdminDetailsPreview: React.FC<AdminDetailsPreviewProps> = ({
  details,
  onClose,
  onConfirm,
}) => {
  const formattedDetails = formatAdminDetails(details);
  const summary = generateSummary(details);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Review Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Job Supplier</p>
                  <p className="font-medium">{formattedDetails.jobSupplier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{formattedDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date Contacted</p>
                  <p className="font-medium">{formattedDetails.dateContacted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Contacted</p>
                  <p className="font-medium">{formattedDetails.timeContacted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Date</p>
                  <p className="font-medium">{formattedDetails.claimDate}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client Name</p>
                  <p className="font-medium">{formattedDetails.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Primary Phone</p>
                  <p className="font-medium">{formattedDetails.phoneNumbers.primary}</p>
                </div>
                {formattedDetails.phoneNumbers.other && (
                  <div>
                    <p className="text-sm text-gray-600">Other Phone</p>
                    <p className="font-medium">{formattedDetails.phoneNumbers.other}</p>
                  </div>
                )}
                {formattedDetails.tenantName && (
                  <div>
                    <p className="text-sm text-gray-600">Tenant Name</p>
                    <p className="font-medium">{formattedDetails.tenantName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Site Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Site Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Site Address</p>
                  <p className="font-medium whitespace-pre-wrap">{formattedDetails.siteAddress}</p>
                </div>
                {formattedDetails.otherAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Other Address</p>
                    <p className="font-medium whitespace-pre-wrap">{formattedDetails.otherAddress}</p>
                  </div>
                )}
                {formattedDetails.meetingOnSite && (
                  <div>
                    <p className="text-sm text-gray-600">Meeting on Site</p>
                    <p className="font-medium">{formattedDetails.meetingOnSite}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Members */}
            {formattedDetails.staffMembers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Staff Members</h3>
                <ul className="list-disc list-inside space-y-1">
                  {formattedDetails.staffMembers.map((member, index) => (
                    <li key={index} className="font-medium">{member}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Time Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Time Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Time On Site</p>
                  <p className="font-medium">{formattedDetails.timeOnSite}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Off Site</p>
                  <p className="font-medium">{formattedDetails.timeOffSite}</p>
                </div>
                {formattedDetails.duration && (
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{formattedDetails.duration}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Claim Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Claim Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Claim Type</p>
                  <p className="font-medium">{formattedDetails.claimTypeLabel}</p>
                </div>
                {formattedDetails.category && (
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{formattedDetails.categoryLabel}</p>
                  </div>
                )}
                {formattedDetails.policyNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Policy Number</p>
                    <p className="font-medium">{formattedDetails.policyNumber}</p>
                  </div>
                )}
                {formattedDetails.propertyReference && (
                  <div>
                    <p className="text-sm text-gray-600">Property Reference</p>
                    <p className="font-medium">{formattedDetails.propertyReference}</p>
                  </div>
                )}
              </div>
              {formattedDetails.causeOfLoss && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Cause of Loss</p>
                  <p className="font-medium whitespace-pre-wrap">{formattedDetails.causeOfLoss}</p>
                </div>
              )}
            </div>

            {/* Other Trades */}
            {formattedDetails.otherTradesRequired && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Other Trades Required</h3>
                <p className="font-medium whitespace-pre-wrap">{formattedDetails.otherTrades}</p>
              </div>
            )}

            {/* Assessor Information */}
            {formattedDetails.assessorAssigned.assigned && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Assessor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Assessor Name</p>
                    <p className="font-medium">{formattedDetails.assessorAssigned.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assessor Contact</p>
                    <p className="font-medium">{formattedDetails.assessorAssigned.contact}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Job Notes */}
            {formattedDetails.jobNotes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Job Notes</h3>
                <p className="font-medium whitespace-pre-wrap">{formattedDetails.jobNotes}</p>
              </div>
            )}

            {/* Plain Text Summary (Hidden but available for copying) */}
            <div className="sr-only">
              <pre>{summary}</pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetailsPreview;
