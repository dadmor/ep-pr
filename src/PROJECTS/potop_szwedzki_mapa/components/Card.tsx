// components/Card.tsx
import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick?: (cardId: string) => void;
  isClickable?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ card, onClick, isClickable = false, isSelected = false, isPlayable = false, className = '' }) => {
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(card.id);
    }
  };

  const cardClasses = `
    relative w-32 h-48 bg-gray-800 rounded-lg shadow-lg text-white font-bold
    flex flex-col justify-between items-center p-2 m-2
    border-2
    ${isClickable && 'cursor-pointer hover:scale-105 transition-transform'}
    ${isSelected ? 'border-blue-500 ring-4 ring-blue-500' : 'border-gray-700'}
    ${isPlayable ? 'border-green-500 ring-2 ring-green-500' : ''}
    ${card.hasAttacked ? 'opacity-70 grayscale' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={handleClick}>
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

export default Card;