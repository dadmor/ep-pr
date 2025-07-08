import React, { useMemo } from "react";
import { useGameStore } from "./states/gameStore";
import { useTimelineStore } from "./states/timelineManager";
import GameCard from "./GameCard";

const HandActionsComponent: React.FC = () => {
  // Hand state
  const hand = useGameStore((state) => state.cards.hand);
  const playCard = useGameStore((state) => state.playCard);
  const gamePhase = useGameStore((state) => state.game.phase);
  const canPlayCard = useGameStore((state) => state.canPlayCard);
  
  // Player resources
  const energy = useGameStore((state) => state.player.energy);
  const maxEnergy = useGameStore((state) => state.player.maxEnergy);
  const gold = useGameStore((state) => state.player.gold);
  const turn = useGameStore((state) => state.game.turn);
  
  // Game actions
  const endTurn = useGameStore((state) => state.endTurn);
  const initializeGame = useGameStore((state) => state.initializeGame);
  
  // Timeline state and actions
  const isTimelinePlaying = useTimelineStore((state) => state.isPlaying);
  const timelineSpeed = useTimelineStore((state) => state.speed);
  const setTimelineSpeed = useTimelineStore((state) => state.setSpeed);
  const pauseTimeline = useTimelineStore((state) => state.pauseTimeline);
  const resumeTimeline = useTimelineStore((state) => state.resumeTimeline);

  // Memoize playable cards to avoid unnecessary re-renders
  const { playableCards, unplayableCards } = useMemo(() => ({
    playableCards: hand.filter(card => canPlayCard(card)),
    unplayableCards: hand.filter(card => !canPlayCard(card))
  }), [hand, canPlayCard]);
  
  // Memoize button states
  const { canEndTurn, endTurnButtonClass } = useMemo(() => {
    const canEnd = gamePhase === "main";
    const buttonClass = `px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${
      canEnd
        ? "bg-amber-400 hover:bg-amber-500 text-amber-900 cursor-pointer"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`;
    return { canEndTurn: canEnd, endTurnButtonClass: buttonClass };
  }, [gamePhase]);
  
  // Handler functions
  const handleCardPlay = (card) => {
    if (gamePhase === "main") playCard(card);
  };
  
  const handleEndTurn = () => {
    if (canEndTurn) {
      endTurn();
    }
  };
  
  const handleRestartGame = () => {
    if (window.confirm("Czy na pewno chcesz rozpocząć nową grę?")) {
      initializeGame();
    }
  };
  
  const toggleTimelinePlayback = () => {
    if (isTimelinePlaying) {
      pauseTimeline();
    } else {
      resumeTimeline();
    }
  };
  
  const changeAnimationSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2, 3];
    const currentIndex = speeds.indexOf(timelineSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setTimelineSpeed(speeds[nextIndex]);
  };

  return (
    <div className="bg-yellow-50/60 backdrop-blur-lg rounded-xl p-2 shadow-lg/50 fixed bottom-0 left-0 right-0 z-20 mx-auto w-4/5 max-w-4xl">
      <div className="flex gap-3">
        {/* Hand area - left side */}
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <h3 className="text-amber-800 font-bold text-sm">
              🎴 Twoja ręka ({hand.length}/7)
            </h3>
            
            {/* Energy bar */}
            <div className="flex items-center bg-amber-100 rounded-lg px-2 py-0.5">
              <span className="text-amber-800 font-bold text-sm mr-1.5">⚡ Energia:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-1.5">
                <div
                  className="h-2.5 bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${(energy / maxEnergy) * 100}%` }}
                ></div>
              </div>
              <span className="text-amber-700 font-bold">{energy}/{maxEnergy}</span>
            </div>
          </div>
          
          <div className="flex gap-1 flex-wrap justify-center min-h-[160px] items-center">
            {hand.length === 0 ? (
              <p className="text-amber-600 italic">Brak kart w ręce</p>
            ) : (
              <>
                {playableCards.map((card) => (
                  <GameCard
                    key={card.instanceId}
                    card={card}
                    onClick={() => handleCardPlay(card)}
                    isPlayable={gamePhase === "main"}
                    compact={false}
                  />
                ))}
                {unplayableCards.map((card) => (
                  <GameCard
                    key={card.instanceId}
                    card={card}
                    onClick={() => handleCardPlay(card)}
                    isPlayable={false}
                    compact={false}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        
        {/* Actions panel - right side */}
        <div className="w-44 border-l border-amber-200 pl-2">
          <div className="space-y-2">
            {/* Resource displays */}
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="bg-amber-100 rounded-lg p-1.5 flex justify-between items-center">
                <span className="font-bold text-amber-800 text-xs">Złoto</span>
                <span className="bg-yellow-300 px-2 py-0.5 rounded-full text-amber-800 font-bold text-xs">
                  {gold} 💰
                </span>
              </div>
              
              <div className="bg-amber-100 rounded-lg p-1.5 flex justify-between items-center">
                <span className="font-bold text-amber-800 text-xs">Tura</span>
                <span className="bg-amber-200 px-2 py-0.5 rounded-full text-amber-800 font-bold text-xs">
                  {turn}
                </span>
              </div>
            </div>
            
            {/* Game controls */}
            <button
              onClick={handleEndTurn}
              disabled={!canEndTurn}
              className={endTurnButtonClass}
            >
              ⏭️ Zakończ turę
            </button>
            
            {/* Animation controls */}
            <div className="flex space-x-1">
              <button
                onClick={toggleTimelinePlayback}
                className="flex-1 px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors text-xs font-medium"
              >
                {isTimelinePlaying ? "⏸️ Pauza" : "▶️ Wznów"}
              </button>
              
              <button
                onClick={changeAnimationSpeed}
                className="flex-1 px-2 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors text-xs font-medium"
              >
                {timelineSpeed}x
              </button>
            </div>
            
            {/* Reset game button */}
            <button
              onClick={handleRestartGame}
              className="w-full px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors text-xs font-medium"
            >
              🔄 Nowa gra
            </button>
          </div>
          
          {/* Game phase indicator */}
          <div className="mt-2 text-center">
            <div className="text-xs">
              {gamePhase === "main" && (
                <span className="bg-green-100 px-2 py-0.5 rounded text-green-700">
                  ✨ Twoja tura
                </span>
              )}
              {gamePhase === "selectTarget" && (
                <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">
                  🎯 Wybieranie celu
                </span>
              )}
              {gamePhase === "enemyTurn" && (
                <span className="bg-red-100 px-2 py-0.5 rounded text-red-700">
                  ⏳ Tura przeciwnika
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HandActionsComponent);