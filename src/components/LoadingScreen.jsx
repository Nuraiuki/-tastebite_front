import React, { useState, useEffect } from 'react';

// Export both named and default for compatibility
export const LoadingScreen = ({ onComplete, text = "Tastebite Recipes 🍽️" }) => {
  const [typed, setTyped] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTyped(text.substring(0, index));
      index++;

      if (index > text.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 800);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [onComplete, text]);

  return (
    <div className="fixed inset-0 z-50 bg-white text-orange-500 flex flex-col items-center justify-center animate-fade-in">
      <div className="mb-4 text-3xl sm:text-4xl font-mono font-bold tracking-wide">
        {typed}
        <span className="animate-blink ml-1">|</span>
      </div>
      <div className="w-[200px] h-[3px] bg-gray-800 rounded overflow-hidden">
        <div className="w-[40%] h-full bg-orange-500 animate-loading-bar shadow-[0_0_15px_#f97316]" />
      </div>
    </div>
  );
};

export default LoadingScreen;
  