import React from "react";
import { useAdminForm } from "../hooks/useAdminForm";
import { CLAIM_TYPES, WATER_CATEGORIES } from "../types/admin";
import AdminDetailsPreview from "./AdminDetailsPreview";

const AdminDetailsForm = () => {
  const {
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
    togglePreview,
    confirmAndSubmit,
  } = useAdminForm();

  // Helper function to render error message
  const renderError = (field: string) => {
    return errors[field] ? (
      <span className="text-red-500 text-sm mt-1" data-error>
        {errors[field]}
      </span>
    ) : null;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Administration Details</h2>

        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Details saved successfully!
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.submit}
          </div>
        )}

        {/* Form Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-1">
              <label className="block">
                Job Supplier:
                <input
                  type="text"
                  value={formState.jobSupplier}
                  onChange={(e) => updateField("jobSupplier", e.target.value)}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.jobSupplier ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Job Supplier"
                />
              </label>
              {renderError('jobSupplier')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Order Number:
                <input
                  type="text"
                  value={formState.orderNumber}
                  onChange={(e) => updateField("orderNumber", e.target.value)}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.orderNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Order Number"
                />
              </label>
              {renderError('orderNumber')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Date Contacted:
                <input
                  type="date"
                  value={formState.dateContacted}
                  onChange={(e) => updateField("dateContacted", e.target.value)}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.dateContacted ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </label>
              {renderError('dateContacted')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Time Contacted:
                <input
                  type="time"
                  value={formState.timeContacted}
                  onChange={(e) => updateField("timeContacted", e.target.value)}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.timeContacted ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </label>
              {renderError('timeContacted')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Claim Date:
                <input
                  type="date"
                  value={formState.claimDate}
                  onChange={(e) => updateField("claimDate", e.target.value)}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.claimDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </label>
              {renderError('claimDate')}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="space-y-1">
              <label className="block">
                Client Name:
                <input
                  type="text"
                  value={formState.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.clientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Client Name"
                />
              </label>
              {renderError('clientName')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Primary Phone:
                <input
                  type="tel"
                  value={formState.phoneNumbers.primary}
                  onChange={(e) => updateField("phoneNumbers", {
                    ...formState.phoneNumbers,
                    primary: e.target.value
                  })}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.primaryPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Primary Phone"
                />
              </label>
              {renderError('primaryPhone')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Other Phone:
                <input
                  type="tel"
                  value={formState.phoneNumbers.other}
                  onChange={(e) => updateField("phoneNumbers", {
                    ...formState.phoneNumbers,
                    other: e.target.value
                  })}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.otherPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Other Phone (Optional)"
                />
              </label>
              {renderError('otherPhone')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Tenant Name:
                <input
                  type="text"
                  value={formState.tenantName}
                  onChange={(e) => updateField("tenantName", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Enter Tenant Name (Optional)"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Site Information Section */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Site Information</h3>
          
          <div className="space-y-1">
            <label className="block">
              Meeting on Site:
              <input
                type="datetime-local"
                value={formState.meetingOnSite}
                onChange={(e) => updateField("meetingOnSite", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </label>
          </div>

          <div className="space-y-1">
            <label className="block">
              Site Address:
              <textarea
                value={formState.siteAddress}
                onChange={(e) => updateField("siteAddress", e.target.value)}
                className={`border rounded px-3 py-2 w-full ${
                  errors.siteAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Site Address"
                rows={3}
              />
            </label>
            {renderError('siteAddress')}
          </div>

          <div className="space-y-1">
            <label className="block">
              Other Address:
              <textarea
                value={formState.otherAddress}
                onChange={(e) => updateField("otherAddress", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                placeholder="Enter Other Address (Optional)"
                rows={3}
              />
            </label>
          </div>
        </div>

        {/* Staff Members Section */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Staff Members</h3>
          
          {formState.staffMembers.map((member, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={member}
                onChange={(e) => updateStaffMember(index, e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 flex-grow"
                placeholder="Enter Staff Member Name"
              />
              <button
                type="button"
                onClick={() => removeStaffMember(index)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addStaffMember}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            Add Staff Member
          </button>
        </div>

        {/* Time Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block">
              Time On Site:
              <input
                type="time"
                value={formState.timeOnSite}
                onChange={(e) => updateField("timeOnSite", e.target.value)}
                className={`border rounded px-3 py-2 w-full ${
                  errors.timeOnSite ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </label>
            {renderError('timeOnSite')}
          </div>

          <div className="space-y-1">
            <label className="block">
              Time Off Site:
              <input
                type="time"
                value={formState.timeOffSite}
                onChange={(e) => updateField("timeOffSite", e.target.value)}
                className={`border rounded px-3 py-2 w-full ${
                  errors.timeOffSite ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </label>
            {renderError('timeOffSite')}
          </div>
        </div>

        {/* Claim Information */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Claim Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block">
                Claim Type:
                <select
                  value={formState.claimType}
                  onChange={(e) => updateField("claimType", e.target.value)}
                  className={`border rounded px-3 py-2 w-full ${
                    errors.claimType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Claim Type</option>
                  {CLAIM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              {renderError('claimType')}
            </div>

            <div className="space-y-1">
              <label className="block">
                Category:
                <select
                  value={formState.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                >
                  <option value="">Select Category</option>
                  {WATER_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block">
                Policy Number:
                <input
                  type="text"
                  value={formState.policyNumber}
                  onChange={(e) => updateField("policyNumber", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Enter Policy Number"
                />
              </label>
            </div>

            <div className="space-y-1">
              <label className="block">
                Property Reference:
                <input
                  type="text"
                  value={formState.propertyReference}
                  onChange={(e) => updateField("propertyReference", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Enter Property Reference"
                />
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block">
              Cause of Loss:
              <textarea
                value={formState.causeOfLoss}
                onChange={(e) => updateField("causeOfLoss", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                placeholder="Describe the cause of loss"
                rows={3}
              />
            </label>
          </div>
        </div>

        {/* Other Trades Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formState.otherTradesRequired}
              onChange={(e) => updateField("otherTradesRequired", e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <label>Other Trades Required</label>
          </div>

          {formState.otherTradesRequired && (
            <div className="space-y-1">
              <textarea
                value={formState.otherTrades}
                onChange={(e) => updateField("otherTrades", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                placeholder="Specify other trades required"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Assessor Information */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formState.assessorAssigned.assigned}
              onChange={(e) =>
                updateField("assessorAssigned", {
                  ...formState.assessorAssigned,
                  assigned: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600"
            />
            <label>Assessor Assigned</label>
          </div>

          {formState.assessorAssigned.assigned && (
            <div className="ml-6 space-y-4">
              <div className="space-y-1">
                <label className="block">
                  Assessor Name:
                  <input
                    type="text"
                    value={formState.assessorAssigned.name}
                    onChange={(e) =>
                      updateField("assessorAssigned", {
                        ...formState.assessorAssigned,
                        name: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    placeholder="Enter Assessor Name"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="block">
                  Assessor Contact:
                  <input
                    type="text"
                    value={formState.assessorAssigned.contact}
                    onChange={(e) =>
                      updateField("assessorAssigned", {
                        ...formState.assessorAssigned,
                        contact: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    placeholder="Enter Assessor Contact"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Job Notes */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Additional Notes</h3>
          
          <div className="space-y-1">
            <label className="block">
              Job Notes:
              <textarea
                value={formState.jobNotes}
                onChange={(e) => updateField("jobNotes", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                placeholder="Enter any additional job notes"
                rows={4}
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
              transition-colors duration-200`}
          >
            {isSubmitting ? 'Saving...' : 'Review Details'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <AdminDetailsPreview
          details={formState}
          onClose={togglePreview}
          onConfirm={confirmAndSubmit}
        />
      )}
    </>
  );
};

export default AdminDetailsForm;
