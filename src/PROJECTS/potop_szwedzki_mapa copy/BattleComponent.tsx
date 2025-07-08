import React, { useMemo, useState, useEffect } from "react";
import { useGameStore } from "./states/gameStore";
import { uiStore } from "./states/uiStore";
import GameCard from "./GameCard";
import { Shield, Sword, Heart } from "lucide-react";

const BattleComponent = () => {
  // Game state
  const gamePhase = useGameStore((state) => state.game.phase);
  const playerBattlefield = useGameStore((state) => state.cards.battlefield);
  const playerHp = useGameStore((state) => state.player.hp);
  const enemy = useGameStore((state) => state.enemy);
  
  // Game actions
  const selectAttackTarget = useGameStore((state) => state.selectAttackTarget);
  const executeAttack = useGameStore((state) => state.executeAttack);
  const cancelTargetSelection = useGameStore((state) => state.cancelTargetSelection);
  
  // UI state
  const pendingAction = uiStore((state) => state.pendingAction);
  const selectedCard = uiStore((state) => state.selectedCard);
  
  // Animation state
  const [attackingCard, setAttackingCard] = useState(null);
  const [targetCard, setTargetCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate enemy health percentage for progress bar
  const enemyHealthPercentage = useMemo(() => {
    if (!enemy) return 0;
    return Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));
  }, [enemy]);
  
  // Calculate player health percentage for progress bar
  const playerHealthPercentage = useMemo(() => {
    return Math.max(0, Math.min(100, (playerHp / 100) * 100)); // Assuming maxHp is 100
  }, [playerHp]);

  // Handle player card click for attack
  const handlePlayerCardClick = (card) => {
    if (gamePhase === "main" && 
        card.canAttack && 
        !card.used && 
        card.attack > 0 && 
        (card.currentHP || card.defense) > 0) {
      selectAttackTarget(card);
    }
  };

  // Handle enemy card click during target selection with animation
  const handleEnemyCardClick = (card) => {
    if (gamePhase === "selectTarget" && pendingAction?.attacker && pendingAction.type === "selectAttackTarget") {
      // Start animation
      setAttackingCard(pendingAction.attacker);
      setTargetCard(card);
      setIsAnimating(true);
      
      // Execute attack after animation delay
      setTimeout(() => {
        executeAttack(pendingAction.attacker, card);
        setIsAnimating(false);
        setAttackingCard(null);
        setTargetCard(null);
      }, 800); // Delay only for attack animation
    }
  };
  
  // Handle direct attack on enemy
  const handleEnemyAttack = () => {
    if (gamePhase === "selectTarget" && pendingAction?.attacker && pendingAction.type === "selectAttackTarget") {
      // Start animation
      setAttackingCard(pendingAction.attacker);
      setTargetCard("enemy");
      setIsAnimating(true);
      
      // Execute attack after animation delay
      setTimeout(() => {
        executeAttack(pendingAction.attacker, "enemy");
        setIsAnimating(false);
        setAttackingCard(null);
        setTargetCard(null);
      }, 800); // Delay only for attack animation
    }
  };
  
  // Early return if no enemy
  if (!enemy) {
    return (
      <div className="bg-yellow-50/60 backdrop-blur-lg rounded-xl p-2 shadow-lg/50 flex justify-center items-center h-28">
        <p className="text-amber-700 italic">Ładowanie bitwy...</p>
      </div>
    );
  }
  
  // Filter to show max 3 cards per side
  const displayEnemyCards = enemy.battlefield.slice(0, 3);
  const displayPlayerCards = playerBattlefield.slice(0, 3);
  const enemyHasMoreCards = enemy.battlefield.length > 3;
  const playerHasMoreCards = playerBattlefield.length > 3;

  return (
    <div className="bg-yellow-50/60 backdrop-blur-lg rounded-xl p-2 shadow-lg/50 mb-2 relative">
      {/* Target selection phase info */}
      {gamePhase === "selectTarget" && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 whitespace-nowrap">
          ⚔️ Wybierz cel ataku
          <button onClick={cancelTargetSelection} className="ml-2 text-blue-200 hover:text-white">✕</button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-2">
        {/* Enemy header */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center ${targetCard === "enemy" ? "bg-red-200 animate-pulse" : "bg-red-100"} px-2 py-1 rounded text-xs transition-colors duration-300`}>
            <Heart size={12} className="text-red-600 mr-1" />
            <span>{enemy.currentHp}/{enemy.maxHp}</span>
          </div>
          <span className="font-bold text-amber-800 text-sm truncate max-w-28">{enemy.name}</span>
        </div>

        {/* Battle indicator */}
        <div className="bg-amber-100 rounded-full w-7 h-7 flex items-center justify-center font-bold text-amber-800">
          ⚔️
        </div>
        
        {/* Player header */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-800 text-sm">Twoja Armia</span>
          <div className="flex items-center bg-green-100 px-2 py-1 rounded text-xs">
            <Heart size={12} className="text-green-600 mr-1" />
            <span>{playerHp}/100</span>
          </div>
        </div>
      </div>
      
      {/* Health bars */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300 bg-red-500"
            style={{ width: `${enemyHealthPercentage}%` }}
          ></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300 bg-green-500"
            style={{ width: `${playerHealthPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Battle area */}
      <div className="flex justify-between gap-2 relative">
        {/* Enemy side */}
        <div className="flex-1">
          <div className="flex flex-wrap justify-center gap-1 min-h-20">
            {enemy.battlefield.length === 0 ? (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-xs italic text-amber-600">Brak jednostek</p>
              </div>
            ) : (
              <>
                {/* Enemy portrait/avatar - clickable during target selection */}
                <div 
                  className={`p-1.5 rounded-lg border ${targetCard === "enemy" ? "border-red-500 bg-red-100/80 animate-pulse" : "border-amber-300 bg-amber-100/60"} 
                    backdrop-blur-sm text-center h-20 w-16
                    ${gamePhase === "selectTarget" ? "cursor-pointer hover:bg-amber-200/70 hover:border-amber-400" : ""}
                    ${gamePhase === "enemyTurn" ? "border-red-300 bg-red-50/60" : ""}
                    transition-all duration-200
                  `}
                  onClick={gamePhase === "selectTarget" ? handleEnemyAttack : undefined}
                >
                  <div className="text-xl mb-0.5">
                    {enemy.ai === "aggressive" ? "⚔️" : enemy.ai === "defensive" ? "🛡️" : "⚖️"}
                  </div>
                  <p className="text-xs text-amber-800 line-clamp-2">
                    {enemy.description || `${enemy.name}`}
                  </p>
                  
                  {gamePhase === "selectTarget" && (
                    <div className="mt-0.5 text-xs font-bold text-red-600 animate-pulse">
                      🎯 Atak!
                    </div>
                  )}
                </div>
                
                {/* Enemy battlefield cards */}
                {displayEnemyCards.map((card) => (
                  <GameCard
                    key={card.instanceId}
                    card={card}
                    isEnemy={true}
                    compact={true}
                    isAttackTarget={
                      pendingAction?.type === "selectAttackTarget" &&
                      pendingAction.possibleTargets.some(
                        (target) => target.instanceId === card.instanceId
                      )
                    }
                    isBeingAttacked={targetCard && targetCard.instanceId === card.instanceId}
                    canBeAttacked={
                      gamePhase === "selectTarget" &&
                      pendingAction?.type === "selectAttackTarget"
                    }
                    onClick={() => handleEnemyCardClick(card)}
                  />
                ))}
                {enemyHasMoreCards && (
                  <div className="flex items-center justify-center text-xs text-amber-700 bg-amber-50/80 rounded-lg border border-amber-200 h-20 w-12">
                    +{enemy.battlefield.length - 3}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Center divider */}
        <div className="border-r border-amber-200 mx-1"></div>
        
        {/* Player side */}
        <div className="flex-1">
          <div className="flex flex-wrap justify-center gap-1 min-h-20">
            {playerBattlefield.length === 0 ? (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-xs italic text-amber-600">Brak jednostek</p>
              </div>
            ) : (
              <>
                {displayPlayerCards.map((card) => (
                  <GameCard
                    key={card.instanceId}
                    card={card}
                    isPlayable={false}
                    compact={true}
                    onClick={() => handlePlayerCardClick(card)}
                    isSelected={selectedCard?.instanceId === card.instanceId}
                    isAttacking={attackingCard && attackingCard.instanceId === card.instanceId}
                  />
                ))}
                {playerHasMoreCards && (
                  <div className="flex items-center justify-center text-xs text-amber-700 bg-amber-50/80 rounded-lg border border-amber-200 h-20 w-12">
                    +{playerBattlefield.length - 3}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Game phase indicator */}
      <div className="flex justify-center mt-1">
        <div className="text-xs text-amber-600">
          {gamePhase === "main" && playerBattlefield.some(card => 
            card.canAttack && !card.used && card.attack > 0 && (card.currentHP || card.defense) > 0
          ) && (
            <span className="bg-green-100 px-2 py-0.5 rounded">
              💡 Kliknij jednostkę aby zaatakować
            </span>
          )}
          {gamePhase === "selectTarget" && (
            <span className="bg-blue-100 px-2 py-0.5 rounded">
              🎯 Wybierz cel w armii wroga
            </span>
          )}
          {gamePhase === "enemyTurn" && (
            <span className="bg-red-100 px-2 py-0.5 rounded">
              ⏳ Tura przeciwnika...
            </span>
          )}
        </div>
      </div>
      
      {/* Disable all interactions during animation */}
      {isAnimating && (
        <div className="absolute inset-0 bg-transparent cursor-not-allowed z-20"></div>
      )}
    </div>
  );
};

export default React.memo(BattleComponent);