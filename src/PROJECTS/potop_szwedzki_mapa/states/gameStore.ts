// === gameStore.ts ===
import { create } from "zustand";
import { 
  GAME_SETTINGS, 
  AI_SETTINGS, 
  POLISH_CARDS_DATA, 
  SWEDISH_CARDS_DATA, 
  ENEMY_SCENARIOS,
  KEYWORDS_EFFECTS,
  INITIAL_EVENT_LOG,
  SPELL_NAMES,
  CARD_KEYWORDS
} from "../gameConstants";
import { uiStore } from "./uiStore";
import GameTimeline from "./timelineManager";

// === TYPES ===
export interface Card {
  id: number;
  name: string;
  cost: number;
  attack: number;
  defense: number;
  type: "unit" | "hero" | "fortification" | "spell";
  rarity: "common" | "uncommon" | "rare" | "legendary";
  description: string;
  keywords?: string[];
  instanceId?: number;
  bonusAttack?: number;
  bonusDefense?: number;
  used?: boolean;
  currentHP?: number;
  maxHP?: number;
  canAttack?: boolean;
  summoned?: boolean;
}

export interface EnemyTemplate {
  id: number;
  name: string;
  hp: number;
  description: string;
  rewards: { gold: number; cards: number; };
  deckComposition: ReadonlyArray<{ cardId: number; count: number; }> | { cardId: number; count: number; }[];
  ai: "aggressive" | "defensive" | "balanced";
  startsFirst: boolean;
}

export interface Enemy {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  description: string;
  rewards: { gold: number; cards: number; };
  currentHp: number;
  hand: Card[];
  battlefield: Card[];
  discardPile: Card[];
  energy: number;
  maxEnergy: number;
  deck: Card[];
  ai: "aggressive" | "defensive" | "balanced";
  startsFirst: boolean;
}

// === GAME STATE ===
export interface GameState {
  player: {
    hp: number;
    maxHp: number;
    morale: number;
    gold: number;
    energy: number;
    maxEnergy: number;
  };
  
  game: {
    turn: number;
    phase: "main" | "combat" | "selectTarget" | "enemyTurn" | "victory" | "defeat";
    eventLog: string[];
  };
  
  cards: {
    hand: Card[];
    deck: Card[];
    discardPile: Card[];
    battlefield: Card[];
  };
  
  enemy: Enemy | null;
}

// === ACTIONS ===
export interface GameActions {
  initializeGame: () => void;
  endTurn: () => void;
  playCard: (card: Card) => void;
  drawCard: (count?: number) => void;
  selectAttackTarget: (attacker: Card) => void;
  executeAttack: (attacker: Card, target: Card | "enemy") => void;
  cancelTargetSelection: () => void;
  enemyTurn: () => void;
  handleVictory: () => void;
  handleDefeat: () => void;
  canPlayCard: (card: Card) => boolean;
}

// === MECHANICS ===
export class GameMechanics {
  static initializeCardHP(card: Card): Card {
    if (card.type === "unit" || card.type === "hero" || card.type === "fortification") {
      return {
        ...card,
        currentHP: card.defense,
        maxHP: card.defense,
        canAttack: true,
        summoned: true,
        used: false
      };
    }
    return { ...card, canAttack: true };
  }

  static calculateCardAttack(card: Card, battlefield: Card[]): number {
    let attack = card.attack + (card.bonusAttack || 0);
    
    if (card.keywords?.includes(CARD_KEYWORDS.SWARM)) {
      const otherSwarms = battlefield.filter(c => 
        c.keywords?.includes(CARD_KEYWORDS.SWARM) && c.instanceId !== card.instanceId
      ).length;
      attack += otherSwarms * KEYWORDS_EFFECTS.SWARM_ATTACK_BONUS;
    }
    
    return attack;
  }

  static canCardAttack(card: Card): boolean {
    return (card.currentHP || card.defense) > 0 && 
           card.canAttack === true && 
           card.attack > 0 &&
           !card.used;
  }

  static isCardAlive(card: Card): boolean {
    if (card.type === "unit" || card.type === "hero" || card.type === "fortification") {
      return (card.currentHP || card.defense) > 0;
    }
    return true;
  }

  static getPossibleTargets(attacker: Card, enemyBattlefield: Card[]): Card[] {
    return enemyBattlefield.filter(card => this.isCardAlive(card));
  }

  static applyLeadershipEffects(battlefield: Card[]): Card[] {
    const leaders = battlefield.filter(c => c.keywords?.includes(CARD_KEYWORDS.LEADERSHIP));
    if (leaders.length === 0) return battlefield;
    
    return battlefield.map(card => {
      if (card.keywords?.includes(CARD_KEYWORDS.LEADERSHIP)) return card;
      
      const eliteLeaders = leaders.filter(l => 
        l.keywords?.includes(CARD_KEYWORDS.KING) && l.keywords?.includes(CARD_KEYWORDS.ELITE)
      );
      const regularLeaders = leaders.filter(l => 
        !l.keywords?.includes(CARD_KEYWORDS.ELITE) || !l.keywords?.includes(CARD_KEYWORDS.KING)
      );
      
      const eliteBonus = eliteLeaders.length * KEYWORDS_EFFECTS.ELITE_LEADERSHIP_BONUS.attack;
      const regularBonus = regularLeaders.length * KEYWORDS_EFFECTS.LEADERSHIP_BONUS.attack;
      
      return {
        ...card,
        bonusAttack: (card.bonusAttack || 0) + eliteBonus + regularBonus,
        bonusDefense: (card.bonusDefense || 0) + 
          eliteLeaders.length * KEYWORDS_EFFECTS.ELITE_LEADERSHIP_BONUS.defense + 
          regularLeaders.length * KEYWORDS_EFFECTS.LEADERSHIP_BONUS.defense
      };
    });
  }
}

// === SERVICES ===
export class CardService {
  private static nextId = 1000;

  static createCardInstance(card: Card): Card {
    return GameMechanics.initializeCardHP({ 
      ...card, 
      instanceId: CardService.nextId++,
      bonusAttack: 0,
      bonusDefense: 0
    });
  }

  static drawCards(state: GameState, count: number): Partial<GameState> {
    let deck = [...state.cards.deck];
    let discard = [...state.cards.discardPile];
    let hand = [...state.cards.hand];
    let eventLog = [...state.game.eventLog];

    for (let i = 0; i < count; i++) {
      if (hand.length >= GAME_SETTINGS.MAX_HAND_SIZE) break;
      
      if (deck.length === 0) {
        if (discard.length === 0) break;
        deck = discard.sort(() => Math.random() - 0.5);
        discard = [];
        eventLog = [
          "🔄 Talia przetasowana!", 
          ...eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
        ];
      }
      
      const card = deck.shift();
      if (card) hand.push(card);
    }
    
    return { 
      cards: { ...state.cards, hand, deck, discardPile: discard },
      game: { ...state.game, eventLog }
    };
  }

  static playCard(state: GameState, card: Card): Partial<GameState> {
    let newState: Partial<GameState> = {
      player: {
        ...state.player,
        energy: state.player.energy - card.cost
      },
      cards: {
        ...state.cards,
        hand: state.cards.hand.filter(c => c.instanceId !== card.instanceId)
      },
      game: {
        ...state.game,
        eventLog: [
          `🎯 ${card.name} ${card.type === "spell" ? "zostaje rzucone" : "wchodzi na pole bitwy"}!`,
          ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
        ]
      }
    };

    if (card.type === "spell") {
      newState.cards!.discardPile = [...state.cards.discardPile, card];
      
      if (card.name === SPELL_NAMES.POLISH.DEFENSE_OF_WARSAW) {
        newState.cards!.battlefield = state.cards.battlefield.map(unit => ({
          ...unit,
          bonusDefense: (unit.bonusDefense || 0) + GAME_SETTINGS.DEFENSE_WARSAW_DEFENSE_BONUS
        }));
        newState.game!.eventLog = [
          "🛡️ Obrona Warszawy - wszystkie jednostki +0/+2!",
          ...newState.game!.eventLog.slice(1)
        ];
      }
    } else {
      const cardWithHP = GameMechanics.initializeCardHP(card);
      newState.cards!.battlefield = GameMechanics.applyLeadershipEffects([
        ...state.cards.battlefield, 
        cardWithHP
      ]);
      
      if (card.keywords?.includes(CARD_KEYWORDS.WEALTH)) {
        newState.player!.gold = state.player.gold + GAME_SETTINGS.WEALTH_GOLD_BONUS;
        newState.game!.eventLog = [
          `💰 ${card.name} - Bogactwo! +1 złoto`,
          ...newState.game!.eventLog.slice(1)
        ];
      }
    }

    return newState;
  }
}

export class EnemyService {
  static createEnemy(template: EnemyTemplate): Enemy {
    const deck: Card[] = [];
    
    template.deckComposition.forEach(({ cardId, count }) => {
      const baseCard = (SWEDISH_CARDS_DATA as unknown as Card[]).find(c => c.id === cardId);
      if (baseCard) {
        for (let i = 0; i < count; i++) {
          deck.push(CardService.createCardInstance(baseCard));
        }
      }
    });

    const shuffledDeck = deck.sort(() => Math.random() - 0.5);
    const hand = shuffledDeck.slice(0, GAME_SETTINGS.ENEMY_INITIAL_HAND_SIZE);
    const remainingDeck = shuffledDeck.slice(GAME_SETTINGS.ENEMY_INITIAL_HAND_SIZE);

    return {
      id: template.id,
      name: template.name,
      hp: template.hp,
      maxHp: template.hp,
      description: template.description,
      rewards: template.rewards,
      currentHp: template.hp,
      hand,
      deck: remainingDeck,
      battlefield: [],
      discardPile: [],
      energy: GAME_SETTINGS.ENEMY_INITIAL_ENERGY,
      maxEnergy: GAME_SETTINGS.ENEMY_MAX_ENERGY,
      ai: template.ai,
      startsFirst: template.startsFirst
    };
  }

  static chooseCardToPlay(enemy: Enemy): Card | null {
    const playableCards = enemy.hand.filter(card => card.cost <= enemy.energy);
    if (playableCards.length === 0) return null;
    
    switch (enemy.ai) {
      case "aggressive":
        return playableCards.reduce((best, current) => 
          current.attack > best.attack ? current : best
        , playableCards[0]);
      case "defensive":
        const defensiveCards = playableCards.filter(c => 
          c.type === "fortification" || c.keywords?.includes(CARD_KEYWORDS.DEFENSE)
        );
        return defensiveCards.length > 0 ? defensiveCards[0] : playableCards[0];
      default:
        return playableCards.reduce((best, current) => {
          const currentValue = (current.attack + current.defense) / current.cost;
          const bestValue = (best.attack + best.defense) / best.cost;
          return currentValue > bestValue ? current : best;
        }, playableCards[0]);
    }
  }

  static chooseAttackTarget(battlefield: Card[]): Card | null {
    const aliveTargets = battlefield.filter(card => GameMechanics.isCardAlive(card));
    if (aliveTargets.length === 0) return null;
    
    // Priority: heroes > fortifications > units
    for (const type of ["hero", "fortification", "unit"]) {
      const targets = aliveTargets.filter(c => c.type === type);
      if (targets.length > 0) {
        return targets.reduce((weakest, current) => 
          (current.currentHP || current.defense) < (weakest.currentHP || weakest.defense) ? current : weakest
        , targets[0]);
      }
    }
    
    return null;
  }
}

// === MAIN GAME STORE ===
export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // === INITIAL STATE ===
  player: {
    hp: GAME_SETTINGS.INITIAL_PLAYER_HP,
    maxHp: GAME_SETTINGS.INITIAL_PLAYER_HP,
    morale: GAME_SETTINGS.INITIAL_MORALE,
    gold: GAME_SETTINGS.INITIAL_GOLD,
    energy: GAME_SETTINGS.INITIAL_ENERGY,
    maxEnergy: GAME_SETTINGS.MAX_ENERGY,
  },
  
  game: {
    turn: 1,
    phase: "main",
    eventLog: [...INITIAL_EVENT_LOG],
  },
  
  cards: {
    hand: [],
    deck: [],
    discardPile: [],
    battlefield: [],
  },
  
  enemy: null,

  // === ACTIONS ===
  
  initializeGame: () => {
    // Clear any existing timeouts
    GameTimeline.cancelAllActions();
    
    // Create player's deck
    const initialDeck: Card[] = [];
    (POLISH_CARDS_DATA as unknown as Card[]).forEach(card => {
      for (let i = 0; i < GAME_SETTINGS.CARDS_PER_DECK_TYPE; i++) {
        initialDeck.push(CardService.createCardInstance(card));
      }
    });

    const shuffledDeck = initialDeck.sort(() => Math.random() - 0.5);
    const initialHand = shuffledDeck.slice(0, GAME_SETTINGS.INITIAL_HAND_SIZE);
    const remainingDeck = shuffledDeck.slice(GAME_SETTINGS.INITIAL_HAND_SIZE);
    
    // Create enemy
    const enemyTemplate = ENEMY_SCENARIOS[0] as unknown as EnemyTemplate;
    const enemy = EnemyService.createEnemy(enemyTemplate);

    set({
      player: {
        hp: GAME_SETTINGS.INITIAL_PLAYER_HP,
        maxHp: GAME_SETTINGS.INITIAL_PLAYER_HP,
        morale: GAME_SETTINGS.INITIAL_MORALE,
        gold: GAME_SETTINGS.INITIAL_GOLD,
        energy: GAME_SETTINGS.INITIAL_ENERGY,
        maxEnergy: GAME_SETTINGS.MAX_ENERGY,
      },
      
      game: {
        turn: 1,
        phase: "main",
        eventLog: [
          ...INITIAL_EVENT_LOG,
          `🎯 Scenariusz: ${enemy.name} (${enemy.hp} HP)`,
          `🤖 Styl AI: ${enemy.ai}`,
          `📊 Przeciwnik ma ${enemy.deck.length + enemy.hand.length} kart`,
          enemy.startsFirst ? `⚡ ${enemy.name} zaczyna pierwszy!` : `🛡️ Ty zaczynasz pierwszy!`
        ],
      },
      
      cards: {
        hand: initialHand,
        deck: remainingDeck,
        discardPile: [],
        battlefield: [],
      },
      
      enemy,
    });

    // Set initial notification in UI store
    uiStore.getState().setNotification({ 
      message: enemy.startsFirst ? `🎮 Nowa gra! ${enemy.name} zaczyna!` : "🎮 Nowa gra rozpoczęta!", 
      type: "success"
    });

    // If enemy starts first, use the timeline manager to schedule it
    if (enemy.startsFirst) {
      GameTimeline.scheduleAttack(() => get().enemyTurn());
    }
  },

  canPlayCard: (card: Card) => {
    const state = get();
    return state.player.energy >= card.cost && state.game.phase === "main";
  },

  playCard: (card: Card) => {
    const state = get();
    if (!get().canPlayCard(card)) {
      uiStore.getState().setNotification({ message: "❌ Nie można zagrać tej karty!", type: "error" });
      return;
    }

    const updates = CardService.playCard(state, card);
    set(state => ({ ...state, ...updates }));

    // Special effects using the timeline manager
    if (card.name === SPELL_NAMES.POLISH.MOBILIZATION) {
      GameTimeline.scheduleAttack(() => get().drawCard(GAME_SETTINGS.MOBILIZATION_CARDS_DRAWN));
    }
    
    if (card.keywords?.includes(CARD_KEYWORDS.SCOUT)) {
      GameTimeline.scheduleAttack(() => get().drawCard(1));
    }
  },

  drawCard: (count = 1) => {
    const state = get();
    const updates = CardService.drawCards(state, count);
    set(state => ({ ...state, ...updates }));
  },

  selectAttackTarget: (attacker: Card) => {
    const state = get();
    if (!GameMechanics.canCardAttack(attacker) || !state.enemy) return;

    const possibleTargets = GameMechanics.getPossibleTargets(attacker, state.enemy.battlefield);

    set(state => ({
      ...state,
      game: { ...state.game, phase: "selectTarget" }
    }));

    uiStore.getState().setPendingAction({
      type: "selectAttackTarget",
      attacker,
      possibleTargets,
      damage: GameMechanics.calculateCardAttack(attacker, state.cards.battlefield)
    });
    
    uiStore.getState().setSelectedCard(attacker);
  },

  executeAttack: (attacker: Card, target: Card | "enemy") => {
    const state = get();
    const pendingAction = uiStore.getState().pendingAction;
    if (!pendingAction || !state.enemy) return;

    const damage = GameMechanics.calculateCardAttack(attacker, state.cards.battlefield);

    set(state => {
      const newState = { ...state };
      
      // Mark attacker as used
      newState.cards.battlefield = newState.cards.battlefield.map(card => 
        card.instanceId === attacker.instanceId ? { ...card, used: true } : card
      );

      if (target === "enemy") {
        // Attack on enemy
        newState.enemy!.currentHp = Math.max(0, newState.enemy!.currentHp - damage);
        newState.game.eventLog = [
          `⚔️ ${attacker.name} atakuje ${newState.enemy!.name} za ${damage} obrażeń!`,
          ...newState.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
        ];
      } else {
        // Attack on card
        const targetCurrentHP = target.currentHP || target.defense;
        const newHP = Math.max(0, targetCurrentHP - damage);
        
        // IMPORTANT CHANGE: We always keep the card on the battlefield, even if destroyed (HP = 0)
        newState.enemy!.battlefield = newState.enemy!.battlefield.map(card =>
          card.instanceId === target.instanceId ? { ...card, currentHP: newHP } : card
        );
        
        if (newHP > 0) {
          newState.game.eventLog = [
            `⚔️ ${attacker.name} atakuje ${target.name} za ${damage} obrażeń! (${newHP}/${target.maxHP || target.defense} HP)`,
            ...newState.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        } else {
          newState.game.eventLog = [
            `💀 ${target.name} pada pod atakiem ${attacker.name}!`,
            ...newState.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        }
      }

      // Reset game phase
      newState.game.phase = "main";

      return newState;
    });

    // Reset UI
    uiStore.getState().setPendingAction(null);
    uiStore.getState().setSelectedCard(null);
  },

  cancelTargetSelection: () => {
    set(state => ({
      ...state,
      game: { ...state.game, phase: "main" }
    }));
    
    // Reset UI
    uiStore.getState().setPendingAction(null);
    uiStore.getState().setSelectedCard(null);
  },

  endTurn: () => {
    const state = get();
    
    // Check victory/defeat conditions
    if (state.enemy && state.enemy.currentHp <= 0) {
      get().handleVictory();
      return;
    }
    
    if (state.player.hp <= 0) {
      get().handleDefeat();
      return;
    }
    
    // Reset player's battlefield
    set(state => ({
      ...state,
      cards: {
        ...state.cards,
        battlefield: state.cards.battlefield.map(card => ({
          ...card,
          canAttack: true,
          used: false,
          bonusDefense: card.keywords?.includes(CARD_KEYWORDS.DEFENSE) ? card.bonusDefense : 0,
          bonusAttack: 0
        }))
      },
      player: { ...state.player, energy: state.player.maxEnergy },
      game: { ...state.game, turn: state.game.turn + 1 }
    }));

    // Schedule enemy turn with timeline manager
    GameTimeline.scheduleAttack(() => get().enemyTurn());
    get().drawCard(1);
  },

  enemyTurn: () => {
    // Cancel any pending actions when enemy turn starts
    GameTimeline.cancelAllActions();
    
    set(state => ({
      ...state,
      game: { ...state.game, phase: "enemyTurn" },
      enemy: state.enemy ? {
        ...state.enemy,
        energy: state.enemy.maxEnergy,
        battlefield: state.enemy.battlefield.map(card => ({
          ...card,
          canAttack: true,
          used: false
        }))
      } : null
    }));

    // Execute enemy turn logic
    GameTimeline.scheduleAttack(() => {
      const state = get();
      if (!state.enemy) return;

      // Draw card
      if (state.enemy.hand.length < GAME_SETTINGS.MAX_HAND_SIZE && state.enemy.deck.length > 0) {
        const card = state.enemy.deck[0];
        set(state => ({
          ...state,
          enemy: {
            ...state.enemy!,
            hand: [...state.enemy!.hand, card],
            deck: state.enemy!.deck.slice(1)
          },
          game: {
            ...state.game,
            eventLog: [
              `🎴 ${state.enemy!.name} dobiera kartę`,
              ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
            ]
          }
        }));
      }

      // Play cards
      const maxCards = Math.floor(Math.random() * AI_SETTINGS.MAX_CARDS_PER_TURN) + 1;
      let cardsPlayed = 0;
      
      const playNextCard = () => {
        const currentState = get();
        if (!currentState.enemy || cardsPlayed >= maxCards) {
          startAttackPhase();
          return;
        }

        const cardToPlay = EnemyService.chooseCardToPlay(currentState.enemy);
        if (!cardToPlay) {
          startAttackPhase();
          return;
        }

        set(state => {
          const newEnemy = { ...state.enemy! };
          newEnemy.hand = newEnemy.hand.filter(c => c.instanceId !== cardToPlay.instanceId);
          newEnemy.energy -= cardToPlay.cost;

          if (cardToPlay.type === "spell") {
            newEnemy.discardPile = [...newEnemy.discardPile, cardToPlay];
          } else {
            const cardWithHP = GameMechanics.initializeCardHP(cardToPlay);
            newEnemy.battlefield = GameMechanics.applyLeadershipEffects([
              ...newEnemy.battlefield, 
              cardWithHP
            ]);
          }

          return {
            ...state,
            enemy: newEnemy,
            game: {
              ...state.game,
              eventLog: [
                `🤖 ${newEnemy.name} gra ${cardToPlay.name}`,
                ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
              ]
            }
          };
        });

        cardsPlayed++;
        GameTimeline.scheduleAttack(playNextCard);
      };

      const startAttackPhase = () => {
        const currentState = get();
        if (!currentState.enemy) return;

        const attackers = currentState.enemy.battlefield.filter(card => 
          GameMechanics.canCardAttack(card)
        );

        let attackIndex = 0;
        
        const executeNextAttack = () => {
          if (attackIndex >= attackers.length) {
            // End enemy turn
            set(state => ({ ...state, game: { ...state.game, phase: "main" } }));
            return;
          }

          const attacker = attackers[attackIndex];
          const currentState = get();
          const target = EnemyService.chooseAttackTarget(currentState.cards.battlefield);

          // Update UI to show attacking card
          uiStore.getState().setAttackingCard(attacker);

          if (target) {
            // Update UI to show target card
            uiStore.getState().setTargetCard(target);
            
            // Use timeline for attack animation
            GameTimeline.scheduleAttack(() => {
              // Attack on player's card
              const damage = GameMechanics.calculateCardAttack(attacker, currentState.enemy!.battlefield);
              const targetCurrentHP = target.currentHP || target.defense;
              const newHP = Math.max(0, targetCurrentHP - damage);

              set(state => {
                // IMPORTANT: Keep cards on battlefield even when destroyed
                return {
                  ...state,
                  cards: {
                    ...state.cards,
                    battlefield: state.cards.battlefield.map(card =>
                      card.instanceId === target.instanceId 
                        ? { ...card, currentHP: newHP }
                        : card
                    )
                  },
                  game: {
                    ...state.game,
                    eventLog: newHP > 0
                      ? [
                          `⚔️ ${attacker.name} atakuje ${target.name} za ${damage} obrażeń! (${newHP}/${target.maxHP || target.defense} HP)`,
                          ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
                        ]
                      : [
                          `💀 ${target.name} pada pod atakiem ${attacker.name}!`,
                          ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
                        ]
                  }
                };
              });
              
              // Clear UI indicators
              uiStore.getState().setAttackingCard(null);
              uiStore.getState().setTargetCard(null);
              
              // Mark attacker as used
              set(state => ({
                ...state,
                enemy: {
                  ...state.enemy!,
                  battlefield: state.enemy!.battlefield.map(card =>
                    card.instanceId === attacker.instanceId ? { ...card, used: true } : card
                  )
                }
              }));

              attackIndex++;
              executeNextAttack();
            });
          } else {
            // Attack on player
            // Set target as "player"
            uiStore.getState().setTargetCard("player");
            
            // Use timeline for attack animation
            GameTimeline.scheduleAttack(() => {
              const damage = GameMechanics.calculateCardAttack(attacker, currentState.enemy!.battlefield);
              set(state => ({
                ...state,
                player: { ...state.player, hp: Math.max(0, state.player.hp - damage) },
                game: {
                  ...state.game,
                  eventLog: [
                    `💔 ${attacker.name} zadaje ci ${damage} obrażeń!`,
                    ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
                  ]
                }
              }));
              
              // Clear UI indicators
              uiStore.getState().setAttackingCard(null);
              uiStore.getState().setTargetCard(null);

              // Mark attacker as used
              set(state => ({
                ...state,
                enemy: {
                  ...state.enemy!,
                  battlefield: state.enemy!.battlefield.map(card =>
                    card.instanceId === attacker.instanceId ? { ...card, used: true } : card
                  )
                }
              }));

              attackIndex++;
              executeNextAttack();
            });
          }
        };

        if (attackers.length > 0) {
          executeNextAttack();
        } else {
          set(state => ({ ...state, game: { ...state.game, phase: "main" } }));
        }
      };

      // Start the chain of actions
      playNextCard();
    });
  },

  handleVictory: () => {
    const state = get();
    const enemy = state.enemy;
    const rewards = enemy?.rewards || { gold: 15, cards: 1 };

    set(state => ({
      ...state,
      game: {
        ...state.game,
        phase: "victory",
        eventLog: [
          `🏆 ZWYCIĘSTWO nad ${enemy?.name}!`,
          `💰 Zdobyto: ${rewards.gold} złota, ${rewards.cards} kart`,
          ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 2)
        ]
      },
      cards: {
        ...state.cards,
        discardPile: [...state.cards.discardPile, ...state.cards.battlefield],
        battlefield: []
      }
    }));

    // Prepare next enemy
    GameTimeline.scheduleAttack(() => {
      const currentState = get();
      const currentEnemyId = currentState.enemy?.id || 1;
      const nextEnemyIndex = ENEMY_SCENARIOS.findIndex(e => e.id === currentEnemyId + 1);
      
      const nextEnemyTemplate = nextEnemyIndex !== -1 
        ? ENEMY_SCENARIOS[nextEnemyIndex] as unknown as EnemyTemplate
        : ENEMY_SCENARIOS[0] as unknown as EnemyTemplate;
      
      const nextEnemy = EnemyService.createEnemy(nextEnemyTemplate);
      
      // Draw rewards
      get().drawCard(rewards.cards);
      
      set(state => ({
        ...state,
        enemy: nextEnemy,
        game: {
          ...state.game,
          phase: "main",
          eventLog: [
            `⚔️ Nowy scenariusz: ${nextEnemy.name}!`,
            `🤖 Styl AI: ${nextEnemy.ai}`,
            `📊 Ma ${nextEnemy.deck.length + nextEnemy.hand.length} kart`,
            nextEnemy.startsFirst ? `⚡ ${nextEnemy.name} zaczyna pierwszy!` : `🛡️ Ty zaczynasz pierwszy!`,
            ...state.game.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 4)
          ]
        },
        player: { ...state.player, energy: state.player.maxEnergy }
      }));

      // If new enemy starts first
      if (nextEnemy.startsFirst) {
        GameTimeline.scheduleAttack(() => get().enemyTurn());
      }
    });
  },

  handleDefeat: () => {
    // Cancel all pending actions on defeat
    GameTimeline.cancelAllActions();
    
    set(state => ({
      ...state,
      game: { ...state.game, phase: "defeat" }
    }));
  }
}));