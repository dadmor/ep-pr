// === NotificationComponent.tsx ===
import React from "react";
import { useGameStore, Notification } from "./store";

const NotificationComponent: React.FC = () => {
  const notification = useGameStore((state) => state.ui.notification);

  if (!notification) return null;

  const getNotificationStyles = (type: Notification["type"]): string => {
    switch (type) {
      case "success":
        return "bg-yellow-200 border-amber-400";
      case "warning":
        return "bg-yellow-100 border-yellow-400";
      case "error":
        return "bg-red-100 border-red-400";
      default:
        return "bg-yellow-200 border-amber-400";
    }
  };

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg font-bold z-30 backdrop-blur-sm text-amber-900 border animate-slideDown ${getNotificationStyles(
        notification.type
      )}`}
    >
      {notification.message}
      
      <style>{`
        @keyframes slideDown {
          0% {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationComponent;