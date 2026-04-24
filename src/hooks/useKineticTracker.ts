import { useState, useEffect } from 'react';

export function useKineticTracker() {
  const [steps, setSteps] = useState(0);
  const STRIDE_LENGTH = 0.76; // 76cm per step

  const calculateMetrics = (currentSteps: number) => {
    const meters = currentSteps * STRIDE_LENGTH;
    const km = meters / 1000;
    const haba = (meters / 100) * 0.5; // 0.5 HABA per 100m
    return { meters, km, haba };
  };

  // Logic to listen to the phone's physical sensors
  useEffect(() => {
    const sensor = new (window as any).StepSensor(); // Use Android Pedometer API
    sensor.onchange = () => setSteps(s => s + 1);
  }, []);

  return { steps, ...calculateMetrics(steps) };
}
