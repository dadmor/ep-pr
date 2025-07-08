import React, { useRef, useEffect } from "react";
import { useGameStore } from "./states/gameStore";

const EventLogComponent: React.FC = () => {
  const eventLog = useGameStore((state) => state.game.eventLog);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the latest log entry when log changes
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [eventLog]);
  
  return (
    <div className="bg-yellow-50/70 backdrop-blur-lg rounded-xl p-2 shadow-lg/50 overflow-hidden">
      <h3 className="text-amber-800 font-bold text-sm mb-1 flex items-center">
        <span className="mr-1">📜</span> Kronika Wydarzeń
      </h3>
      <div 
        ref={logContainerRef}
        className="h-64 overflow-y-auto pr-1 text-xs space-y-1 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100"
      >
        {eventLog.map((event, index) => (
          <div 
            key={index} 
            className={`p-1 rounded ${
              index === 0 
                ? "bg-amber-100/80 font-medium" 
                : "hover:bg-amber-50/80"
            }`}
          >
            {event}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(EventLogComponent);