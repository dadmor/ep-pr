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

    const newPlayerDeck = [...allCards].sort(() => 0.5 - Math.random()).map(getNewCardInstance);
    const newOpponentDeck = [...allCards].sort(() => 0.5 - Math.random()).map(getNewCardInstance);

    const initialStateForScenario = getInitialState(scenarioToLoad);

    set((state) => {
      const newState = {
        ...initialStateForScenario,
        currentScenarioIndex: scenarioIndex,
        player: {
          ...initialStateForScenario.player,
          deck: newPlayerDeck.filter(c => !scenarioToLoad.playerStartingCards.some(sc => sc.name === c.name)),
        },
        opponent: {
          ...initialStateForScenario.opponent,
          deck: newOpponentDeck.filter(c => !scenarioToLoad.opponentStartingCards.some(oc => oc.name === c.name)),
        },
        gameStatus: 'playing',
        messages: [`Scenario "${scenarioToLoad.name}" loaded!`],
      };

      // Draw initial hand for player if applicable
      for (let i = 0; i < 3; i++) { // Draw 3 cards at start of scenario
        if (newState.player.deck.length > 0 && newState.player.hand.length < 5) {
          const [drawnCard, ...remainingDeck] = newState.player.deck;
          newState.player.hand.push(drawnCard);
          newState.player.deck = remainingDeck;
        }
      }
      return newState;
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

      const card = state.player.playArea.find(c => c.id === cardId);
      if (cardId === null || (card && !card.hasAttacked)) {
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
      let target = state.opponent.playArea.find(c => c.id === targetId);

      if (!attacker || !target) {
        get().addMessage("Invalid attack: Attacker or target not found.");
        return {};
      }
      if (attacker.hasAttacked) {
        get().addMessage(`${attacker.name} has already attacked this turn.`);
        return {};
      }

      // Create mutable copies for logic
      let newAttacker = { ...attacker };
      let newTarget = { ...target };

      const damageDealt = Math.max(0, newAttacker.attack - newTarget.armor);
      newTarget.hp -= damageDealt;
      get().addMessage(`${newAttacker.name} attacked ${newTarget.name} for ${damageDealt} damage.`);

      newAttacker.hasAttacked = true;

      const updatedPlayerPlayArea = state.player.playArea.map(card =>
        card.id === newAttacker.id ? newAttacker : card
      );

      let updatedOpponentPlayArea = [...state.opponent.playArea];
      if (newTarget.hp <= 0) {
        get().addMessage(`${newTarget.name} was defeated!`);
        updatedOpponentPlayArea = updatedOpponentPlayArea.filter(card => card.id !== newTarget.id);
        get().addMessage(`Player gained ${newTarget.goldValue} gold.`);
        return {
          player: {
            ...state.player,
            playArea: updatedPlayerPlayArea,
            gold: state.player.gold + newTarget.goldValue,
          },
          opponent: {
            ...state.opponent,
            playArea: updatedOpponentPlayArea,
          },
          selectedAttackerId: null,
        };
      } else {
        updatedOpponentPlayArea = updatedOpponentPlayArea.map(card =>
          card.id === newTarget.id ? newTarget : card
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
    get().checkWinConditions(); // Check win conditions immediately after an attack
  },

  endTurn: () => {
    set((state) => {
      if (state.gameStatus !== 'playing') return {};

      const nextTurn = state.turn === 'player' ? 'opponent' : 'player';

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
        return opponentTurnLogic(newState, get().addMessage); // Pass addMessage to AI
      }
      return newState;
    });
    get().checkWinConditions(); // Check win conditions after turn ends
  },

  resetGame: () => {
    set(getInitialState(scenarios[0])); // Reset to first scenario
    get().addMessage("Game reset.");
    get().loadScenario(0); // Reload the first scenario explicitly
  },

  checkWinConditions: () => {
    set((state) => {
      if (state.gameStatus !== 'playing') return {}; // Game already ended

      if (state.player.playArea.length === 0) {
        get().addMessage("Player has no cards left on the table. Opponent wins!");
        return { gameStatus: 'opponentWins' };
      }
      if (state.opponent.playArea.length === 0) {
        get().addMessage("Opponent has no cards left on the table. Player wins!");
        return { gameStatus: 'playerWins' };
      }
      return {};
    });
  },
}));

// --- Opponent AI Logic (Simple Example) ---
// This function takes the current state and returns a modified state.
// It also needs access to addMessage for logging.
const opponentTurnLogic = (state: GameState, addMessage: (msg: string) => void): GameState => {
  let newState = { ...state };
  addMessage("Opponent's turn!");

  // 1. Play a card if possible and beneficial (e.g., highest attack card they can afford)
  const affordableCards = newState.opponent.deck
    .filter(card => card.cost <= newState.opponent.gold)
    .sort((a, b) => b.attack - a.attack);

  if (affordableCards.length > 0 && newState.opponent.playArea.length < 5) {
    const cardToPlay = affordableCards[0];
    newState.opponent.gold -= cardToPlay.cost;
    newState.opponent.deck = newState.opponent.deck.filter(c => c.id !== cardToPlay.id);
    newState.opponent.playArea = [...newState.opponent.playArea, { ...cardToPlay, hasAttacked: false }];
    addMessage(`Opponent played ${cardToPlay.name}.`);
  }

  // 2. Attack with available cards
  newState.opponent.playArea.forEach(attacker => {
    if (!attacker.hasAttacked && newState.player.playArea.length > 0) {
      // Find lowest HP target for simple AI
      const target = newState.player.playArea.reduce((minHpCard, currentCard) =>
        (minHpCard.hp > currentCard.hp ? currentCard : minHpCard), newState.player.playArea[0]
      );

      const damageDealt = Math.max(0, attacker.attack - target.armor);
      target.hp -= damageDealt;
      addMessage(`Opponent's ${attacker.name} attacked Player's ${target.name} for ${damageDealt} damage.`);

      newState.player.playArea = newState.player.playArea.map(card =>
        card.id === target.id ? { ...card, hp: target.hp } : card
      ).filter(card => card.hp > 0);

      newState.opponent.playArea = newState.opponent.playArea.map(card =>
        card.id === attacker.id ? { ...card, hasAttacked: true } : card
      );
    }
  });

  // After opponent's actions, switch back to player's turn
  newState.turn = 'player';
  addMessage("Opponent turn ended. It is now player's turn.");
  return newState;
};