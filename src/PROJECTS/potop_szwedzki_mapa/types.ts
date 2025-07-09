// types.ts
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
}

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
}