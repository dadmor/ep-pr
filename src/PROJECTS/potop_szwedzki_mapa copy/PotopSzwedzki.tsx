import React, { useEffect } from "react";
import { useGameStore } from "./states/gameStore";
import MapComponent from "./MapComponent";
import BattleComponent from "./BattleComponent";
import EventLogComponent from "./EventLogComponent";
import HandActionsComponent from "./HandActionsComponent";
import NotificationComponent from "./NotificationComponent";
import CardTooltip from "./CardTooltip";

const PotopSzwedzki: React.FC = () => {
  // State selectors
  const playerHp = useGameStore((state) => state.player.hp);
  const gamePhase = useGameStore((state) => state.game.phase);
  const gameTurn = useGameStore((state) => state.game.turn);
  const initializeGame = useGameStore((state) => state.initializeGame);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Ekran przegranej
  if (gamePhase === "defeat" || playerHp <= 0) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 text-amber-900 flex flex-col items-center justify-center p-8">
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
      {/* Mapa jako tło */}
      <MapComponent />
      
      {/* Elementy UI */}
      <NotificationComponent />
      <CardTooltip />
      
      {/* Obszar bitwy na górze */}
      <div className="w-96 mx-auto mt-4 z-20">
        <BattleComponent />
      </div>
      
      {/* Kronika wydarzeń na boku */}
      <div className="fixed right-4 top-20 z-20 w-64">
        <EventLogComponent />
      </div>
      
      {/* Ręka gracza i akcje na dole */}
      <HandActionsComponent />
    </div>
  );
};

export default PotopSzwedzki;