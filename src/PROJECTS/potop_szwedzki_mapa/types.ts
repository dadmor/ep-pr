// types.ts - Updated with new types
export interface Card {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  armor: number;
  attack: number;
  cost: number;
  goldValue: number;
  hasAttacked: boolean;
  faction?: string; // Added for historical context
}

export interface Player {
  id: string;
  name: string;
  deck: Card[];
  hand: Card[];
  playArea: Card[];
  gold: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Province {
  id: number;
  name: string;
  path: Point[];
  color: string;
}

export interface City {
  id: number;
  name: string;
  position: Point;
  size: number;
  color: string;
}

export interface MapData {
  provinces: Province[];
  cities: City[];
  mapSize: {
    width: number;
    height: number;
  };
}

export interface Scenario {
  name: string;
  playerStartingCards: Card[];
  opponentStartingCards: Card[];
  startingPlayer: 'player' | 'opponent';
  playerStartingGold: number;
  opponentStartingGold: number;
  cityId: number; // ID miasta z mapy, na którym ma być wycentrowany widok
  description?: string; // Brief description for the scenario selection screen
}

// New types for enhanced game flow
export type GameFlow = 
  | 'startScreen' 
  | 'historicalContext' 
  | 'deckBuilder' 
  | 'gameScreen';

// Historical context types
export interface HistoricalArrow {
  start: Point;
  end: Point;
  color?: string;
  dashed?: boolean;
  width?: number;
}

export interface HistoricalIcon {
  position: Point;
  type: 'infantry' | 'cavalry' | 'artillery' | 'navy' | 'battle';
  color?: string;
  label?: string;
  size?: number;
}

export interface HistoricalPage {
  title: string;
  text: string;
  date?: string;
  arrows?: HistoricalArrow[];
  icons?: HistoricalIcon[];
  units?: Card[]; // Units involved in this historical moment
}

export interface ScenarioHistory {
  scenarioId: number;
  pages: HistoricalPage[];
}

// Main game state interface
export interface GameState {
  player: Player;
  opponent: Player;
  turn: 'player' | 'opponent';
  selectedAttackerId: string | null;
  scenarios: Scenario[];
  currentScenarioIndex: number;
  gameStatus: 'playing' | 'playerWins' | 'opponentWins';
  messages: string[];
  mapData: MapData | null;
  
  // New state properties for enhanced game flow
  gameFlow: GameFlow;
  completedScenarios: number[]; // Indices of completed scenarios
  scenarioHistories: ScenarioHistory[];
  selectedScenarioForHistory: number;
}