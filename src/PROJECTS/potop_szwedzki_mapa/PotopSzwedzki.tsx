// App.tsx
import React, { useEffect, useRef } from "react";
import { useGameStore } from "./store/gameStore";
import { AnimationProvider, useAnimation } from "./context/AnimationContext";
import Hand from "./components/Hand";
import PlayArea from "./components/PlayArea";
import GameInfo from "./components/GameInfo";
import ActionButton from "./components/ActionButton";
import { Card as CardType } from "./types";

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

// Main component that wraps the game with the AnimationProvider
const PotopSzwedzkiGame: React.FC = () => {
  return (
    <AnimationProvider>
      <GameWithAnimations />
    </AnimationProvider>
  );
};

// Inner component that uses the animation context
const GameWithAnimations: React.FC = () => {
  const {
    player,
    opponent,
    turn,
    selectedAttackerId,
    gameStatus,
    currentScenarioIndex,
    scenarios,
    loadScenario,
    selectAttacker,
    resetGame,
    addMessage
  } = useGameStore();

  const { 
    isAnimating,
    setIsAnimating,
    animateAttack,
    showNotification,
    autoAnimateRef,
    animateCardDraw,
    animateCardPlay,
    executeOpponentTurn
  } = useAnimation();

  // Refs for the deck area
  const deckRef = useRef<HTMLDivElement>(null);

  // Track the last state for animations
  const lastPlayerPlayAreaRef = useRef<CardType[]>([]);
  const lastOpponentPlayAreaRef = useRef<CardType[]>([]);
  const isInitialMount = useRef(true);

  // Effect to load the initial scenario on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      loadScenario(0);
      isInitialMount.current = false;
    }
  }, [loadScenario]);

  // Effect to detect card defeats
  useEffect(() => {
    // Find cards that were in the last state but are no longer present
    const findDefeatedCards = (
      previousCards: CardType[],
      currentCards: CardType[]
    ) => {
      return previousCards.filter(
        prevCard => !currentCards.some(currCard => currCard.id === prevCard.id)
      );
    };

    // Only run if we're past the initial mount
    if (!isInitialMount.current) {
      const defeatedPlayerCards = findDefeatedCards(
        lastPlayerPlayAreaRef.current,
        player.playArea
      );
      
      const defeatedOpponentCards = findDefeatedCards(
        lastOpponentPlayAreaRef.current,
        opponent.playArea
      );

      // Notify about defeated cards
      defeatedPlayerCards.forEach(card => {
        showNotification(`${card.name} was defeated!`, 'warning');
        if (gameStatus === 'opponentWins') {
          showNotification('You have been defeated!', 'warning');
        }
      });

      defeatedOpponentCards.forEach(card => {
        showNotification(`${card.name} was defeated!`, 'success');
        if (gameStatus === 'playerWins') {
          showNotification('Victory! You have defeated your opponent!', 'success');
        }
      });
    }

    // Update the last state references
    lastPlayerPlayAreaRef.current = [...player.playArea];
    lastOpponentPlayAreaRef.current = [...opponent.playArea];
  }, [player.playArea, opponent.playArea, gameStatus, showNotification]);

  const handleCardInHandClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing" && !isAnimating) {
      const card = player.hand.find(c => c.id === cardId);
      if (card && player.gold >= card.cost) {
        // Use the animation context function instead of inline code
        animateCardPlay(cardId);
      }
    }
  };

  const handlePlayerCardInPlayAreaClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing" && !isAnimating) {
      selectAttacker(selectedAttackerId === cardId ? null : cardId);
    }
  };

  const handleOpponentCardInPlayAreaClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing" && selectedAttackerId && !isAnimating) {
      const attacker = player.playArea.find(card => card.id === selectedAttackerId);
      const target = opponent.playArea.find(card => card.id === cardId);
      
      if (attacker && target) {
        // Calculate damage for animation
        const damage = Math.max(0, attacker.attack - target.armor);
        
        // Animate the attack using the animation context function
        animateAttack(selectedAttackerId, cardId, damage, () => {
          // After animation, update game state
          useGameStore.getState().attackCard(selectedAttackerId, cardId);
          
          if (target.hp <= damage) {
            showNotification(`${target.name} was defeated!`, 'success');
          }
        });
      }
    }
  };

  const handleDrawCard = () => {
    if (!isDrawDisabled(turn, player.gold, player.hand.length, player.deck.length, gameStatus) && !isAnimating) {
      // Use the animation context function instead of inline code
      animateCardDraw(deckRef);
    }
  };

  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1 && !isAnimating) {
      setIsAnimating(true);
      showNotification(`Loading next scenario: ${scenarios[currentScenarioIndex + 1].name}`, 'info', () => {
        loadScenario(currentScenarioIndex + 1);
        setIsAnimating(false);
      });
    }
  };

  const handleEndTurn = () => {
    if (!isEndTurnDisabled(turn, gameStatus) && !isAnimating) {
      setIsAnimating(true);
      addMessage("Ending turn. Opponent's turn begins.");
      
      showNotification("Ending turn. Opponent's turn begins.", 'info', () => {
        // First end player's turn
        useGameStore.getState().endTurn();
        
        // Then execute opponent's turn using the animation context function
        executeOpponentTurn();
      });
    }
  };

  const handleResetGame = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      showNotification("Resetting game...", 'warning', () => {
        resetGame();
        setIsAnimating(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-between p-4">
      <div className="flex w-full max-w-7xl justify-between items-start flex-grow">
        {/* Game Info Column */}
        <GameInfo onNextScenario={handleNextScenario} onResetGame={handleResetGame} />

        {/* Game Board Column */}
        <div className="flex flex-col flex-grow mx-4 items-center">
          {/* Opponent's Play Area */}
          <PlayArea
            cards={opponent.playArea}
            isOpponent={true}
            onCardClick={handleOpponentCardInPlayAreaClick}
            selectedAttackerId={selectedAttackerId}
            canTarget={
              selectedAttackerId !== null &&
              turn === "player" &&
              gameStatus === "playing"
            }
          />

          {/* Action Buttons */}
          <div className="my-6 flex space-x-4">
            <div 
              ref={deckRef} 
              className="relative h-16 w-12 mr-4 bg-purple-900 rounded-md shadow-lg flex items-center justify-center"
              data-area="deck"
            >
              <span className="text-xs text-white font-bold">{player.deck.length}</span>
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-xs px-2 py-0.5 rounded-full">
                1 💰
              </div>
            </div>
            
            <ActionButton
              onClick={handleDrawCard}
              disabled={isDrawDisabled(
                turn,
                player.gold,
                player.hand.length,
                player.deck.length,
                gameStatus
              ) || isAnimating}
            >
              Draw Card (1 Gold)
            </ActionButton>
            <ActionButton
              onClick={handleEndTurn}
              disabled={isEndTurnDisabled(turn, gameStatus) || isAnimating}
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

export default PotopSzwedzkiGame;