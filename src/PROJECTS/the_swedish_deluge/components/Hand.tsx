// components/Hand.tsx
import React from 'react';
import { Card as CardType } from '../types';
import Card from './Card';
import { useAnimation } from '../context/AnimationContext';
import { useGameStore } from '../store/gameStore';
import clsx from 'clsx';
import { TURN_TYPE } from '../constants';

interface HandProps {
  hand: CardType[];
  onCardClick: (cardId: string) => void;
  gold: number;
}

const Hand: React.FC<HandProps> = ({ hand, onCardClick, gold }) => {
  const { autoAnimateRef } = useAnimation();
  const { turn } = useGameStore();

  return (
    <div 
      ref={autoAnimateRef}
      className={clsx(
        "w-full flex justify-center py-1 bg-amber-100/50 rounded-t-lg transition-all duration-300",
        turn === TURN_TYPE.PLAYER && "ring-2 ring-amber-400 ring-opacity-70"
      )}
      data-area="hand"
    >
      {hand.length === 0 ? (
        <p className="text-gray-400">Your hand is empty.</p>
      ) : (
        hand.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick}
            isClickable={true}
            isPlayable={gold >= card.cost}
          />
        ))
      )}
    </div>
  );
};

export default React.memo(Hand);