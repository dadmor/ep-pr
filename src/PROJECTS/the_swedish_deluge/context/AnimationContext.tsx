// src/PROJECTS/potop_szwedzki_mapa/context/AnimationContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Card as CardType } from '../types';
import { useGameStore } from '../store/gameStore';
import { 
  ANIMATION_DURATION, 
  NOTIFICATION_TYPE, 
  WIN_CONDITION,
  ATTACK_LUNGE_DISTANCE
} from '../constants';

interface AnimationContextType {
  // Animation state
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
  
  // Auto-animate hook for container animations
  autoAnimateRef: React.RefCallback<Element>;
  
  // Card references for attack animations
  registerCardRef: (cardId: string, element: HTMLElement | null) => void;
  getCardRef: (cardId: string) => HTMLElement | undefined;
  
  // Essential animation methods
  animateAttack: (
    attackerId: string, 
    targetId: string,
    damage: number,
    onComplete?: () => void
  ) => void;
  
  animateDamage: (
    targetId: string,
    damage: number,
    onComplete?: () => void
  ) => void;
  
  showNotification: (
    message: string,
    type?: 'success' | 'warning' | 'info',
    onComplete?: () => void
  ) => void;

  // New animation methods moved from main component
  animateCardDraw: (
    deckRef: React.RefObject<HTMLDivElement>,
    onComplete?: () => void
  ) => void;

  animateCardPlay: (
    cardId: string,
    onComplete?: () => void
  ) => void;

  executeOpponentTurn: () => void;
  
  handleOpponentAttacks: () => void;
  
  executeNextAttack: (
    attackers: CardType[], 
    index: number
  ) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

// Helper for card references
const useCardRefs = () => {
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const registerCardRef = useCallback((cardId: string, element: HTMLElement | null) => {
    if (element) {
      cardRefs.current.set(cardId, element);
    } else {
      cardRefs.current.delete(cardId);
    }
  }, []);

  const getCardRef = useCallback((cardId: string): HTMLElement | undefined => {
    return cardRefs.current.get(cardId);
  }, []);

  return { registerCardRef, getCardRef };
};

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoAnimateRef] = useAutoAnimate(); // Create auto-animate ref
  const { registerCardRef, getCardRef } = useCardRefs();
  
  // Animation for attacking
  const animateAttack = useCallback((
    attackerId: string,
    targetId: string,
    damage: number,
    onComplete?: () => void
  ) => {
    setIsAnimating(true);
    const attackerElement = getCardRef(attackerId);
    const targetElement = getCardRef(targetId);
    
    if (!attackerElement || !targetElement) {
      if (onComplete) onComplete();
      setIsAnimating(false);
      return;
    }
    
    // Calculate direction vector from attacker to target
    const attackerRect = attackerElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    const directionX = targetRect.left - attackerRect.left;
    const directionY = targetRect.top - attackerRect.top;
    
    // Normalize to get a shorter movement distance
    const distance = Math.sqrt(directionX * directionX + directionY * directionY);
    const moveX = (directionX / distance) * distance * ATTACK_LUNGE_DISTANCE;
    const moveY = (directionY / distance) * distance * ATTACK_LUNGE_DISTANCE;
    
    // Store original transform for resetting
    const originalTransform = attackerElement.style.transform;
    
    // Animate the attacker "lunging" toward the target
    attackerElement.style.transition = `transform ${ANIMATION_DURATION.SHORT}ms ease-out`;
    attackerElement.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    
    // Return to original position
    setTimeout(() => {
      attackerElement.style.transition = `transform ${ANIMATION_DURATION.SHORT}ms ease-in`;
      attackerElement.style.transform = originalTransform;
      
      // When attack animation completes, show damage
      setTimeout(() => {
        animateDamage(targetId, damage, onComplete);
      }, ANIMATION_DURATION.SHORT);
    }, ANIMATION_DURATION.SHORT);
  }, [getCardRef]);
  
  // Animation for damage
  const animateDamage = useCallback((
    targetId: string,
    damage: number,
    onComplete?: () => void
  ) => {
    const targetElement = getCardRef(targetId);
    
    if (!targetElement) {
      if (onComplete) onComplete();
      setIsAnimating(false);
      return;
    }
    
    // Create damage indicator
    const damageContainer = document.createElement("div");
    damageContainer.className = "damage-indicator-container";
    damageContainer.style.position = "absolute";
    damageContainer.style.zIndex = "1001";
    damageContainer.style.pointerEvents = "none";
    damageContainer.style.display = "flex";
    damageContainer.style.justifyContent = "center";
    damageContainer.style.alignItems = "center";
    damageContainer.style.width = "40px";
    damageContainer.style.height = "40px";
    damageContainer.style.borderRadius = "50%";
    damageContainer.style.background = "linear-gradient(135deg, #740000, #ff0000)";
    damageContainer.style.boxShadow = "0 0 0 3px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.8)";
    
    // Add damage text
    const damageEl = document.createElement("div");
    damageEl.className = "damage-indicator";
    damageEl.textContent = `-${damage}`;
    damageEl.style.color = "white";
    damageEl.style.fontWeight = "bold";
    damageEl.style.fontSize = "20px";
    damageEl.style.textShadow = "0 0 2px black, 0 0 4px black";
    
    damageContainer.appendChild(damageEl);
    
    // Position damage indicator
    const targetRect = targetElement.getBoundingClientRect();
    damageContainer.style.top = `${targetRect.top + targetRect.height / 3}px`;
    damageContainer.style.left = `${targetRect.left + targetRect.width / 2 - 20}px`;
    document.body.appendChild(damageContainer);
    
    // Add pulsing animation
    damageContainer.animate(
      [
        { transform: 'scale(0.8)', opacity: 0 },
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      { duration: ANIMATION_DURATION.SHORT, easing: 'ease-out' }
    );
    
    // Shake target card
    let shakeCount = 0;
    const originalTransform = targetElement.style.transform;
    
    const shakeCard = () => {
      if (shakeCount >= 5) {
        targetElement.style.transform = originalTransform;
        return;
      }
      
      targetElement.style.transform = shakeCount % 2 === 0 
        ? `${originalTransform} translateX(5px)` 
        : `${originalTransform} translateX(-5px)`;
      
      shakeCount++;
      setTimeout(shakeCard, 50);
    };
    
    shakeCard();
    
    // Flash target card red
    targetElement.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
    setTimeout(() => {
      targetElement.style.backgroundColor = "";
    }, ANIMATION_DURATION.MEDIUM);
    
    // Animate damage indicator floating up and fading out
    setTimeout(() => {
      const animation = damageContainer.animate(
        [
          { transform: 'translateY(0)', opacity: 1 },
          { transform: 'translateY(-40px)', opacity: 0 }
        ],
        { duration: ANIMATION_DURATION.LONG, easing: 'ease-out' }
      );
      
      animation.onfinish = () => {
        document.body.removeChild(damageContainer);
        if (onComplete) onComplete();
        setIsAnimating(false);
      };
    }, ANIMATION_DURATION.MEDIUM);
  }, [getCardRef]);
  
  // Notification system
  const showNotification = useCallback((
    message: string,
    type: 'success' | 'warning' | 'info' = 'info',
    onComplete?: () => void
  ) => {
    // Create notification element
    const notificationEl = document.createElement("div");
    notificationEl.className = `game-notification game-notification-${type}`;
    notificationEl.textContent = message;
    notificationEl.style.position = "fixed";
    notificationEl.style.top = "50%";
    notificationEl.style.left = "50%";
    notificationEl.style.transform = "translate(-50%, -50%)";
    notificationEl.style.padding = "12px 20px";
    notificationEl.style.borderRadius = "8px";
    notificationEl.style.zIndex = "2000";
    notificationEl.style.fontSize = "18px";
    notificationEl.style.fontWeight = "bold";
    notificationEl.style.pointerEvents = "none";

    // Set background color based on type
    if (type === NOTIFICATION_TYPE.SUCCESS) {
      notificationEl.style.backgroundColor = "rgba(46, 204, 113, 0.9)";
    } else if (type === NOTIFICATION_TYPE.WARNING) {
      notificationEl.style.backgroundColor = "rgba(230, 126, 34, 0.9)";
    } else {
      notificationEl.style.backgroundColor = "rgba(52, 152, 219, 0.9)";
    }
    notificationEl.style.color = "white";

    document.body.appendChild(notificationEl);

    // Animate in
    notificationEl.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -60%)' },
        { opacity: 1, transform: 'translate(-50%, -50%)' }
      ],
      { duration: ANIMATION_DURATION.SHORT, easing: 'ease-out' }
    );

    // Hide notification after a delay
    setTimeout(() => {
      const animation = notificationEl.animate(
        [
          { opacity: 1, transform: 'translate(-50%, -50%)' },
          { opacity: 0, transform: 'translate(-50%, -40%)' }
        ],
        { duration: ANIMATION_DURATION.MEDIUM, easing: 'ease-in' }
      );
      
      animation.onfinish = () => {
        document.body.removeChild(notificationEl);
        if (onComplete) onComplete();
      };
    }, ANIMATION_DURATION.NOTIFICATION);
  }, []);

  // New animation for drawing a card (moved from main component)
  const animateCardDraw = useCallback((
    deckRef: React.RefObject<HTMLDivElement>,
    onComplete?: () => void
  ) => {
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
        { duration: ANIMATION_DURATION.MEDIUM, easing: 'ease-in-out' }
      );
      
      animation.onfinish = () => {
        document.body.removeChild(tempCard);
        
        // Execute game logic after animation
        useGameStore.getState().drawCard();
        
        showNotification('Card drawn', NOTIFICATION_TYPE.INFO, () => {
          setIsAnimating(false);
          if (onComplete) onComplete();
        });
      };
    } else {
      // Fallback if refs aren't available
      useGameStore.getState().drawCard();
      showNotification('Card drawn', NOTIFICATION_TYPE.INFO, () => {
        setIsAnimating(false);
        if (onComplete) onComplete();
      });
    }
  }, [showNotification]);

  // Animation for playing a card
  const animateCardPlay = useCallback((
    cardId: string,
    onComplete?: () => void
  ) => {
    const card = useGameStore.getState().player.hand.find(c => c.id === cardId);
    
    if (!card) {
      if (onComplete) onComplete();
      setIsAnimating(false);
      return;
    }
    
    setIsAnimating(true);
    
    // Use a small delay for visual feedback
    setTimeout(() => {
      useGameStore.getState().playCard(cardId);
      showNotification(`Played ${card.name} for ${card.cost} gold`, NOTIFICATION_TYPE.INFO, () => {
        setIsAnimating(false);
        if (onComplete) onComplete();
      });
    }, ANIMATION_DURATION.SHORT);
  }, [showNotification]);

  // Execute opponent's turn
  const executeOpponentTurn = useCallback(() => {
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
        showNotification(`Opponent played ${cardToPlay.name}`, NOTIFICATION_TYPE.WARNING, () => {
          // Continue with attack phase after playing card
          handleOpponentAttacks();
        });
      }, 500);
    } else {
      // No card played, proceed to attacks
      handleOpponentAttacks();
    }
  }, []);
  
  // Handle opponent attacks
  const handleOpponentAttacks = useCallback(() => {
    // Get current game state
    const currentState = useGameStore.getState();
    const attackers = currentState.opponent.playArea.filter(card => !card.hasAttacked);
    
    if (attackers.length === 0 || currentState.player.playArea.length === 0) {
      // No available attackers or targets, end turn
      showNotification("Opponent's turn ends", NOTIFICATION_TYPE.INFO, () => {
        useGameStore.getState().endTurn();
        setIsAnimating(false);
      });
      return;
    }
    
    // Execute attacks one by one with animations
    executeNextAttack(attackers, 0);
  }, []);
  
  // Execute opponent attacks one by one
  const executeNextAttack = useCallback((attackers: CardType[], index: number) => {
    // Always get the latest game state
    const currentState = useGameStore.getState();
    
    if (index >= attackers.length || currentState.player.playArea.length === 0) {
      // All attacks completed or no more targets, end turn
      showNotification("Opponent's turn ends", NOTIFICATION_TYPE.INFO, () => {
        useGameStore.getState().endTurn();
        setIsAnimating(false);
      });
      return;
    }
    
    const attacker = attackers[index];
    
    // Find best target (lowest HP)
    const targets = [...currentState.player.playArea].sort((a, b) => a.hp - b.hp);
    if (targets.length === 0) {
      showNotification("Opponent's turn ends", NOTIFICATION_TYPE.INFO, () => {
        useGameStore.getState().endTurn();
        setIsAnimating(false);
      });
      return;
    }
    
    const target = targets[0];
    
    // Calculate damage for animation
    const damage = Math.max(0, attacker.attack - target.armor);
    
    // Show notification before attack
    showNotification(`Opponent's ${attacker.name} attacks your ${target.name}`, NOTIFICATION_TYPE.WARNING, () => {
      // Animate the attack
      animateAttack(attacker.id, target.id, damage, () => {
        // Update game state after animation completes
        useGameStore.getState().opponentAttack(attacker.id, target.id);
        
        // Check if player was defeated
        const updatedState = useGameStore.getState();
        if (updatedState.gameStatus === WIN_CONDITION.OPPONENT_WINS) {
          showNotification('You have been defeated!', NOTIFICATION_TYPE.WARNING, () => {
            setIsAnimating(false);
          });
          return;
        }
        
        // Check if target was defeated
        const targetStillExists = updatedState.player.playArea.some(card => card.id === target.id);
        
        if (!targetStillExists) {
          showNotification(`Your ${target.name} was defeated!`, NOTIFICATION_TYPE.WARNING, () => {
            // Continue with next attack
            executeNextAttack(attackers, index + 1);
          });
        } else {
          // Target survived, continue with next attack
          executeNextAttack(attackers, index + 1);
        }
      });
    });
  }, [animateAttack, showNotification]);
  
  const value = {
    isAnimating,
    setIsAnimating,
    autoAnimateRef,
    registerCardRef,
    getCardRef,
    animateAttack,
    animateDamage,
    showNotification,
    animateCardDraw,
    animateCardPlay,
    executeOpponentTurn,
    handleOpponentAttacks,
    executeNextAttack
  };
  
  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};