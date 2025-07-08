// store/gameStore.ts
import { create } from 'zustand';
import { Card, GameState, Scenario } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- Game Assets (Example Cards) ---
const allCards: Card[] = [
  { id: uuidv4(), name: 'Knight', hp: 10, maxHp: 10, armor: 2, attack: 3, cost: 3, goldValue: 6, hasAttacked: false },
  { id: uuidv4(), name: 'Archer', hp: 7, maxHp: 7, armor: 0, attack: 4, cost: 2, goldValue: 4, hasAttacked: false },
  { id: uuidv4(), name: 'Defender', hp: 12, maxHp: 12, armor: 3, attack: 2, cost: 4, goldValue: 8, hasAttacked: false },
  { id: uuidv4(), name: 'Goblin', hp: 5, maxHp: 5, armor: 0, attack: 2, cost: 1, goldValue: 2, hasAttacked: false },
  { id: uuidv4(), name: 'Ogre', hp: 15, maxHp: 15, armor: 1, attack: 5, cost: 5, goldValue: 10, hasAttacked: false },
];

// Function to get a fresh card instance (important for new scenarios)
const getNewCardInstance = (cardTemplate: Card): Card => ({
  ...cardTemplate,
  id: uuidv4(), // Assign a new unique ID
  hp: cardTemplate.maxHp, // Reset HP
  hasAttacked: false, // Reset attack status
});

// --- Scenarios ---
const scenarios: Scenario[] = [
  {
    name: 'First Blood',
    playerStartingCards: [getNewCardInstance(allCards[0]), getNewCardInstance(allCards[1]), getNewCardInstance(allCards[3])],
    opponentStartingCards: [getNewCardInstance(allCards[2]), getNewCardInstance(allCards[3])],
    startingPlayer: 'player',
    playerStartingGold: 5,
    opponentStartingGold: 3,
  },
  {
    name: 'Reinforcements',
    playerStartingCards: [getNewCardInstance(allCards[0]), getNewCardInstance(allCards[3])],
    opponentStartingCards: [getNewCardInstance(allCards[4]), getNewCardInstance(allCards[1])],
    startingPlayer: 'opponent',
    playerStartingGold: 7,
    opponentStartingGold: 6,
  },
];

// --- Initial State Function ---
const getInitialState = (scenario: Scenario): GameState => ({
  player: {
    id: 'player',
    name: 'Player',
    deck: allCards.filter(c => !scenario.playerStartingCards.some(sc => sc.name === c.name)).map(getNewCardInstance),
    hand: [],
    playArea: scenario.playerStartingCards.map(getNewCardInstance),
    gold: scenario.playerStartingGold,
  },
  opponent: {
    id: 'opponent',
    name: 'Opponent',
    deck: allCards.filter(c => !scenario.opponentStartingCards.some(oc => oc.name === c.name)).map(getNewCardInstance),
    hand: [],
    playArea: scenario.opponentStartingCards.map(getNewCardInstance),
    gold: scenario.opponentStartingGold,
  },
  turn: scenario.startingPlayer,
  selectedAttackerId: null,
  scenarios: scenarios,
  currentScenarioIndex: 0,
  gameStatus: 'playing',
  messages: [],
});

// Helper function to check win conditions
const checkWinConditionsHelper = (playerPlayArea: Card[], opponentPlayArea: Card[]): 'playing' | 'playerWins' | 'opponentWins' => {
  if (playerPlayArea.length === 0) {
    return 'opponentWins';
  }
  if (opponentPlayArea.length === 0) {
    return 'playerWins';
  }
  return 'playing';
};

// Define the store's state and actions
interface GameStore extends GameState {
  drawCard: () => void;
  playCard: (cardId: string) => void;
  selectAttacker: (cardId: string | null) => void;
  attackCard: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  loadScenario: (scenarioIndex: number) => void;
  resetGame: () => void;
  addMessage: (message: string) => void;
  checkWinConditions: () => void; // Helper action to be called after state changes
}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial State ---
  ...getInitialState(scenarios[0]), // Start with the first scenario's initial state

  // --- Actions ---

  addMessage: (message: string) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      // Keep messages array from getting too long
      if (newMessages.length > 10) {
        return { messages: newMessages.slice(-10) };
      }
      return { messages: newMessages };
    });
  },

  loadScenario: (scenarioIndex: number) => {
    const scenarioToLoad = scenarios[scenarioIndex];
    if (!scenarioToLoad) {
      get().addMessage("Invalid scenario index.");
      return;
    }

    // Tworzenie nowych talii
    const newPlayerDeck = [...allCards]
      .sort(() => 0.5 - Math.random())
      .map(getNewCardInstance)
      .filter(c => !scenarioToLoad.playerStartingCards.some(sc => sc.name === c.name));
    
    const newOpponentDeck = [...allCards]
      .sort(() => 0.5 - Math.random())
      .map(getNewCardInstance)
      .filter(c => !scenarioToLoad.opponentStartingCards.some(oc => oc.name === c.name));

    // Tworzenie nowego stanu dla scenariusza
    const initialPlayerHand = [];
    let remainingPlayerDeck = [...newPlayerDeck];
    
    // Dobranie początkowej ręki (3 karty)
    for (let i = 0; i < 3; i++) {
      if (remainingPlayerDeck.length > 0 && initialPlayerHand.length < 5) {
        const [drawnCard, ...restDeck] = remainingPlayerDeck;
        initialPlayerHand.push(drawnCard);
        remainingPlayerDeck = restDeck;
      }
    }

    set({
      player: {
        id: 'player',
        name: 'Player',
        deck: remainingPlayerDeck,
        hand: initialPlayerHand,
        playArea: scenarioToLoad.playerStartingCards.map(getNewCardInstance),
        gold: scenarioToLoad.playerStartingGold,
      },
      opponent: {
        id: 'opponent',
        name: 'Opponent',
        deck: newOpponentDeck,
        hand: [],
        playArea: scenarioToLoad.opponentStartingCards.map(getNewCardInstance),
        gold: scenarioToLoad.opponentStartingGold,
      },
      turn: scenarioToLoad.startingPlayer,
      selectedAttackerId: null,
      currentScenarioIndex: scenarioIndex,
      gameStatus: 'playing',
      messages: [`Scenario "${scenarioToLoad.name}" loaded!`],
    });
  },

  drawCard: () => {
    set((state) => {
      if (state.turn !== 'player' || state.player.hand.length >= 5) {
        get().addMessage("Cannot draw card: Not your turn or hand is full.");
        return {}; // No state change
      }
      const drawCost = 1;
      if (state.player.gold < drawCost) {
        get().addMessage("Not enough gold to draw a card.");
        return {};
      }
      if (state.player.deck.length === 0) {
        get().addMessage("Your deck is empty!");
        return {};
      }

      const [drawnCard, ...remainingDeck] = state.player.deck;
      get().addMessage(`Player drew ${drawnCard.name} for ${drawCost} gold.`);
      return {
        player: {
          ...state.player,
          hand: [...state.player.hand, drawnCard],
          deck: remainingDeck,
          gold: state.player.gold - drawCost,
        },
      };
    });
  },

  playCard: (cardId: string) => {
    set((state) => {
      if (state.turn !== 'player' || state.gameStatus !== 'playing') return {};

      const cardToPlayIndex = state.player.hand.findIndex(c => c.id === cardId);
      if (cardToPlayIndex === -1) return {};

      const cardToPlay = state.player.hand[cardToPlayIndex];
      if (state.player.gold < cardToPlay.cost) {
        get().addMessage(`Not enough gold to play ${cardToPlay.name}. Costs ${cardToPlay.cost}, you have ${state.player.gold}.`);
        return {};
      }

      const newHand = [...state.player.hand];
      newHand.splice(cardToPlayIndex, 1);
      get().addMessage(`Player played ${cardToPlay.name} for ${cardToPlay.cost} gold.`);

      return {
        player: {
          ...state.player,
          gold: state.player.gold - cardToPlay.cost,
          hand: newHand,
          playArea: [...state.player.playArea, { ...cardToPlay, hasAttacked: false }],
        },
      };
    });
  },

  selectAttacker: (cardId: string | null) => {
    set((state) => {
      if (state.turn !== 'player' || state.gameStatus !== 'playing') return {};

      if (cardId === null) {
        return { selectedAttackerId: null };
      }

      const card = state.player.playArea.find(c => c.id === cardId);
      if (card && !card.hasAttacked) {
        return { selectedAttackerId: cardId };
      } else if (card && card.hasAttacked) {
        get().addMessage(`${card.name} has already attacked this turn.`);
        return { selectedAttackerId: null };
      }
      return {};
    });
  },

  attackCard: (attackerId: string, targetId: string) => {
    set((state) => {
      if (state.turn !== 'player' || state.gameStatus !== 'playing') return {};

      const attacker = state.player.playArea.find(c => c.id === attackerId);
      const target = state.opponent.playArea.find(c => c.id === targetId);

      if (!attacker || !target) {
        get().addMessage("Invalid attack: Attacker or target not found.");
        return {};
      }
      if (attacker.hasAttacked) {
        get().addMessage(`${attacker.name} has already attacked this turn.`);
        return {};
      }

      // Immutable update
      const damageDealt = Math.max(0, attacker.attack - target.armor);
      const newTarget = { ...target, hp: target.hp - damageDealt };
      const newAttacker = { ...attacker, hasAttacked: true };
      
      get().addMessage(`${attacker.name} attacked ${target.name} for ${damageDealt} damage.`);

      const updatedPlayerPlayArea = state.player.playArea.map(card =>
        card.id === attackerId ? newAttacker : card
      );

      // Sprawdzenie czy karta została pokonana
      if (newTarget.hp <= 0) {
        get().addMessage(`${target.name} was defeated!`);
        const updatedOpponentPlayArea = state.opponent.playArea.filter(card => card.id !== targetId);
        get().addMessage(`Player gained ${target.goldValue} gold.`);
        
        const newState = {
          player: {
            ...state.player,
            playArea: updatedPlayerPlayArea,
            gold: state.player.gold + target.goldValue,
          },
          opponent: {
            ...state.opponent,
            playArea: updatedOpponentPlayArea,
          },
          selectedAttackerId: null,
        };
        
        // Sprawdzamy warunki zwycięstwa już tutaj
        const gameStatus = checkWinConditionsHelper(
          newState.player.playArea, 
          newState.opponent.playArea
        );
        
        return { ...newState, gameStatus };
      } else {
        const updatedOpponentPlayArea = state.opponent.playArea.map(card =>
          card.id === targetId ? newTarget : card
        );
        
        return {
          player: {
            ...state.player,
            playArea: updatedPlayerPlayArea,
          },
          opponent: {
            ...state.opponent,
            playArea: updatedOpponentPlayArea,
          },
          selectedAttackerId: null,
        };
      }
    });
  },

  endTurn: () => {
    set((state) => {
      if (state.gameStatus !== 'playing') return {};

      const nextTurn = state.turn === 'player' ? 'opponent' : 'player';

      // Resetuj status ataku dla wszystkich kart
      const resetPlayerCards = state.player.playArea.map(card => ({ ...card, hasAttacked: false }));
      const resetOpponentCards = state.opponent.playArea.map(card => ({ ...card, hasAttacked: false }));

      get().addMessage(`Turn ended. It is now ${nextTurn}'s turn.`);

      const newState = {
        ...state,
        player: { ...state.player, playArea: resetPlayerCards },
        opponent: { ...state.opponent, playArea: resetOpponentCards },
        turn: nextTurn,
        selectedAttackerId: null,
      };

      if (nextTurn === 'opponent') {
        // Wykonuj ruch przeciwnika jako część tej samej aktualizacji stanu
        return opponentTurnLogic(newState, get().addMessage);
      }
      
      return newState;
    });
  },

  resetGame: () => {
    set(getInitialState(scenarios[0])); // Reset to first scenario
    get().addMessage("Game reset.");
    get().loadScenario(0); // Reload the first scenario explicitly
  },

  checkWinConditions: () => {
    set((state) => {
      if (state.gameStatus !== 'playing') return {}; // Game already ended

      const gameStatus = checkWinConditionsHelper(state.player.playArea, state.opponent.playArea);
      
      if (gameStatus !== 'playing') {
        get().addMessage(
          gameStatus === 'playerWins' 
            ? "Opponent has no cards left on the table. Player wins!"
            : "Player has no cards left on the table. Opponent wins!"
        );
      }
      
      return { gameStatus };
    });
  },
}));

// --- Opponent AI Logic ---
const opponentTurnLogic = (state: GameState, addMessage: (msg: string) => void): GameState => {
  addMessage("Opponent's turn!");
  
  let newOpponentGold = state.opponent.gold;
  let newOpponentDeck = [...state.opponent.deck];
  let newOpponentPlayArea = [...state.opponent.playArea];
  let newPlayerPlayArea = [...state.player.playArea];
  
  // 1. Play a card if possible
  const affordableCards = newOpponentDeck
    .filter(card => card.cost <= newOpponentGold)
    .sort((a, b) => b.attack - a.attack);

  if (affordableCards.length > 0 && newOpponentPlayArea.length < 5) {
    const cardToPlay = affordableCards[0];
    newOpponentGold -= cardToPlay.cost;
    newOpponentDeck = newOpponentDeck.filter(c => c.id !== cardToPlay.id);
    newOpponentPlayArea = [...newOpponentPlayArea, { ...cardToPlay, hasAttacked: false }];
    addMessage(`Opponent played ${cardToPlay.name}.`);
  }

  // 2. Attack with available cards
  for (const attacker of [...newOpponentPlayArea]) {
    if (attacker.hasAttacked || newPlayerPlayArea.length === 0) continue;
    
    // Find lowest HP target
    const targetIndex = newPlayerPlayArea.reduce(
      (minIndex, card, index, array) => 
        card.hp < array[minIndex].hp ? index : minIndex, 
      0
    );
    const target = newPlayerPlayArea[targetIndex];
    
    const damageDealt = Math.max(0, attacker.attack - target.armor);
    const newTargetHp = target.hp - damageDealt;
    
    addMessage(`Opponent's ${attacker.name} attacked Player's ${target.name} for ${damageDealt} damage.`);
    
    // Update attacker to mark as attacked
    newOpponentPlayArea = newOpponentPlayArea.map(card =>
      card.id === attacker.id ? { ...card, hasAttacked: true } : card
    );
    
    // Update or remove target based on HP
    if (newTargetHp <= 0) {
      addMessage(`Player's ${target.name} was defeated!`);
      newPlayerPlayArea = newPlayerPlayArea.filter(card => card.id !== target.id);
    } else {
      newPlayerPlayArea = newPlayerPlayArea.map(card =>
        card.id === target.id ? { ...card, hp: newTargetHp } : card
      );
    }
  }

  // Sprawdź warunki zwycięstwa
  const gameStatus = checkWinConditionsHelper(newPlayerPlayArea, newOpponentPlayArea);
  
  // Po zakończeniu tury przeciwnika, przełącz na turę gracza
  return {
    ...state,
    player: {
      ...state.player,
      playArea: newPlayerPlayArea
    },
    opponent: {
      ...state.opponent,
      gold: newOpponentGold,
      deck: newOpponentDeck,
      playArea: newOpponentPlayArea
    },
    turn: 'player',
    gameStatus
  };
};