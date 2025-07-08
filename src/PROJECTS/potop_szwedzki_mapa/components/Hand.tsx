// components/Hand.tsx
import React, { useRef } from 'react';
import { Card as CardType } from '../types';
import Card from './Card';

interface HandProps {
  hand: CardType[];
  onCardClick: (cardId: string) => void;
  gold: number;
  handRef?: React.RefObject<HTMLDivElement>; // Add ref for measuring positions
}

const Hand: React.FC<HandProps> = ({ hand, onCardClick, gold, handRef }) => {
  // Create ref if not provided
  const internalRef = useRef<HTMLDivElement>(null);
  const handAreaRef = handRef || internalRef;

  return (
    <div 
      ref={handAreaRef}
      className="w-full flex justify-center py-4 bg-gray-900 rounded-t-lg transition-all duration-300"
      data-area="hand" // Add data attribute for identification
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