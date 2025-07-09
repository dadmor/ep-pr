// src/PROJECTS/potop_szwedzki_mapa/context/AnimationContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface AnimationContextType {
  // Animation state
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
  
  // Auto-animate hook for container animations
  // Changed from RefObject to RefCallback to match useAutoAnimate's return type
  autoAnimateRef: React.RefCallback<Element>;
  
  // Card references for attack animations
  registerCardRef: (cardId: string, element: HTMLElement | null) => void;
  getCardRef: (cardId: string) => HTMLElement | undefined;
  
  // Essential animation methods we want to keep
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
  
  // Keep essential attack animation
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
    
    // Normalize to get a shorter movement distance (30% of the way)
    const distance = Math.sqrt(directionX * directionX + directionY * directionY);
    const moveX = (directionX / distance) * distance * 0.3;
    const moveY = (directionY / distance) * distance * 0.3;
    
    // Store original transform for resetting
    const originalTransform = attackerElement.style.transform;
    
    // Animate the attacker "lunging" toward the target
    attackerElement.style.transition = 'transform 0.15s ease-out';
    attackerElement.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    
    // Return to original position
    setTimeout(() => {
      attackerElement.style.transition = 'transform 0.15s ease-in';
      attackerElement.style.transform = originalTransform;
      
      // When attack animation completes, show damage
      setTimeout(() => {
        animateDamage(targetId, damage, onComplete);
      }, 150);
    }, 150);
  }, [getCardRef]);
  
  // Keep essential damage animation
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
      { duration: 300, easing: 'ease-out' }
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
    }, 400);
    
    // Animate damage indicator floating up and fading out
    setTimeout(() => {
      const animation = damageContainer.animate(
        [
          { transform: 'translateY(0)', opacity: 1 },
          { transform: 'translateY(-40px)', opacity: 0 }
        ],
        { duration: 700, easing: 'ease-out' }
      );
      
      animation.onfinish = () => {
        document.body.removeChild(damageContainer);
        if (onComplete) onComplete();
        setIsAnimating(false);
      };
    }, 400);
  }, [getCardRef]);
  
  // Simplified notification system
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
    if (type === "success") {
      notificationEl.style.backgroundColor = "rgba(46, 204, 113, 0.9)";
    } else if (type === "warning") {
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
      { duration: 300, easing: 'ease-out' }
    );

    // Hide notification after a delay
    setTimeout(() => {
      const animation = notificationEl.animate(
        [
          { opacity: 1, transform: 'translate(-50%, -50%)' },
          { opacity: 0, transform: 'translate(-50%, -40%)' }
        ],
        { duration: 400, easing: 'ease-in' }
      );
      
      animation.onfinish = () => {
        document.body.removeChild(notificationEl);
        if (onComplete) onComplete();
      };
    }, 1500);
  }, []);
  
  const value = {
    isAnimating,
    setIsAnimating,
    autoAnimateRef,
    registerCardRef,
    getCardRef,
    animateAttack,
    animateDamage,
    showNotification
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