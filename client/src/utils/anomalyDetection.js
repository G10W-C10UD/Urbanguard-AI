// Predictive anomaly detection engine for UrbanGuard-AI
// Uses age, weather, and seasonal factors to predict infrastructure failure

// Chennai seasonal weather factors
export const CHENNAI_SEASONS = {
  monsoon: {
    months: [6, 7, 8, 9],
    label: 'Southwest Monsoon',
    factors: { streetlight: 0.3, road: 0.9, waterpipe: 0.5, sewer: 0.9 }
  },
  northeast_monsoon: {
    months: [10, 11, 12],
    label: 'Northeast Monsoon',
    factors: { streetlight: 0.4, road: 0.7, waterpipe: 0.5, sewer: 0.7 }
  },
  summer: {
    months: [3, 4, 5],
    label: 'Summer',
    factors: { streetlight: 0.8, road: 0.4, waterpipe: 0.6, sewer: 0.3 }
  },
  winter: {
    months: [1, 2],
    label: 'Winter / Dry Season',
    factors: { streetlight: 0.1, road: 0.2, waterpipe: 0.2, sewer: 0.1 }
  }
};

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  for (const [key, season] of Object.entries(CHENNAI_SEASONS)) {
    if (season.months.includes(month)) return { key, ...season };
  }
  return { key: 'winter', ...CHENNAI_SEASONS.winter };
}

export function calculateAnomalyRisk(asset) {
  const installYear = new Date(asset.installed_date || asset.installedDate || '2015-01-01').getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - installYear;
  // Use a default lifespan if not available, e.g., 20 years
  const expectedLifespan = asset.expected_lifespan_years || asset.expectedLifespan || 20;
  const ageFactor = Math.min(age / expectedLifespan, 1.0);

  const season = getCurrentSeason();
  const weatherFactor = season.factors[asset.type] || 0.3;

  const baseDegradation = 0.1;
  const riskScore = ((ageFactor * 0.4) + (weatherFactor * 0.4) + (baseDegradation * 0.2)) * 100;

  let riskLevel;
  if (riskScore < 34) riskLevel = 'low';
  else if (riskScore < 67) riskLevel = 'medium';
  else riskLevel = 'high';

  const monthsRemaining = Math.max(0, (1 - ageFactor) * expectedLifespan * 12);
  const predictedFailureDate = new Date();
  predictedFailureDate.setMonth(predictedFailureDate.getMonth() + Math.floor(monthsRemaining));

  return {
    ageFactor: parseFloat(ageFactor.toFixed(2)),
    weatherFactor: parseFloat(weatherFactor.toFixed(2)),
    riskScore: parseFloat(riskScore.toFixed(1)),
    riskLevel,
    season: season.label,
    predictedFailureDate: predictedFailureDate.toISOString().split('T')[0],
    monthsRemaining: Math.floor(monthsRemaining),
    age,
    installYear,
    expectedLifespan
  };
}

export function getRiskColor(riskLevel) {
  if (riskLevel === 'high') return '#EF4444';
  if (riskLevel === 'medium') return '#F59E0B';
  return '#22C55E';
}
