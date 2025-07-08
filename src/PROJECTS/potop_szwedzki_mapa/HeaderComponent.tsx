import React from "react";
import { useGameStore } from "./gameStore";  // Zmieniona ścieżka importu

const HeaderComponent: React.FC = () => {
  const turn = useGameStore((state) => state.game.turn);
  const gold = useGameStore((state) => state.player.gold);
  const playerHp = useGameStore((state) => state.player.hp);
  const maxPlayerHp = useGameStore((state) => state.player.maxHp);
  const energy = useGameStore((state) => state.player.energy);
  const maxEnergy = useGameStore((state) => state.player.maxEnergy);
  const morale = useGameStore((state) => state.player.morale);

  return (
    <header className="bg-yellow-100/60 backdrop-blur-lg p-2 border-b border-zinc-400/50 relative z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-amber-900 text-center">
          <span className="text-black text-sm">⚔️</span> 1655
        </h1>
        <div className="flex justify-center gap-6 text-sm text-amber-800">
          <span>Tura {turn}</span>
          <span>💰 {gold}</span>
          <span>❤️ {playerHp}/{maxPlayerHp}</span>
          <span>
            ⚡ {energy}/{maxEnergy}
          </span>
          <span>🏅 {morale}%</span>
        </div>
      </div>
    </header>
  );
};

export default HeaderComponent;