// CardTooltip.jsx - Prosty komponent tooltipa
import React from "react";
import { uiStore } from "./states/uiStore";
import { Shield, Sword, Heart, X } from "lucide-react";

const CardTooltip = () => {
  const tooltipCard = uiStore((state) => state.tooltipCard);
  const setTooltipCard = uiStore((state) => state.setTooltipCard);

  if (!tooltipCard) return null;

  const closeTooltip = () => setTooltipCard(null);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" 
         onClick={closeTooltip}>
      <div 
        className="bg-gradient-to-br from-amber-50 to-yellow-100 p-4 rounded-lg shadow-xl max-w-md w-full border-2 border-amber-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-amber-900">{tooltipCard.name}</h3>
          <button onClick={closeTooltip} className="text-amber-700 hover:text-amber-900">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="bg-amber-200/60 px-3 py-1 rounded-full">
            <span className="font-bold">Koszt:</span> {tooltipCard.cost}
          </div>
          <div className="bg-amber-200/60 px-3 py-1 rounded-full">
            <span className="font-bold">Typ:</span> {
              tooltipCard.type === "unit" ? "Jednostka" :
              tooltipCard.type === "hero" ? "Bohater" :
              tooltipCard.type === "fortification" ? "Fortyfikacja" : "Zaklęcie"
            }
          </div>
          <div className="bg-amber-200/60 px-3 py-1 rounded-full">
            <span className="font-bold">Rzadkość:</span> {
              tooltipCard.rarity === "common" ? "Powszechna" :
              tooltipCard.rarity === "uncommon" ? "Niepowszechna" :
              tooltipCard.rarity === "rare" ? "Rzadka" : "Legendarna"
            }
          </div>
        </div>
        
        <p className="text-amber-900 mb-4 bg-amber-50/80 p-2 rounded border border-amber-100">
          {tooltipCard.description}
        </p>
        
        <div className="flex gap-4 mb-3">
          {tooltipCard.attack > 0 && (
            <div className="flex items-center bg-red-100 px-3 py-1 rounded-md">
              <Sword size={16} className="text-red-700 mr-1" />
              <span className="font-bold">Atak:</span> {tooltipCard.attack}
              {tooltipCard.bonusAttack ? <span className="text-green-600">+{tooltipCard.bonusAttack}</span> : null}
            </div>
          )}
          
          {tooltipCard.defense > 0 && (
            <div className="flex items-center bg-blue-100 px-3 py-1 rounded-md">
              <Shield size={16} className="text-blue-700 mr-1" />
              <span className="font-bold">Obrona:</span> {tooltipCard.defense}
              {tooltipCard.bonusDefense ? <span className="text-green-600">+{tooltipCard.bonusDefense}</span> : null}
            </div>
          )}
          
          {(tooltipCard.type === "unit" || tooltipCard.type === "hero" || tooltipCard.type === "fortification") && (
            <div className="flex items-center bg-green-100 px-3 py-1 rounded-md">
              <Heart size={16} className="text-green-700 mr-1" />
              <span className="font-bold">HP:</span> {tooltipCard.currentHP || tooltipCard.defense}/
              {tooltipCard.maxHP || tooltipCard.defense}
            </div>
          )}
        </div>
        
        {tooltipCard.keywords?.length > 0 && (
          <div className="mt-2 border-t border-amber-200 pt-2">
            <h4 className="font-bold text-amber-800 mb-1">Słowa kluczowe:</h4>
            <div className="flex flex-wrap gap-1">
              {tooltipCard.keywords.map((keyword, index) => (
                <span key={index} className="bg-amber-50 px-2 py-1 rounded text-xs">{keyword}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CardTooltip);