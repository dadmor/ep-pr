// === HandComponent.tsx ===
import React from "react";
import { useGameStore } from "./store";
import GameCard from "./GameCard";

const HandComponent: React.FC = () => {
  const hand = useGameStore((state) => state.cards.hand);
  const playCard = useGameStore((state) => state.playCard);
  const gamePhase = useGameStore((state) => state.game.phase);
  const energy = useGameStore((state) => state.player.energy);
  const canPlayCard = useGameStore((state) => state.canPlayCard);

  const handleCardPlay = (card: any) => {
    if (gamePhase === "main") {
      playCard(card);
    }
  };

  const playableCards = hand.filter((card) => canPlayCard(card));
  const unplayableCards = hand.filter((card) => !canPlayCard(card));

  return (
    <div className="flex-1 space-y-2 z-20">
      <div className="flex justify-between">
        <h3 className="text-amber-800 font-bold">
          🎴 Twoja ręka ({hand.length}/7)
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-amber-700">
            {gamePhase === "main" ? (
              <span className="bg-green-100 px-2 py-1 rounded">
                ✨ Możesz grać karty
              </span>
            ) : gamePhase === "selectTarget" ? (
              <span className="bg-blue-100 px-2 py-1 rounded">
                🎯 Wybieranie celu ataku
              </span>
            ) : gamePhase === "enemyTurn" ? (
              <span className="bg-red-100 px-2 py-1 rounded">
                ⏳ Tura przeciwnika
              </span>
            ) : (
              <span className="bg-gray-100 px-2 py-1 rounded">
                ⏸️ Gra wstrzymana
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50/60 backdrop-blur-lg rounded-xl p-2 shadow-lg/50">
        <div className="flex gap-2 flex-wrap justify-center min-h-[200px] items-center">
          {hand.length === 0 ? (
            <p className="text-amber-600 italic">Brak kart w ręce</p>
          ) : (
            <>
              {/* Najpierw karty, które można zagrać */}
              {playableCards.map((card) => (
                <GameCard
                  key={card.instanceId}
                  card={card}
                  onClick={() => handleCardPlay(card)}
                  isPlayable={gamePhase === "main"}
                  compact={false}
                />
              ))}

              {/* Potem karty, których nie można zagrać */}
              {unplayableCards.map((card) => (
                <GameCard
                  key={card.instanceId}
                  card={card}
                  onClick={() => handleCardPlay(card)}
                  isPlayable={false}
                  compact={false}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandComponent;