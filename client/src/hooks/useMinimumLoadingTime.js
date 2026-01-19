import { useState, useEffect, useRef } from 'react';

/**
 * A hook to ensure a loader is visible for a minimum duration.
 * @param {boolean} isActuallyLoading - The real loading state from an API call or transition.
 * @param {number} minDisplayTime - The minimum time in milliseconds to show the loader.
 * @returns {boolean} - A boolean indicating if the loader should be displayed.
 */
export function useMinimumLoadingTime(isActuallyLoading, minDisplayTime = 3000) {
  const [shouldDisplayGridGlitchGame, setShouldDisplayGridGlitchGame] = useState(false);
  const loadingStartTime = useRef(0);

  useEffect(() => {
    if (isActuallyLoading) {
      // When loading starts, record the time and show the loader.
      loadingStartTime.current = Date.now();
      setShouldDisplayGridGlitchGame(true);
    } else if (shouldDisplayGridGlitchGame) {
      // When loading ends, calculate how long it's been.
      const timeElapsed = Date.now() - loadingStartTime.current;
      const remainingTime = minDisplayTime - timeElapsed;

      if (remainingTime > 0) {
        // If minimum time hasn't passed, wait before hiding the loader.
        const timer = setTimeout(() => setShouldDisplayGridGlitchGame(false), remainingTime);
        return () => clearTimeout(timer);
      } else {
        // Otherwise, hide it immediately.
        setShouldDisplayGridGlitchGame(false);
      }
    }
  }, [isActuallyLoading, minDisplayTime, shouldDisplayGridGlitchGame]);

  return shouldDisplayGridGlitchGame;
}
