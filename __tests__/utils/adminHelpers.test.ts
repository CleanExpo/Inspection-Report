import {
  formatPhoneNumber,
  formatDate,
  formatTime,
  calculateDuration,
  getClaimTypeLabel,
  getWaterCategoryLabel,
  formatAdminDetails,
  generateSummary,
  isDetailsComplete
} from '@/utils/adminHelpers';
import { AdminDetails, ClaimType, WaterCategory } from '@/types/admin';

describe('adminHelpers', () => {
  describe('formatPhoneNumber', () => {
    it('formats 10-digit phone numbers correctly', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    });

    it('handles non-10-digit numbers', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
      expect(formatPhoneNumber('12345678901')).toBe('12345678901');
    });
  });

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      expect(formatDate('2024-01-01')).toBe('January 1, 2024');
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatTime', () => {
    it('formats times correctly', () => {
      expect(formatTime('13:00')).toBe('1:00 PM');
      expect(formatTime('09:30')).toBe('9:30 AM');
      expect(formatTime('')).toBe('');
    });
  });

  describe('calculateDuration', () => {
    it('calculates duration between times correctly', () => {
      expect(calculateDuration('09:00', '10:30')).toBe('1h 30m');
      expect(calculateDuration('13:00', '14:15')).toBe('1h 15m');
      expect(calculateDuration('', '')).toBe('');
    });

    it('handles invalid time ranges', () => {
      expect(calculateDuration('10:00', '09:00')).toBe('Invalid time range');
    });
  });

  describe('getClaimTypeLabel', () => {
    it('returns correct labels for claim types', () => {
      expect(getClaimTypeLabel('water' as ClaimType)).toBe('Water Damage');
      expect(getClaimTypeLabel('fire' as ClaimType)).toBe('Fire Damage');
      expect(getClaimTypeLabel('storm' as ClaimType)).toBe('Storm Damage');
      expect(getClaimTypeLabel('impact' as ClaimType)).toBe('Impact Damage');
      expect(getClaimTypeLabel('other' as ClaimType)).toBe('Other');
      expect(getClaimTypeLabel('invalid' as ClaimType)).toBe('Unknown');
    });
  });

  describe('getWaterCategoryLabel', () => {
    it('returns correct labels for water categories', () => {
      expect(getWaterCategoryLabel('1' as WaterCategory)).toBe('Category 1 - Clean Water');
      expect(getWaterCategoryLabel('2' as WaterCategory)).toBe('Category 2 - Grey Water');
      expect(getWaterCategoryLabel('3' as WaterCategory)).toBe('Category 3 - Black Water');
      expect(getWaterCategoryLabel('na' as WaterCategory)).toBe('Not Applicable');
      expect(getWaterCategoryLabel('invalid' as WaterCategory)).toBe('Unknown');
    });
  });

  describe('formatAdminDetails', () => {
    const mockDetails: AdminDetails = {
      jobSupplier: 'Test Supplier',
      orderNumber: '12345',
      dateContacted: '2024-01-01',
      timeContacted: '09:00',
      claimDate: '2024-01-01',
      clientName: 'John Doe',
      phoneNumbers: {
        primary: '1234567890',
        other: ''
      },
      tenantName: '',
      meetingOnSite: '2024-01-01T10:00',
      siteAddress: '123 Test St',
      otherAddress: '',
      staffMembers: ['Staff 1'],
      timeOnSite: '10:00',
      timeOffSite: '11:30',
      claimType: 'water',
      category: '1',
      policyNumber: 'POL123',
      propertyReference: 'REF123',
      causeOfLoss: 'Test cause',
      otherTradesRequired: false,
      otherTrades: '',
      assessorAssigned: {
        assigned: false,
        name: '',
        contact: ''
      },
      jobNotes: ''
    };

    it('formats admin details correctly', () => {
      const formatted = formatAdminDetails(mockDetails);
      
      expect(formatted.dateContacted).toBe('January 1, 2024');
      expect(formatted.timeContacted).toBe('9:00 AM');
      expect(formatted.phoneNumbers.primary).toBe('(123) 456-7890');
      expect(formatted.duration).toBe('1h 30m');
      expect(formatted.claimTypeLabel).toBe('Water Damage');
      expect(formatted.categoryLabel).toBe('Category 1 - Clean Water');
    });
  });

  describe('generateSummary', () => {
    const mockDetails: AdminDetails = {
      jobSupplier: 'Test Supplier',
      orderNumber: '12345',
      dateContacted: '2024-01-01',
      timeContacted: '09:00',
      claimDate: '2024-01-01',
      clientName: 'John Doe',
      phoneNumbers: {
        primary: '1234567890',
        other: ''
      },
      tenantName: '',
      meetingOnSite: '2024-01-01T10:00',
      siteAddress: '123 Test St',
      otherAddress: '',
      staffMembers: ['Staff 1'],
      timeOnSite: '10:00',
      timeOffSite: '11:30',
      claimType: 'water',
      category: '1',
      policyNumber: 'POL123',
      propertyReference: 'REF123',
      causeOfLoss: 'Test cause',
      otherTradesRequired: false,
      otherTrades: '',
      assessorAssigned: {
        assigned: false,
        name: '',
        contact: ''
      },
      jobNotes: ''
    };

    it('generates a complete summary', () => {
      const summary = generateSummary(mockDetails);
      
      expect(summary).toContain('Job Details:');
      expect(summary).toContain('Test Supplier');
      expect(summary).toContain('12345');
      expect(summary).toContain('Water Damage');
      
      expect(summary).toContain('Client Information:');
      expect(summary).toContain('John Doe');
      expect(summary).toContain('(123) 456-7890');
      
      expect(summary).toContain('Site Details:');
      expect(summary).toContain('123 Test St');
      
      expect(summary).toContain('Time Information:');
      expect(summary).toContain('10:00 AM');
      expect(summary).toContain('11:30 AM');
      expect(summary).toContain('1h 30m');
    });
  });

  describe('isDetailsComplete', () => {
    it('returns true for complete details', () => {
      const completeDetails: AdminDetails = {
        jobSupplier: 'Test',
        orderNumber: '123',
        dateContacted: '2024-01-01',
        timeContacted: '09:00',
        claimDate: '2024-01-01',
        clientName: 'John',
        phoneNumbers: {
          primary: '1234567890',
          other: ''
        },
        tenantName: '',
        meetingOnSite: '',
        siteAddress: '123 St',
        otherAddress: '',
        staffMembers: [],
        timeOnSite: '',
        timeOffSite: '',
        claimType: 'water',
        category: '',
        policyNumber: '',
        propertyReference: '',
        causeOfLoss: '',
        otherTradesRequired: false,
        otherTrades: '',
        assessorAssigned: {
          assigned: false,
          name: '',
          contact: ''
        },
        jobNotes: ''
      };

      expect(isDetailsComplete(completeDetails)).toBe(true);
    });

    it('returns false for incomplete details', () => {
      const incompleteDetails: AdminDetails = {
        jobSupplier: '',
        orderNumber: '',
        dateContacted: '',
        timeContacted: '',
        claimDate: '',
        clientName: '',
        phoneNumbers: {
          primary: '',
          other: ''
        },
        tenantName: '',
        meetingOnSite: '',
        siteAddress: '',
        otherAddress: '',
        staffMembers: [],
        timeOnSite: '',
        timeOffSite: '',
        claimType: '',
        category: '',
        policyNumber: '',
        propertyReference: '',
        causeOfLoss: '',
        otherTradesRequired: false,
        otherTrades: '',
        assessorAssigned: {
          assigned: false,
          name: '',
          contact: ''
        },
        jobNotes: ''
      };

      expect(isDetailsComplete(incompleteDetails)).toBe(false);
    });
  });
});
