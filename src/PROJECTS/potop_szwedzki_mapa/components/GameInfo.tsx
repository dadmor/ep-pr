// components/GameInfo.tsx
import React from 'react';
import { GameState } from '../types';
import { useGameStore } from '../store/gameStore'; // Import the store

interface GameInfoProps {
  // gameState: GameState; // No longer needed as a prop if we directly access the store
  onNextScenario: () => void;
  onResetGame: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ onNextScenario, onResetGame }) => {
  // Select relevant parts of the state directly from the store
  const { player, opponent, turn, gameStatus, currentScenarioIndex, scenarios, messages } = useGameStore();

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-xl m-4 w-64 flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-center">Game Info</h2>
      <div className="text-lg">
        <p>Current Turn: <span className="font-semibold capitalize">{turn}</span></p>
        <p>Player Gold: <span className="font-semibold text-yellow-400">{player.gold}</span></p>
        <p>Opponent Gold: <span className="font-semibold text-yellow-400">{opponent.gold}</span></p>
      </div>

      <div className="text-sm">
        <p>Scenario: <span className="font-semibold">{scenarios[currentScenarioIndex]?.name}</span></p>
        <p>Player Deck: <span className="font-semibold">{player.deck.length} cards</span></p>
        <p>Opponent Deck: <span className="font-semibold">{opponent.deck.length} cards</span></p>
      </div>

      <div className="text-lg font-bold text-center">
        {gameStatus === 'playerWins' && <p className="text-green-400">YOU WIN!</p>}
        {gameStatus === 'opponentWins' && <p className="text-red-400">YOU LOSE!</p>}
        {gameStatus === 'playing' && <p className="text-blue-400">Game On!</p>}
      </div>

      {messages.length > 0 && (
        <div className="bg-gray-700 p-2 rounded max-h-32 overflow-y-auto">
          <h3 className="text-md font-semibold mb-1">Game Log:</h3>
          {messages.map((msg, index) => (
            <p key={index} className="text-xs text-gray-300">{msg}</p>
          ))}
        </div>
      )}

      {gameStatus !== 'playing' && (
        <div className="flex flex-col space-y-2">
          {gameStatus === 'playerWins' && currentScenarioIndex < scenarios.length - 1 && (
            <button
              onClick={onNextScenario}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-bold transition-colors"
            >
              Next Scenario ({scenarios[currentScenarioIndex + 1]?.name})
            </button>
          )}
          <button
            onClick={onResetGame}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold transition-colors"
          >
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameInfo;