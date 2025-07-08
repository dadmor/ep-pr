// components/Hand.tsx
import React from 'react';
import { Card as CardType } from '../types';
import Card from './Card';

interface HandProps {
  hand: CardType[];
  onCardClick: (cardId: string) => void;
  gold: number;
}

const Hand: React.FC<HandProps> = ({ hand, onCardClick, gold }) => {
  return (
    <div className="w-full flex justify-center py-4 bg-gray-900 rounded-t-lg">
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

export default Hand;