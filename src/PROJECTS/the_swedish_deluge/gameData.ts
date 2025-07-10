// gameData.ts - Updated to import data from JSON files
import { Card, Scenario, ScenarioHistory, HistoricalPage, HistoricalArrow } from './types';
import { v4 as uuidv4 } from 'uuid';


// Import JSON data
import cardsJson from './assets/cards.json';
import scenariosJson from './assets/scenarios.json';
import storiesJson from './assets/stories.json';

// Create card templates from JSON
const createCardTemplates = (): Card[] => {
  return cardsJson.map(cardData => ({
    id: uuidv4(),
    name: cardData.name,
    hp: cardData.maxHp,
    maxHp: cardData.maxHp,
    armor: cardData.armor,
    attack: cardData.attack,
    cost: cardData.cost,
    goldValue: cardData.goldValue,
    hasAttacked: false,
    faction: cardData.faction
  }));
};

// All available cards
export const allCards: Card[] = createCardTemplates();

// Helper function to find a card template by name
const findCardTemplate = (name: string): Card => {
  const template = allCards.find(card => card.name === name);
  if (!template) {
    throw new Error(`Card template not found: ${name}`);
  }
  return template;
};

// Helper function to create a new instance of a card with a unique ID
export const getNewCardInstance = (cardTemplate: Card | string): Card => {
  // If cardTemplate is a string (card name), find the template in allCards
  if (typeof cardTemplate === 'string') {
    const template = findCardTemplate(cardTemplate);
    return getNewCardInstance(template);
  }
  
  // Otherwise create a new instance with a unique ID
  return {
    ...cardTemplate,
    id: uuidv4(),
    hp: cardTemplate.maxHp,
    hasAttacked: false,
  };
};

// Process scenarios from JSON, ensuring type safety
export const scenarios: Scenario[] = scenariosJson.map(scenarioData => {
  return {
    name: scenarioData.name,
    description: scenarioData.description,
    playerStartingCards: scenarioData.playerStartingCards.map(cardName => 
      getNewCardInstance(findCardTemplate(cardName))
    ),
    opponentStartingCards: scenarioData.opponentStartingCards.map(cardName => 
      getNewCardInstance(findCardTemplate(cardName))
    ),
    startingPlayer: scenarioData.startingPlayer as 'player' | 'opponent',
    playerStartingGold: scenarioData.playerStartingGold,
    opponentStartingGold: scenarioData.opponentStartingGold,
    cityId: scenarioData.cityId
  };
});

// Process historical data from JSON, ensuring type safety
export const scenarioHistories: ScenarioHistory[] = storiesJson.map(historyData => {
  return {
    scenarioId: historyData.scenarioId,
    pages: historyData.pages.map(page => {
      // Create valid HistoricalPage object
      const historicalPage: HistoricalPage = {
        title: page.title,
        text: page.text,
        date: page.date
      };
      
      // Add optional fields only if they exist in the source data
      if (page.arrows) {
        historicalPage.arrows = page.arrows as HistoricalArrow[];
      }
      
      if (page.icons) {
        historicalPage.icons = page.icons.map(icon => ({
          position: icon.position,
          type: icon.type as 'infantry' | 'cavalry' | 'artillery' | 'navy' | 'battle',
          color: icon.color,
          label: icon.label
        }));
      }
      
      // Process unit references in history pages
      if (page.units) {
        historicalPage.units = page.units.map(unitData => {
          const template = findCardTemplate(unitData.template);
          return getNewCardInstance({
            ...template,
            name: unitData.name
          });
        });
      }
      
      return historicalPage;
    })
  };
});

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