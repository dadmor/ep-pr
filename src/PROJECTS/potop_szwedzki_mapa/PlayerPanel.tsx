// === PlayerPanel.tsx (po aktualizacji) ===
import React from "react";
import { useGameStore } from "./gameStore";
import { uiStore } from "./uiStore";
import GameCard from "./GameCard";

const PlayerPanel: React.FC = () => {
  const battlefield = useGameStore((state) => state.cards.battlefield);
  const playerHp = useGameStore((state) => state.player.hp);
  const gamePhase = useGameStore((state) => state.game.phase);
  const selectAttackTarget = useGameStore((state) => state.selectAttackTarget);
  const cancelTargetSelection = useGameStore((state) => state.cancelTargetSelection);
  
  // Pobranie stanu z uiStore
  const selectedCard = uiStore((state) => state.selectedCard);

  const handleCardClick = (card: any) => {
    if (gamePhase === "main" && card.canAttack && !card.used && card.attack > 0 && (card.currentHP || card.defense) > 0) {
      selectAttackTarget(card);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="bg-yellow-50/40 backdrop-blur-lg rounded-xl p-2 shadow-lg/50 relative">
        {/* Informacja o fazie wyboru celu */}
        {gamePhase === "selectTarget" && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
            ⚔️ Wybierz cel ataku
            <button
              onClick={cancelTargetSelection}
              className="ml-2 text-blue-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex justify-center gap-2 flex-wrap min-h-[120px] items-center">
          {battlefield.length === 0 ? (
            <p className="text-amber-700 italic">
              Brak jednostek na polu bitwy
            </p>
          ) : (
            battlefield.map((unit) => (
              <GameCard
                key={unit.instanceId}
                card={unit}
                isPlayable={false}
                onClick={() => handleCardClick(unit)}
                isSelected={selectedCard?.instanceId === unit.instanceId}
              />
            ))
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-amber-800 font-bold">
          🛡️ Twoja Armia (HP: {playerHp})
        </h3>
        
        {/* Wskazówki dla gracza */}
        <div className="text-xs text-amber-600">
          {gamePhase === "main" && battlefield.some(card => card.canAttack && !card.used) && (
            <span className="bg-green-100 px-2 py-1 rounded">
              💡 Kliknij jednostkę aby zaatakować
            </span>
          )}
          {gamePhase === "selectTarget" && (
            <span className="bg-blue-100 px-2 py-1 rounded">
              🎯 Wybierz cel w armii wroga
            </span>
          )}
          {gamePhase === "enemyTurn" && (
            <span className="bg-red-100 px-2 py-1 rounded">
              ⏳ Tura przeciwnika...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerPanel;