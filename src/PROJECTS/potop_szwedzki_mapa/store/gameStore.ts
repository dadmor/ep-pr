// store/gameStore.ts
import { create } from "zustand";
import { Card, GameState, Scenario } from "../types";
import { v4 as uuidv4 } from "uuid";

// --- Helper Functions ---
const getNewCardInstance = (cardTemplate: Card): Card => ({
  ...cardTemplate,
  id: uuidv4(),
  hp: cardTemplate.maxHp,
  hasAttacked: false,
});

const calculateDamage = (attacker: Card, target: Card): number =>
  Math.max(0, attacker.attack - target.armor);

const updateCardInArray = (
  cards: Card[],
  cardId: string,
  updates: Partial<Card>
): Card[] =>
  cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card));

const checkWinConditions = (
  playerPlayArea: Card[],
  opponentPlayArea: Card[]
): "playing" | "playerWins" | "opponentWins" => {
  if (playerPlayArea.length === 0) return "opponentWins";
  if (opponentPlayArea.length === 0) return "playerWins";
  return "playing";
};

// --- Game Assets (Example Cards) ---
const allCards: Card[] = [
  {
    id: uuidv4(),
    name: "Knight",
    hp: 10,
    maxHp: 10,
    armor: 2,
    attack: 3,
    cost: 3,
    goldValue: 6,
    hasAttacked: false,
  },
  {
    id: uuidv4(),
    name: "Archer",
    hp: 7,
    maxHp: 7,
    armor: 0,
    attack: 4,
    cost: 2,
    goldValue: 4,
    hasAttacked: false,
  },
  {
    id: uuidv4(),
    name: "Defender",
    hp: 12,
    maxHp: 12,
    armor: 3,
    attack: 2,
    cost: 4,
    goldValue: 8,
    hasAttacked: false,
  },
  {
    id: uuidv4(),
    name: "Goblin",
    hp: 5,
    maxHp: 5,
    armor: 0,
    attack: 2,
    cost: 1,
    goldValue: 2,
    hasAttacked: false,
  },
  {
    id: uuidv4(),
    name: "Ogre",
    hp: 15,
    maxHp: 15,
    armor: 1,
    attack: 5,
    cost: 5,
    goldValue: 10,
    hasAttacked: false,
  },
];

// --- Scenarios ---
const scenarios: Scenario[] = [
  {
    name: "First Blood",
    playerStartingCards: [
      getNewCardInstance(allCards[0]),
      getNewCardInstance(allCards[1]),
      getNewCardInstance(allCards[3]),
    ],
    opponentStartingCards: [
      getNewCardInstance(allCards[2]),
      getNewCardInstance(allCards[3]),
    ],
    startingPlayer: "player",
    playerStartingGold: 5,
    opponentStartingGold: 3,
  },
  {
    name: "Reinforcements",
    playerStartingCards: [
      getNewCardInstance(allCards[0]),
      getNewCardInstance(allCards[3]),
    ],
    opponentStartingCards: [
      getNewCardInstance(allCards[4]),
      getNewCardInstance(allCards[1]),
    ],
    startingPlayer: "opponent",
    playerStartingGold: 7,
    opponentStartingGold: 6,
  },
];

// --- Initial State Function ---
const getInitialState = (scenario: Scenario): GameState => ({
  player: {
    id: "player",
    name: "Player",
    deck: createShuffledDeck(scenario.playerStartingCards),
    hand: [],
    playArea: scenario.playerStartingCards.map(getNewCardInstance),
    gold: scenario.playerStartingGold,
  },
  opponent: {
    id: "opponent",
    name: "Opponent",
    deck: createShuffledDeck(scenario.opponentStartingCards),
    hand: [],
    playArea: scenario.opponentStartingCards.map(getNewCardInstance),
    gold: scenario.opponentStartingGold,
  },
  turn: scenario.startingPlayer,
  selectedAttackerId: null,
  scenarios: scenarios,
  currentScenarioIndex: 0,
  gameStatus: "playing",
  messages: [],
});

const createShuffledDeck = (excludedCards: Card[]): Card[] =>
  [...allCards]
    .sort(() => 0.5 - Math.random())
    .map(getNewCardInstance)
    .filter((c) => !excludedCards.some((ec) => ec.name === c.name));

const resetCardsAttackStatus = (cards: Card[]): Card[] =>
  cards.map((card) => ({ ...card, hasAttacked: false }));

// Define the store's state and actions
interface GameStore extends GameState {
  drawCard: () => void;
  playCard: (cardId: string) => void;
  selectAttacker: (cardId: string | null) => void;
  attackCard: (attackerId: string, targetId: string) => void;
  endTurn: () => void;
  opponentPlayCard: (cardName: string) => void;
  opponentAttack: (attackerId: string, targetId: string) => void;
  loadScenario: (scenarioIndex: number) => void;
  resetGame: () => void;
  addMessage: (message: string) => void;
  checkWinConditions: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial State ---
  ...getInitialState(scenarios[0]),

  // --- Actions ---
  addMessage: (message: string) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      return {
        messages:
          newMessages.length > 10 ? newMessages.slice(-10) : newMessages,
      };
    });
  },

  loadScenario: (scenarioIndex: number) => {
    const scenarioToLoad = scenarios[scenarioIndex];
    if (!scenarioToLoad) {
      get().addMessage("Invalid scenario index.");
      return;
    }

    const newPlayerDeck = createShuffledDeck(
      scenarioToLoad.playerStartingCards
    );

    // Draw initial hand (3 cards)
    const initialPlayerHand = [];
    let remainingPlayerDeck = [...newPlayerDeck];

    for (
      let i = 0;
      i < 3 && remainingPlayerDeck.length > 0 && initialPlayerHand.length < 5;
      i++
    ) {
      const [drawnCard, ...restDeck] = remainingPlayerDeck;
      initialPlayerHand.push(drawnCard);
      remainingPlayerDeck = restDeck;
    }

    set({
      player: {
        id: "player",
        name: "Player",
        deck: remainingPlayerDeck,
        hand: initialPlayerHand,
        playArea: scenarioToLoad.playerStartingCards.map(getNewCardInstance),
        gold: scenarioToLoad.playerStartingGold,
      },
      opponent: {
        id: "opponent",
        name: "Opponent",
        deck: createShuffledDeck(scenarioToLoad.opponentStartingCards),
        hand: [],
        playArea: scenarioToLoad.opponentStartingCards.map(getNewCardInstance),
        gold: scenarioToLoad.opponentStartingGold,
      },
      turn: scenarioToLoad.startingPlayer,
      selectedAttackerId: null,
      currentScenarioIndex: scenarioIndex,
      gameStatus: "playing",
      messages: [`Scenario "${scenarioToLoad.name}" loaded!`],
    });
  },

  drawCard: () => {
    set((state) => {
      if (
        state.turn !== "player" ||
        state.player.hand.length >= 5 ||
        state.player.gold < 1 ||
        state.player.deck.length === 0
      ) {
        get().addMessage(
          state.player.deck.length === 0
            ? "Your deck is empty!"
            : state.player.gold < 1
            ? "Not enough gold to draw a card."
            : "Cannot draw card: Not your turn or hand is full."
        );
        return {};
      }

      const [drawnCard, ...remainingDeck] = state.player.deck;
      get().addMessage(`Player drew ${drawnCard.name} for 1 gold.`);

      return {
        player: {
          ...state.player,
          hand: [...state.player.hand, drawnCard],
          deck: remainingDeck,
          gold: state.player.gold - 1,
        },
      };
    });
  },

  playCard: (cardId: string) => {
    set((state) => {
      if (state.turn !== "player" || state.gameStatus !== "playing") return {};

      const cardToPlayIndex = state.player.hand.findIndex(
        (c) => c.id === cardId
      );
      if (cardToPlayIndex === -1) return {};

      const cardToPlay = state.player.hand[cardToPlayIndex];
      if (state.player.gold < cardToPlay.cost) {
        get().addMessage(
          `Not enough gold to play ${cardToPlay.name}. Costs ${cardToPlay.cost}, you have ${state.player.gold}.`
        );
        return {};
      }

      const newHand = [...state.player.hand];
      newHand.splice(cardToPlayIndex, 1);
      get().addMessage(
        `Player played ${cardToPlay.name} for ${cardToPlay.cost} gold.`
      );

      return {
        player: {
          ...state.player,
          gold: state.player.gold - cardToPlay.cost,
          hand: newHand,
          playArea: [
            ...state.player.playArea,
            { ...cardToPlay, hasAttacked: false },
          ],
        },
      };
    });
  },

  // New method to simulate opponent playing a card
  opponentPlayCard: (cardName: string) => {
    set((state) => {
      if (state.turn !== "opponent" || state.gameStatus !== "playing") return {};

      // Find a card in the deck with the specified name
      const cardToPlayIndex = state.opponent.deck.findIndex(
        (c) => c.name === cardName
      );

      if (cardToPlayIndex === -1) {
        get().addMessage(`Opponent has no ${cardName} in deck.`);
        return {};
      }

      const cardToPlay = state.opponent.deck[cardToPlayIndex];
      
      if (state.opponent.gold < cardToPlay.cost) {
        get().addMessage(`Opponent doesn't have enough gold to play ${cardName}.`);
        return {};
      }

      const newDeck = [...state.opponent.deck];
      newDeck.splice(cardToPlayIndex, 1);
      get().addMessage(`Opponent played ${cardToPlay.name} for ${cardToPlay.cost} gold.`);

      return {
        opponent: {
          ...state.opponent,
          gold: state.opponent.gold - cardToPlay.cost,
          deck: newDeck,
          playArea: [
            ...state.opponent.playArea,
            { ...cardToPlay, hasAttacked: false },
          ],
        },
      };
    });
  },

  selectAttacker: (cardId: string | null) => {
    set((state) => {
      if (state.turn !== "player" || state.gameStatus !== "playing") return {};

      if (cardId === null) return { selectedAttackerId: null };

      const card = state.player.playArea.find((c) => c.id === cardId);
      if (!card) return {};

      if (card.hasAttacked) {
        get().addMessage(`${card.name} has already attacked this turn.`);
        return { selectedAttackerId: null };
      }

      return { selectedAttackerId: cardId };
    });
  },

  attackCard: (attackerId: string, targetId: string) => {
    set((state) => {
      if (state.turn !== "player" || state.gameStatus !== "playing") return {};

      const attacker = state.player.playArea.find((c) => c.id === attackerId);
      const target = state.opponent.playArea.find((c) => c.id === targetId);

      if (!attacker || !target) {
        get().addMessage("Invalid attack: Attacker or target not found.");
        return {};
      }
      if (attacker.hasAttacked) {
        get().addMessage(`${attacker.name} has already attacked this turn.`);
        return {};
      }

      const damageDealt = calculateDamage(attacker, target);
      const newTarget = { ...target, hp: target.hp - damageDealt };
      const newAttacker = { ...attacker, hasAttacked: true };

      get().addMessage(
        `${attacker.name} attacked ${target.name} for ${damageDealt} damage.`
      );

      const updatedPlayerPlayArea = updateCardInArray(
        state.player.playArea,
        attackerId,
        { hasAttacked: true }
      );

      // Check if target was defeated
      if (newTarget.hp <= 0) {
        get().addMessage(`${target.name} was defeated!`);
        const updatedOpponentPlayArea = state.opponent.playArea.filter(
          (card) => card.id !== targetId
        );
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

        const gameStatus = checkWinConditions(
          newState.player.playArea,
          newState.opponent.playArea
        );
        return { ...newState, gameStatus };
      } else {
        const updatedOpponentPlayArea = updateCardInArray(
          state.opponent.playArea,
          targetId,
          { hp: newTarget.hp }
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

  // New method for opponent to attack a specific card
  opponentAttack: (attackerId: string, targetId: string) => {
    set((state) => {
      if (state.turn !== "opponent" || state.gameStatus !== "playing") return {};

      const attacker = state.opponent.playArea.find((c) => c.id === attackerId);
      const target = state.player.playArea.find((c) => c.id === targetId);

      if (!attacker || !target) {
        get().addMessage("Invalid attack: Attacker or target not found.");
        return {};
      }
      if (attacker.hasAttacked) {
        get().addMessage(`Opponent's ${attacker.name} has already attacked this turn.`);
        return {};
      }

      const damageDealt = calculateDamage(attacker, target);
      const newTarget = { ...target, hp: target.hp - damageDealt };
      const newAttacker = { ...attacker, hasAttacked: true };

      get().addMessage(
        `Opponent's ${attacker.name} attacked ${target.name} for ${damageDealt} damage.`
      );

      const updatedOpponentPlayArea = updateCardInArray(
        state.opponent.playArea,
        attackerId,
        { hasAttacked: true }
      );

      // Check if target was defeated
      if (newTarget.hp <= 0) {
        get().addMessage(`${target.name} was defeated!`);
        const updatedPlayerPlayArea = state.player.playArea.filter(
          (card) => card.id !== targetId
        );
        get().addMessage(`Opponent gained ${target.goldValue} gold.`);

        const newState = {
          opponent: {
            ...state.opponent,
            playArea: updatedOpponentPlayArea,
            gold: state.opponent.gold + target.goldValue,
          },
          player: {
            ...state.player,
            playArea: updatedPlayerPlayArea,
          },
        };

        const gameStatus = checkWinConditions(
          newState.player.playArea,
          newState.opponent.playArea
        );
        return { ...newState, gameStatus };
      } else {
        const updatedPlayerPlayArea = updateCardInArray(
          state.player.playArea,
          targetId,
          { hp: newTarget.hp }
        );

        return {
          opponent: {
            ...state.opponent,
            playArea: updatedOpponentPlayArea,
          },
          player: {
            ...state.player,
            playArea: updatedPlayerPlayArea,
          },
        };
      }
    });
    
    // Always check win conditions after each attack
    get().checkWinConditions();
  },

  endTurn: () => {
    set((state) => {
      if (state.gameStatus !== "playing") return {};

      const nextTurn = state.turn === "player" ? "opponent" : "player";
      get().addMessage(`Turn ended. It is now ${nextTurn}'s turn.`);

      // When we end our turn, we always reset attack status for both players
      const newState = {
        ...state,
        player: {
          ...state.player,
          playArea: resetCardsAttackStatus(state.player.playArea),
        },
        opponent: {
          ...state.opponent,
          playArea: resetCardsAttackStatus(state.opponent.playArea),
        },
        turn: nextTurn,
        selectedAttackerId: null,
      };

      // We don't auto-process opponent turns anymore as the UI handles it with animations
      return newState;
    });
  },

  resetGame: () => {
    get().loadScenario(0);
  },

  checkWinConditions: () => {
    set((state) => {
      if (state.gameStatus !== "playing") return {};

      const gameStatus = checkWinConditions(
        state.player.playArea,
        state.opponent.playArea
      );

      if (gameStatus !== "playing") {
        get().addMessage(
          gameStatus === "playerWins"
            ? "Opponent has no cards left on the table. Player wins!"
            : "Player has no cards left on the table. Opponent wins!"
        );
      }

      return { gameStatus };
    });
  },
}));

// --- Opponent AI Logic ---
// Note: Most of this is now handled in the App component with animations
// This is kept for reference or fallback purposes

const findBestTarget = (targets: Card[]): number => {
  return targets.reduce(
    (minIndex, card, index, array) =>
      card.hp < array[minIndex].hp ? index : minIndex,
    0
  );
};

const playOpponentCard = (
  gold: number,
  deck: Card[],
  playArea: Card[],
  addMessage: (msg: string) => void
): { gold: number; deck: Card[]; playArea: Card[] } => {
  const affordableCards = deck
    .filter((card) => card.cost <= gold)
    .sort((a, b) => b.attack - a.attack);

  if (affordableCards.length === 0 || playArea.length >= 5) {
    return { gold, deck, playArea };
  }

  const cardToPlay = affordableCards[0];
  addMessage(`Opponent played ${cardToPlay.name}.`);

  return {
    gold: gold - cardToPlay.cost,
    deck: deck.filter((c) => c.id !== cardToPlay.id),
    playArea: [...playArea, { ...cardToPlay, hasAttacked: false }],
  };
};

const handleOpponentAttacks = (
  opponentPlayArea: Card[],
  playerPlayArea: Card[],
  addMessage: (msg: string) => void
): { opponentPlayArea: Card[]; playerPlayArea: Card[] } => {
  if (playerPlayArea.length === 0) {
    return { opponentPlayArea, playerPlayArea };
  }

  let updatedOpponentPlayArea = [...opponentPlayArea];
  let updatedPlayerPlayArea = [...playerPlayArea];

  for (const attacker of opponentPlayArea) {
    if (attacker.hasAttacked || updatedPlayerPlayArea.length === 0) continue;

    const targetIndex = findBestTarget(updatedPlayerPlayArea);
    const target = updatedPlayerPlayArea[targetIndex];

    const damageDealt = calculateDamage(attacker, target);
    const newTargetHp = target.hp - damageDealt;

    addMessage(
      `Opponent's ${attacker.name} attacked Player's ${target.name} for ${damageDealt} damage.`
    );

    // Update attacker to mark as attacked
    updatedOpponentPlayArea = updateCardInArray(
      updatedOpponentPlayArea,
      attacker.id,
      { hasAttacked: true }
    );

    // Update or remove target based on HP
    if (newTargetHp <= 0) {
      addMessage(`Player's ${target.name} was defeated!`);
      updatedPlayerPlayArea = updatedPlayerPlayArea.filter(
        (card) => card.id !== target.id
      );
    } else {
      updatedPlayerPlayArea = updateCardInArray(
        updatedPlayerPlayArea,
        target.id,
        { hp: newTargetHp }
      );
    }
  }

  return {
    opponentPlayArea: updatedOpponentPlayArea,
    playerPlayArea: updatedPlayerPlayArea,
  };
};

const opponentTurnLogic = (
  state: GameState,
  addMessage: (msg: string) => void
): GameState => {
  addMessage("Opponent's turn!");

  // 1. Play a card if possible
  const {
    gold: newOpponentGold,
    deck: newOpponentDeck,
    playArea: newOpponentPlayAreaAfterPlay,
  } = playOpponentCard(
    state.opponent.gold,
    state.opponent.deck,
    state.opponent.playArea,
    addMessage
  );

  // 2. Attack with available cards
  const {
    opponentPlayArea: finalOpponentPlayArea,
    playerPlayArea: finalPlayerPlayArea,
  } = handleOpponentAttacks(
    newOpponentPlayAreaAfterPlay,
    state.player.playArea,
    addMessage
  );

  // Check win conditions
  const gameStatus = checkWinConditions(
    finalPlayerPlayArea,
    finalOpponentPlayArea
  );

  // Return updated game state
  return {
    player: {
      ...state.player,
      playArea: finalPlayerPlayArea,
    },
    opponent: {
      ...state.opponent,
      gold: newOpponentGold,
      deck: newOpponentDeck,
      playArea: finalOpponentPlayArea,
    },
    turn: "player",
    selectedAttackerId: null,
    scenarios: state.scenarios,
    currentScenarioIndex: state.currentScenarioIndex,
    gameStatus,
    messages: state.messages,
  };
};