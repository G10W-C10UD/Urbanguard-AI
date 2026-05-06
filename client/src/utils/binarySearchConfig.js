export const BINARY_SEARCH_CONFIGS = {
  streetlight: {
    label: 'Street Light Power Consumption',
    totalUnits: 20,
    expectedPerUnit: 100,
    unit: 'W',
    unitLabel: 'Watts',
    description: 'Each street light consumes 100W. A faulty light shows 0W consumption.',
    faultLabel: 'Light Unit',
    color: '#F59E0B',
    icon: 'Lightbulb'
  },
  road: {
    label: 'Road Surface Stress Sensors',
    totalUnits: 20,
    expectedPerUnit: 80,
    unit: 'score',
    unitLabel: 'Vibration Score',
    description: 'Each sensor zone expects score 80. Damaged zones read significantly lower.',
    faultLabel: 'Road Segment',
    color: '#EF4444',
    icon: 'Route'
  },
  waterpipe: {
    label: 'Pipeline Flow Rate Sensors',
    totalUnits: 20,
    expectedPerUnit: 50,
    unit: 'LPM',
    unitLabel: 'Litres Per Minute',
    description: 'Each pipe segment expects 50 LPM flow. A leak causes flow drop.',
    faultLabel: 'Pipe Segment',
    color: '#3B82F6',
    icon: 'Droplets'
  },
  sewer: {
    label: 'Sewer Flow Volume Sensors',
    totalUnits: 20,
    expectedPerUnit: 30,
    unit: 'm³/hr',
    unitLabel: 'Cubic Metres per Hour',
    description: 'Each sewer segment expects 30 m³/hr. A blockage causes flow reduction.',
    faultLabel: 'Sewer Segment',
    color: '#8B5CF6',
    icon: 'CircleDot'
  }
};
