// AssetContext — central state for all 100 Chennai infrastructure assets
// Provides: unified health scores, IoT simulation, anomaly data, social media, auto-dispatch
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import fallbackAssets from '../data/assets.js';
import { generateIoTReading, getStatusFromDeviation, getHealthScore } from '../utils/iotSimulator.js';
import { calculateAnomalyRisk } from '../utils/anomalyDetection.js';
import { runBinarySearch, generateRandomFault, generateFaultyReadings } from '../utils/binarySearch.js';
import { BINARY_SEARCH_CONFIGS } from '../utils/binarySearchConfig.js';

export const AssetContext = createContext();

export const useAssets = () => useContext(AssetContext);

// ─── Unified Health Score (5 signals combined) ───
export function calculateUnifiedHealthScore(asset, iotReading, anomalyEntry) {
  // Signal 1: IoT Score (40% weight)
  const iotDeviation = Math.abs(iotReading?.deviation || 0);
  const iotScore = iotDeviation > 20 ? 20 : iotDeviation > 5 ? 60 : 100;
  const iotWeight = iotScore * 0.40;

  // Signal 2: Anomaly Risk Score (25% weight)
  const riskScore = anomalyEntry?.riskScore || 0;
  const anomalyScore = 100 - riskScore;
  const anomalyWeight = anomalyScore * 0.25;

  // Signal 3: Complaint Score (15% weight)
  const complaintScore = asset.complaint_score || 0;
  const complaintHealth = complaintScore > 25 ? 20 : complaintScore > 10 ? 50 : 100;
  const complaintWeight = complaintHealth * 0.15;

  // Signal 4: Social Media Flags (10% weight)
  const socialFlags = asset.social_media_flags || 0;
  const socialHealth = socialFlags > 15 ? 30 : socialFlags > 5 ? 60 : 100;
  const socialWeight = socialHealth * 0.10;

  // Signal 5: Binary Search Result (10% weight)
  const binaryFault = asset.binary_faulty_index !== null && asset.binary_faulty_index !== undefined;
  const binaryHealth = binaryFault ? 30 : 100;
  const binaryWeight = binaryHealth * 0.10;

  const unified = Math.round(iotWeight + anomalyWeight + complaintWeight + socialWeight + binaryWeight);

  let status;
  if (unified >= 80) status = 'healthy';
  else if (unified >= 50) status = 'warning';
  else status = 'critical';

  return { unifiedScore: unified, status };
}

// ─── Social Media Post Templates ───
const SOCIAL_POSTS = {
  streetlight: [
    'Street light near {area} has been dark for 3 nights! #Chennai #GCC #UrbanGuardAI',
    'No street lights on {area} main road, very dangerous at night! #Chennai',
    'When will GCC fix the broken lights in {area}? #ChennaiProblems'
  ],
  road: [
    'Massive pothole on {area} road, nearly wrecked my bike! #Chennai #RoadConditions',
    'The road near {area} is completely broken, someone will get hurt! #Chennai',
    'Worst road condition in {area}, GCC please fix ASAP #ChennaiRoads'
  ],
  waterpipe: [
    'No water supply in {area} since morning, pipe seems burst! #ChennaiMetroWater',
    'Water flooding the street in {area} — pipe leak! #Chennai #WaterCrisis',
    'Low water pressure in {area} for 2 days, please check the pipelines #Chennai'
  ],
  sewer: [
    'Sewer overflow on {area} main road, unbearable! #Chennai #Sanitation',
    'Blocked drain in {area} causing flooding during rain #ChennaiFloods',
    'Sewer stench near {area} market, GCC please fix #Chennai #PublicHealth'
  ]
};

// ─── Default simulation config ───
const DEFAULT_SIM_CONFIG = {
  iotActive: true,
  updateIntervalMs: 30000,
  faultProbability: 0.15,
  iotCriticalThreshold: 20,
  iotWarningThreshold: 5,
  complaintCriticalScore: 25,
  socialMediaCriticalFlags: 15,
  anomalyHighRiskScore: 67,
};

export function AssetProvider({ children }) {
  const [assets, setAssets] = useState([]);
  const [iotReadings, setIotReadings] = useState({});
  const [anomalyData, setAnomalyData] = useState({});
  const [socialPosts, setSocialPosts] = useState({});
  const [autoDetectedFaults, setAutoDetectedFaults] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  // Simulation config (shared with Settings page)
  const [simConfig, setSimConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('urbanguard_sim_config');
      return stored ? { ...DEFAULT_SIM_CONFIG, ...JSON.parse(stored) } : DEFAULT_SIM_CONFIG;
    } catch {
      return DEFAULT_SIM_CONFIG;
    }
  });

  // Refs so intervals can always read latest values
  const simConfigRef = useRef(simConfig);
  const assetsRef = useRef(assets);
  const iotReadingsRef = useRef(iotReadings);
  const anomalyDataRef = useRef(anomalyData);

  useEffect(() => { simConfigRef.current = simConfig; }, [simConfig]);
  useEffect(() => { assetsRef.current = assets; }, [assets]);
  useEffect(() => { iotReadingsRef.current = iotReadings; }, [iotReadings]);
  useEffect(() => { anomalyDataRef.current = anomalyData; }, [anomalyData]);

  // Persist config changes
  const updateSimConfig = useCallback((updates) => {
    setSimConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('urbanguard_sim_config', JSON.stringify(next));
      return next;
    });
  }, []);

  // ─── Auto-dispatch helper ───
  const dispatchJob = useCallback(async (asset, faultDescription, severity, source) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('urbanguard_token');
      await axios.post(`${baseUrl}/api/jobs`, {
        asset_id: asset.id,
        asset_type: asset.type,
        area: asset.area,
        fault_description: faultDescription,
        severity,
        source,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Silently fail — job might already exist (duplicate guard on server)
    }
  }, []);

  // ─── Initialize assets ───
  useEffect(() => {
    let iotInterval;
    let socialInterval;

    const seedInitialFaults = () => {
      setAutoDetectedFaults(prev => {
        if (prev.length > 0) return prev;
        const seedFaults = [
          { assetId: 'SL-007', assetName: 'Nungambakkam High Road Light', assetType: 'streetlight', area: 'Nungambakkam', faultyUnitIndex: 14, totalUnits: 20, detectedAt: new Date(Date.now() - 4 * 60000).toISOString(), iotDeviation: -33.8, status: 'unreviewed' },
          { assetId: 'RD-004', assetName: 'Mount Road Central', assetType: 'road', area: 'Mount Road', faultyUnitIndex: 8, totalUnits: 20, detectedAt: new Date(Date.now() - 12 * 60000).toISOString(), iotDeviation: -29, status: 'unreviewed' },
          { assetId: 'WP-003', assetName: 'Adyar River Zone Pipeline', assetType: 'waterpipe', area: 'Adyar', faultyUnitIndex: 17, totalUnits: 20, detectedAt: new Date(Date.now() - 28 * 60000).toISOString(), iotDeviation: -24.5, status: 'unreviewed' },
        ];
        seedFaults.forEach(fault => {
          const config = BINARY_SEARCH_CONFIGS[fault.assetType];
          const readings = generateFaultyReadings(config.totalUnits, fault.faultyUnitIndex, config.expectedPerUnit);
          const result = runBinarySearch(readings, config.expectedPerUnit);
          fault.steps = result.steps;
          fault.totalSteps = result.totalSteps;
          fault.readings = readings;
          fault.totalUnits = config.totalUnits;
        });
        return seedFaults;
      });
    };

    const initializeAssets = async () => {
      let loadedAssets = [];
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${baseUrl}/api/assets`);
        if (res.data.success && res.data.data.length > 0) {
          loadedAssets = res.data.data;
        } else {
          loadedAssets = fallbackAssets;
        }
      } catch {
        loadedAssets = fallbackAssets;
      }

      // Decide initial faulty assets
      const initialFaultyIndices = new Set();
      const numFaulty = 15 + Math.floor(Math.random() * 6);
      while (initialFaultyIndices.size < numFaulty) {
        initialFaultyIndices.add(Math.floor(Math.random() * loadedAssets.length));
      }

      const newIotReadings = {};
      const newAnomalyData = {};
      const newSocialPosts = {};

      const processedAssets = loadedAssets.map((asset, index) => {
        const isFaulty = initialFaultyIndices.has(index);
        const reading = generateIoTReading(asset, isFaulty);
        const anomaly = calculateAnomalyRisk(asset);

        newIotReadings[asset.id] = reading;
        newAnomalyData[asset.id] = anomaly;
        newSocialPosts[asset.id] = [];

        // Calculate unified health score
        const { unifiedScore, status } = calculateUnifiedHealthScore(asset, reading, anomaly);

        return { ...asset, status, healthScore: unifiedScore, isFaulty };
      });

      setAssets(processedAssets);
      setIotReadings(newIotReadings);
      setAnomalyData(newAnomalyData);
      setSocialPosts(newSocialPosts);
      setLastUpdated(Date.now());
      setIsLoading(false);

      seedInitialFaults();

      // Start IoT timer — uses dynamic interval from config
      const startIoTTimer = () => {
        if (iotInterval) clearInterval(iotInterval);
        iotInterval = setInterval(() => {
          if (simConfigRef.current.iotActive) {
            updateIoTData();
          }
        }, simConfigRef.current.updateIntervalMs);
      };
      startIoTTimer();

      // Re-create interval when config changes
      const configWatcher = setInterval(() => {
        const currentInterval = simConfigRef.current.updateIntervalMs;
        // Check if we need to restart timer (store last known interval)
        if (configWatcher._lastInterval !== currentInterval) {
          configWatcher._lastInterval = currentInterval;
          startIoTTimer();
        }
      }, 2000);

      // Social media timer — every 90s
      socialInterval = setInterval(() => triggerSocialMedia(), 90000);

      return () => {
        clearInterval(iotInterval);
        clearInterval(socialInterval);
        clearInterval(configWatcher);
      };
    };

    const cleanup = initializeAssets();

    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(fn => fn && fn());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── IoT Update Cycle ───
  const updateIoTData = useCallback(() => {
    setAssets(prevAssets => {
      const config = simConfigRef.current;
      let assetsToUpdate = [...prevAssets];
      
      // Randomly flip 1-2 assets based on fault probability
      const flipCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < flipCount; i++) {
        const flipIdx = Math.floor(Math.random() * assetsToUpdate.length);
        if (assetsToUpdate[flipIdx].status !== 'repair' && assetsToUpdate[flipIdx].job_status !== 'assigned' && assetsToUpdate[flipIdx].job_status !== 'in_progress') {
          // Use fault probability from config
          assetsToUpdate[flipIdx] = {
            ...assetsToUpdate[flipIdx],
            isFaulty: Math.random() < config.faultProbability
          };
        }
      }

      const latestReadings = {};
      const latestAnomaly = anomalyDataRef.current;
      let newFaultsToDetect = [];
      const jobDispatches = [];

      const updatedAssets = assetsToUpdate.map(asset => {
        if (asset.status === 'repair' || asset.job_status === 'in_progress' || asset.job_status === 'assigned') {
          latestReadings[asset.id] = { ...(iotReadingsRef.current[asset.id] || {}), deviation: 0 };
          return asset;
        }

        const reading = generateIoTReading(asset, asset.isFaulty);
        latestReadings[asset.id] = reading;

        // Recalculate unified health score
        const anomalyEntry = latestAnomaly[asset.id];
        const { unifiedScore, status } = calculateUnifiedHealthScore(asset, reading, anomalyEntry);

        // Auto-dispatch trigger 1: IoT deviation > critical threshold
        if (Math.abs(reading.deviation) > config.iotCriticalThreshold && (!asset.job_status || asset.job_status === 'none')) {
          jobDispatches.push({
            asset,
            description: `IoT sensor detected ${Math.abs(reading.deviation).toFixed(1)}% deviation from expected reading. Automatic dispatch triggered.`,
            severity: 'critical',
            source: 'iot'
          });
        }

        // Auto-dispatch trigger 4: Anomaly risk > threshold
        if (anomalyEntry && anomalyEntry.riskScore > config.anomalyHighRiskScore && (!asset.job_status || asset.job_status === 'none')) {
          jobDispatches.push({
            asset,
            description: `Anomaly detection risk score ${anomalyEntry.riskScore}/100 exceeds threshold. Predictive maintenance dispatch.`,
            severity: 'critical',
            source: 'anomaly'
          });
        }

        // Binary search auto-trigger at deviation > 15%
        if (Math.abs(reading.deviation) > 15) {
          newFaultsToDetect.push({ asset, deviation: reading.deviation });
        }

        return { ...asset, status, healthScore: unifiedScore };
      });

      // Run binary search for newly detected faults
      if (newFaultsToDetect.length > 0) {
        setAutoDetectedFaults(prev => {
          let next = [...prev];
          let added = false;
          for (const item of newFaultsToDetect) {
            const { asset, deviation } = item;
            if (!next.some(f => f.assetId === asset.id && f.status === 'unreviewed')) {
              const bsConfig = BINARY_SEARCH_CONFIGS[asset.type] || BINARY_SEARCH_CONFIGS['streetlight'];
              const faultyIndex = generateRandomFault(bsConfig.totalUnits);
              const internalReadings = generateFaultyReadings(bsConfig.totalUnits, faultyIndex, bsConfig.expectedPerUnit);
              const result = runBinarySearch(internalReadings, bsConfig.expectedPerUnit);
              next.unshift({
                assetId: asset.id,
                assetName: asset.name,
                assetType: asset.type,
                area: asset.area,
                faultyUnitIndex: result.faultyIndex,
                totalUnits: bsConfig.totalUnits,
                steps: result.steps,
                totalSteps: result.totalSteps,
                detectedAt: new Date().toISOString(),
                iotDeviation: parseFloat(deviation.toFixed(1)),
                status: 'unreviewed'
              });
              added = true;

              // Auto-dispatch trigger 2: Binary search identifies fault
              if (result.faultyIndex !== null && (!asset.job_status || asset.job_status === 'none')) {
                jobDispatches.push({
                  asset,
                  description: `Binary search diagnostic identified fault at unit #${result.faultyIndex + 1} of ${bsConfig.totalUnits}. IoT deviation: ${Math.abs(deviation).toFixed(1)}%.`,
                  severity: 'critical',
                  source: 'binary_search'
                });
              }
            }
          }
          return added ? next.slice(0, 10) : prev;
        });
      }

      // Fire auto-dispatches (deduplicated by asset — only first trigger per asset)
      const dispatched = new Set();
      for (const job of jobDispatches) {
        if (!dispatched.has(job.asset.id)) {
          dispatched.add(job.asset.id);
          dispatchJob(job.asset, job.description, job.severity, job.source);
        }
      }

      setIotReadings(latestReadings);
      setLastUpdated(Date.now());
      return updatedAssets;
    });

    window.dispatchEvent(new Event('sensor_update'));
  }, [dispatchJob]);

  // ─── Social Media Simulation (every 90s) ───
  const triggerSocialMedia = useCallback(() => {
    setAssets(prevAssets => {
      let nextAssets = [...prevAssets];
      let modified = false;

      setSocialPosts(prevPosts => {
        const nextPosts = { ...prevPosts };
        const pickCount = 2 + Math.floor(Math.random() * 2); // 2-3 assets

        for (let i = 0; i < pickCount; i++) {
          const randIdx = Math.floor(Math.random() * nextAssets.length);
          const randAsset = nextAssets[randIdx];
          const postCount = 1 + Math.floor(Math.random() * 3); // 1-3 posts

          nextAssets[randIdx] = {
            ...randAsset,
            social_media_flags: (randAsset.social_media_flags || 0) + postCount
          };
          modified = true;

          for (let p = 0; p < postCount; p++) {
            const templates = SOCIAL_POSTS[randAsset.type];
            if (templates) {
              const tmpl = templates[Math.floor(Math.random() * templates.length)];
              const areaName = randAsset.area || randAsset.name;
              const post = tmpl.replace(/{area}/g, areaName).replace(/{road name}/g, areaName);
              nextPosts[randAsset.id] = nextPosts[randAsset.id] || [];
              nextPosts[randAsset.id].push({
                text: post,
                timestamp: new Date().toISOString(),
                platform: ['Twitter/X', 'Facebook', 'Local Forum'][Math.floor(Math.random() * 3)]
              });
            }
          }
        }
        return nextPosts;
      });

      if (modified) {
        // Recalculate unified scores for modified assets
        return nextAssets.map(asset => {
          const reading = iotReadingsRef.current[asset.id];
          const anomaly = anomalyDataRef.current[asset.id];
          const { unifiedScore, status } = calculateUnifiedHealthScore(asset, reading, anomaly);
          // Don't override status if under repair
          if (asset.status === 'repair' || asset.job_status === 'in_progress' || asset.job_status === 'assigned') {
            return asset;
          }
          return { ...asset, status, healthScore: unifiedScore };
        });
      }
      return prevAssets;
    });
  }, []);

  // ─── Reset helpers (for Settings page) ───
  const resetIoTSimulation = useCallback(() => {
    setAssets(prev => prev.map(a => ({
      ...a,
      isFaulty: false,
      status: 'healthy',
      healthScore: 100
    })));
    setIotReadings(prev => {
      const reset = {};
      for (const id in prev) {
        reset[id] = { ...prev[id], deviation: 0, actual: prev[id].expected };
      }
      return reset;
    });
  }, []);

  const clearSocialFlags = useCallback(() => {
    setAssets(prev => prev.map(a => ({ ...a, social_media_flags: 0 })));
    setSocialPosts({});
  }, []);

  // ─── Utility getters ───
  const getAssetById = (id) => assets.find(a => a.id === id);
  const getCriticalAssets = () => assets.filter(a => a.status === 'critical');
  const getWarningAssets = () => assets.filter(a => a.status === 'warning');
  const getAssetsByType = (type) => assets.filter(a => a.type === type);

  const markFaultReviewed = useCallback((assetId) => {
    setAutoDetectedFaults(prev => prev.map(f => f.assetId === assetId ? { ...f, status: 'reviewed' } : f));
  }, []);

  const value = {
    assets,
    iotReadings,
    anomalyData,
    socialPosts,
    lastUpdated,
    isLoading,
    autoDetectedFaults,
    simConfig,
    updateSimConfig,
    resetIoTSimulation,
    clearSocialFlags,
    markFaultReviewed,
    getAssetById,
    getCriticalAssets,
    getWarningAssets,
    getAssetsByType,
    calculateUnifiedHealthScore,
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
}
