// src/PROJECTS/potop_szwedzki_mapa/context/AnimationContext.tsx
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { AnimationUtils, useCardRefs } from '../utils/animations';

interface AnimationContextType {
  // Card ref registration
  registerCardRef: (cardId: string, element: HTMLElement | null) => void;
  getCardRef: (cardId: string) => HTMLElement | undefined;
  
  // Animation states
  isAnimating: boolean;
  
  // Animation methods
  animateCardPlacement: (
    cardId: string, 
    fromElement: HTMLElement | null,
    toPosition: { top: number; left: number },
    onComplete?: () => void
  ) => void;
  
  animateAttack: (
    attackerId: string, 
    targetId: string,
    damage: number,
    onComplete?: () => void
  ) => void;
  
  animateCardDefeated: (
    cardId: string,
    goldValue: number,
    onComplete?: () => void
  ) => void;
  
  showNotification: (
    message: string,
    type?: 'success' | 'warning' | 'info',
    onComplete?: () => void
  ) => void;
  
  animateScenarioSetup: (
    playerCardIds: string[],
    opponentCardIds: string[],
    onComplete?: () => void
  ) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { registerCardRef, getCardRef } = useCardRefs();
  
  // Queue for managing sequential animations
  const animationQueue = useRef<Function[]>([]);
  const isProcessingQueue = useRef(false);
  
  // Process the animation queue
  const processAnimationQueue = useCallback(() => {
    if (animationQueue.current.length === 0) {
      isProcessingQueue.current = false;
      setIsAnimating(false);
      return;
    }
    
    isProcessingQueue.current = true;
    setIsAnimating(true);
    
    const nextAnimation = animationQueue.current.shift();
    if (nextAnimation) {
      nextAnimation();
    }
  }, []);
  
  // Add animation to queue and process if not already processing
  const queueAnimation = useCallback((animationFn: Function) => {
    animationQueue.current.push(animationFn);
    
    if (!isProcessingQueue.current) {
      processAnimationQueue();
    }
  }, [processAnimationQueue]);
  
  // Animation methods
  const animateCardPlacement = useCallback((
    cardId: string,
    fromElement: HTMLElement | null,
    toPosition: { top: number; left: number },
    onComplete?: () => void
  ) => {
    queueAnimation(() => {
      const cardElement = getCardRef(cardId);
      
      if (!cardElement || !fromElement) {
        if (onComplete) onComplete();
        processAnimationQueue();
        return;
      }
      
      const fromRect = fromElement.getBoundingClientRect();
      const fromPosition = {
        top: fromRect.top,
        left: fromRect.left
      };
      
      AnimationUtils.animateCardPlacement(
        cardElement,
        fromPosition,
        toPosition,
        () => {
          if (onComplete) onComplete();
          processAnimationQueue();
        }
      );
    });
  }, [getCardRef, queueAnimation, processAnimationQueue]);
  
  const animateAttack = useCallback((
    attackerId: string,
    targetId: string,
    damage: number,
    onComplete?: () => void
  ) => {
    queueAnimation(() => {
      const attackerElement = getCardRef(attackerId);
      const targetElement = getCardRef(targetId);
      
      if (!attackerElement || !targetElement) {
        if (onComplete) onComplete();
        processAnimationQueue();
        return;
      }
      
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
              if (onComplete) onComplete();
              processAnimationQueue();
            }
          );
        }
      );
    });
  }, [getCardRef, queueAnimation, processAnimationQueue]);
  
  const animateCardDefeated = useCallback((
    cardId: string,
    goldValue: number,
    onComplete?: () => void
  ) => {
    queueAnimation(() => {
      const cardElement = getCardRef(cardId);
      
      if (!cardElement) {
        if (onComplete) onComplete();
        processAnimationQueue();
        return;
      }
      
      // Save card's parent before animation in case it gets removed from DOM
      const cardParent = cardElement.parentElement;
      
      AnimationUtils.animateCardDefeated(
        cardElement,
        goldValue,
        () => {
          // If the card is still in the DOM, make it invisible
          if (cardElement && cardParent && cardParent.contains(cardElement)) {
            cardElement.style.visibility = 'hidden';
          }
          
          if (onComplete) onComplete();
          processAnimationQueue();
        }
      );
    });
  }, [getCardRef, queueAnimation, processAnimationQueue]);
  
  const showNotification = useCallback((
    message: string,
    type: 'success' | 'warning' | 'info' = 'info',
    onComplete?: () => void
  ) => {
    queueAnimation(() => {
      AnimationUtils.showNotification(
        message,
        type,
        () => {
          if (onComplete) onComplete();
          processAnimationQueue();
        }
      );
    });
  }, [queueAnimation, processAnimationQueue]);
  
  const animateScenarioSetup = useCallback((
    playerCardIds: string[],
    opponentCardIds: string[],
    onComplete?: () => void
  ) => {
    queueAnimation(() => {
      const playerCardElements = playerCardIds
        .map(id => getCardRef(id))
        .filter((el): el is HTMLElement => el !== undefined);
        
      const opponentCardElements = opponentCardIds
        .map(id => getCardRef(id))
        .filter((el): el is HTMLElement => el !== undefined);
      
      if (playerCardElements.length === 0 && opponentCardElements.length === 0) {
        if (onComplete) onComplete();
        processAnimationQueue();
        return;
      }
      
      AnimationUtils.animateScenarioSetup(
        playerCardElements,
        opponentCardElements,
        () => {
          if (onComplete) onComplete();
          processAnimationQueue();
        }
      );
    });
  }, [getCardRef, queueAnimation, processAnimationQueue]);
  
  const value = {
    registerCardRef,
    getCardRef,
    isAnimating,
    animateCardPlacement,
    animateAttack,
    animateCardDefeated,
    showNotification,
    animateScenarioSetup
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