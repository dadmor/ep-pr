// App.tsx
import React, { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import Hand from "./components/Hand";
import PlayArea from "./components/PlayArea";
import GameInfo from "./components/GameInfo";
import ActionButton from "./components/ActionButton";

// Helper function to determine if an action is disabled
const isDrawDisabled = (
  turn: "player" | "opponent",
  playerGold: number,
  handSize: number,
  deckSize: number,
  gameStatus: string
) =>
  turn !== "player" ||
  playerGold < 1 ||
  handSize >= 5 ||
  deckSize === 0 ||
  gameStatus !== "playing";

const isEndTurnDisabled = (turn: "player" | "opponent", gameStatus: string) =>
  turn !== "player" || gameStatus !== "playing";

const App: React.FC = () => {
  const {
    player,
    opponent,
    turn,
    selectedAttackerId,
    gameStatus,
    currentScenarioIndex,
    scenarios,
    drawCard,
    playCard,
    selectAttacker,
    attackCard,
    endTurn,
    loadScenario,
    resetGame,
  } = useGameStore();

  // Effect to load the initial scenario on component mount
  useEffect(() => {
    loadScenario(0);
  }, [loadScenario]);

  const handleCardInHandClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing") {
      playCard(cardId);
    }
  };

  const handlePlayerCardInPlayAreaClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing") {
      selectAttacker(selectedAttackerId === cardId ? null : cardId);
    }
  };

  const handleOpponentCardInPlayAreaClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing" && selectedAttackerId) {
      attackCard(selectedAttackerId, cardId);
    }
  };

  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      loadScenario(currentScenarioIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-between p-4">
      <div className="flex w-full max-w-7xl justify-between items-start flex-grow">
        {/* Game Info Column */}
        <GameInfo onNextScenario={handleNextScenario} onResetGame={resetGame} />

        {/* Game Board Column */}
        <div className="flex flex-col flex-grow mx-4 items-center">
          {/* Opponent's Play Area */}
          <PlayArea
            cards={opponent.playArea}
            isOpponent={true}
            onCardClick={handleOpponentCardInPlayAreaClick}
            selectedAttackerId={null}
            canTarget={
              selectedAttackerId !== null &&
              turn === "player" &&
              gameStatus === "playing"
            }
          />

          {/* Action Buttons */}
          <div className="my-6 flex space-x-4">
            <ActionButton
              onClick={drawCard}
              disabled={isDrawDisabled(
                turn,
                player.gold,
                player.hand.length,
                player.deck.length,
                gameStatus
              )}
            >
              Draw Card (1 Gold)
            </ActionButton>
            <ActionButton
              onClick={endTurn}
              disabled={isEndTurnDisabled(turn, gameStatus)}
            >
              End Turn
            </ActionButton>
          </div>

          {/* Player's Play Area */}
          <PlayArea
            cards={player.playArea}
            isOpponent={false}
            onCardClick={handlePlayerCardInPlayAreaClick}
            selectedAttackerId={selectedAttackerId}
            canTarget={false}
          />
        </div>

        {/* Player Hand (Right Column) */}
        <div className="w-96 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">Your Hand</h2>
          <Hand
            hand={player.hand}
            onCardClick={handleCardInHandClick}
            gold={player.gold}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
