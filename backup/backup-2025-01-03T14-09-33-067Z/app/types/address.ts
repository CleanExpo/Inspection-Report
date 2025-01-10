/**
 * Supported country codes
 */
export type CountryCode = 'US' | 'CA';

/**
 * Address interface
 */
export interface Address {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
    countryCode?: CountryCode;
}

/**
 * Postal code format by country
 */
export const POSTAL_FORMATS = {
    US: '12345 or 12345-6789',
    CA: 'A1A 1A1'
} as const;

/**
 * State/territory codes by country
 */
export const STATE_CODES = {
    US: [
        // States
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        // Territories
        'DC', 'PR', 'VI', 'AS', 'GU', 'MP'
    ],
    CA: [
        // Provinces
        'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK',
        // Territories
        'NT', 'NU', 'YT'
    ]
} as const;
