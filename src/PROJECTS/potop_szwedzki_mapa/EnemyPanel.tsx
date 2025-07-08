import React from "react";
import { useGameStore } from "./store";
import GameCard from "./GameCard";

const EnemyPanel: React.FC = () => {
  const currentEnemy = useGameStore((state) => state.currentEnemy);
  const gamePhase = useGameStore((state) => state.gamePhase);
  const pendingAction = useGameStore((state) => state.pendingAction);
  const executeAttack = useGameStore((state) => state.executeAttack);

  if (!currentEnemy) return null;

  const handleEnemyCardClick = (card: any) => {
    if (
      gamePhase === "selectTarget" &&
      pendingAction?.type === "selectAttackTarget"
    ) {
      // Sprawdź czy karta może być celem
      const canTarget = pendingAction.possibleTargets.some(
        (target) => target.instanceId === card.instanceId
      );

      if (canTarget && pendingAction.attacker) {
        executeAttack(pendingAction.attacker, card);
      }
    }
  };

  const handleAttackEnemy = () => {
    if (
      gamePhase === "selectTarget" &&
      pendingAction?.type === "selectAttackTarget" &&
      pendingAction.attacker
    ) {
      executeAttack(pendingAction.attacker, "enemy");
    }
  };

  return (
    <div className="flex-1 space-y-2 z-20">
      {/* Główne pole bitwy przeciwnika */}
      <div className="bg-red-50/40 backdrop-blur-lg rounded-xl p-2 shadow-lg/50 relative">
        {/* Informacja o możliwości ataku na przeciwnika */}
        {gamePhase === "selectTarget" && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleAttackEnemy}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold transition-colors"
            >
              🎯 Atakuj {currentEnemy.name} ({pendingAction?.damage} dmg)
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2 flex-wrap min-h-[120px] items-center">
          {currentEnemy.battlefield.length === 0 ? (
            <div className="text-red-700 italic text-center">
              <p>Wróg nie ma jednostek na polu bitwy</p>
              {gamePhase === "selectTarget" && (
                <p className="text-sm mt-2 text-red-600">
                  💡 Możesz zaatakować bezpośrednio {currentEnemy.name}
                </p>
              )}
            </div>
          ) : (
            currentEnemy.battlefield.map((unit) => {
              const isValidTarget =
                gamePhase === "selectTarget" &&
                pendingAction?.possibleTargets.some(
                  (target) => target.instanceId === unit.instanceId
                );

              return (
                <GameCard
                  key={unit.instanceId}
                  card={unit}
                  isEnemy={true}
                  isPlayable={false}
                  onClick={() => handleEnemyCardClick(unit)}
                  canBeAttacked={isValidTarget}
                  isAttackTarget={isValidTarget && gamePhase === "selectTarget"}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Nagłówek z informacjami */}
        <h3 className="text-red-700 font-bold flex">⚔️ {currentEnemy.name}</h3>

        <div className="flex-1 flex items-center justify-between bg-red-100 rounded px-2 py-1 gap-2">
          <span className="text-sm withespace-nowrap">
            HP:&nbsp;{currentEnemy.currentHp}/{currentEnemy.maxHp}
          </span>
          {/* Pasek HP przeciwnika */}
          <div className="w-full bg-red-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (currentEnemy.currentHp / currentEnemy.maxHp) * 100
                }%`,
              }}
            ></div>
          </div>

          {/* Ukryte karty w ręce przeciwnika */}
          {currentEnemy.hand.length > 0 && (
            <div className="flex justify-center gap-1">
              {currentEnemy.hand.slice(0, 7).map((_, index) => (
                <div
                  key={index}
                  className="w-4 h-6 bg-gradient-to-b from-red-800 to-red-900 rounded-sm border border-red-700 flex items-center justify-center"
                >
                  <span className="text-red-200 text-md -mt-1">♠</span>
                </div>
              ))}
              {currentEnemy.hand.length > 7 && (
                <div className="text-red-600 text-xs self-center ml-1">
                  +{currentEnemy.hand.length - 7}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <span className="text-sm block font-normal">
        ⚡{currentEnemy.energy} 🤖 {currentEnemy.ai}
      </span>
    </div>
  );
};

export default EnemyPanel;
