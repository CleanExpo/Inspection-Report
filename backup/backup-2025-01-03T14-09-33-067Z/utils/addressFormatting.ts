interface AddressComponents {
  unit?: string;
  number: string;
  street: string;
  streetType: string;
  suburb: string;
  state: string;
  postcode: string;
}

const STREET_TYPES: Record<string, string> = {
  'ST': 'STREET',
  'RD': 'ROAD',
  'AVE': 'AVENUE',
  'DR': 'DRIVE',
  'CT': 'COURT',
  'CL': 'CLOSE',
  'CRES': 'CRESCENT',
  'PL': 'PLACE',
  'WAY': 'WAY',
  'GR': 'GROVE',
  'LA': 'LANE',
  'PDE': 'PARADE',
  'SQ': 'SQUARE',
  'TCE': 'TERRACE',
  'ESP': 'ESPLANADE',
  'BVD': 'BOULEVARD',
  'CCT': 'CIRCUIT',
  'HWY': 'HIGHWAY',
};

const STATE_CODES: Record<string, string> = {
  'NSW': 'New South Wales',
  'VIC': 'Victoria',
  'QLD': 'Queensland',
  'WA': 'Western Australia',
  'SA': 'South Australia',
  'TAS': 'Tasmania',
  'ACT': 'Australian Capital Territory',
  'NT': 'Northern Territory',
};

export class AddressFormatter {
  static parseAddress(address: string): AddressComponents | null {
    try {
      // Remove multiple spaces and trim
      const cleanAddress = address.replace(/\s+/g, ' ').trim().toUpperCase();
      
      // Try to match Australian address format
      const regex = /^(?:(?:UNIT|APARTMENT|FLAT)\s*(\d+)[,\s]+)?(\d+[A-Z]?)\s+([^,]+?)\s+(ST|RD|AVE|DR|CT|CL|CRES|PL|WAY|GR|LA|PDE|SQ|TCE|ESP|BVD|CCT|HWY|STREET|ROAD|AVENUE|DRIVE|COURT|CLOSE|CRESCENT|PLACE|GROVE|LANE|PARADE|SQUARE|TERRACE|ESPLANADE|BOULEVARD|CIRCUIT|HIGHWAY)(?:[,\s]+([^,]+))?(?:[,\s]+(NSW|VIC|QLD|WA|SA|TAS|ACT|NT))?(?:[,\s]+(\d{4}))?$/i;
      
      const matches = cleanAddress.match(regex);
      if (!matches) return null;

      const [, unit, number, street, type, suburb, state, postcode] = matches;

      // Validate and standardize components
      if (!number || !street || !type) return null;

      const standardizedType = STREET_TYPES[type] || type;

      return {
        ...(unit && { unit }),
        number,
        street: this.toTitleCase(street),
        streetType: standardizedType,
        suburb: suburb ? this.toTitleCase(suburb) : '',
        state: state || '',
        postcode: postcode || '',
      };
    } catch (error) {
      console.error('Error parsing address:', error);
      return null;
    }
  }

  static formatAddress(components: AddressComponents): string {
    const parts: string[] = [];

    if (components.unit) {
      parts.push(`Unit ${components.unit}`);
    }

    parts.push(`${components.number} ${components.street} ${components.streetType}`);

    if (components.suburb) {
      parts.push(components.suburb);
    }

    if (components.state) {
      parts.push(components.state);
    }

    if (components.postcode) {
      parts.push(components.postcode);
    }

    return parts.join(', ');
  }

  static standardizeAddress(address: string): string {
    const components = this.parseAddress(address);
    if (!components) {
      // If parsing fails, return the original address with basic cleanup
      return address.replace(/\s+/g, ' ').trim();
    }
    return this.formatAddress(components);
  }

  static validatePostcode(postcode: string, state?: string): boolean {
    if (!/^\d{4}$/.test(postcode)) return false;

    if (state) {
      const ranges: Record<string, Array<[number, number]>> = {
        'NSW': [[2000, 2999], [200, 299]],
        'ACT': [[2600, 2618], [2900, 2920]],
        'VIC': [[3000, 3999], [8000, 8999]],
        'QLD': [[4000, 4999], [9000, 9999]],
        'SA': [[5000, 5799], [5800, 5999]],
        'WA': [[6000, 6797], [6800, 6999]],
        'TAS': [[7000, 7799], [7800, 7999]],
        'NT': [[800, 899], [900, 999]],
      };

      const stateRanges = ranges[state];
      if (!stateRanges) return false;

      const code = parseInt(postcode);
      return stateRanges.some(([min, max]) => code >= min && code <= max);
    }

    return true;
  }

  static getStateFromPostcode(postcode: string): string | null {
    const code = parseInt(postcode);
    if (isNaN(code)) return null;

    if (code >= 2000 && code <= 2999) return 'NSW';
    if ((code >= 2600 && code <= 2618) || (code >= 2900 && code <= 2920)) return 'ACT';
    if (code >= 3000 && code <= 3999) return 'VIC';
    if (code >= 4000 && code <= 4999) return 'QLD';
    if (code >= 5000 && code <= 5999) return 'SA';
    if (code >= 6000 && code <= 6999) return 'WA';
    if (code >= 7000 && code <= 7999) return 'TAS';
    if (code >= 800 && code <= 999) return 'NT';

    return null;
  }

  private static toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static getStateName(stateCode: string): string {
    const upperCode = stateCode.toUpperCase();
    return STATE_CODES[upperCode] || stateCode;
  }

  static isValidStreetType(type: string): boolean {
    const upperType = type.toUpperCase();
    return Object.keys(STREET_TYPES).includes(upperType) || 
           Object.values(STREET_TYPES).includes(upperType);
  }
}
