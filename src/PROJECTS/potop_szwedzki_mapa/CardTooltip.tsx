import React from "react";
import { Sword, Shield, Heart, Plus } from "lucide-react";
import { Card } from "./gameStore";
import { uiStore } from "./uiStore";
// Nie importujemy CARD_KEYWORDS, będziemy używać stałych stringów

// Obiekt zawierający opisy słów kluczowych z indeksem typu string
const KEYWORD_DESCRIPTIONS: Record<string, string> = {
  // Angielskie nazwy słów kluczowych
  "SWARM": "Otrzymuje +1 do ataku za każdą inną kartę z umiejętnością Rój na polu bitwy.",
  "LEADERSHIP": "Zapewnia wszystkim sojuszniczym jednostkom +1/+1 do ataku i obrony.",
  "ELITE": "W połączeniu z Przywództwem, zapewnia większe bonusy do ataku i obrony.",
  "KING": "Razem z Elite i Przywództwem daje najsilniejsze bonusy dowodzenia.",
  "DEFENSE": "Zachowuje bonusy obrony po zakończeniu tury.",
  "WEALTH": "Daje +1 złota po zagraniu tej karty.",
  "SCOUT": "Pozwala dobrać dodatkową kartę po zagraniu.",
  "INSTANT": "Efekt tej karty aktywuje się natychmiast po zagraniu.",
  "TACTICS": "Specjalna umiejętność strategiczna, może wpływać na pole bitwy.",
  
  // Polskie wersje
  "Rójka": "Otrzymuje +1 do ataku za każdą inną kartę z umiejętnością Rój na polu bitwy.",
  "Dowództwo": "Zapewnia wszystkim sojuszniczym jednostkom +1/+1 do ataku i obrony.",
  "Elita": "W połączeniu z Przywództwem, zapewnia większe bonusy do ataku i obrony.",
  "Król": "Razem z Elite i Przywództwem daje najsilniejsze bonusy dowodzenia.",
  "Obrona": "Zachowuje bonusy obrony po zakończeniu tury.",
  "Bogactwo": "Daje +1 złota po zagraniu tej karty.",
  "Zwiad": "Pozwala dobrać dodatkową kartę po zagraniu.",
  "Natychmiastowe": "Efekt tej karty aktywuje się natychmiast po zagraniu.",
  "Taktyka": "Specjalna umiejętność strategiczna, może wpływać na pole bitwy."
};

const CardTooltip: React.FC = () => {
  // Get the tooltip card from uiStore
  const tooltipCard = uiStore((state) => state.tooltipCard);
  const setTooltipCard = uiStore((state) => state.setTooltipCard);

  if (!tooltipCard) return null;

  const card = tooltipCard;
  const currentCardHP =
    card.currentHP !== undefined ? card.currentHP : card.defense;
  const maxCardHP = card.maxHP || card.defense;
  const isDamaged = card.maxHP && currentCardHP < maxCardHP;
  const isAlive = currentCardHP > 0;

  // Close the tooltip when clicking outside
  const handleClickOutside = () => {
    setTooltipCard(null);
  };

  // Prevent click propagation for the modal content
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClickOutside}
    >
      <div 
        className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 shadow-xl max-w-md w-full text-sm mx-4 max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-amber-900">{card.name}</h3>
          <div className="flex items-center gap-2">
            {card.cost !== undefined && (
              <div className="flex items-center text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full shadow-sm">
                <Plus size={14} className="mr-1" /> {card.cost}
              </div>
            )}
            <div className="text-xs px-2 py-1 rounded-full bg-amber-200 text-amber-800">
              {card.type}
            </div>
          </div>
        </div>

        <div className="mb-4 text-amber-800">
          <div className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">
            Rzadkość
          </div>
          <div className="text-sm capitalize">{card.rarity}</div>
        </div>

        <div className="mb-4 text-amber-800">
          <div className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">
            Opis
          </div>
          <div className="text-sm">{card.description}</div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5">
          {card.attack > 0 && (
            <div className="flex flex-col items-center">
              <div className="font-semibold text-xs text-red-700 mb-1">
                Atak
              </div>
              <div className="flex items-center text-red-700 bg-red-200 px-3 py-1.5 rounded-lg">
                <Sword size={16} className="mr-1.5" />
                <span className="font-bold">{card.attack}</span>
                {card.bonusAttack ? (
                  <span className="text-green-600 ml-1">
                    +{card.bonusAttack}
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {card.defense > 0 && (
            <div className="flex flex-col items-center">
              <div className="font-semibold text-xs text-blue-700 mb-1">
                Obrona
              </div>
              <div className="flex items-center text-blue-700 bg-blue-200 px-3 py-1.5 rounded-lg">
                <Shield size={16} className="mr-1.5" />
                <span className="font-bold">{card.defense}</span>
                {card.bonusDefense ? (
                  <span className="text-green-600 ml-1">
                    +{card.bonusDefense}
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {(card.type === "unit" ||
            card.type === "hero" ||
            card.type === "fortification") && (
            <div className="flex flex-col items-center">
              <div className="font-semibold text-xs text-green-700 mb-1">
                Zdrowie
              </div>
              <div className="flex items-center text-green-700 bg-green-200 px-3 py-1.5 rounded-lg">
                <Heart size={16} className="mr-1.5" />
                <span className="font-bold">{currentCardHP}</span>
                {isDamaged && (
                  <span className="text-amber-600 ml-1">/{maxCardHP}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {(card.keywords && card.keywords.length > 0) && (
          <div className="mt-4">
            <div className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">
              Słowa kluczowe
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {card.keywords.map((keyword, index) => (
                <span key={index} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">
                  {keyword}
                </span>
              ))}
            </div>
            
            {/* Opisy słów kluczowych */}
            <div className="bg-amber-100/50 rounded-md p-3 border border-amber-200 space-y-2">
              {card.keywords.map((keyword, index) => (
                <div key={index} className="text-xs text-amber-900">
                  <span className="font-semibold">{keyword}:</span> {KEYWORD_DESCRIPTIONS[keyword] || `Specjalna umiejętność: ${keyword}`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          {card.used ? "Karta została już użyta w tej turze." : ""}
          {!isAlive ? "Ta jednostka została zniszczona." : ""}
          {card.canAttack && !card.used ? "Ta jednostka może atakować." : ""}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setTooltipCard(null)}
            className="bg-amber-200 hover:bg-amber-300 text-amber-900 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardTooltip;