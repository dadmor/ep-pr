// components/Card.tsx
import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Card as CardType } from '../types';
import { useAnimation } from '../context/AnimationContext';

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
    registerCardRef(card.id, cardRef.current);
    return () => registerCardRef(card.id, null);
  }, [card.id, registerCardRef]);

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(card.id);
    }
  };

  // Uporządkowanie klas CSS za pomocą clsx
  const cardClasses = clsx(
    'relative w-32 h-48 bg-gray-800 rounded-lg shadow-lg text-white font-bold',
    'flex flex-col justify-between items-center p-2 m-2 border-2',
    'transition-all duration-300', // Add transition for smoother effects
    {
      'cursor-pointer hover:scale-105 transition-transform': isClickable,
      'border-blue-500 ring-4 ring-blue-500': isSelected,
      'border-green-500 ring-2 ring-green-500': isPlayable,
      'opacity-70 grayscale': card.hasAttacked,
      'border-gray-700': !isSelected && !isPlayable
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
      <div className="text-sm text-center w-full truncate">{card.name}</div>
      <div className="absolute top-2 left-2 bg-yellow-500 text-gray-900 text-xs px-2 py-0.5 rounded-full">
        Cost: {card.cost}
      </div>
      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="text-xl">⚔️ {card.attack}</div>
        <div className="text-lg">🛡️ {card.armor}</div>
        <div className="text-lg">❤️ {card.hp}/{card.maxHp}</div>
      </div>
    </div>
  );
};

// Optymalizacja renderowania komponentu za pomocą React.memo
export default React.memo(Card);