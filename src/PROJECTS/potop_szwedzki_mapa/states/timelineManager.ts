// timelineManager.js - Simplified animation manager with focused delays only for battles
import { create } from "zustand";

// Simple store for managing animation timeouts
export const useTimelineStore = create((set, get) => ({
  // Collection of active timeouts
  timeouts: {},

  // Add a timeout with ID
  addTimeout: (id, timeoutId) => {
    set((state) => ({
      timeouts: { ...state.timeouts, [id]: timeoutId },
    }));
  },

  // Clear a single timeout
  clearTimeout: (id) => {
    const { timeouts } = get();
    if (timeouts[id]) {
      clearTimeout(timeouts[id]);
      set((state) => {
        const newTimeouts = { ...state.timeouts };
        delete newTimeouts[id];
        return { timeouts: newTimeouts };
      });
    }
  },

  // Clear all timeouts
  clearAllTimeouts: () => {
    const { timeouts } = get();
    Object.values(timeouts).forEach((id) => clearTimeout(id));
    set({ timeouts: {} });
  },
}));

// Simplified animation delays - focused only on battle actions
const GameTimeline = {
  // Schedule an action with timeout
  schedule: (id, callback, delay) => {
    // Get current state
    const store = useTimelineStore.getState();

    // Clear previous timeout with this ID (if exists)
    store.clearTimeout(id);

    // Create and save new timeout
    const timeoutId = setTimeout(() => {
      callback();
      store.clearTimeout(id); // Auto-cleanup after execution
    }, delay);

    store.addTimeout(id, timeoutId);
    return id;
  },

  // Battle action timings - only essential animations
  scheduleAttack: (callback) =>
    GameTimeline.schedule(`attack-${Date.now()}`, callback, 800),

  scheduleCardDamage: (callback) =>
    GameTimeline.schedule(`damage-${Date.now()}`, callback, 500),

  // Method to clear all timeouts
  cancelAllActions: () => useTimelineStore.getState().clearAllTimeouts(),
};

export default GameTimeline;
