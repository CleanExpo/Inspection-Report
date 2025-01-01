export const australianTerms = {
  // Room terminology
  room: {
    livingRoom: 'Lounge Room',
    bathroom: 'Bathroom',
    kitchen: 'Kitchen',
    bedroom: 'Bedroom',
    laundry: 'Laundry',
    basement: 'Cellar'
  },

  // Material types
  material: {
    drywall: 'Plasterboard',
    wood: 'Timber',
    concrete: 'Concrete',
    carpet: 'Carpet'
  },

  // Measurement terms
  measurement: {
    moisture: 'Moisture',
    temperature: 'Temperature',
    humidity: 'Humidity',
    unit: {
      moisture: '%WME', // Wood Moisture Equivalent
      temperature: '°C',
      humidity: '%RH'
    }
  },

  // Reading methods
  readingMethod: {
    surface: 'Surface',
    deep: 'Deep',
    penetrating: 'Penetrating',
    nonInvasive: 'Non-Invasive'
  },

  // Device names (common in Australia)
  device: {
    protimeter: 'Protimeter',
    flir: 'FLIR',
    tramex: 'Tramex',
    genericMeter: 'Moisture Meter'
  },

  // Status terms
  status: {
    dry: 'Dry',
    affected: 'Affected',
    wet: 'Wet',
    saturated: 'Saturated'
  },

  // Action buttons
  actions: {
    addReading: 'Add Reading',
    finalizeDay: 'Finalise Day',
    startNewDay: 'Start New Day',
    takePhoto: 'Take Photo',
    uploadPhoto: 'Upload Photo'
  },

  // Placeholders
  placeholders: {
    roomName: 'e.g., Lounge Room, Kitchen',
    roomDescription: 'e.g., North wall, near window',
    searchReadings: 'Search readings...',
    notes: 'Add notes here...'
  }
};
