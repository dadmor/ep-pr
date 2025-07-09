import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "./store/gameStore";
import { AnimationProvider, useAnimation } from "./context/AnimationContext";
import Hand from "./components/Hand";
import PlayArea from "./components/PlayArea";
import GameInfo from "./components/GameInfo";
import ActionButton from "./components/ActionButton";
import { Card as CardType } from "./types";
import ScenarioMap from "./components/ScenarioMap";
import { 
  TURN_TYPE, 
  MAX_HAND_SIZE, 
  CARD_DRAW_COST, 
  WIN_CONDITION 
} from "./constants";

// Helper function to determine if an action is disabled
const isDrawDisabled = (
  turn: "player" | "opponent",
  playerGold: number,
  handSize: number,
  deckSize: number,
  gameStatus: string
) =>
  turn !== TURN_TYPE.PLAYER ||
  playerGold < CARD_DRAW_COST ||
  handSize >= MAX_HAND_SIZE ||
  deckSize === 0 ||
  gameStatus !== WIN_CONDITION.PLAYING;

const isEndTurnDisabled = (turn: "player" | "opponent", gameStatus: string) =>
  turn !== TURN_TYPE.PLAYER || gameStatus !== WIN_CONDITION.PLAYING;

// Main component that wraps the game with the AnimationProvider
const PotopSzwedzkiGame = () => {
  return (
    <AnimationProvider>
      <GameWithAnimations />
    </AnimationProvider>
  );
};

// Inner component that uses the animation context
const GameWithAnimations = () => {
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
    addMessage,
    mapData
  } = useGameStore();

  const {
    isAnimating,
    setIsAnimating,
    animateAttack,
    showNotification,
    animateCardDraw,
    animateCardPlay,
    executeOpponentTurn,
  } = useAnimation();

  // Refs for the deck area
  const deckRef = useRef<HTMLDivElement | null>(null);

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
    const findDefeatedCards = (previousCards: CardType[], currentCards: CardType[]): CardType[] => {
      return previousCards.filter(
        (prevCard) =>
          !currentCards.some((currCard) => currCard.id === prevCard.id)
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
      defeatedPlayerCards.forEach((card) => {
        showNotification(`${card.name} was defeated!`, "warning");
        if (gameStatus === WIN_CONDITION.OPPONENT_WINS) {
          showNotification("You have been defeated!", "warning");
        }
      });

      defeatedOpponentCards.forEach((card) => {
        showNotification(`${card.name} was defeated!`, "success");
        if (gameStatus === WIN_CONDITION.PLAYER_WINS) {
          showNotification(
            "Victory! You have defeated your opponent!",
            "success"
          );
        }
      });
    }

    // Update the last state references
    lastPlayerPlayAreaRef.current = [...player.playArea];
    lastOpponentPlayAreaRef.current = [...opponent.playArea];
  }, [player.playArea, opponent.playArea, gameStatus, showNotification]);

  const handleCardInHandClick = (cardId: string) => {
    if (turn === TURN_TYPE.PLAYER && gameStatus === WIN_CONDITION.PLAYING && !isAnimating) {
      const card = player.hand.find((c) => c.id === cardId);
      if (card && player.gold >= card.cost) {
        // Use the animation context function instead of inline code
        animateCardPlay(cardId);
      }
    }
  };

  const handlePlayerCardInPlayAreaClick = (cardId: string) => {
    if (turn === TURN_TYPE.PLAYER && gameStatus === WIN_CONDITION.PLAYING && !isAnimating) {
      selectAttacker(selectedAttackerId === cardId ? null : cardId);
    }
  };

  const handleOpponentCardInPlayAreaClick = (cardId: string) => {
    if (
      turn === TURN_TYPE.PLAYER &&
      gameStatus === WIN_CONDITION.PLAYING &&
      selectedAttackerId &&
      !isAnimating
    ) {
      const attacker = player.playArea.find(
        (card) => card.id === selectedAttackerId
      );
      const target = opponent.playArea.find((card) => card.id === cardId);

      if (attacker && target) {
        // Calculate damage for animation
        const damage = Math.max(0, attacker.attack - target.armor);

        // Animate the attack using the animation context function
        animateAttack(selectedAttackerId, cardId, damage, () => {
          // After animation, update game state
          useGameStore.getState().attackCard(selectedAttackerId, cardId);

          if (target.hp <= damage) {
            showNotification(`${target.name} was defeated!`, "success");
          }
        });
      }
    }
  };

  const handleDrawCard = () => {
    if (
      !isDrawDisabled(
        turn,
        player.gold,
        player.hand.length,
        player.deck.length,
        gameStatus
      ) &&
      !isAnimating
    ) {
      // Use the animation context function instead of inline code
      animateCardDraw(deckRef);
    }
  };

  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1 && !isAnimating) {
      setIsAnimating(true);
      showNotification(
        `Loading next scenario: ${scenarios[currentScenarioIndex + 1].name}`,
        "info",
        () => {
          loadScenario(currentScenarioIndex + 1);
          setIsAnimating(false);
        }
      );
    }
  };

  const handleSelectScenario = (index: number) => {
    if (!isAnimating) {
      setIsAnimating(true);
      showNotification(
        `Loading scenario: ${scenarios[index].name}`,
        "info",
        () => {
          loadScenario(index);
          setIsAnimating(false);
        }
      );
    }
  };

  const handleEndTurn = () => {
    if (!isEndTurnDisabled(turn, gameStatus) && !isAnimating) {
      setIsAnimating(true);
      addMessage("Ending turn. Opponent's turn begins.");

      showNotification("Ending turn. Opponent's turn begins.", "info", () => {
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
      showNotification("Resetting game...", "warning", () => {
        resetGame();
        setIsAnimating(false);
      });
    }
  };

  // Show loading state if map data is not available
  if (!mapData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading map data...</h2>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-amber-50 text-white overflow-hidden flex flex-col">
      {/* Fullscreen Scenario Map Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <ScenarioMap
          scenarios={scenarios}
          currentIndex={currentScenarioIndex}
          onSelectScenario={handleSelectScenario}
          isAnimating={isAnimating}
        />
      </div>
      <div className="fixed top-0 right-0 p-4 z-10">
        <GameInfo
          onNextScenario={handleNextScenario}
          onResetGame={handleResetGame}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex-col space-y-4 mt-2 z-10">
        <PlayArea
          cards={opponent.playArea}
          isOpponent={true}
          onCardClick={handleOpponentCardInPlayAreaClick}
          selectedAttackerId={selectedAttackerId}
          canTarget={
            selectedAttackerId !== null &&
            turn === TURN_TYPE.PLAYER &&
            gameStatus === WIN_CONDITION.PLAYING
          }
        />
        <PlayArea
          cards={player.playArea}
          isOpponent={false}
          onCardClick={handlePlayerCardInPlayAreaClick}
          selectedAttackerId={selectedAttackerId}
          canTarget={false}
        />
      </div>
      <div className="px-6 z-10">
        <Hand
          hand={player.hand}
          onCardClick={handleCardInHandClick}
          gold={player.gold}
        />
      </div>
      <div className="fixed bottom-0 right-0 flex flex-col justify-center p-4 gap-2 z-10">
        <ActionButton
          onClick={handleDrawCard}
          disabled={
            isDrawDisabled(
              turn,
              player.gold,
              player.hand.length,
              player.deck.length,
              gameStatus
            ) || isAnimating
          }
          className="w-52"
        >
          Draw Card ({CARD_DRAW_COST} 💰)
        </ActionButton>

        <ActionButton
          onClick={handleEndTurn}
          disabled={isEndTurnDisabled(turn, gameStatus) || isAnimating}
          className="w-52"
        >
          End Turn
        </ActionButton>
      </div>
    </div>
  );
};

export default PotopSzwedzkiGame;