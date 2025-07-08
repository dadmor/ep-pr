// components/PlayArea.tsx
import React, { useRef } from 'react';
import clsx from 'clsx';
import { Card as CardType } from '../types';
import Card from './Card';

interface PlayAreaProps {
  cards: CardType[];
  isOpponent: boolean;
  onCardClick?: (cardId: string) => void;
  selectedAttackerId: string | null;
  canTarget: boolean; // Indicates if cards in this area can be targeted by an attack
  areaRef?: React.RefObject<HTMLDivElement>; // Add ref for measuring positions
}

const PlayArea: React.FC<PlayAreaProps> = ({ 
  cards, 
  isOpponent, 
  onCardClick, 
  selectedAttackerId, 
  canTarget,
  areaRef 
}) => {
  // Create ref if not provided
  const internalRef = useRef<HTMLDivElement>(null);
  const playAreaRef = areaRef || internalRef;

  const playAreaClasses = clsx(
    'w-full flex justify-center items-center p-4 min-h-[200px]',
    'transition-colors duration-300', // Add transition for smoother effects
    {
      'bg-red-800 bg-opacity-30 rounded-b-lg': isOpponent,
      'bg-blue-800 bg-opacity-30 rounded-t-lg': !isOpponent,
      'ring-2 ring-red-500 ring-opacity-50': isOpponent && canTarget && selectedAttackerId // Highlight when attackable
    }
  );

  return (
    <div 
      ref={playAreaRef} 
      className={playAreaClasses}
      data-area={isOpponent ? 'opponent' : 'player'} // Add data attribute for identification
    >
      {cards.length === 0 ? (
        <p className="text-gray-400">
          {isOpponent ? "Opponent's play area is empty." : "Your play area is empty."}
        </p>
      ) : (
        cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick}
            isClickable={isOpponent ? canTarget : true} // Only player's own cards are selectable attackers, opponent's are only targets
            isSelected={card.id === selectedAttackerId}
            className={clsx({
              'ring-2 ring-red-500 ring-opacity-70 hover:ring-opacity-100': 
                isOpponent && canTarget && selectedAttackerId // Highlight targetable cards
            })}
          />
        ))
      )}
    </div>
  );
};

export default React.memo(PlayArea);