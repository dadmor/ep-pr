// components/ActionButton.tsx
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, disabled = false, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-lg text-lg font-bold transition-colors duration-200
        ${disabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default ActionButton;