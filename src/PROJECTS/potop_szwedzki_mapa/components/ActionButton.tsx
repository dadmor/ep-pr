// components/ActionButton.tsx
import React from 'react';
import clsx from 'clsx';

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
  const handleClick = () => {
    if (!disabled) {
      // Add a little button press animation
      const button = document.activeElement as HTMLElement;
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 100);
      }
      
      onClick();
    }
  };

  const buttonClasses = clsx(
    'px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200',
    {
      'bg-gray-600 text-gray-400 cursor-not-allowed': disabled,
      'bg-purple-600 hover:bg-purple-700 text-white active:scale-95': !disabled
    },
    'transform hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
    className
  );

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
};

export default React.memo(ActionButton);