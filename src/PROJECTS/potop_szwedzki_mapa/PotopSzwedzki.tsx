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
  } = useGameStore();

  const { 
    isAnimating,
    animateCardPlacement,
    animateAttack,
    animateCardDefeated,
    showNotification,
    animateScenarioSetup
  } = useAnimation();

  // Refs for positioning
  const playerAreaRef = useRef<HTMLDivElement>(null);
  const opponentAreaRef = useRef<HTMLDivElement>(null);
  const handAreaRef = useRef<HTMLDivElement>(null);
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

  // Effect to animate scenario setup
  useEffect(() => {
    if (!isInitialMount.current && playerAreaRef.current && opponentAreaRef.current) {
      const playerCardIds = player.playArea.map(card => card.id);
      const opponentCardIds = opponent.playArea.map(card => card.id);
      
      // Animate the initial setup
      animateScenarioSetup(playerCardIds, opponentCardIds, () => {
        // Update the last state references
        lastPlayerPlayAreaRef.current = [...player.playArea];
        lastOpponentPlayAreaRef.current = [...opponent.playArea];
      });
    }
  }, [currentScenarioIndex]); // This will trigger when scenario changes

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

      // Animate any defeated cards
      defeatedPlayerCards.forEach(card => {
        animateCardDefeated(card.id, card.goldValue, () => {
          if (gameStatus === 'opponentWins') {
            showNotification('You have been defeated!', 'warning');
          }
        });
      });

      defeatedOpponentCards.forEach(card => {
        animateCardDefeated(card.id, card.goldValue, () => {
          if (gameStatus === 'playerWins') {
            showNotification('Victory! You have defeated your opponent!', 'success');
          }
        });
      });
    }

    // Update the last state references
    lastPlayerPlayAreaRef.current = [...player.playArea];
    lastOpponentPlayAreaRef.current = [...opponent.playArea];
  }, [player.playArea, opponent.playArea, gameStatus]);

  const handleCardInHandClick = (cardId: string) => {
    if (turn === "player" && gameStatus === "playing" && !isAnimating) {
      const card = player.hand.find(c => c.id === cardId);
      if (card && player.gold >= card.cost) {
        // Get the position for where the card will be placed
        if (playerAreaRef.current && handAreaRef.current) {
          const handCardElement = handAreaRef.current.querySelector(`[data-card-id="${cardId}"]`);
          const playerAreaRect = playerAreaRef.current.getBoundingClientRect();
          
          // Calculate center position of player area
          const toPosition = {
            top: playerAreaRect.top + playerAreaRect.height / 2 - 75, // Adjust for card height
            left: playerAreaRect.left + playerAreaRect.width / 2 - 50  // Adjust for card width
          };
          
          // Call the animation function first, then the game logic
          animateCardPlacement(cardId, handCardElement as HTMLElement, toPosition, () => {
            playCard(cardId);
            showNotification(`Played ${card.name} for ${card.cost} gold`, 'info');
          });
        } else {
          // Fallback if refs aren't available
          playCard(cardId);
        }
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
          
          // If target is defeated, the effect will handle the defeat animation
          if (target.hp <= damage) {
            showNotification(`${target.name} was defeated!`, 'success');
          }
        });
      }
    }
  };

  const handleDrawCard = () => {
    if (!isDrawDisabled(turn, player.gold, player.hand.length, player.deck.length, gameStatus) && !isAnimating) {
      // Get the positions for animation
      if (deckRef.current && handAreaRef.current) {
        const deckRect = deckRef.current.getBoundingClientRect();
        const handRect = handAreaRef.current.getBoundingClientRect();
        
        // Create temporary invisible card element for the animation
        const tempCard = document.createElement('div');
        tempCard.className = 'card-back bg-purple-800 rounded-lg shadow-lg';
        tempCard.style.width = '128px';
        tempCard.style.height = '192px';
        tempCard.style.position = 'absolute';
        tempCard.style.top = `${deckRect.top}px`;
        tempCard.style.left = `${deckRect.left}px`;
        tempCard.style.zIndex = '1000';
        tempCard.style.pointerEvents = 'none';
        document.body.appendChild(tempCard);
        
        // Animate the card draw
        const toPosition = {
          top: handRect.top + handRect.height / 2 - 75,
          left: handRect.left + handRect.width / 2 - 50
        };
        
        // Use the utility directly since we don't have the card ID yet
        import('./utils/animations').then(({ AnimationUtils }) => {
          AnimationUtils.animateCardPlacement(
            tempCard,
            { top: deckRect.top, left: deckRect.left },
            toPosition,
            () => {
              document.body.removeChild(tempCard);
              drawCard();
              showNotification('Card drawn', 'info');
            }
          );
        });
      } else {
        // Fallback if refs aren't available
        drawCard();
      }
    }
  };

  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      showNotification(`Loading next scenario: ${scenarios[currentScenarioIndex + 1].name}`, 'info', () => {
        loadScenario(currentScenarioIndex + 1);
      });
    }
  };

  // Fixed function: First end player's turn, then execute opponent's turn
  const handleEndTurn = () => {
    if (!isEndTurnDisabled(turn, gameStatus) && !isAnimating) {
      showNotification("Ending turn. Opponent's turn begins.", 'info', () => {
        // First end player's turn
        endTurn();
        
        // Now start opponent's turn
        const currentState = useGameStore.getState();
        if (currentState.opponent.playArea.length > 0 || currentState.opponent.deck.length > 0) {
          executeOpponentTurn();
        }
      });
    }
  };
  
  // Completely redesigned opponent turn function with proper animations
  const executeOpponentTurn = () => {
    // Get current game state
    const currentState = useGameStore.getState();
    
    // 1. Play a card if possible
    const playableCards = currentState.opponent.deck
      .filter(card => card.cost <= currentState.opponent.gold)
      .sort((a, b) => b.attack - a.attack);
      
    // First try to play a card if we have gold and space
    if (playableCards.length > 0 && currentState.opponent.playArea.length < 5 && currentState.opponent.gold >= playableCards[0].cost) {
      const cardToPlay = playableCards[0];
      
      // Pre-emptively add the card to opponent's play area without affecting the game state yet
      // This registers the card in the DOM so we can animate it properly
      // We'll call the actual game logic after the animation completes
      
      // First, update the state to make the card visible but don't deduct gold yet
      // This is a temporary state update just for animation purposes
      const tempCardId = `temp-${cardToPlay.id}`;
      const tempCard = { ...cardToPlay, id: tempCardId };
      
      // Temporarily add the card to opponent's play area with a custom ID for animation
      useGameStore.setState((state) => ({
        opponent: {
          ...state.opponent,
          playArea: [...state.opponent.playArea, tempCard],
        }
      }));
      
      // Wait a moment for the DOM to update with the new card
      setTimeout(() => {
        // Now that the card is in the DOM, we can animate it
        if (opponentAreaRef.current) {
          // Find the card element that was just added to the DOM
          const cardElement = opponentAreaRef.current.querySelector(`[data-card-id="${tempCardId}"]`);
          
          if (cardElement) {
            // Create start position (from top of screen)
            const startPosition = {
              top: opponentAreaRef.current.getBoundingClientRect().top - 200,
              left: opponentAreaRef.current.getBoundingClientRect().left + opponentAreaRef.current.getBoundingClientRect().width / 2 - 64
            };
            
            // Calculate end position (center of opponent area)
            const opponentAreaRect = opponentAreaRef.current.getBoundingClientRect();
            const endPosition = {
              top: opponentAreaRect.top + opponentAreaRect.height / 2 - 75,
              left: opponentAreaRect.left + opponentAreaRect.width / 2 - 50
            };
            
            // Make the card invisible initially
            (cardElement as HTMLElement).style.opacity = '0';
            
            // Animate the card placement
            animateCardPlacement(tempCardId, null, endPosition, () => {
              // Remove the temporary card
              useGameStore.setState((state) => ({
                opponent: {
                  ...state.opponent,
                  playArea: state.opponent.playArea.filter(c => c.id !== tempCardId),
                }
              }));
              
              // Now play the real card using the game logic
              useGameStore.getState().opponentPlayCard(cardToPlay.name);
              
              // Check if card was successfully played
              const updatedState = useGameStore.getState();
              const cardWasPlayed = updatedState.opponent.gold < currentState.opponent.gold;
              
              if (cardWasPlayed) {
                showNotification(`Opponent played ${cardToPlay.name}`, 'warning', () => {
                  // Continue with attack phase after playing card
                  handleOpponentAttacks();
                });
              } else {
                // If card play failed, move to attacks
                handleOpponentAttacks();
              }
            });
          } else {
            // Fallback if the card element wasn't found
            useGameStore.setState((state) => ({
              opponent: {
                ...state.opponent,
                playArea: state.opponent.playArea.filter(c => c.id !== tempCardId),
              }
            }));
            useGameStore.getState().opponentPlayCard(cardToPlay.name);
            handleOpponentAttacks();
          }
        } else {
          // Fallback if refs aren't available
          useGameStore.setState((state) => ({
            opponent: {
              ...state.opponent,
              playArea: state.opponent.playArea.filter(c => c.id !== tempCardId),
            }
          }));
          useGameStore.getState().opponentPlayCard(cardToPlay.name);
          handleOpponentAttacks();
        }
      }, 50); // Small delay to ensure DOM is updated
    } else {
      // No card played, proceed to attacks
      handleOpponentAttacks();
    }
  };
  
  // Handle opponent attacks with animations - FIXED
  const handleOpponentAttacks = () => {
    // Get current game state
    const currentState = useGameStore.getState();
    const attackers = currentState.opponent.playArea.filter(card => !card.hasAttacked);
    
    if (attackers.length === 0 || currentState.player.playArea.length === 0) {
      // No available attackers or targets, end turn
      showNotification("Opponent's turn ends", 'info', () => {
        // IMPORTANT FIX: Manually end opponent's turn and return to player
        useGameStore.getState().endTurn();
      });
      return;
    }
    
    // Execute attacks one by one with animations
    executeNextAttack(attackers, 0);
  };
  
  // Completely rewritten opponent attack handling with proper animations
  const executeNextAttack = (attackers: CardType[], index: number) => {
    // Always get the latest game state
    const currentState = useGameStore.getState();
    
    if (index >= attackers.length || currentState.player.playArea.length === 0) {
      // All attacks completed or no more targets, end turn
      showNotification("Opponent's turn ends", 'info', () => {
        // End opponent's turn and return to player
        useGameStore.getState().endTurn();
      });
      return;
    }
    
    const attacker = attackers[index];
    
    // Find best target (lowest HP)
    const targets = [...currentState.player.playArea].sort((a, b) => a.hp - b.hp);
    if (targets.length === 0) {
      showNotification("Opponent's turn ends", 'info', () => {
        useGameStore.getState().endTurn();
      });
      return;
    }
    
    const target = targets[0];
    
    // Calculate damage for animation
    const damage = Math.max(0, attacker.attack - target.armor);
    
    // Get references to the card DOM elements
    const attackerElement = document.querySelector(`[data-card-id="${attacker.id}"]`) as HTMLElement;
    const targetElement = document.querySelector(`[data-card-id="${target.id}"]`) as HTMLElement;
    
    if (!attackerElement || !targetElement) {
      // If we can't find the DOM elements, just apply the game logic and continue
      useGameStore.getState().opponentAttack(attacker.id, target.id);
      executeNextAttack(attackers, index + 1);
      return;
    }
    
    // Show notification and animate attack with the exact same animations as player
    showNotification(`Opponent's ${attacker.name} attacks your ${target.name}`, 'warning', () => {
      // Copy the exact attack animation used for player
      import('./utils/animations').then(({ AnimationUtils }) => {
        // First animate the attack movement
        AnimationUtils.animateAttack(
          attackerElement,
          targetElement,
          () => {
            // Then animate damage being received
            AnimationUtils.animateDamage(
              targetElement,
              damage,
              () => {
                // Update game state with the attack
                useGameStore.getState().opponentAttack(attacker.id, target.id);
                
                // Check if player was defeated
                const updatedState = useGameStore.getState();
                if (updatedState.gameStatus === 'opponentWins') {
                  showNotification('You have been defeated!', 'warning');
                  return;
                }
                
                // Check if target was defeated - we don't need to animate defeat here
                // as the useEffect watching playArea changes will handle that
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
              }
            );
          }
        );
      });
    });
  };

  const handleResetGame = () => {
    showNotification("Resetting game...", 'warning', () => {
      resetGame();
    });
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
            areaRef={opponentAreaRef}
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
            areaRef={playerAreaRef}
          />
        </div>

        {/* Player Hand (Right Column) */}
        <div className="w-96 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">Your Hand</h2>
          <Hand
            hand={player.hand}
            onCardClick={handleCardInHandClick}
            gold={player.gold}
            handRef={handAreaRef}
          />
        </div>
      </div>
    </div>
  );
};

export default PotopSzwedzkiGame;