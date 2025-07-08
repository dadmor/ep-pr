// timelineManager.js - Prosty menedżer animacji
import { create } from "zustand";

// Store do zarządzania timeoutami i animacjami
export const useTimelineStore = create((set, get) => ({
  // Kolekcja aktywnych timeoutów
  timeouts: {},
  
  // Dodaj timeout z ID
  addTimeout: (id, timeoutId) => {
    set(state => ({
      timeouts: { ...state.timeouts, [id]: timeoutId }
    }));
  },
  
  // Wyczyść pojedynczy timeout
  clearTimeout: (id) => {
    const { timeouts } = get();
    if (timeouts[id]) {
      clearTimeout(timeouts[id]);
      set(state => {
        const newTimeouts = { ...state.timeouts };
        delete newTimeouts[id];
        return { timeouts: newTimeouts };
      });
    }
  },
  
  // Wyczyść wszystkie timeouty
  clearAllTimeouts: () => {
    const { timeouts } = get();
    Object.values(timeouts).forEach(id => clearTimeout(id));
    set({ timeouts: {} });
  },
  
  // Prędkość animacji (mnożnik)
  speed: 1,
  
  // Ustaw prędkość animacji
  setSpeed: (speed) => set({ speed }),
  
  // Czy animacje są włączone
  isPlaying: true,
  
  // Wstrzymaj animacje
  pause: () => set({ isPlaying: false }),
  
  // Wznów animacje
  resume: () => set({ isPlaying: true }),
}));

// Pomocnicze funkcje do zarządzania timeoutami w grze
const GameTimeline = {
  // Zaplanuj akcję z timeoutem
  schedule: (id, callback, delay) => {
    // Pobierz aktualny stan
    const store = useTimelineStore.getState();
    
    // Wyczyść poprzedni timeout o tym ID (jeśli istnieje)
    store.clearTimeout(id);
    
    // Jeśli animacje są wstrzymane, nie twórz nowego timeoutu
    if (!store.isPlaying) return id;
    
    // Dostosuj opóźnienie do prędkości
    const adjustedDelay = delay / store.speed;
    
    // Utwórz i zapisz nowy timeout
    const timeoutId = setTimeout(() => {
      callback();
      store.clearTimeout(id); // Auto-cleanup po wykonaniu
    }, adjustedDelay);
    
    store.addTimeout(id, timeoutId);
    return id;
  },
  
  // Typowe akcje w grze
  scheduleCardDraw: (callback) => 
    GameTimeline.schedule(`draw-${Date.now()}`, callback, 500),
    
  scheduleCardPlay: (callback) => 
    GameTimeline.schedule(`play-${Date.now()}`, callback, 700),
    
  scheduleAttack: (callback) => 
    GameTimeline.schedule(`attack-${Date.now()}`, callback, 800),
    
  scheduleEnemyTurn: (callback) => 
    GameTimeline.schedule(`enemy-turn-${Date.now()}`, callback, 1000),
    
  // Metoda do czyszczenia wszystkich timeoutów
  cancelAllActions: () => 
    useTimelineStore.getState().clearAllTimeouts()
};

export default GameTimeline;