import React from 'react';
import clsx from 'clsx';
import { Card as CardType } from '../types';
import Card from './Card';
import { useAnimation } from '../context/AnimationContext';
import { useGameStore } from '../store/gameStore';
import { TURN_TYPE } from '../constants';

interface PlayAreaProps {
  cards: CardType[];
  isOpponent: boolean;
  onCardClick?: (cardId: string) => void;
  selectedAttackerId: string | null;
  canTarget: boolean; // Indicates if cards in this area can be targeted by an attack
}

const PlayArea: React.FC<PlayAreaProps> = ({ 
  cards, 
  isOpponent, 
  onCardClick, 
  selectedAttackerId, 
  canTarget
}) => {
  const { autoAnimateRef } = useAnimation();
  const { turn } = useGameStore();

  const playAreaClasses = clsx(
    'w-full flex justify-center items-center ',
    'transition-colors duration-300', // Add transition for smoother effects
    {
      'bg-red-800 bg-opacity-10 rounded-lg': isOpponent,
      'bg-blue-800 bg-opacity-10 rounded-lg': !isOpponent,
      'ring-4 ring-red-500 ring-opacity-50': isOpponent && canTarget && selectedAttackerId, // Highlight when attackable
      'ring-4 ring-blue-400 ring-opacity-70': !isOpponent && turn === TURN_TYPE.PLAYER // Add blue highlight when it's player's turn
    }
  );

  return (
    <div 
      ref={autoAnimateRef} // Apply auto-animate to the container
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
            key={card.id} // The key is important for auto-animate to track elements
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