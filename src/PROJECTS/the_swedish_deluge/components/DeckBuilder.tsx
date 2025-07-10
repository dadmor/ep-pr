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
    const scenarioAvailableCards = allCards.map(getNewCardInstance);
    setAvailableCards(scenarioAvailableCards);
    
    // Start with any preset cards from the scenario
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
    customizeDeck(scenarioIndex, selectedCards);
    onStartGame();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col"
         style={{
           backgroundImage: "url('/assets/parchment-background.jpg')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundColor: "#f3e8d2" // Jasny kolor pergaminu jako fallback
         }}>
      {/* Burned edges overlay */}
      <div className="absolute inset-0 w-full h-full z-0"
           style={{
             background: "radial-gradient(ellipse at center, transparent 50%, rgba(58, 30, 0, 0.4) 100%)",
             pointerEvents: "none"
           }}></div>
           
      {/* Aged map overlay */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-30"
           style={{
             backgroundImage: "url('/assets/old-polish-map.jpg')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             filter: "sepia(0.5) contrast(1.05) brightness(1.1)"
           }}></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-80 z-10"
           style={{
             backgroundImage: "url('/assets/ornament-corner.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat"
           }}></div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-80 z-10 transform scale-x-[-1]"
           style={{
             backgroundImage: "url('/assets/ornament-corner.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat"
           }}></div>

      {/* Heading */}
      <div className="relative z-10 py-4 px-6 border-b-2 border-amber-800"
           style={{
             background: "url('/assets/dark-parchment.jpg')",
             backgroundSize: "cover",
             boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
           }}>
        <h1 className="text-2xl font-serif font-bold text-amber-800"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
          {scenario.name} - Prepare Your Forces
        </h1>
        <p className="text-sm font-serif text-amber-700 italic">
          Choose additional units to add to your Royal Army's company. Your starting units are already mustered by the Crown.
        </p>
      </div>

      <div className="flex flex-grow overflow-hidden relative z-10">
        {/* Available units */}
        <div className="w-1/2 p-4 overflow-y-auto"
             style={{
               background: "url('/assets/light-parchment.jpg')",
               backgroundSize: "cover",
               borderRight: "2px solid #92400e"
             }}>
          <h2 className="text-xl text-amber-900 font-serif font-bold mb-4 pb-2 border-b border-amber-600">
            Available Troops for Recruitment
          </h2>
          
          <div ref={availableCardsRef} className="grid grid-cols-2 gap-4">
            {availableCards.map((card, index) => (
              <div 
                key={`available-${index}`}
                className={`rounded-lg p-3 flex flex-col items-center transform transition-all duration-300 ${
                  card.cost <= availableGold ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  background: "url('/assets/dark-parchment.jpg')",
                  backgroundSize: "cover",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                  border: "1px solid #92400e"
                }}
                onClick={() => card.cost <= availableGold && addCardToDeck(card)}
              >
                <Card card={card} />
                <div className="mt-2 text-center">
                  <div className="text-amber-800 font-serif font-semibold">{card.name}</div>
                  <div className="text-amber-700 flex items-center justify-center mt-1 font-serif">
                    Cost: {card.cost} 
                    <span className="ml-1 text-yellow-600">⚜️</span>
                  </div>
                  {card.cost > availableGold && (
                    <div className="text-red-800 text-xs mt-1 font-serif italic">Insufficient treasury</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected units and summary */}
        <div className="w-1/2 p-4 flex flex-col"
             style={{
               background: "url('/assets/victory-parchment.jpg')",
               backgroundSize: "cover"
             }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-700">
            <h2 className="text-xl text-amber-900 font-serif font-bold">Royal War Council</h2>
            <div className="px-4 py-2 rounded-lg font-serif font-bold flex items-center"
                 style={{
                   background: "url('/assets/seal-background.jpg')",
                   backgroundSize: "cover",
                   border: "2px solid #92400e",
                   color: "#7c2d12"
                 }}>
              Treasury: {availableGold} <span className="ml-1 text-yellow-600">⚜️</span>
            </div>
          </div>
          
          {/* Display starting units */}
          <div className="mb-4 p-3 rounded-lg"
               style={{
                 background: "rgba(146, 64, 14, 0.1)",
                 border: "1px dashed #92400e"
               }}>
            <h3 className="text-lg text-amber-800 font-serif font-semibold mb-2 border-b border-amber-600 pb-1">
              Starting Forces (Already Deployed)
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {scenario.playerStartingCards.map((card, index) => (
                <div key={`starting-${index}`} 
                     className="rounded-lg p-2 transition-all"
                     style={{
                       background: "rgba(146, 64, 14, 0.2)",
                       border: "1px solid #92400e"
                     }}>
                  <div className="text-amber-900 text-sm font-serif font-semibold">{card.name}</div>
                  <div className="flex justify-between text-xs text-amber-700 font-serif">
                    <span>ATK: {card.attack}</span>
                    <span>HP: {card.hp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <h3 className="text-lg text-amber-800 font-serif font-semibold mb-2 border-b border-amber-600 pb-1">
              Reinforcement Cards (War Reserve)
            </h3>
            {selectedCards.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-amber-700 italic font-serif"
                   style={{
                     background: "rgba(146, 64, 14, 0.05)",
                     border: "1px dashed #92400e",
                     borderRadius: "0.5rem"
                   }}>
                Select units to strengthen your Royal Army
              </div>
            ) : (
              <div ref={selectedCardsRef} className="grid grid-cols-3 gap-4">
                {selectedCards.map((card, index) => (
                  <div 
                    key={`selected-${index}`}
                    className="rounded-lg p-3 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105"
                    style={{
                      background: "url('/assets/light-parchment.jpg')",
                      backgroundSize: "cover",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                      border: "1px solid #92400e"
                    }}
                    onClick={() => removeCardFromDeck(index)}
                  >
                    <div className="absolute top-1 right-1 bg-red-700 text-amber-50 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✕
                    </div>
                    <Card card={card} />
                    <div className="mt-2 text-amber-800 text-sm text-center font-serif">{card.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 rounded-lg p-4"
               style={{
                 background: "url('/assets/dark-parchment.jpg')",
                 backgroundSize: "cover",
                 border: "2px solid #92400e"
               }}>
            <h3 className="text-amber-800 font-serif font-bold mb-2 border-b border-amber-600 pb-1">Muster Roll</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-amber-700 font-serif">
              <div className="flex justify-between">
                <span>Total Units:</span>
                <span className="font-bold">{selectedCards.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Attack Strength:</span>
                <span className="font-bold">{selectedCards.reduce((sum, card) => sum + card.attack, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Vitality:</span>
                <span className="font-bold">{selectedCards.reduce((sum, card) => sum + card.hp, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. Cost per Unit:</span>
                <span className="font-bold">
                  {selectedCards.length > 0 
                    ? (selectedCards.reduce((sum, card) => sum + card.cost, 0) / selectedCards.length).toFixed(1) 
                    : '0'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleStartGame}
              className="py-3 px-10 rounded-lg font-serif font-bold transition-all duration-300 border-2 text-amber-50 transform hover:scale-105"
              style={{
                backgroundImage: "linear-gradient(to bottom, #b45309, #78350f)",
                border: "2px solid #92400e",
                textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
              }}
            >
              <div className="flex items-center">
                <span className="mr-2">Begin Battle</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative flourish at bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-12 opacity-70 z-10"
           style={{
             backgroundImage: "url('/assets/decorative-flourish.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat",
             backgroundPosition: "center"
           }}></div>
    </div>
  );
};

export default DeckBuilder;