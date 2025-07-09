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
    drawCard,
    playCard,
    selectAttacker,
    attackCard,
    endTurn,
    loadScenario,
    resetGame,
    addMessage
  } = useGameStore();

  const { 
    isAnimating,
    setIsAnimating,
    animateAttack,
    animateDamage,
    showNotification,
    autoAnimateRef
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
        setIsAnimating(true);
        // Use a small delay for visual feedback
        setTimeout(() => {
          playCard(cardId);
          showNotification(`Played ${card.name} for ${card.cost} gold`, 'info', () => {
            setIsAnimating(false);
          });
        }, 200);
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
        
        // Animate the attack, then execute game logic
        animateAttack(selectedAttackerId, cardId, damage, () => {
          attackCard(selectedAttackerId, cardId);
          
          // Notification is handled within the attack animation callbacks
          if (target.hp <= damage) {
            showNotification(`${target.name} was defeated!`, 'success');
          }
        });
      }
    }
  };

  const handleDrawCard = () => {
    if (!isDrawDisabled(turn, player.gold, player.hand.length, player.deck.length, gameStatus) && !isAnimating) {
      setIsAnimating(true);
      
      // If deck reference is available, animate card draw
      if (deckRef.current) {
        // Create temporary invisible card element for the animation
        const tempCard = document.createElement('div');
        tempCard.className = 'card-back bg-purple-800 rounded-lg shadow-lg';
        tempCard.style.width = '128px';
        tempCard.style.height = '192px';
        tempCard.style.position = 'absolute';
        
        const deckRect = deckRef.current.getBoundingClientRect();
        tempCard.style.top = `${deckRect.top}px`;
        tempCard.style.left = `${deckRect.left}px`;
        tempCard.style.zIndex = '1000';
        tempCard.style.pointerEvents = 'none';
        
        document.body.appendChild(tempCard);
        
        // Simple animation using Web Animations API
        const animation = tempCard.animate(
          [
            { top: `${deckRect.top}px`, left: `${deckRect.left}px`, opacity: 1, transform: 'scale(1)' },
            { top: `${deckRect.top - 50}px`, left: `${deckRect.left + 100}px`, opacity: 0.8, transform: 'scale(0.9)' }
          ],
          { duration: 400, easing: 'ease-in-out' }
        );
        
        animation.onfinish = () => {
          document.body.removeChild(tempCard);
          drawCard();
          showNotification('Card drawn', 'info', () => {
            setIsAnimating(false);
          });
        };
      } else {
        // Fallback if refs aren't available
        drawCard();
        showNotification('Card drawn', 'info', () => {
          setIsAnimating(false);
        });
      }
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
        endTurn();
        
        // Then execute opponent's turn
        executeOpponentTurn();
      });
    }
  };
  
  // Opponent turn function
  const executeOpponentTurn = () => {
    // Get current game state
    const currentState = useGameStore.getState();
    
    // 1. Play a card if possible
    const playableCards = currentState.opponent.deck
      .filter(card => card.cost <= currentState.opponent.gold)
      .sort((a, b) => b.attack - a.attack);
      
    if (playableCards.length > 0 && currentState.opponent.playArea.length < 5 && currentState.opponent.gold >= playableCards[0].cost) {
      const cardToPlay = playableCards[0];
      
      // Play the card with a small delay for animation
      setTimeout(() => {
        useGameStore.getState().opponentPlayCard(cardToPlay.name);
        showNotification(`Opponent played ${cardToPlay.name}`, 'warning', () => {
          // Continue with attack phase after playing card
          handleOpponentAttacks();
        });
      }, 500);
    } else {
      // No card played, proceed to attacks
      handleOpponentAttacks();
    }
  };
  
  // Handle opponent attacks
  const handleOpponentAttacks = () => {
    // Get current game state
    const currentState = useGameStore.getState();
    const attackers = currentState.opponent.playArea.filter(card => !card.hasAttacked);
    
    if (attackers.length === 0 || currentState.player.playArea.length === 0) {
      // No available attackers or targets, end turn
      showNotification("Opponent's turn ends", 'info', () => {
        useGameStore.getState().endTurn();
        setIsAnimating(false);
      });
      return;
    }
    
    // Execute attacks one by one with animations
    executeNextAttack(attackers, 0);
  };
  
  // Execute opponent attacks one by one
  const executeNextAttack = (attackers: CardType[], index: number) => {
    // Always get the latest game state
    const currentState = useGameStore.getState();
    
    if (index >= attackers.length || currentState.player.playArea.length === 0) {
      // All attacks completed or no more targets, end turn
      showNotification("Opponent's turn ends", 'info', () => {
        useGameStore.getState().endTurn();
        setIsAnimating(false);
      });
      return;
    }
    
    const attacker = attackers[index];
    
    // Find best target (lowest HP)
    const targets = [...currentState.player.playArea].sort((a, b) => a.hp - b.hp);
    if (targets.length === 0) {
      showNotification("Opponent's turn ends", 'info', () => {
        useGameStore.getState().endTurn();
        setIsAnimating(false);
      });
      return;
    }
    
    const target = targets[0];
    
    // Calculate damage for animation
    const damage = Math.max(0, attacker.attack - target.armor);
    
    // Show notification before attack
    showNotification(`Opponent's ${attacker.name} attacks your ${target.name}`, 'warning', () => {
      // Animate the attack
      animateAttack(attacker.id, target.id, damage, () => {
        // Update game state after animation completes
        useGameStore.getState().opponentAttack(attacker.id, target.id);
        
        // Check if player was defeated
        const updatedState = useGameStore.getState();
        if (updatedState.gameStatus === 'opponentWins') {
          showNotification('You have been defeated!', 'warning', () => {
            setIsAnimating(false);
          });
          return;
        }
        
        // Check if target was defeated
        const targetStillExists = updatedState.player.playArea.some(card => card.id === target.id);
        
        if (!targetStillExists) {
          showNotification(`Your ${target.name} was defeated!`, 'warning', () => {
            // Continue with next attack
            executeNextAttack(attackers, index + 1);
          });
        } else {
          // Target survived, continue with next attack
          executeNextAttack(attackers, index + 1);
        }
      });
    });
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