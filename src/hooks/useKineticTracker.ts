import { useState, useEffect, useRef } from 'react';

export function useKineticTracker() {
  const [steps, setSteps] = useState(0);
  const STRIDE_LENGTH = 0.76; // Default human step sizing baseline: 76cm
  
  // Anti-Spoofing Window Tracker Variables
  const lastStepTimeRef = useRef<number>(Date.now());
  const anomalyFlaggedRef = useRef<boolean>(false);

  const calculateMetrics = (currentSteps: number) => {
    if (anomalyFlaggedRef.current) {
      return { meters: 0, km: 0, ubuntuRewardAllocation: 0 };
    }
    const meters = currentSteps * STRIDE_LENGTH;
    const km = meters / 1000;
    const ubuntuRewardAllocation = (meters / 100) * 0.5; // Distribute 0.5 $UBUNTU tokens per 100m metric covered
    return { meters, km, ubuntuRewardAllocation };
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('StepSensor' in window)) {
      console.warn("Kinetic Hardware Warning: Native step sensors are unavailable. Using sandbox mode.");
      return;
    }

    const physicalHardwareSensor = new (window as any).StepSensor();
    
    physicalHardwareSensor.onchange = () => {
      const currentTime = Date.now();
      const timeDifferenceMs = currentTime - lastStepTimeRef.current;
      
      // HARDENING PROTECTION: Reject updates if pacing crosses impossible human speeds (under 125ms per step)
      if (timeDifferenceMs < 125) {
        console.error("[!] Velocity protection triggered: Step sensor anomaly flagged. Spoofing suspected.");
        anomalyFlaggedRef.current = true;
        setSteps(0); // Instantly drop accumulated records to reset balance calculations
        return;
      }

      lastStepTimeRef.current = currentTime;
      if (!anomalyFlaggedRef.current) {
        setSteps(s => s + 1);
      }
    };

    return () => {
      try {
        physicalHardwareSensor.stop();
      } catch (e) {}
    };
  }, []);

  return { steps, ...calculateMetrics(steps), isTampered: anomalyFlaggedRef.current };
}
