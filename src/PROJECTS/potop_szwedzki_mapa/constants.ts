// constants.ts - Updated with new constants
// Card drawing constraints
export const MAX_HAND_SIZE = 5;
export const CARD_DRAW_COST = 1;

// Win conditions
export const WIN_CONDITION = {
  PLAYING: 'playing',
  PLAYER_WINS: 'playerWins',
  OPPONENT_WINS: 'opponentWins',
} as const;

// Player/opponent identifiers
export const PLAYER_ID = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
} as const;

export const TURN_TYPE = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
} as const;

// Notification types
export const NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Animation constants
export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 400,
  LONG: 700,
  NOTIFICATION: 1500,
} as const;

// UI constants
export const MAX_MESSAGES_LOG = 10;
export const INITIAL_HAND_SIZE = 3;

// Game mechanics
export const ATTACK_LUNGE_DISTANCE = 0.3; // 30% of the way to target

// Game flow states
export const GAME_FLOW = {
  START_SCREEN: 'startScreen',
  HISTORICAL_CONTEXT: 'historicalContext',
  DECK_BUILDER: 'deckBuilder',
  GAME_SCREEN: 'gameScreen',
} as const;