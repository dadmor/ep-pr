// src/PROJECTS/potop_szwedzki_mapa/components/DeckBuilder.tsx
import React, { useState, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useGameStore } from "../store/gameStore";
import ActionButton from "./ActionButton";
import Card from "./Card";
import { Card as CardType } from "../types";
import { allCards, getNewCardInstance } from "../gameData";

interface DeckBuilderProps {
  scenarioIndex: number;
  onStartGame: () => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({ 
  scenarioIndex, 
  onStartGame 
}) => {
  const { scenarios, customizeDeck } = useGameStore();
  const scenario = scenarios[scenarioIndex];
  
  // State for deck building
  const [availableGold, setAvailableGold] = useState(scenario.playerStartingGold);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [availableCards, setAvailableCards] = useState<CardType[]>([]);
  
  // Auto-animate refs
  const [availableCardsRef] = useAutoAnimate<HTMLDivElement>({
    duration: 300,
    easing: 'ease-in-out'
  });
  
  const [selectedCardsRef] = useAutoAnimate<HTMLDivElement>({
    duration: 300,
    easing: 'ease-out'
  });
  
  // Initialize available cards
  useEffect(() => {
    // Create a set of available card types for this scenario
    // We'll use all cards by default, but you could customize per scenario
    const scenarioAvailableCards = allCards.map(getNewCardInstance);
    setAvailableCards(scenarioAvailableCards);
    
    // Start with any preset cards from the scenario
    // We're not adding the starting cards to the selected deck here
    // because the starting cards are already defined in the scenario
    setSelectedCards([]);
  }, [scenario]);
  
  const addCardToDeck = (card: CardType) => {
    if (card.cost <= availableGold) {
      setSelectedCards([...selectedCards, getNewCardInstance(card)]);
      setAvailableGold(availableGold - card.cost);
    }
  };
  
  const removeCardFromDeck = (index: number) => {
    const cardToRemove = selectedCards[index];
    const newSelectedCards = [...selectedCards];
    newSelectedCards.splice(index, 1);
    setSelectedCards(newSelectedCards);
    setAvailableGold(availableGold + cardToRemove.cost);
  };
  
  const handleStartGame = () => {
    // Save the customized deck to the game store
    // The customized deck is ONLY for the player's draw pile, not the starting cards
    customizeDeck(scenarioIndex, selectedCards);
    onStartGame();
  };

  return (
    <div className="relative w-full h-screen bg-amber-50 overflow-hidden flex flex-col">
      {/* Heading */}
      <div className="bg-amber-900 text-amber-100 py-4 px-6 z-10 shadow-md">
        <h1 className="text-2xl font-bold">{scenario.name} - Prepare Your Forces</h1>
        <p className="text-sm opacity-80">
          Choose additional units to add to your deck. Your starting units are already defined by the scenario.
        </p>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Available units */}
        <div className="w-1/2 bg-gray-900 bg-opacity-80 p-4 overflow-y-auto">
          <h2 className="text-xl text-white font-bold mb-4">Available Units</h2>
          
          <div ref={availableCardsRef} className="grid grid-cols-2 gap-4">
            {availableCards.map((card, index) => (
              <div 
                key={`available-${index}`}
                className={`bg-gray-800 rounded-lg p-3 flex flex-col items-center transform transition-all duration-300 ${
                  card.cost <= availableGold ? 'hover:bg-gray-700 cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => card.cost <= availableGold && addCardToDeck(card)}
              >
                <Card card={card} />
                <div className="mt-2 text-center">
                  <div className="text-white font-semibold">{card.name}</div>
                  <div className="text-yellow-400 flex items-center justify-center mt-1">
                    Cost: {card.cost} 
                    <span className="ml-1">💰</span>
                  </div>
                  {card.cost > availableGold && (
                    <div className="text-red-400 text-xs mt-1">Not enough gold</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected units and summary */}
        <div className="w-1/2 bg-amber-900 bg-opacity-80 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-white font-bold">Your Deck</h2>
            <div className="bg-yellow-600 px-4 py-2 rounded-full text-white font-bold flex items-center">
              {availableGold} <span className="ml-1">💰</span>
            </div>
          </div>
          
          {/* Display starting units */}
          <div className="mb-4">
            <h3 className="text-lg text-amber-200 font-semibold mb-2">Starting Units (On Field)</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {scenario.playerStartingCards.map((card, index) => (
                <div key={`starting-${index}`} className="bg-amber-800 bg-opacity-70 rounded-lg p-2">
                  <div className="text-amber-200 text-sm font-semibold">{card.name}</div>
                  <div className="flex justify-between text-xs text-amber-300">
                    <span>ATK: {card.attack}</span>
                    <span>HP: {card.hp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <h3 className="text-lg text-amber-200 font-semibold mb-2">Additional Cards (For Drawing)</h3>
            {selectedCards.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-amber-300 italic">
                Select units to add to your deck
              </div>
            ) : (
              <div ref={selectedCardsRef} className="grid grid-cols-3 gap-4">
                {selectedCards.map((card, index) => (
                  <div 
                    key={`selected-${index}`}
                    className="bg-amber-800 rounded-lg p-3 flex flex-col items-center hover:bg-amber-700 cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => removeCardFromDeck(index)}
                  >
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✕
                    </div>
                    <Card card={card} />
                    <div className="mt-2 text-white text-sm text-center">{card.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 bg-amber-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Deck Stats</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-amber-100">
              <div className="flex justify-between">
                <span>Cards in Deck:</span>
                <span className="font-bold">{selectedCards.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Attack:</span>
                <span className="font-bold">{selectedCards.reduce((sum, card) => sum + card.attack, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total HP:</span>
                <span className="font-bold">{selectedCards.reduce((sum, card) => sum + card.hp, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. Cost:</span>
                <span className="font-bold">
                  {selectedCards.length > 0 
                    ? (selectedCards.reduce((sum, card) => sum + card.cost, 0) / selectedCards.length).toFixed(1) 
                    : '0'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <ActionButton 
              onClick={handleStartGame}
              className="w-64"
            >
              Start Battle
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;