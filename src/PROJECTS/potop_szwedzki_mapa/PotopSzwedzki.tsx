// src/PROJECTS/potop_szwedzki_mapa/PotopSzwedzki.tsx
import React, { useEffect, useRef } from "react";
import { useGameStore } from "./store/gameStore";
import { AnimationProvider, useAnimation } from "./context/AnimationContext";
import { GAME_FLOW } from "./constants";

// Components
import Hand from "./components/Hand";
import PlayArea from "./components/PlayArea";
import GameInfo from "./components/GameInfo";
import ActionButton from "./components/ActionButton";
import ScenarioMap from "./components/ScenarioMap";
import StartScreen from "./components/StartScreen";
import HistoricalContext from "./components/HistoricalContext";
import DeckBuilder from "./components/DeckBuilder";

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
    mapData,
    gameFlow,
    setGameFlow,
    selectScenarioForHistory
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
  const lastPlayerPlayAreaRef = useRef<Array<any>>([]);
  const lastOpponentPlayAreaRef = useRef<Array<any>>([]);
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
    const findDefeatedCards = (previousCards: any[], currentCards: any[]): any[] => {
      return previousCards.filter(
        (prevCard) =>
          !currentCards.some((currCard) => currCard.id === prevCard.id)
      );
    };

    // Only run if we're past the initial mount and in game screen
    if (!isInitialMount.current && gameFlow === GAME_FLOW.GAME_SCREEN) {
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
        if (gameStatus === "opponentWins") {
          showNotification("You have been defeated!", "warning");
          
          // Show return to scenario screen button after a delay
          setTimeout(() => {
            showNotification("Returning to scenario selection...", "info", () => {
              setGameFlow(GAME_FLOW.START_SCREEN);
            });
          }, 3000);
        }
      });

      defeatedOpponentCards.forEach((card) => {
        showNotification(`${card.name} was defeated!`, "success");
        if (gameStatus === "playerWins") {
          showNotification(
            "Victory! You have defeated your opponent!",
            "success"
          );
          
          // Show return to scenario screen button after a delay
          setTimeout(() => {
            showNotification("Returning to scenario selection...", "info", () => {
              setGameFlow(GAME_FLOW.START_SCREEN);
            });
          }, 3000);
        }
      });
    }

    // Update the last state references
    lastPlayerPlayAreaRef.current = [...player.playArea];
    lastOpponentPlayAreaRef.current = [...opponent.playArea];
  }, [player.playArea, opponent.playArea, gameStatus, showNotification, gameFlow, setGameFlow]);

  const handleCardInHandClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing" && !isAnimating) {
      const card = player.hand.find((c) => c.id === cardId);
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
    if (
      turn === "player" &&
      gameStatus === "playing" &&
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
      turn === "player" &&
      player.gold >= 1 &&
      player.hand.length < 5 &&
      player.deck.length > 0 &&
      gameStatus === "playing" &&
      !isAnimating
    ) {
      // Use the animation context function instead of inline code
      animateCardDraw(deckRef);
    }
  };

  const handleSelectScenario = (index: number) => {
    if (!isAnimating) {
      setIsAnimating(true);
      showNotification(
        `Loading scenario: ${scenarios[index].name}`,
        "info",
        () => {
          // First load the scenario data
          loadScenario(index);
          
          // Then show the historical context
          selectScenarioForHistory(index);
          setIsAnimating(false);
        }
      );
    }
  };

  const handleEndTurn = () => {
    if (turn === "player" && gameStatus === "playing" && !isAnimating) {
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
      showNotification("Returning to main menu...", "warning", () => {
        resetGame();
        setGameFlow(GAME_FLOW.START_SCREEN);
        setIsAnimating(false);
      });
    }
  };

  // Render based on current game flow state
  const renderGameFlow = () => {
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

    // Render the appropriate screen based on game flow
    switch (gameFlow) {
      case GAME_FLOW.START_SCREEN:
        return (
          <StartScreen 
            onSelectScenario={handleSelectScenario} 
          />
        );
        
      case GAME_FLOW.HISTORICAL_CONTEXT:
        return (
          <HistoricalContext 
            scenarioIndex={currentScenarioIndex}
            onContinue={() => setGameFlow(GAME_FLOW.DECK_BUILDER)} 
          />
        );
        
      case GAME_FLOW.DECK_BUILDER:
        return (
          <DeckBuilder 
            scenarioIndex={currentScenarioIndex}
            onStartGame={() => setGameFlow(GAME_FLOW.GAME_SCREEN)} 
          />
        );
        
      case GAME_FLOW.GAME_SCREEN:
        return renderGameScreen();
        
      default:
        return <div>Unknown game state</div>;
    }
  };

  // Render the main game screen
  const renderGameScreen = () => {
    return (
      <div className="relative h-screen bg-amber-50 text-white overflow-hidden flex flex-col">
        {/* Fullscreen Scenario Map Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <ScenarioMap
            scenarios={scenarios}
            currentIndex={currentScenarioIndex}
            onSelectScenario={() => {}} // Disabled in game mode
            isAnimating={isAnimating}
          />
        </div>
        <div className="fixed top-0 right-0 p-4 z-10">
          <GameInfo
            onNextScenario={() => {}} // Disabled in game mode
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
              turn === "player" &&
              gameStatus === "playing"
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
              turn !== "player" ||
              player.gold < 1 ||
              player.hand.length >= 5 ||
              player.deck.length === 0 ||
              gameStatus !== "playing" ||
              isAnimating
            }
            className="w-52"
          >
            Draw Card (1 💰)
          </ActionButton>

          <ActionButton
            onClick={handleEndTurn}
            disabled={
              turn !== "player" ||
              gameStatus !== "playing" ||
              isAnimating
            }
            className="w-52"
          >
            End Turn
          </ActionButton>
        </div>
      </div>
    );
  };

  return renderGameFlow();
};

export default PotopSzwedzkiGame;