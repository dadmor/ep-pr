// gameData.ts
import { Card, Scenario } from './types';
import { v4 as uuidv4 } from 'uuid';
import { TURN_TYPE } from './constants';

// Card templates - all available cards in the game
export const allCards: Card[] = [
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

// Helper function to create a new instance of a card with a unique ID
export const getNewCardInstance = (cardTemplate: Card): Card => ({
  ...cardTemplate,
  id: uuidv4(),
  hp: cardTemplate.maxHp,
  hasAttacked: false,
});

// Game scenarios
export const scenarios: Scenario[] = [
  {
    name: "First Blood",
    playerStartingCards: [
      getNewCardInstance(allCards[0]), // Knight
      getNewCardInstance(allCards[1]), // Archer
      getNewCardInstance(allCards[3]), // Goblin
    ],
    opponentStartingCards: [
      getNewCardInstance(allCards[2]), // Defender
      getNewCardInstance(allCards[3]), // Goblin
    ],
    startingPlayer: TURN_TYPE.PLAYER,
    playerStartingGold: 5,
    opponentStartingGold: 3,
    cityId: 1, // Warszawa
  },
  {
    name: "Reinforcements",
    playerStartingCards: [
      getNewCardInstance(allCards[0]), // Knight
      getNewCardInstance(allCards[3]), // Goblin
    ],
    opponentStartingCards: [
      getNewCardInstance(allCards[4]), // Ogre
      getNewCardInstance(allCards[1]), // Archer
    ],
    startingPlayer: TURN_TYPE.OPPONENT,
    playerStartingGold: 7,
    opponentStartingGold: 6,
    cityId: 2, // Kraków
  },
  {
    name: "Northern Front",
    playerStartingCards: [
      getNewCardInstance(allCards[0]), // Knight
      getNewCardInstance(allCards[2]), // Defender
    ],
    opponentStartingCards: [
      getNewCardInstance(allCards[1]), // Archer
      getNewCardInstance(allCards[3]), // Goblin
      getNewCardInstance(allCards[3]), // Goblin
    ],
    startingPlayer: TURN_TYPE.PLAYER,
    playerStartingGold: 6,
    opponentStartingGold: 4,
    cityId: 4, // Gdańsk
  },
  {
    name: "Western Assault",
    playerStartingCards: [
      getNewCardInstance(allCards[1]), // Archer
      getNewCardInstance(allCards[1]), // Archer
      getNewCardInstance(allCards[3]), // Goblin
    ],
    opponentStartingCards: [
      getNewCardInstance(allCards[0]), // Knight
      getNewCardInstance(allCards[2]), // Defender
    ],
    startingPlayer: TURN_TYPE.OPPONENT,
    playerStartingGold: 8,
    opponentStartingGold: 5,
    cityId: 3, // Poznań
  }
];

// Helper function to create a shuffled deck, excluding cards already in play
export const createShuffledDeck = (excludedCards: Card[]): Card[] =>
  [...allCards]
    .sort(() => 0.5 - Math.random())
    .map(getNewCardInstance)
    .filter((c) => !excludedCards.some((ec) => ec.name === c.name));

// Helper function to reset the attack status of all cards
export const resetCardsAttackStatus = (cards: Card[]): Card[] =>
  cards.map((card) => ({ ...card, hasAttacked: false }));

// Game mechanics helpers
export const calculateDamage = (attacker: Card, target: Card): number =>
  Math.max(0, attacker.attack - target.armor);

export const updateCardInArray = (
  cards: Card[],
  cardId: string,
  updates: Partial<Card>
): Card[] =>
  cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card));