// IoT sensor simulation engine for UrbanGuard-AI
// Simulates real-time sensor readings for all 100 Chennai assets

export const IOT_CONFIG = {
  streetlight: {
    expectedPerUnit: 100,
    unit: 'W',
    label: 'Power Consumption',
    normalVariance: 0.03,
    faultyDrop: { min: 0.20, max: 0.40 }
  },
  road: {
    expectedPerUnit: 80,
    unit: 'score',
    label: 'Surface Integrity Score',
    normalVariance: 0.03,
    faultyDrop: { min: 0.25, max: 0.45 }
  },
  waterpipe: {
    expectedPerUnit: 50,
    unit: 'LPM',
    label: 'Flow Rate',
    normalVariance: 0.03,
    faultyDrop: { min: 0.20, max: 0.40 }
  },
  sewer: {
    expectedPerUnit: 30,
    unit: 'm³/hr',
    label: 'Flow Volume',
    normalVariance: 0.03,
    faultyDrop: { min: 0.20, max: 0.40 }
  }
};

export function generateIoTReading(asset, isFaulty = false) {
  const config = IOT_CONFIG[asset.type];
  const expected = config.expectedPerUnit;
  if (isFaulty) {
    const drop = config.faultyDrop.min + Math.random() * (config.faultyDrop.max - config.faultyDrop.min);
    const actual = parseFloat((expected * (1 - drop)).toFixed(1));
    const deviation = parseFloat((((expected - actual) / expected) * 100).toFixed(1));
    return { actual, expected, deviation, unit: config.unit, label: config.label };
  }
  const variance = (Math.random() - 0.5) * 2 * config.normalVariance;
  const actual = parseFloat((expected * (1 + variance)).toFixed(1));
  const deviation = parseFloat((((expected - actual) / expected) * 100).toFixed(1));
  return { actual, expected, deviation, unit: config.unit, label: config.label };
}

export function getStatusFromDeviation(deviation) {
  const abs = Math.abs(deviation);
  if (abs < 5) return 'healthy';
  if (abs < 20) return 'warning';
  return 'critical';
}

export function getHealthScore(deviation) {
  const abs = Math.abs(deviation);
  if (abs >= 40) return Math.floor(Math.random() * 20) + 20;
  if (abs >= 20) return Math.floor(Math.random() * 20) + 35;
  if (abs >= 5) return Math.floor(Math.random() * 20) + 60;
  return Math.floor(Math.random() * 15) + 85;
}
