import { useEffect } from "react";

export default function Toast({ message, onClose, duration = 2500 }) {
  useEffect(() => {
    const timeout = setTimeout(onClose, duration);
    return () => clearTimeout(timeout);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm animate-fade-in">
      {message}
    </div>
  );
}
