// src/PROJECTS/potop_szwedzki_mapa/utils/animations.ts
import { gsap } from "gsap";

/**
 * Animation utility class for card game effects
 */
export class AnimationUtils {
  // Animation durations in seconds
  static readonly CARD_PLACEMENT_DURATION = 0.5;
  static readonly ATTACK_DURATION = 0.3;
  static readonly DAMAGE_DURATION = 0.4;
  static readonly NOTIFICATION_DURATION = 1.5;

  /**
   * Animates a card being placed from one container to another
   * @param cardElement - DOM element of the card
   * @param fromPosition - Starting position {top, left}
   * @param toPosition - Target position {top, left}
   * @param onComplete - Callback function when animation completes
   */
  static animateCardPlacement(
    cardElement: HTMLElement,
    fromPosition: { top: number; left: number },
    toPosition: { top: number; left: number },
    onComplete?: () => void
  ): void {
    // Create a temporary clone of the card for animation
    const clone = cardElement.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.zIndex = "1000";
    clone.style.top = `${fromPosition.top}px`;
    clone.style.left = `${fromPosition.left}px`;
    clone.style.opacity = "0.9";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    // Animate the clone to the target position
    gsap.fromTo(
      clone,
      {
        top: fromPosition.top,
        left: fromPosition.left,
        scale: 0.8,
        rotation: -5,
        opacity: 0.9,
      },
      {
        top: toPosition.top,
        left: toPosition.left,
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: this.CARD_PLACEMENT_DURATION,
        ease: "power2.out",
        onComplete: () => {
          document.body.removeChild(clone);
          if (onComplete) onComplete();
        },
      }
    );
  }

  /**
   * Animates a card attack motion
   * @param attackerElement - DOM element of the attacking card
   * @param targetElement - DOM element of the target card
   * @param onComplete - Callback function when animation completes
   */
  static animateAttack(
    attackerElement: HTMLElement,
    targetElement: HTMLElement,
    onComplete?: () => void
  ): void {
    const attackerRect = attackerElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // Calculate direction vector from attacker to target
    const directionX = targetRect.left - attackerRect.left;
    const directionY = targetRect.top - attackerRect.top;

    // Normalize to get a shorter movement distance (30% of the way)
    const distance = Math.sqrt(
      directionX * directionX + directionY * directionY
    );
    const moveX = (directionX / distance) * distance * 0.3;
    const moveY = (directionY / distance) * distance * 0.3;

    // Animate the attacker "lunging" toward the target
    gsap
      .timeline()
      .to(attackerElement, {
        x: moveX,
        y: moveY,
        scale: 1.1,
        duration: this.ATTACK_DURATION / 2,
        ease: "power1.out",
      })
      .to(attackerElement, {
        x: 0,
        y: 0,
        scale: 1,
        duration: this.ATTACK_DURATION / 2,
        ease: "power1.in",
        onComplete,
      });
  }

  /**
   * Animates damage being applied to a card
   * @param cardElement - DOM element of the card receiving damage
   * @param damageAmount - Amount of damage to show
   * @param onComplete - Callback function when animation completes
   */
  static animateDamage(
    cardElement: HTMLElement,
    damageAmount: number,
    onComplete?: () => void
  ): void {
    // Create damage indicator container with medallion-like style
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
    damageContainer.style.background =
      "linear-gradient(135deg, #740000, #ff0000)";
    damageContainer.style.boxShadow =
      "0 0 0 3px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.8)";

    // Create the actual damage text
    const damageEl = document.createElement("div");
    damageEl.className = "damage-indicator";
    damageEl.textContent = `-${damageAmount}`;
    damageEl.style.color = "white";
    damageEl.style.fontWeight = "bold";
    damageEl.style.fontSize = "20px";
    damageEl.style.textShadow = "0 0 2px black, 0 0 4px black";

    // Add a pulsing effect to the container
    damageContainer.style.animation = "damage-pulse 0.5s ease-in-out";

    // Create a style element for the pulse animation if it doesn't exist
    if (!document.getElementById("damage-animation-style")) {
      const styleEl = document.createElement("style");
      styleEl.id = "damage-animation-style";
      styleEl.textContent = `
        @keyframes damage-pulse {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Add the damage text to the container
    damageContainer.appendChild(damageEl);

    // Position the damage indicator over the card
    const cardRect = cardElement.getBoundingClientRect();
    damageContainer.style.top = `${cardRect.top + cardRect.height / 3}px`;
    damageContainer.style.left = `${cardRect.left + cardRect.width / 2 - 20}px`; // Center it (40px/2)
    document.body.appendChild(damageContainer);

    // Shake the card
    gsap.to(cardElement, {
      x: "+=5",
      duration: 0.05,
      repeat: 5,
      yoyo: true,
    });

    // Flash the card red
    gsap.to(cardElement, {
      backgroundColor: "rgba(255, 0, 0, 0.3)",
      duration: 0.2,
      yoyo: true,
      repeat: 1,
    });

    // Add some floating debris/particle effects around the damage
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement("div");
      particle.style.position = "absolute";
      particle.style.width = "6px";
      particle.style.height = "6px";
      particle.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
      particle.style.borderRadius = "50%";
      particle.style.top = `${cardRect.top + cardRect.height / 3}px`;
      particle.style.left = `${cardRect.left + cardRect.width / 2}px`;
      particle.style.zIndex = "1000";
      document.body.appendChild(particle);

      // Animate each particle in a random direction
      gsap.to(particle, {
        x: -20 + Math.random() * 40,
        y: -20 + Math.random() * 40,
        opacity: 0,
        duration: 0.7,
        onComplete: () => {
          document.body.removeChild(particle);
        },
      });
    }

    // Animate the damage container
    gsap.fromTo(
      damageContainer,
      { opacity: 1, scale: 1 },
      {
        y: -40,
        opacity: 0,
        scale: 1.2,
        duration: this.DAMAGE_DURATION,
        delay: 0.4, // Delay the fade out to make the damage more noticeable
        onComplete: () => {
          document.body.removeChild(damageContainer);
          if (onComplete) onComplete();
        },
      }
    );
  }

  /**
   * Shows a notification in the center of the screen
   * @param message - Notification message to display
   * @param type - Type of notification ('success', 'warning', 'info')
   * @param onComplete - Callback function when notification disappears
   */
  static showNotification(
    message: string,
    type: "success" | "warning" | "info" = "info",
    onComplete?: () => void
  ): void {
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
      notificationEl.style.color = "white";
    } else if (type === "warning") {
      notificationEl.style.backgroundColor = "rgba(230, 126, 34, 0.9)";
      notificationEl.style.color = "white";
    } else {
      notificationEl.style.backgroundColor = "rgba(52, 152, 219, 0.9)";
      notificationEl.style.color = "white";
    }

    document.body.appendChild(notificationEl);

    // Animate the notification
    gsap.fromTo(
      notificationEl,
      { y: -20, opacity: 0, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.2)",
      }
    );

    // Fade out after duration
    gsap.to(notificationEl, {
      opacity: 0,
      y: 20,
      delay: this.NOTIFICATION_DURATION,
      duration: 0.4,
      onComplete: () => {
        document.body.removeChild(notificationEl);
        if (onComplete) onComplete();
      },
    });
  }

  /**
   * Animates a card being defeated (removed from play)
   * @param cardElement - DOM element of the defeated card
   * @param goldValue - Gold value of the defeated card
   * @param onComplete - Callback function when animation completes
   */
  static animateCardDefeated(
    cardElement: HTMLElement,
    goldValue: number,
    onComplete?: () => void
  ): void {
    if (!cardElement || !document.body.contains(cardElement)) {
      if (onComplete) onComplete();
      return;
    }

    // Show gold gain notification
    const goldNotification = document.createElement("div");
    goldNotification.className = "gold-notification";
    goldNotification.innerHTML = `+${goldValue} <span style="color: gold;">⚜️</span>`;
    goldNotification.style.position = "absolute";
    goldNotification.style.color = "gold";
    goldNotification.style.fontWeight = "bold";
    goldNotification.style.fontSize = "20px";
    goldNotification.style.textShadow = "0 0 5px black";
    goldNotification.style.zIndex = "1001";
    goldNotification.style.pointerEvents = "none";

    const cardRect = cardElement.getBoundingClientRect();
    goldNotification.style.top = `${cardRect.top}px`;
    goldNotification.style.left = `${
      cardRect.left + cardRect.width / 2 - 15
    }px`;
    document.body.appendChild(goldNotification);

    // Animate the card being defeated
    gsap.to(cardElement, {
      opacity: 0,
      scale: 0.5,
      rotation: Math.random() > 0.5 ? 45 : -45,
      duration: 0.6,
      ease: "power2.in",
    });

    // Animate the gold notification
    gsap.to(goldNotification, {
      y: -40,
      opacity: 0,
      duration: 1.2,
      delay: 0.3,
      onComplete: () => {
        document.body.removeChild(goldNotification);
        if (onComplete) onComplete();
      },
    });
  }

  /**
   * Animates the initial setup of cards at the start of a scenario
   * @param playerCards - Array of player card elements
   * @param opponentCards - Array of opponent card elements
   * @param onComplete - Callback function when all animations complete
   * @returns GSAP Timeline instance
   */
  static animateScenarioSetup(
    playerCards: HTMLElement[],
    opponentCards: HTMLElement[],
    onComplete?: () => void
  ): gsap.core.Timeline {
    const tl = gsap.timeline({
      onComplete,
    });

    // First animate opponent cards one by one
    opponentCards.forEach((card, index) => {
      tl.fromTo(
        card,
        {
          opacity: 0,
          scale: 0.7,
          y: -50,
          rotation: -5 + Math.random() * 10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotation: 0,
          duration: 0.4,
          ease: "back.out(1.2)",
        },
        index * 0.15 // Stagger the animations
      );
    });

    // Then animate player cards with a slight delay
    playerCards.forEach((card, index) => {
      tl.fromTo(
        card,
        {
          opacity: 0,
          scale: 0.7,
          y: 50,
          rotation: -5 + Math.random() * 10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotation: 0,
          duration: 0.4,
          ease: "back.out(1.2)",
        },
        opponentCards.length * 0.15 + 0.3 + index * 0.15 // Start after opponent cards
      );
    });

    return tl;
  }
}

/**
 * Hook to reference DOM elements of cards by their ID
 */
export function useCardRefs() {
  const cardRefs = new Map<string, HTMLElement>();

  const registerCardRef = (cardId: string, element: HTMLElement | null) => {
    if (element) {
      cardRefs.set(cardId, element);
    } else {
      cardRefs.delete(cardId);
    }
  };

  const getCardRef = (cardId: string): HTMLElement | undefined => {
    return cardRefs.get(cardId);
  };

  return { registerCardRef, getCardRef };
}
