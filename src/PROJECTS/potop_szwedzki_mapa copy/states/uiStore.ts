import { create } from "zustand";
import { Card } from "./gameStore";
import { GAME_SETTINGS } from "../gameConstants";

export interface Notification {
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface PendingAction {
  type: "selectAttackTarget" | "selectSpellTarget";
  attacker?: Card;
  possibleTargets: Card[];
  damage?: number;
}

export interface UIState {
  notification: Notification | null;
  pendingAction: PendingAction | null;
  selectedCard: Card | null;
  tooltipCard: Card | null;
  attackingCard: Card | null;  // Track the card that is currently attacking
  targetCard: Card | "enemy" | "player" | null;  // Track the target of the attack
}

export interface UIActions {
  setNotification: (notification: Notification | null) => void;
  setPendingAction: (action: PendingAction | null) => void;
  setSelectedCard: (card: Card | null) => void;
  setTooltipCard: (card: Card | null) => void;
  setAttackingCard: (card: Card | null) => void;
  setTargetCard: (target: Card | "enemy" | "player" | null) => void;
}

// === UI STORE ===
export const uiStore = create<UIState & UIActions>((set) => ({
  notification: null,
  pendingAction: null,
  selectedCard: null,
  tooltipCard: null,
  attackingCard: null,
  targetCard: null,

  setNotification: (notification: Notification | null) => {
    set({ notification });

    if (notification) {
      setTimeout(() => {
        set(state => {
          // Make sure we don't clear a newer notification
          if (state.notification === notification) {
            return { notification: null };
          }
          return {};
        });
      }, GAME_SETTINGS.NOTIFICATION_TIMEOUT);
    }
  },

  setPendingAction: (action: PendingAction | null) => {
    set({ pendingAction: action });
  },

  setSelectedCard: (card: Card | null) => {
    set({ selectedCard: card });
  },
  
  setTooltipCard: (card: Card | null) => {
    set({ tooltipCard: card });
  },
  
  setAttackingCard: (card: Card | null) => {
    set({ attackingCard: card });
  },
  
  setTargetCard: (target: Card | "enemy" | "player" | null) => {
    set({ targetCard: target });
  }
}));