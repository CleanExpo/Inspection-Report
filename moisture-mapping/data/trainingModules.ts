import { TrainingModule } from '../types/training';

export const trainingModules: TrainingModule[] = [
  {
    id: 'basics-water-damage',
    category: 'basics',
    title: 'Water Damage Basics',
    description: 'Learn fundamental concepts of water damage restoration in Australia',
    estimatedMinutes: 30,
    requiredForCertification: true,
    steps: [
      {
        id: 'water-categories',
        title: 'Water Categories',
        content: `
          Understanding water categories is crucial for safe restoration:
          
          • Category 1 (Clean Water)
          - Broken water supply lines
          - Overflow from clean water sources
          - Rainwater/storm damage
          
          • Category 2 (Grey Water)
          - Washing machine overflow
          - Toilet overflow (urine only)
          - Aquarium leaks
          
          • Category 3 (Black Water)
          - Sewage backups
          - River/flood water
          - Seawater intrusion
        `,
        quiz: {
          question: 'Which category would you assign to a washing machine overflow?',
          options: ['Category 1', 'Category 2', 'Category 3'],
          correctIndex: 1,
          explanation: 'Washing machine overflow is Category 2 (Grey Water) due to potential contaminants from detergents and soiled items.'
        }
      },
      {
        id: 'material-types',
        title: 'Common Building Materials',
        content: `
          Australian construction commonly uses:
          
          • Plasterboard (Gyprock)
          - Most interior walls
          - Highly moisture sensitive
          - Requires quick action
          
          • Timber
          - Structural elements
          - Flooring
          - Skirting boards
          
          • Concrete
          - Foundations
          - Floors
          - Slower to dry
        `,
        quiz: {
          question: 'Which material typically requires the most urgent attention when wet?',
          options: ['Concrete', 'Timber', 'Plasterboard'],
          correctIndex: 2,
          explanation: 'Plasterboard is highly moisture sensitive and can quickly develop mould, requiring immediate attention.'
        }
      }
    ]
  },
  {
    id: 'equipment-usage',
    category: 'equipment',
    title: 'Moisture Detection Equipment',
    description: 'Master the use of common moisture detection tools',
    estimatedMinutes: 45,
    requiredForCertification: true,
    steps: [
      {
        id: 'moisture-meters',
        title: 'Using Moisture Meters',
        content: `
          Common moisture meters in Australia:
          
          • Protimeter
          - Pin-type for deep readings
          - Search mode for surface scanning
          - Calibrated for timber (%WME)
          
          • Tramex
          - Non-invasive scanning
          - Multiple material scales
          - Large scanning area
          
          • FLIR
          - Thermal imaging
          - Large area assessment
          - Non-contact operation
        `,
        quiz: {
          question: 'Which meter type is best for non-invasive initial surveys?',
          options: ['Pin-type meter', 'Capacitance meter', 'Thermal camera'],
          correctIndex: 1,
          explanation: 'Capacitance meters (like Tramex) are ideal for initial surveys as they are non-invasive and can quickly scan large areas.'
        }
      }
    ]
  },
  {
    id: 'safety-procedures',
    category: 'safety',
    title: 'Safety Protocols',
    description: 'Essential safety procedures for water damage restoration',
    estimatedMinutes: 40,
    requiredForCertification: true,
    steps: [
      {
        id: 'ppe-requirements',
        title: 'Personal Protective Equipment',
        content: `
          Required PPE in Australia:
          
          • Category 1 Water
          - Gloves
          - Safety boots
          - High-vis vest
          
          • Category 2 Water
          - Above items plus:
          - P2 mask
          - Eye protection
          
          • Category 3 Water
          - Full PPE including:
          - Disposable suit
          - Face shield
          - Respiratory protection
        `,
        quiz: {
          question: 'What additional PPE is required when dealing with Category 2 water compared to Category 1?',
          options: ['Just gloves', 'P2 mask and eye protection', 'Full disposable suit'],
          correctIndex: 1,
          explanation: 'Category 2 water requires additional P2 mask and eye protection due to potential contaminants.'
        }
      }
    ]
  },
  {
    id: 'best-practices',
    category: 'bestPractices',
    title: 'IICRC Best Practices',
    description: 'Industry standard practices for water damage restoration',
    estimatedMinutes: 35,
    requiredForCertification: true,
    steps: [
      {
        id: 'drying-standards',
        title: 'Drying Standards',
        content: `
          IICRC S500 Standard requirements:
          
          • Goal moisture content:
          - Timber: 12-15%
          - Plasterboard: 10-12%
          - Concrete: 12-14%
          
          • Drying time targets:
          - 3-5 days typical
          - Daily moisture reduction
          - Document all readings
          
          • Environmental conditions:
          - Temperature: 21-29°C
          - Humidity: 30-50% RH
          - Air movement: Essential
        `,
        quiz: {
          question: 'What is the acceptable moisture content range for timber according to IICRC standards?',
          options: ['8-10%', '12-15%', '16-20%'],
          correctIndex: 1,
          explanation: 'According to IICRC S500, timber should be dried to 12-15% moisture content for proper restoration.'
        }
      }
    ]
  }
];
