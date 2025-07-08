import React, { useMemo } from "react";
import { Sword, Shield, Heart, Plus, Info, Target } from "lucide-react";
import { useGameStore } from "./states/gameStore";
import { uiStore } from "./states/uiStore";

const GameCard = ({
  card,
  onClick,
  isPlayable = true,
  compact = false,
  isEnemy = false,
  isAttackTarget = false,
  isSelected = false,
  canBeAttacked = false,
  isBeingAttacked = false,
  isAttacking = false
}) => {
  const canPlayCard = useGameStore((state) => state.canPlayCard);
  const gamePhase = useGameStore((state) => state.game.phase);
  const setTooltipCard = uiStore((state) => state.setTooltipCard);

  // Card property calculations only when dependencies change
  const cardProperties = useMemo(() => {
    // Helper functions
    const getRarityBorder = (rarity) => {
      switch (rarity) {
        case "common": return "border-amber-300";
        case "uncommon": return "border-yellow-300";
        case "rare": return "border-orange-300";
        case "legendary": return "border-purple-300";
        default: return "border-blue-300";
      }
    };

    // Card properties
    const canPlay = isPlayable && !isEnemy && canPlayCard(card) && gamePhase === "main";
    const canAttack = !isEnemy && card.canAttack && !card.used && 
                     (card.currentHP || card.defense) > 0 && card.attack > 0;
    const cardSize = compact ? "max-w-24 w-24 h-32" : "max-w-36 w-36 h-48";
    
    // Calculate card class
    let cardClass = `${cardSize} ${getRarityBorder(card.rarity)} border-2 rounded-lg select-none`;
    
    // Add appropriate styles based on state
    if (isSelected) cardClass += " ring-4 ring-blue-400 shadow-lg scale-105";
    if (isAttackTarget) cardClass += " ring-4 ring-red-400 animate-pulse cursor-crosshair";
    if (isBeingAttacked) cardClass += " ring-4 ring-red-600 animate-pulse";
    if (isAttacking) cardClass += " ring-4 ring-green-600 animate-pulse scale-105";
    if (canBeAttacked && gamePhase === "selectTarget") 
      cardClass += " ring-2 ring-orange-300 hover:ring-orange-500 cursor-pointer hover:scale-105";
    if (canAttack && gamePhase === "main") 
      cardClass += " ring-2 ring-green-300 hover:ring-green-500 cursor-pointer";
    
    // Background styles
    let backgroundStyle = "";
    if (isEnemy) {
      backgroundStyle = "linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fed7aa 100%)";
      cardClass += " bg-yellow-100/95";
    } else {
      backgroundStyle = "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)";
      cardClass += " bg-yellow-50/95";
    }
    
    // Styles for playable cards
    if (canPlay) {
      cardClass += " cursor-pointer hover:scale-105 hover:bg-yellow-100/100 hover:shadow-lg";
    } else if (!canAttack && !canBeAttacked && !isAttackTarget && !isBeingAttacked && !isAttacking) {
      cardClass += " opacity-80";
    }
    
    // Additional styles
    cardClass += " backdrop-blur-sm text-amber-900 p-2 transition-all duration-200 flex flex-col justify-between text-xs shadow-md";
    
    // HP calculations
    const currentCardHP = card.currentHP !== undefined ? card.currentHP : card.defense;
    const maxCardHP = card.maxHP || card.defense;
    const hpPercentage = maxCardHP ? (currentCardHP / maxCardHP) * 100 : 100;
    const isAlive = currentCardHP > 0;
    const isDamaged = card.maxHP && currentCardHP < maxCardHP;
    
    return {
      cardClass,
      backgroundStyle,
      canPlay,
      canAttack,
      currentCardHP,
      maxCardHP,
      hpPercentage,
      isAlive,
      isDamaged
    };
  }, [
    card, isPlayable, isEnemy, canPlayCard, gamePhase, 
    compact, isSelected, isAttackTarget, canBeAttacked,
    isBeingAttacked, isAttacking
  ]);
  
  // Show card tooltip
  const handleInfoToggle = (e) => {
    e.stopPropagation();
    setTooltipCard(card);
  };

  return (
    <div
      onClick={onClick}
      className={`${cardProperties.cardClass} relative`}
      style={{ background: cardProperties.backgroundStyle }}
    >
      {/* Card header */}
      <div className="relative">
        {/* Info button */}
        <div
          className="absolute -top-1 -left-1 z-10 bg-amber-100 hover:bg-amber-200 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition-colors"
          onClick={handleInfoToggle}
        >
          <Info size={12} className="text-amber-800" />
        </div>

        {/* Card cost */}
        {!isEnemy && (
          <div className="absolute -top-1 -right-1 flex items-center text-yellow-700 bg-yellow-200 px-1 py-0.5 rounded-full shadow-sm">
            <Plus size={10} className="mr-0.5" /> {card.cost}
          </div>
        )}

        {/* Card name */}
        <div className="font-bold text-center text-amber-900 relative mt-3 px-1">
          {card.name}
          {isSelected && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          )}
          {cardProperties.canAttack && gamePhase === "main" && (
            <div className="absolute -top-1 left-0">
              <Sword size={12} className="text-green-600" />
            </div>
          )}
          {isAttackTarget && (
            <div className="absolute -top-1 left-0">
              <Target size={12} className="text-red-600" />
            </div>
          )}
        </div>

        {/* Card description - only in non-compact mode */}
        {!compact && (
          <div className="text-amber-800 text-xs px-1 mt-1 text-center overflow-hidden max-h-10">
            {card.description}
          </div>
        )}
      </div>

      {/* HP bar */}
      {(card.type === "unit" || card.type === "hero" || card.type === "fortification") && (
        <div className="my-1">
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                cardProperties.hpPercentage > 60
                  ? "bg-green-500"
                  : cardProperties.hpPercentage > 30
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${cardProperties.hpPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-center">
            {/* Always show HP for units/heroes/fortifications */}
            <span className={`
              ${cardProperties.hpPercentage < 100 ? "text-red-600" : "text-green-600"}
              ${cardProperties.isAlive ? "" : "text-gray-500"}
            `}>
              {cardProperties.currentCardHP}/{cardProperties.maxCardHP}
            </span>
          </div>
        </div>
      )}

      {/* Card stats */}
      <div className="flex justify-between items-center mt-1 gap-px">
        {card.attack > 0 && (
          <div className="flex items-center text-red-700 bg-red-200 p-0.5 rounded">
            <Sword size={12} className="mr-0.5" />
            <span>{card.attack}</span>
            {card.bonusAttack ? <span className="text-green-600">+{card.bonusAttack}</span> : null}
          </div>
        )}

        {card.defense > 0 && (
          <div className="flex items-center text-blue-700 bg-blue-200 p-0.5 rounded">
            <Shield size={12} className="mr-0.5" />
            <span>{card.defense}</span>
            {card.bonusDefense ? <span className="text-green-600">+{card.bonusDefense}</span> : null}
          </div>
        )}

        {/* HP as a separate stat - only in non-compact mode */}
        {(card.type === "unit" || card.type === "hero" || card.type === "fortification") && !compact && (
          <div className={`flex items-center ${cardProperties.hpPercentage < 100 ? "text-red-700 bg-red-200" : "text-green-700 bg-green-200"} p-0.5 rounded`}>
            <Heart size={12} className="mr-0.5" />
            <span>{cardProperties.currentCardHP}</span>
          </div>
        )}
      </div>

      {/* Status overlays */}
      {card.used && (
        <div className="absolute inset-0 bg-gray-500/30 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs bg-gray-800/80 px-2 py-1 rounded">UŻYTE</span>
        </div>
      )}

      {/* Show damaged state with cracked/burning overlay instead of immediately disappearing */}
      {!cardProperties.isAlive && (card.type === "unit" || card.type === "hero" || card.type === "fortification") && (
        <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs bg-red-800/80 px-2 py-1 rounded">💀 POKONANE</span>
        </div>
      )}
      
      {/* Show damaged state (but not destroyed) */}
      {cardProperties.isAlive && cardProperties.isDamaged && cardProperties.hpPercentage <= 50 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/20 rounded-lg"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-1 bg-red-700/60 rotate-45 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-8 h-1 bg-red-700/60 -rotate-45 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(GameCard);