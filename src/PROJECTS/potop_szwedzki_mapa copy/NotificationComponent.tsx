import React, { useEffect, useState } from "react";
import { uiStore } from "./states/uiStore";
import { GAME_SETTINGS } from "./gameConstants";

const NotificationComponent: React.FC = () => {
  const notification = uiStore((state) => state.notification);
  const [isVisible, setIsVisible] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);
  
  useEffect(() => {
    if (notification) {
      // Show notification with animation
      setExitAnimation(false);
      setIsVisible(true);
      
      // Set up exit animation before hiding
      const hideTimer = setTimeout(() => {
        setExitAnimation(true);
        
        // Actually hide after animation completes
        setTimeout(() => {
          setIsVisible(false);
        }, 300); // Match animation duration
      }, GAME_SETTINGS.NOTIFICATION_TIMEOUT - 300);
      
      return () => clearTimeout(hideTimer);
    } else {
      setIsVisible(false);
    }
  }, [notification]);
  
  if (!isVisible || !notification) return null;
  
  // Determine notification style based on type
  let bgClass = "bg-blue-100 border-blue-300 text-blue-800";
  let icon = "ℹ️";
  
  switch (notification.type) {
    case "success":
      bgClass = "bg-green-100 border-green-300 text-green-800";
      icon = "✅";
      break;
    case "warning":
      bgClass = "bg-yellow-100 border-yellow-300 text-yellow-800";
      icon = "⚠️";
      break;
    case "error":
      bgClass = "bg-red-100 border-red-300 text-red-800";
      icon = "❌";
      break;
  }
  
  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
        ${bgClass} px-4 py-2 rounded-lg shadow-md border
        transition-all duration-300 flex items-center
        ${exitAnimation ? "opacity-0 translate-y-[-20px]" : "opacity-100"}`}
    >
      <span className="mr-2">{icon}</span>
      <span>{notification.message}</span>
    </div>
  );
};

export default React.memo(NotificationComponent);