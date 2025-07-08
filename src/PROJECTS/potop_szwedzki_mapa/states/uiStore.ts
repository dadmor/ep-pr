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
  tooltipCard: Card | null; // Add this to store the card currently showing tooltip
}

export interface UIActions {
  setNotification: (notification: Notification | null) => void;
  setPendingAction: (action: PendingAction | null) => void;
  setSelectedCard: (card: Card | null) => void;
  setTooltipCard: (card: Card | null) => void; // Add this action
}

// === UI STORE ===
export const uiStore = create<UIState & UIActions>((set) => ({
  notification: null,
  pendingAction: null,
  selectedCard: null,
  tooltipCard: null, // Initialize as null

  setNotification: (notification: Notification | null) => {
    set({ notification });

    if (notification) {
      setTimeout(() => {
        set(state => {
          // Upewnij się, że nie czyścimy nowszego powiadomienia
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
  }
}));