// components/GameInfo.tsx
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAnimation } from '../context/AnimationContext';
import clsx from 'clsx';

interface GameInfoProps {
  onNextScenario: () => void;
  onResetGame: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ onNextScenario, onResetGame }) => {
  // Select relevant parts of the state directly from the store
  const { player, opponent, turn, gameStatus, currentScenarioIndex, scenarios, messages } = useGameStore();
  const { isAnimating } = useAnimation();
  
  // Ref for the message log container
  const messageLogRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom of the message log when new messages are added
  useEffect(() => {
    if (messageLogRef.current) {
      messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-xl m-4 w-64 flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-center">Game Info</h2>
      
      <div className="text-lg">
        <p>
          Current Turn: 
          <span className={clsx(
            "font-semibold capitalize ml-2 transition-colors duration-300",
            { 'text-blue-400': turn === 'player', 'text-red-400': turn === 'opponent' }
          )}>
            {turn}
          </span>
        </p>
        
        <p className="flex items-center">
          Player Gold: 
          <span className="font-semibold text-yellow-400 ml-2 flex items-center">
            {player.gold}
            <span className="text-yellow-300 ml-1">💰</span>
          </span>
        </p>
        
        <p className="flex items-center">
          Opponent Gold: 
          <span className="font-semibold text-yellow-400 ml-2 flex items-center">
            {opponent.gold}
            <span className="text-yellow-300 ml-1">💰</span>
          </span>
        </p>
      </div>

      <div className="text-sm">
        <p>
          Scenario: 
          <span className="font-semibold ml-2">
            {scenarios[currentScenarioIndex]?.name}
          </span>
        </p>
        
        <p className="flex items-center">
          Player Deck: 
          <span className="font-semibold ml-2 flex items-center">
            {player.deck.length} cards
            <span className="text-purple-300 ml-1">🃏</span>
          </span>
        </p>
        
        <p className="flex items-center">
          Opponent Deck: 
          <span className="font-semibold ml-2 flex items-center">
            {opponent.deck.length} cards
            <span className="text-purple-300 ml-1">🃏</span>
          </span>
        </p>
      </div>

      <div className={clsx(
        "text-lg font-bold text-center py-2 rounded-lg transition-all duration-500",
        {
          'bg-green-500 bg-opacity-20': gameStatus === 'playerWins',
          'bg-red-500 bg-opacity-20': gameStatus === 'opponentWins',
          'bg-blue-500 bg-opacity-10': gameStatus === 'playing'
        }
      )}>
        {gameStatus === 'playerWins' && <p className="text-green-400">YOU WIN!</p>}
        {gameStatus === 'opponentWins' && <p className="text-red-400">YOU LOSE!</p>}
        {gameStatus === 'playing' && <p className="text-blue-400">Game On!</p>}
      </div>

      {messages.length > 0 && (
        <div 
          ref={messageLogRef}
          className="bg-gray-700 p-2 rounded max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        >
          <h3 className="text-md font-semibold mb-1">Game Log:</h3>
          {messages.map((msg, index) => (
            <p 
              key={index} 
              className={clsx(
                "text-xs py-1 border-b border-gray-600 last:border-0",
                { 'text-gray-300': index < messages.length - 1, 'text-white': index === messages.length - 1 }
              )}
            >
              {msg}
            </p>
          ))}
        </div>
      )}

      {gameStatus !== 'playing' && (
        <div className="flex flex-col space-y-2">
          {gameStatus === 'playerWins' && currentScenarioIndex < scenarios.length - 1 && (
            <button
              onClick={onNextScenario}
              disabled={isAnimating}
              className={clsx(
                "px-4 py-2 rounded-md text-white font-bold transition-colors",
                isAnimating 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              Next Scenario ({scenarios[currentScenarioIndex + 1]?.name})
            </button>
          )}
          <button
            onClick={onResetGame}
            disabled={isAnimating}
            className={clsx(
              "px-4 py-2 rounded-md text-white font-bold transition-colors",
              isAnimating 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(GameInfo);