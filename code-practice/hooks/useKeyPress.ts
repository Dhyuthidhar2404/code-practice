import { useState, useEffect } from 'react';

/**
 * A custom hook that monitors key presses
 * @param targetKey The key to monitor
 * @returns boolean indicating if the key is currently pressed
 */
function useKeyPress(targetKey: string): boolean {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

  // Add event listeners
  useEffect(() => {
    // If pressed key is our target key then set to true
    const downHandler = (event: KeyboardEvent): void => {
      if (event.key === targetKey) {
        setKeyPressed(true);
      }
    };

    // If released key is our target key then set to false
    const upHandler = (event: KeyboardEvent): void => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]); // Only re-run if targetKey changes

  return keyPressed;
}

export default useKeyPress; 