// Binary search fault detection algorithm for UrbanGuard-AI
// Identifies the exact faulty unit within an asset group in O(log n) steps

export function runBinarySearch(readings, expectedPerUnit) {
  const steps = [];
  let left = 0;
  let right = readings.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const leftSum = readings.slice(left, mid + 1).reduce((a, b) => a + b, 0);
    const rightSum = readings.slice(mid + 1, right + 1).reduce((a, b) => a + b, 0);
    const leftExpected = (mid - left + 1) * expectedPerUnit;
    const rightExpected = (right - mid) * expectedPerUnit;
    const leftDeviation = ((leftExpected - leftSum) / leftExpected) * 100;
    const rightDeviation = ((rightExpected - rightSum) / rightExpected) * 100;

    steps.push({
      step: steps.length + 1,
      left,
      right,
      mid,
      leftSum: parseFloat(leftSum.toFixed(1)),
      rightSum: parseFloat(rightSum.toFixed(1)),
      leftExpected: parseFloat(leftExpected.toFixed(1)),
      rightExpected: parseFloat(rightExpected.toFixed(1)),
      leftDeviation: parseFloat(leftDeviation.toFixed(1)),
      rightDeviation: parseFloat(rightDeviation.toFixed(1)),
      faultSide: rightDeviation > leftDeviation ? 'right' : 'left'
    });

    if (rightDeviation > leftDeviation) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return {
    faultyIndex: left,
    totalSteps: steps.length,
    steps
  };
}

export function generateFaultyReadings(totalUnits, faultyIndex, expectedPerUnit) {
  return Array.from({ length: totalUnits }, (_, i) =>
    i === faultyIndex ? 0 : expectedPerUnit
  );
}

export function generateRandomFault(totalUnits) {
  return Math.floor(Math.random() * totalUnits);
}
