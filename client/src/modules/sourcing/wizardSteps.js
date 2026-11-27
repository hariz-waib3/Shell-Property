import { STATES } from '@/data/constants'

// control: 'single' | 'multiple' | 'input' | 'textarea'
export const WIZARD_STEPS = [
  {
    title: 'Your enquiry',
    questions: [
      {
        key: 'kind',
        label: 'What best describes this enquiry?',
        control: 'single',
        required: true,
        options: [
          'Active buyer ready to review',
          'Active buyer comparing options',
          'Active buyer ready for EOI',
          'Existing EOI',
        ],
      },
      {
        key: 'stage',
        label: 'Where is this buyer up to?',
        control: 'single',
        required: true,
        options: ['Already presented', 'Presentation booked', 'Not yet booked'],
      },
    ],
  },
  {
    title: 'The buyer',
    note: {
      title: 'Why this matters.',
      text: 'Lot availability changes daily. We confirm with the builder when your buyer is ready to act.',
    },
    questions: [
      {
        key: 'finance',
        label: 'Financial status',
        control: 'single',
        required: true,
        options: ['Pre-approval', 'Eligibility letter', 'Broker engaged', 'Cash buyer', 'Not yet assessed', 'Unknown'],
      },
      { key: 'budget', label: 'Maximum budget', control: 'input', required: true, placeholder: 'e.g. $750,000' },
      {
        key: 'decision',
        label: 'When will the buyer decide?',
        control: 'single',
        required: true,
        options: ['Ready to buy', 'Within 3 days', 'Beyond 3 days', 'Unknown'],
      },
      {
        key: 'ownership',
        label: 'Ownership type',
        control: 'single',
        required: true,
        options: ['Investor', 'Owner occupier', 'First home buyer'],
      },
    ],
  },
  {
    title: 'The property',
    questions: [
      {
        key: 'configurations',
        label: 'Property configuration',
        control: 'multiple',
        required: true,
        options: [
          '4 beds H&L',
          '3 beds H&L',
          'Complete H&L',
          'FIRB H&L',
          'Townhouse',
          'NDIS',
          'Dual key / dual dwelling',
          'Duplex',
          'Co living',
          'Other',
        ],
      },
      { key: 'states', label: 'Target states', control: 'multiple', required: true, options: STATES },
      { key: 'suburbs', label: 'Suburbs or localities', control: 'input', placeholder: 'e.g. Clyde North, Rosewood' },
      { key: 'landSize', label: 'Land size', control: 'input', placeholder: 'e.g. 350–450 sqm' },
      {
        key: 'facing',
        label: 'Land facing',
        control: 'single',
        options: ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'],
      },
    ],
  },
  {
    title: 'Final details',
    questions: [
      {
        key: 'contract',
        label: 'Contract type',
        control: 'single',
        options: ['2-part contract', 'Single contract', 'Land only', 'Build only', 'No preference'],
      },
      {
        key: 'registration',
        label: 'Ideal registration',
        control: 'single',
        options: ['Registered / titled', 'Within 6 months', '6–12 months', '12+ months', 'No preference'],
      },
      {
        key: 'notes',
        label: 'Anything else we should know?',
        control: 'textarea',
        placeholder: 'Timing, must-haves, deal breakers…',
      },
    ],
  },
]
