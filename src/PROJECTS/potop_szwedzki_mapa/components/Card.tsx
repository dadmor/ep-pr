// components/Card.tsx
import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Card as CardType } from '../types';
import { useAnimation } from '../context/AnimationContext';

// Constants for health bar thresholds
const HEALTH_THRESHOLD = {
  HIGH: 66,
  MEDIUM: 33
};

interface CardProps {
  card: CardType;
  onClick?: (cardId: string) => void;
  isClickable?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  isClickable = false, 
  isSelected = false, 
  isPlayable = false, 
  className = '' 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { registerCardRef } = useAnimation();

  // Register card ref for animations
  useEffect(() => {
    if (cardRef.current) {
      registerCardRef(card.id, cardRef.current);
    }
    return () => registerCardRef(card.id, null);
  }, [card.id, registerCardRef]);

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(card.id);
    }
  };

  // Calculate HP percentage for progress bar
  const hpPercentage = (card.hp / card.maxHp) * 100;

  // Organize CSS classes with clsx
  const cardClasses = clsx(
    'relative w-32 h-48 bg-zinc-700 rounded-lg shadow-lg text-white font-bold',
    'flex flex-col justify-between items-center p-2 m-2 border-2',
    'transition-all duration-300', // For smoother transitions
    {
      'cursor-pointer hover:scale-105 transition-transform': isClickable,
      'border-blue-500 ring-4 ring-blue-500': isSelected,
      'border-green-500 ring-2 ring-green-500': isPlayable,
      'opacity-70 grayscale': card.hasAttacked,
      'border-zinc-800': !isSelected && !isPlayable
    },
    className
  );

  return (
    <div 
      ref={cardRef}
      className={cardClasses} 
      onClick={handleClick} 
      data-card-id={card.id} // Add data attribute for easier selection
    >
      {/* Top section with name and cost */}
      <div className="w-full flex justify-between items-start">
        <div className="text-sm text-center truncate max-w-[70%]">{card.name}</div>
        <div className="bg-yellow-500 text-gray-900 text-xs px-2 py-0.5 rounded-full flex items-center">
          <span>{card.cost}</span>
        </div>
      </div>
      
      {/* Middle section for card art or description */}
      <div className="flex-grow flex flex-col justify-center items-center py-2">
        {/* Card art or description could go here */}
      </div>
      
      {/* Bottom section with stats and HP bar */}
      <div className="w-full mt-auto">
        {/* Attack and Armor stats */}
        <div className="flex justify-between items-center mb-1 px-1">
          <div className="text-base flex items-center">⚔️ {card.attack}</div>
          <div className="text-base flex items-center">🛡️ {card.armor}</div>
        </div>
        
        {/* HP Progress bar */}
        <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
          <div 
            className={clsx(
              "h-full rounded-full transition-all duration-300",
              hpPercentage > HEALTH_THRESHOLD.HIGH ? "bg-green-500" : 
              hpPercentage > HEALTH_THRESHOLD.MEDIUM ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ width: `${hpPercentage}%` }}
          ></div>
        </div>
        
        {/* HP text overlay */}
        <div className="text-xs text-center mt-0.5">
          ❤️ {card.hp}/{card.maxHp}
        </div>
      </div>
    </div>
  );
};

// Optimize rendering with React.memo
export default React.memo(Card);