// ./EventLogComponent.tsx
import React from "react";
import { useGameStore } from "./store";

const EventLogComponent: React.FC = () => {
  const eventLog = useGameStore((state) => state.eventLog);

  return (
    <div className="max-w-64 w-64">
      <div 
        className="space-y-1 overflow-y-auto max-h-80"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {eventLog.map((entry, idx) => (
          <div
            key={`${idx}-${entry}`}
            className={`text-sm text-amber-800 p-2 rounded bg-yellow-100 flex items-center gap-2 border border-amber-200 transition-all duration-300 ${
              idx === 0 ? 'animate-slideFromRight' : ''
            }`}
          >
            <span className="flex-1">{entry}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes slideFromRight {
          0% {
            transform: translateX(20px);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-slideFromRight {
          animation: slideFromRight 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EventLogComponent;
