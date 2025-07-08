// components/PlayArea.tsx
import React from 'react';
import clsx from 'clsx';
import { Card as CardType } from '../types';
import Card from './Card';

interface PlayAreaProps {
  cards: CardType[];
  isOpponent: boolean;
  onCardClick?: (cardId: string) => void;
  selectedAttackerId: string | null;
  canTarget: boolean; // Indicates if cards in this area can be targeted by an attack
}

const PlayArea: React.FC<PlayAreaProps> = ({ cards, isOpponent, onCardClick, selectedAttackerId, canTarget }) => {
  const playAreaClasses = clsx(
    'w-full flex justify-center items-center p-4 min-h-[200px]',
    {
      'bg-red-800 bg-opacity-30 rounded-b-lg': isOpponent,
      'bg-blue-800 bg-opacity-30 rounded-t-lg': !isOpponent
    }
  );

  return (
    <div className={playAreaClasses}>
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
            className={isOpponent && canTarget ? 'ring-2 ring-red-500' : ''} // Highlight targetable cards
          />
        ))
      )}
    </div>
  );
};

export default React.memo(PlayArea);