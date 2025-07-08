// === ActionsPanel.tsx (po aktualizacji) ===
import React from "react";
import { useGameStore } from "./gameStore";
import { uiStore } from "./uiStore";
import { Sword, Shield, Clock, Play } from "lucide-react";

const ActionsPanel: React.FC = () => {
  const gamePhase = useGameStore((state) => state.game.phase);
  const energy = useGameStore((state) => state.player.energy);
  const maxEnergy = useGameStore((state) => state.player.maxEnergy);
  const turn = useGameStore((state) => state.game.turn);
  const battlefield = useGameStore((state) => state.cards.battlefield);
  const enemy = useGameStore((state) => state.enemy);
  const endTurn = useGameStore((state) => state.endTurn);
  const cancelTargetSelection = useGameStore((state) => state.cancelTargetSelection);
  
  // Pobranie stanu z uiStore
  const pendingAction = uiStore((state) => state.pendingAction);

  const canEndTurn = gamePhase === "main";
  const hasAttackingUnits = battlefield.some(card => 
    card.canAttack && !card.used && card.attack > 0 && (card.currentHP || card.defense) > 0
  );

  const getPhaseDescription = () => {
    switch (gamePhase) {
      case "main":
        return "🎯 Twoja tura - graj karty i atakuj";
      case "selectTarget":
        return "⚔️ Wybierz cel dla ataku";
      case "enemyTurn":
        return "⏳ Tura przeciwnika";
      case "combat":
        return "⚔️ Faza walki";
      case "victory":
        return "🏆 Zwycięstwo!";
      case "defeat":
        return "💀 Porażka";
      default:
        return "🎮 Gra w toku";
    }
  };

  return (
    <div className="bg-yellow-50/60 backdrop-blur-lg rounded-xl p-4 shadow-lg/50 space-y-4 max-w-64 w-64">
      {/* Nagłówek z fazą gry */}
      <div className="text-center">
        <p className="text-amber-700 text-sm">{getPhaseDescription()}</p>
      </div>

      {/* Energia gracza */}
      <div className="bg-yellow-100/80 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-800 font-semibold">⚡ Energia</span>
          <span className="text-amber-900 font-bold">{energy}/{maxEnergy}</span>
        </div>
        <div className="w-full bg-yellow-200 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(energy / maxEnergy) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Główne akcje */}
      <div className="space-y-2">
        {gamePhase === "selectTarget" && (
          <button
            onClick={cancelTargetSelection}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            ✕ Anuluj atak
          </button>
        )}

        {gamePhase === "main" && (
          <button
            onClick={endTurn}
            disabled={!canEndTurn}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              canEndTurn
                ? "bg-amber-400 hover:bg-amber-500 text-amber-900"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Play size={16} />
            Zakończ turę
          </button>
        )}

        {gamePhase === "enemyTurn" && (
          <div className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg text-center">
            <Clock className="inline mr-2" size={16} />
            Przeciwnik myśli...
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsPanel;