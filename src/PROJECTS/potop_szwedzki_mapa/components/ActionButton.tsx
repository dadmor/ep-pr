// components/ActionButton.tsx
import React from 'react';
import clsx from 'clsx';

// Constants for button styling
const BUTTON_STYLES = {
  DISABLED: {
    BG: 'bg-gray-600',
    TEXT: 'text-gray-400',
    CURSOR: 'cursor-not-allowed'
  },
  ENABLED: {
    BG: 'bg-purple-600',
    HOVER: 'hover:bg-purple-700',
    TEXT: 'text-white'
  }
};

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  children, 
  disabled = false, 
  className = '' 
}) => {
  const buttonClasses = clsx(
    'px-6 py-3 rounded-lg text-lg font-bold transition-colors duration-200',
    {
      [BUTTON_STYLES.DISABLED.BG]: disabled,
      [BUTTON_STYLES.DISABLED.TEXT]: disabled,
      [BUTTON_STYLES.DISABLED.CURSOR]: disabled,
      [BUTTON_STYLES.ENABLED.BG]: !disabled,
      [BUTTON_STYLES.ENABLED.HOVER]: !disabled,
      [BUTTON_STYLES.ENABLED.TEXT]: !disabled
    },
    className
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
};

export default React.memo(ActionButton);