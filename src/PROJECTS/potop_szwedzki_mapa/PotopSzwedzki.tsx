import React, { useEffect } from "react";
import { useGameStore } from "./store";
import MapComponent from "./MapComponent";
import HandComponent from "./HandComponent";
import EventLogComponent from "./EventLogComponent";
import PlayerPanel from "./PlayerPanel";
import EnemyPanel from "./EnemyPanel";
import ActionsPanel from "./ActionsPanel";
import NotificationComponent from "./NotificationComponent";
import HeaderComponent from "./HeaderComponent";

const PotopSzwedzki: React.FC = () => {
  // Fixed state selectors to match the actual store structure
  const playerHp = useGameStore((state) => state.player.hp);
  const enemy = useGameStore((state) => state.enemy);
  const gamePhase = useGameStore((state) => state.game.phase);
  const gameTurn = useGameStore((state) => state.game.turn);
  const initializeGame = useGameStore((state) => state.initializeGame);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // No need for the victory effect as the store already handles it
  // in the executeAttack and enemyTurn functions

  // Ekran przegranej
  if (gamePhase === "defeat" || playerHp <= 0) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 text-amber-900 flex flex-col items-center justify-center p-8 relative">
        <MapComponent />
        <div className="bg-yellow-50/80 backdrop-blur-lg rounded-2xl p-8 text-center relative z-10 shadow-2xl border border-amber-400/50">
          <h1 className="text-6xl mb-4">💀 KLĘSKA</h1>
          <p className="text-xl mb-4">
            Polska padła pod naporem szwedzkiej potęgi...
          </p>
          <p className="text-lg mb-6">Przetrwałeś {gameTurn} tur</p>
          <button
            onClick={initializeGame}
            className="bg-amber-300 hover:bg-amber-400 px-6 py-3 rounded-lg font-bold transition-colors text-amber-900 shadow-md"
          >
            🔄 Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col text-amber-900 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #fefce8 0%, #fef3c7 25%, #fed7aa 50%, #fde68a 75%, #fbbf24 100%)",
      }}
    >
      <MapComponent />
      <NotificationComponent />
      <HeaderComponent />

      <div className="flex-1 flex flex-col w-3/5 mx-auto p-2">
        {/* Sekcja bitwy: Wróg vs Gracz */}
        <div className="flex gap-4">
          <EnemyPanel />
          <div className="text-4xl font-bold text-amber-700">⚔️</div>
          <PlayerPanel />
        </div>

        <div className="flex-1 z-20 flex ml-auto" > 
          <EventLogComponent />
        </div>

        {/* Sekcja dolna: Deck z akcjami + Kronika */}
        <div className="flex gap-4">
          <HandComponent />
          <ActionsPanel />
        </div>
      </div>
    </div>
  );
};

export default PotopSzwedzki;