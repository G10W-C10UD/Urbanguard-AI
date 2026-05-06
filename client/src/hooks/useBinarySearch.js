// Custom hook managing binary search state and animation for UrbanGuard-AI
import { useState, useCallback, useRef } from 'react';
import { runBinarySearch, generateFaultyReadings, generateRandomFault } from '../utils/binarySearch';

export function useBinarySearch(config) {
  const [readings, setReadings] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [faultyIndex, setFaultyIndex] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutsRef = useRef([]);

  const simulateFault = useCallback((presetFaultIndex = null) => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsComplete(false);
    setCurrentStep(-1);
    setSteps([]);
    setFaultyIndex(null);
    setIsRunning(true);

    const faultIdx = presetFaultIndex !== null ? presetFaultIndex : generateRandomFault(config.totalUnits);
    const newReadings = generateFaultyReadings(config.totalUnits, faultIdx, config.expectedPerUnit);
    setReadings(newReadings);

    const result = runBinarySearch(newReadings, config.expectedPerUnit);

    // Initial pause of 500ms before starting Step 1
    const t0 = setTimeout(() => {
      result.steps.forEach((step, i) => {
        const t = setTimeout(() => {
          setCurrentStep(i);
          setSteps(prev => [...prev, step]);
          if (i === result.steps.length - 1) {
            setTimeout(() => {
              setFaultyIndex(result.faultyIndex);
              setIsComplete(true);
              setIsRunning(false);
            }, 1200);
          }
        }, i * 1200);
        timeoutsRef.current.push(t);
      });
    }, 500);
    timeoutsRef.current.push(t0);
  }, [config]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    setReadings([]);
    setSteps([]);
    setCurrentStep(-1);
    setFaultyIndex(null);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  return { readings, steps, currentStep, faultyIndex, isRunning, isComplete, simulateFault, reset };
}
