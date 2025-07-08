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
  
  export interface Scenario {
    name: string;
    playerStartingCards: Card[];
    opponentStartingCards: Card[];
    startingPlayer: 'player' | 'opponent';
    playerStartingGold: number;
    opponentStartingGold: number;
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
  }