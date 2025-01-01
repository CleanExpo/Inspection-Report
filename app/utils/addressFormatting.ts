import { CountryCode, STATE_CODES, Address as AddressType } from '../types/address';

export type Address = AddressType;

/**
 * Address validation error
 */
export class AddressValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AddressValidationError';
    }
}

/**
 * Postal code validation patterns by country
 */
const POSTAL_PATTERNS: Record<CountryCode, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i
};

/**
 * Capitalizes first letter of each word
 */
function capitalizeWords(str: string): string {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Formats an address into a standardized string
 */
export function formatAddress(address: Address): string {
    const parts: string[] = [];

    // Format street
    const street = address.street.trim();
    parts.push(capitalizeWords(street));

    // Add unit if present
    if (address.unit) {
        parts.push(capitalizeWords(address.unit.trim()));
    }

    // Add city
    parts.push(capitalizeWords(address.city.trim()));

    // Add state (always uppercase)
    parts.push(address.state.trim().toUpperCase());

    // Add zip code
    parts.push(address.zipCode.trim());

    return parts.join(', ');
}

/**
 * Validates a postal code for a given country
 */
export function validatePostalCode(code: string, countryCode: CountryCode): void {
    const pattern = POSTAL_PATTERNS[countryCode];
    if (!pattern) {
        throw new AddressValidationError(`Unsupported country code: ${countryCode}`);
    }

    if (!pattern.test(code)) {
        throw new AddressValidationError(`Invalid postal code format for ${countryCode}`);
    }
}

/**
 * Validates a state/territory code for a given country
 */
export function validateStateTerritory(state: string, countryCode: CountryCode): void {
    const validCodes = STATE_CODES[countryCode];
    if (!validCodes) {
        throw new AddressValidationError(`Unsupported country code: ${countryCode}`);
    }

    const stateCode = state.toUpperCase();
    if (!validCodes.includes(stateCode as any)) {
        throw new AddressValidationError(
            `Invalid state/territory code for ${countryCode}`
        );
    }
}

/**
 * Validates an address
 */
export function validateAddress(address: Address): void {
    // Check required fields
    if (!address.street.trim()) {
        throw new AddressValidationError('Street is required');
    }
    if (!address.city.trim()) {
        throw new AddressValidationError('City is required');
    }
    if (!address.state.trim()) {
        throw new AddressValidationError('State is required');
    }
    if (!address.zipCode.trim()) {
        throw new AddressValidationError('Zip code is required');
    }

    // Validate postal code and state
    const countryCode = address.countryCode || 'US';
    validatePostalCode(address.zipCode.trim(), countryCode);
    validateStateTerritory(address.state.trim(), countryCode);

    // Basic street validation
    const street = address.street.trim();
    if (street.toLowerCase().startsWith('po box')) {
        if (!/^po box \d+$/i.test(street)) {
            throw new AddressValidationError('Invalid PO Box format');
        }
    } else {
        if (!/^\d+\s+\w+(\s+\w+)*(\s+(st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane|dr|drive|way|ct|court|cir|circle|pl|place))$/i.test(street)) {
            throw new AddressValidationError('Invalid street format');
        }
    }
}
