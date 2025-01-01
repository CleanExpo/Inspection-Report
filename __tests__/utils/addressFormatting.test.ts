import { 
    formatAddress,
    validateAddress,
    validatePostalCode,
    validateStateTerritory,
    AddressValidationError
} from '../../app/utils/addressFormatting';
import { Address } from '../../app/types/address';
import { jest, expect, describe, it } from '@jest/globals';

describe('Address Formatting and Validation', () => {
    describe('formatAddress', () => {
        it('should format complete address', () => {
            const address: Address = {
                street: '123 Main St',
                unit: 'Apt 4B',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            const formatted = formatAddress(address);
            expect(formatted).toBe('123 Main St, Apt 4B, San Francisco, CA 94105');
        });

        it('should format address without unit', () => {
            const address: Address = {
                street: '456 Market St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            const formatted = formatAddress(address);
            expect(formatted).toBe('456 Market St, San Francisco, CA 94105');
        });

        it('should handle lowercase inputs', () => {
            const address: Address = {
                street: '789 mission st',
                unit: 'suite 100',
                city: 'san francisco',
                state: 'ca',
                zipCode: '94105'
            };

            const formatted = formatAddress(address);
            expect(formatted).toBe('789 Mission St, Suite 100, San Francisco, CA 94105');
        });

        it('should handle extra whitespace', () => {
            const address: Address = {
                street: '  123   Main   St  ',
                city: ' San  Francisco ',
                state: ' CA ',
                zipCode: ' 94105 '
            };

            const formatted = formatAddress(address);
            expect(formatted).toBe('123 Main St, San Francisco, CA 94105');
        });

        it('should handle PO Box addresses', () => {
            const address: Address = {
                street: 'PO Box 12345',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            const formatted = formatAddress(address);
            expect(formatted).toBe('PO Box 12345, San Francisco, CA 94105');
    });

    describe('validatePostalCode', () => {
        it('should validate US zip code', () => {
            expect(() => validatePostalCode('12345', 'US')).not.toThrow();
            expect(() => validatePostalCode('12345-6789', 'US')).not.toThrow();
        });

        it('should reject invalid US zip code', () => {
            expect(() => validatePostalCode('1234', 'US')).toThrow(AddressValidationError);
            expect(() => validatePostalCode('123456', 'US')).toThrow(AddressValidationError);
            expect(() => validatePostalCode('12345-', 'US')).toThrow(AddressValidationError);
            expect(() => validatePostalCode('12345-123', 'US')).toThrow(AddressValidationError);
        });

        it('should validate Canadian postal code', () => {
            expect(() => validatePostalCode('A1A 1A1', 'CA')).not.toThrow();
            expect(() => validatePostalCode('A1A1A1', 'CA')).not.toThrow();
        });

        it('should reject invalid Canadian postal code', () => {
            expect(() => validatePostalCode('A1A1A', 'CA')).toThrow(AddressValidationError);
            expect(() => validatePostalCode('A1A 1A', 'CA')).toThrow(AddressValidationError);
            expect(() => validatePostalCode('11A 1A1', 'CA')).toThrow(AddressValidationError);
        });

        it('should reject unsupported country code', () => {
            expect(() => validatePostalCode('12345', 'XX')).toThrow(AddressValidationError);
        });
    });

    describe('validateStateTerritory', () => {
        it('should validate US state', () => {
            expect(() => validateStateTerritory('CA', 'US')).not.toThrow();
            expect(() => validateStateTerritory('NY', 'US')).not.toThrow();
        });

        it('should validate US territory', () => {
            expect(() => validateStateTerritory('PR', 'US')).not.toThrow();
            expect(() => validateStateTerritory('GU', 'US')).not.toThrow();
        });

        it('should validate Canadian province', () => {
            expect(() => validateStateTerritory('ON', 'CA')).not.toThrow();
            expect(() => validateStateTerritory('BC', 'CA')).not.toThrow();
        });

        it('should validate Canadian territory', () => {
            expect(() => validateStateTerritory('YT', 'CA')).not.toThrow();
            expect(() => validateStateTerritory('NT', 'CA')).not.toThrow();
        });

        it('should reject invalid US state/territory', () => {
            expect(() => validateStateTerritory('XX', 'US')).toThrow(AddressValidationError);
        });

        it('should reject invalid Canadian province/territory', () => {
            expect(() => validateStateTerritory('XX', 'CA')).toThrow(AddressValidationError);
        });

        it('should reject unsupported country code', () => {
            expect(() => validateStateTerritory('XX', 'GB')).toThrow(AddressValidationError);
        });
    });
});

    describe('validateAddress', () => {
        it('should validate complete address', () => {
            const address: Address = {
                street: '123 Main St',
                unit: 'Apt 4B',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            expect(() => validateAddress(address)).not.toThrow();
        });

        it('should reject empty street', () => {
            const address: Address = {
                street: '',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            expect(() => validateAddress(address)).toThrow(AddressValidationError);
            expect(() => validateAddress(address)).toThrow('Street is required');
        });

        it('should reject empty city', () => {
            const address: Address = {
                street: '123 Main St',
                city: '',
                state: 'CA',
                zipCode: '94105'
            };

            expect(() => validateAddress(address)).toThrow(AddressValidationError);
            expect(() => validateAddress(address)).toThrow('City is required');
        });

        it('should reject invalid state code', () => {
            const address: Address = {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'XX',
                zipCode: '94105'
            };

            expect(() => validateAddress(address)).toThrow(AddressValidationError);
            expect(() => validateAddress(address)).toThrow('Invalid state code');
        });

        it('should reject invalid zip code', () => {
            const address: Address = {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '9410'  // Too short
            };

            expect(() => validateAddress(address)).toThrow(AddressValidationError);
            expect(() => validateAddress(address)).toThrow('Invalid zip code');
        });

        it('should reject invalid street format', () => {
            const address: Address = {
                street: '123',  // Missing street name
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            expect(() => validateAddress(address)).toThrow(AddressValidationError);
            expect(() => validateAddress(address)).toThrow('Invalid street format');
        });

        it('should handle PO Box validation', () => {
            const address: Address = {
                street: 'PO Box 12345',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            expect(() => validateAddress(address)).not.toThrow();
        });

        it('should reject invalid PO Box format', () => {
            const address: Address = {
                street: 'PO Box',  // Missing box number
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            };

            expect(() => validateAddress(address)).toThrow(AddressValidationError);
            expect(() => validateAddress(address)).toThrow('Invalid PO Box format');
        });
    });
});
