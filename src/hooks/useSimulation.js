import { useState, useEffect, useRef, useCallback } from 'react';

export const SIMULATION_SPEEDS = {
  slow: 1000,
  normal: 400,
  fast: 100,
};

export function useSimulation(traceSteps = []) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMode, setSpeedMode] = useState('normal'); // 'slow' | 'normal' | 'fast'
  const timerRef = useRef(null);

  const totalSteps = traceSteps?.length || 0;
  const currentStep = totalSteps > 0 && currentStepIndex < totalSteps ? traceSteps[currentStepIndex] : null;

  // Whenever new trace arrives, reset to 0 or last
  useEffect(() => {
    if (totalSteps > 0) {
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [totalSteps]);

  const stepForward = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      } else {
        setIsPlaying(false);
        return prev;
      }
    });
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const play = useCallback(() => {
    if (totalSteps === 0) return;
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [totalSteps, currentStepIndex]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const jumpToStep = useCallback((index) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  }, [totalSteps]);

  // Handle play interval loop
  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      const interval = SIMULATION_SPEEDS[speedMode] || 400;
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < totalSteps - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, interval);

      return () => clearInterval(timerRef.current);
    }
  }, [isPlaying, speedMode, totalSteps]);

  return {
    currentStepIndex,
    totalSteps,
    currentStep,
    isPlaying,
    speedMode,
    setSpeedMode,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    jumpToStep,
  };
}

