// store/gameStore.ts - Fixed customizeDeck function
import { create } from "zustand";
import { Card, GameState, Scenario, MapData, GameFlow, ScenarioHistory, HistoricalArrow, HistoricalIcon } from "../types";
import { 
  scenarios, 
  createShuffledDeck, 
  resetCardsAttackStatus, 
  getNewCardInstance,
  calculateDamage,
  updateCardInArray,
  scenarioHistories
} from "../gameData";
import {
  WIN_CONDITION,
  TURN_TYPE,
  MAX_HAND_SIZE,
  CARD_DRAW_COST,
  INITIAL_HAND_SIZE,
  MAX_MESSAGES_LOG,
  GAME_FLOW
} from "../constants";

// Import map data
import mapDataJson from '../assets/mapa.json';

// Check win conditions based on cards in play
const checkWinConditions = (
  playerPlayArea: Card[],
  opponentPlayArea: Card[]
): "playing" | "playerWins" | "opponentWins" => {
  if (playerPlayArea.length === 0) return WIN_CONDITION.OPPONENT_WINS;
  if (opponentPlayArea.length === 0) return WIN_CONDITION.PLAYER_WINS;
  return WIN_CONDITION.PLAYING;
};

// Get initial state for a scenario
const getInitialState = (scenario: Scenario): GameState => ({
  player: {
    id: TURN_TYPE.PLAYER,
    name: "Player",
    deck: createShuffledDeck(scenario.playerStartingCards),
    hand: [],
    playArea: scenario.playerStartingCards.map(getNewCardInstance),
    gold: scenario.playerStartingGold,
  },
  opponent: {
    id: TURN_TYPE.OPPONENT,
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
  gameStatus: WIN_CONDITION.PLAYING,
  messages: [],
  mapData: mapDataJson as MapData,
  
  // New state for the enhanced game flow
  gameFlow: GAME_FLOW.START_SCREEN,
  completedScenarios: [], // Indices of completed scenarios
  scenarioHistories: scenarioHistories,
  selectedScenarioForHistory: 0,
});

// Define the store's state and actions
interface GameStore extends GameState {
  // Original actions
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
  loadMapData: (mapData: MapData) => void;
  
  // New actions for enhanced game flow
  setGameFlow: (flow: GameFlow) => void;
  selectScenarioForHistory: (index: number) => void;
  markScenarioCompleted: (scenarioIndex: number) => void;
  customizeDeck: (scenarioIndex: number, customCards: Card[]) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial State ---
  ...getInitialState(scenarios[0]),

  // --- Original Actions ---
  addMessage: (message: string) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      return {
        messages:
          newMessages.length > MAX_MESSAGES_LOG ? newMessages.slice(-MAX_MESSAGES_LOG) : newMessages,
      };
    });
  },

  loadMapData: (mapData: MapData) => {
    set(() => ({ mapData }));
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

    // Draw initial hand
    const initialPlayerHand = [];
    let remainingPlayerDeck = [...newPlayerDeck];

    for (
      let i = 0;
      i < INITIAL_HAND_SIZE && remainingPlayerDeck.length > 0 && initialPlayerHand.length < MAX_HAND_SIZE;
      i++
    ) {
      const [drawnCard, ...restDeck] = remainingPlayerDeck;
      initialPlayerHand.push(drawnCard);
      remainingPlayerDeck = restDeck;
    }

    set({
      player: {
        id: TURN_TYPE.PLAYER,
        name: "Player",
        deck: remainingPlayerDeck,
        hand: initialPlayerHand,
        playArea: scenarioToLoad.playerStartingCards.map(getNewCardInstance),
        gold: scenarioToLoad.playerStartingGold,
      },
      opponent: {
        id: TURN_TYPE.OPPONENT,
        name: "Opponent",
        deck: createShuffledDeck(scenarioToLoad.opponentStartingCards),
        hand: [],
        playArea: scenarioToLoad.opponentStartingCards.map(getNewCardInstance),
        gold: scenarioToLoad.opponentStartingGold,
      },
      turn: scenarioToLoad.startingPlayer,
      selectedAttackerId: null,
      currentScenarioIndex: scenarioIndex,
      gameStatus: WIN_CONDITION.PLAYING,
      messages: [`Scenario "${scenarioToLoad.name}" loaded!`],
    });
  },

  drawCard: () => {
    set((state) => {
      if (
        state.turn !== TURN_TYPE.PLAYER ||
        state.player.hand.length >= MAX_HAND_SIZE ||
        state.player.gold < CARD_DRAW_COST ||
        state.player.deck.length === 0
      ) {
        get().addMessage(
          state.player.deck.length === 0
            ? "Your deck is empty!"
            : state.player.gold < CARD_DRAW_COST
            ? "Not enough gold to draw a card."
            : "Cannot draw card: Not your turn or hand is full."
        );
        return {};
      }

      const [drawnCard, ...remainingDeck] = state.player.deck;
      get().addMessage(`Player drew ${drawnCard.name} for ${CARD_DRAW_COST} gold.`);

      return {
        player: {
          ...state.player,
          hand: [...state.player.hand, drawnCard],
          deck: remainingDeck,
          gold: state.player.gold - CARD_DRAW_COST,
        },
      };
    });
  },

  playCard: (cardId: string) => {
    set((state) => {
      if (state.turn !== TURN_TYPE.PLAYER || state.gameStatus !== WIN_CONDITION.PLAYING) return {};

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

  // Method to simulate opponent playing a card
  opponentPlayCard: (cardName: string) => {
    set((state) => {
      if (state.turn !== TURN_TYPE.OPPONENT || state.gameStatus !== WIN_CONDITION.PLAYING) return {};

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
      if (state.turn !== TURN_TYPE.PLAYER || state.gameStatus !== WIN_CONDITION.PLAYING) return {};

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
      if (state.turn !== TURN_TYPE.PLAYER || state.gameStatus !== WIN_CONDITION.PLAYING) return {};

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
        
        // If player wins, mark scenario as completed
        if (gameStatus === WIN_CONDITION.PLAYER_WINS) {
          get().markScenarioCompleted(state.currentScenarioIndex);
        }
        
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

  // Method for opponent to attack a specific card
  opponentAttack: (attackerId: string, targetId: string) => {
    set((state) => {
      if (state.turn !== TURN_TYPE.OPPONENT || state.gameStatus !== WIN_CONDITION.PLAYING) return {};

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
      if (state.gameStatus !== WIN_CONDITION.PLAYING) return {};

      const nextTurn = state.turn === TURN_TYPE.PLAYER ? TURN_TYPE.OPPONENT : TURN_TYPE.PLAYER;
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
    set({ gameFlow: GAME_FLOW.START_SCREEN });
  },

  checkWinConditions: () => {
    set((state) => {
      if (state.gameStatus !== WIN_CONDITION.PLAYING) return {};

      const gameStatus = checkWinConditions(
        state.player.playArea,
        state.opponent.playArea
      );

      if (gameStatus !== WIN_CONDITION.PLAYING) {
        get().addMessage(
          gameStatus === WIN_CONDITION.PLAYER_WINS
            ? "Opponent has no cards left on the table. Player wins!"
            : "Player has no cards left on the table. Opponent wins!"
        );
        
        // If player wins, mark scenario as completed
        if (gameStatus === WIN_CONDITION.PLAYER_WINS) {
          get().markScenarioCompleted(state.currentScenarioIndex);
        }
      }

      return { gameStatus };
    });
  },

  // --- New Actions for Enhanced Game Flow ---
  
  setGameFlow: (flow: GameFlow) => {
    set({ gameFlow: flow });
  },
  
  selectScenarioForHistory: (index: number) => {
    set({ 
      selectedScenarioForHistory: index,
      gameFlow: GAME_FLOW.HISTORICAL_CONTEXT
    });
  },
  
  markScenarioCompleted: (scenarioIndex: number) => {
    set(state => {
      if (state.completedScenarios.includes(scenarioIndex)) {
        return {}; // Already completed
      }
      return {
        completedScenarios: [...state.completedScenarios, scenarioIndex]
      };
    });
  },
  
  // FIXED: This function now correctly adds customized cards to the deck only, not the play area
  customizeDeck: (scenarioIndex: number, customCards: Card[]) => {
    set(state => {
      // Get the current scenario
      const scenario = state.scenarios[scenarioIndex];
      
      // The starting cards are defined by the scenario
      const startingCards = scenario.playerStartingCards.map(getNewCardInstance);
      
      // The deck is populated with the custom selected cards
      const playerDeck = customCards.length > 0 
        ? customCards.map(getNewCardInstance) // Use custom cards if provided
        : createShuffledDeck(startingCards); // Default to shuffled deck
        
      // Draw initial hand
      const initialPlayerHand = [];
      let remainingPlayerDeck = [...playerDeck];

      for (
        let i = 0;
        i < INITIAL_HAND_SIZE && remainingPlayerDeck.length > 0 && initialPlayerHand.length < MAX_HAND_SIZE;
        i++
      ) {
        const [drawnCard, ...restDeck] = remainingPlayerDeck;
        initialPlayerHand.push(drawnCard);
        remainingPlayerDeck = restDeck;
      }
      
      // Update the player state with the starting cards in play area and the custom deck
      return {
        player: {
          ...state.player,
          playArea: startingCards, // Use scenario's starting cards for play area
          deck: remainingPlayerDeck, // Use custom deck for drawing
          hand: initialPlayerHand // Initial hand drawn from the deck
        },
        gameFlow: GAME_FLOW.GAME_SCREEN
      };
    });
  }
}));