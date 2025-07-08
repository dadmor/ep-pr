// components/ActionButton.tsx
import React from 'react';
import clsx from 'clsx';

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, disabled = false, className = '' }) => {
  const buttonClasses = clsx(
    'px-6 py-3 rounded-lg text-lg font-bold transition-colors duration-200',
    {
      'bg-gray-600 text-gray-400 cursor-not-allowed': disabled,
      'bg-purple-600 hover:bg-purple-700 text-white': !disabled
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