import React from "react";
import { Sword, Shield, Heart, Plus, Target } from "lucide-react";
import { useGameStore, Card } from "./store";

interface GameCardProps {
  card: Card;
  onClick?: () => void;
  isPlayable?: boolean;
  compact?: boolean;
  isEnemy?: boolean;
  isAttackTarget?: boolean;
  isSelected?: boolean;
  canBeAttacked?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  card,
  onClick,
  isPlayable = true,
  compact = false,
  isEnemy = false,
  isAttackTarget = false,
  isSelected = false,
  canBeAttacked = false,
}) => {
  const canPlayCard = useGameStore((state) => state.canPlayCard);
  const gamePhase = useGameStore((state) => state.gamePhase);

  const getRarityBorder = (rarity: Card["rarity"]): string => {
    switch (rarity) {
      case "common":
        return "border-amber-800";
      case "uncommon":
        return "border-yellow-700";
      case "rare":
        return "border-orange-700";
      case "legendary":
        return "border-red-600";
      default:
        return "border-purple-800";
    }
  };

  const canPlay = isPlayable && !isEnemy && canPlayCard(card) && gamePhase === "main";
  const canAttack = !isEnemy && card.canAttack && !card.used && (card.currentHP || card.defense) > 0 && card.attack > 0;
  const cardSize = compact ? "max-w-24 w-24 h-32" : "max-w-36 w-36 h-48";

  // Określ stan karty i odpowiednie style
  let cardClass = `${cardSize} ${getRarityBorder(card.rarity)} border-2 rounded-lg select-none`;
  let backgroundStyle = "";
  
  if (isSelected) {
    cardClass += " ring-4 ring-blue-400 shadow-lg scale-105";
  }
  
  if (isAttackTarget) {
    cardClass += " ring-4 ring-red-400 animate-pulse cursor-crosshair";
  }
  
  if (canBeAttacked && gamePhase === "selectTarget") {
    cardClass += " ring-2 ring-orange-300 hover:ring-orange-500 cursor-pointer hover:scale-105";
  }
  
  if (canAttack && gamePhase === "main") {
    cardClass += " ring-2 ring-green-300 hover:ring-green-500 cursor-pointer";
  }

  if (isEnemy) {
    backgroundStyle = "linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fed7aa 100%)";
    cardClass += " bg-yellow-100/95";
  } else {
    backgroundStyle = "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)";
    cardClass += " bg-yellow-50/95";
  }

  if (canPlay) {
    cardClass += " cursor-pointer hover:scale-105 hover:bg-yellow-100/100 hover:shadow-lg";
  } else if (!canAttack && !canBeAttacked && !isAttackTarget) {
    cardClass += " opacity-60";
  }

  cardClass += " backdrop-blur-sm text-amber-900 p-2 transition-all duration-200 flex flex-col justify-between text-xs shadow-md";

  // Oblicz procent HP dla paska zdrowia
  const currentCardHP = card.currentHP !== undefined ? card.currentHP : card.defense;
  const maxCardHP = card.maxHP || card.defense;
  const hpPercentage = maxCardHP ? (currentCardHP / maxCardHP) * 100 : 100;
  const isAlive = currentCardHP > 0;
  const isDamaged = card.maxHP && currentCardHP < maxCardHP;

  return (
    <div
      onClick={onClick}
      className={cardClass}
      style={{ background: backgroundStyle }}
    >
      {/* Nagłówek karty */}
      <div>
        <div className="font-bold mb-1 text-center text-amber-900 relative">
          {card.name}
          {isSelected && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          )}
          {canAttack && gamePhase === "main" && (
            <div className="absolute -top-1 -right-1">
              <Sword size={12} className="text-green-600" />
            </div>
          )}
          {isAttackTarget && (
            <div className="absolute -top-1 -right-1">
              <Target size={12} className="text-red-600" />
            </div>
          )}
        </div>
        
        {!compact && (
          <div className="text-amber-800 text-xs w-min">{card.description}</div>
        )}
      </div>

      {/* Pasek HP dla jednostek */}
      {(card.type === "unit" || card.type === "hero" || card.type === "fortification") && card.maxHP && (
        <div className="my-1">
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                hpPercentage > 60
                  ? "bg-green-500"
                  : hpPercentage > 30
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-center">
            {isDamaged && (
              <span className={`${isAlive ? "text-red-600" : "text-gray-500"}`}>
                {currentCardHP}/{maxCardHP}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Statystyki karty */}
      <div className="flex justify-between items-center mt-1 gap-px">
        {card.attack > 0 && (
          <div className="flex items-center text-red-700 bg-red-200 p-0.5 rounded">
            <Sword size={12} className="mr-0.5" />
            <span>{card.attack}</span>
            {card.bonusAttack ? (
              <span className="text-green-600">+{card.bonusAttack}</span>
            ) : null}
          </div>
        )}
        
        {card.defense > 0 && (
          <div className="flex items-center text-blue-700 bg-blue-200 p-0.5 rounded">
            <Shield size={12} className="mr-0.5" />
            <span>{card.defense}</span>
            {card.bonusDefense ? (
              <span className="text-green-600">+{card.bonusDefense}</span>
            ) : null}
          </div>
        )}
        
        {!isEnemy && (
          <div className="flex items-center text-yellow-700 bg-yellow-200 p-0.5 rounded">
            <Plus size={12} className="mr-0.5" /> {card.cost}
          </div>
        )}
        
        {/* Pokazuj HP tylko jeśli karta ma HP system */}
        {(card.type === "unit" || card.type === "hero" || card.type === "fortification") && !compact && (
          <div className="flex items-center text-green-700 bg-green-200 p-0.5 rounded">
            <Heart size={12} className="mr-0.5" />
            <span>{currentCardHP}</span>
          </div>
        )}
      </div>

      {/* Oznaczenia statusu */}
      {card.used && (
        <div className="absolute inset-0 bg-gray-500/30 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs bg-gray-800/80 px-2 py-1 rounded">
            UŻYTE
          </span>
        </div>
      )}
      
      {!isAlive && (
        <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs bg-red-800/80 px-2 py-1 rounded">
            💀 ZNISZCZONE
          </span>
        </div>
      )}
    </div>
  );
};

export default GameCard;