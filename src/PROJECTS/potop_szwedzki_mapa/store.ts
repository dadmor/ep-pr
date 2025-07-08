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
} from "./gameConstants";

// === TYPY PODSTAWOWE ===
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
  deckComposition: { cardId: number; count: number; }[];
  ai: "aggressive" | "defensive" | "balanced";
  startsFirst: boolean; // Nowe pole - czy przeciwnik zaczyna
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
  startsFirst: boolean; // Dodajemy również do Enemy
}

export interface Notification {
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface PendingAction {
  type: "selectAttackTarget" | "selectSpellTarget";
  attacker?: Card;
  possibleTargets: Card[];
  damage?: number;
}

export interface GameState {
  // Stan gracza
  morale: number;
  gold: number;
  turn: number;
  playerHp: number;
  maxPlayerHp: number;
  
  // Karty gracza
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  battlefield: Card[];
  
  // Wróg z kartami
  currentEnemy: Enemy | null;
  
  // System energii
  energy: number;
  maxEnergy: number;
  
  // Fazy gry
  gamePhase: "main" | "combat" | "selectTarget" | "enemyTurn" | "victory" | "defeat";
  eventLog: string[];
  notification: Notification | null;
  nextId: number;

  // System wyboru celów
  pendingAction: PendingAction | null;
  selectedCard: Card | null;

  // Dane gry
  polishCards: Card[];
  swedishCards: Card[];
  swedishEnemies: EnemyTemplate[];

  // Tracking
  cardsPlayedThisTurn: Card[];
  enemyTurnCount: number;

  // === AKCJE ===
  createCardInstance: (card: Card) => Card;
  initializeGame: () => void;
  drawCard: (count?: number) => void;
  canPlayCard: (card: Card) => boolean;
  playCard: (card: Card) => void;
  
  selectAttackTarget: (attacker: Card) => void;
  executeAttack: (attacker: Card, target: Card | "enemy") => void;
  cancelTargetSelection: () => void;
  
  enemyTurn: () => void;
  endTurn: () => void;
  handleVictory: () => void;
  setNotification: (notification: Notification | null) => void;
  
  enemyDrawCard: (count?: number) => void;
  enemyPlayCard: () => void;
  createEnemyDeck: (enemyTemplate: EnemyTemplate) => Card[];
  createEnemy: (enemyTemplate: EnemyTemplate) => Enemy;
}

// === MECHANIKI GIER ===
class GameMechanics {
  static initializeCardHP(card: Card): Card {
    if (card.type === "unit" || card.type === "hero" || card.type === "fortification") {
      return {
        ...card,
        currentHP: card.defense,
        maxHP: card.defense,
        canAttack: true,        // ← ZMIANA: true zamiast false
        summoned: true,
        used: false             // ← DODANE: upewniamy się że karta nie jest używana
      };
    }
    return {
      ...card,
      canAttack: true           // ← ZMIANA: true zamiast false
    };
  }

  static calculateCardAttack(card: Card, battlefield: Card[]): number {
    let attack = card.attack + (card.bonusAttack || 0);
    
    // Rójka - za każdego innego Partyzanta na polu
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

  static damageCard(card: Card, damage: number): Card {
    const currentHP = (card.currentHP || card.defense) - damage;
    return {
      ...card,
      currentHP: Math.max(0, currentHP)
    };
  }

  static isCardAlive(card: Card): boolean {
    if (card.type === "unit" || card.type === "hero" || card.type === "fortification") {
      return (card.currentHP || card.defense) > 0;
    }
    return true;
  }

  static calculateCardDefense(card: Card): number {
    return (card.currentHP || card.defense) + (card.bonusDefense || 0);
  }

  static getPossibleTargets(attacker: Card, enemyBattlefield: Card[], canTargetEnemy: boolean = true): Card[] {
    const targets: Card[] = [];
    
    enemyBattlefield.forEach(card => {
      if (this.isCardAlive(card)) {
        targets.push(card);
      }
    });
    
    return targets;
  }

  static applyLeadershipEffects(battlefield: Card[]): Card[] {
    const leaders = battlefield.filter(c => c.keywords?.includes(CARD_KEYWORDS.LEADERSHIP));
    if (leaders.length === 0) return battlefield;
    
    return battlefield.map(card => {
      if (card.keywords?.includes(CARD_KEYWORDS.LEADERSHIP)) return card;
      
      // Sprawdź czy to Król Karol X (bonus +2/+2)
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
        bonusDefense: (card.bonusDefense || 0) + eliteLeaders.length * KEYWORDS_EFFECTS.ELITE_LEADERSHIP_BONUS.defense + regularLeaders.length * KEYWORDS_EFFECTS.LEADERSHIP_BONUS.defense
      };
    });
  }

  static chooseEnemyCardToPlay(enemy: Enemy, playerBattlefield: Card[]): Card | null {
    const playableCards = enemy.hand.filter(card => card.cost <= enemy.energy);
    if (playableCards.length === 0) return null;
    
    switch (enemy.ai) {
      case "aggressive":
        return playableCards.reduce((best, current) => 
          current.attack > best.attack ? current : best
        );
      
      case "defensive":
        const defensiveCards = playableCards.filter(c => 
          c.type === "fortification" || c.keywords?.includes(CARD_KEYWORDS.DEFENSE)
        );
        if (defensiveCards.length > 0) {
          return defensiveCards[0];
        }
        return playableCards[0];
      
      case "balanced":
      default:
        return playableCards.reduce((best, current) => {
          const currentValue = (current.attack + current.defense) / current.cost;
          const bestValue = (best.attack + best.defense) / best.cost;
          return currentValue > bestValue ? current : best;
        });
    }
  }

  static chooseAttackTarget(battlefield: Card[]): Card | null {
    const aliveTargets = battlefield.filter(card => this.isCardAlive(card));
    if (aliveTargets.length === 0) return null;
    
    const heroes = aliveTargets.filter(c => c.type === "hero");
    if (heroes.length > 0) {
      return heroes.reduce((weakest, current) => 
        (current.currentHP || current.defense) < (weakest.currentHP || weakest.defense) ? current : weakest
      );
    }
    
    const fortifications = aliveTargets.filter(c => c.type === "fortification");
    if (fortifications.length > 0) {
      return fortifications.reduce((weakest, current) => 
        (current.currentHP || current.defense) < (weakest.currentHP || weakest.defense) ? current : weakest
      );
    }
    
    const units = aliveTargets.filter(c => c.type === "unit");
    if (units.length > 0) {
      return units.reduce((weakest, current) => 
        (current.currentHP || current.defense) < (weakest.currentHP || weakest.defense) ? current : weakest
      );
    }
    
    return null;
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  // === STAN POCZĄTKOWY (używając stałych) ===
  morale: GAME_SETTINGS.INITIAL_MORALE,
  gold: GAME_SETTINGS.INITIAL_GOLD,
  turn: 1,
  playerHp: GAME_SETTINGS.INITIAL_PLAYER_HP,
  maxPlayerHp: GAME_SETTINGS.INITIAL_PLAYER_HP,
  hand: [],
  deck: [],
  discardPile: [],
  battlefield: [],
  currentEnemy: null,
  energy: GAME_SETTINGS.INITIAL_ENERGY,
  maxEnergy: GAME_SETTINGS.MAX_ENERGY,
  gamePhase: "main",
  eventLog: [...INITIAL_EVENT_LOG],
  notification: null,
  nextId: 0,
  cardsPlayedThisTurn: [],
  enemyTurnCount: 0,
  pendingAction: null,
  selectedCard: null,

  // Dane kart (używając stałych)
  polishCards: POLISH_CARDS_DATA as Card[],
  swedishCards: SWEDISH_CARDS_DATA as Card[],
  swedishEnemies: ENEMY_SCENARIOS as EnemyTemplate[],

  // === IMPLEMENTACJA AKCJI ===
  
  createCardInstance: (card: Card): Card => {
    const state = get();
    const instance = GameMechanics.initializeCardHP({ 
      ...card, 
      instanceId: state.nextId,
      bonusAttack: 0,
      bonusDefense: 0
    });
    set(prevState => ({ nextId: prevState.nextId + 1 }));
    return instance;
  },

  createEnemyDeck: (enemyTemplate: EnemyTemplate): Card[] => {
    const state = get();
    const deck: Card[] = [];
    
    enemyTemplate.deckComposition.forEach(({ cardId, count }) => {
      const baseCard = state.swedishCards.find(c => c.id === cardId);
      if (baseCard) {
        for (let i = 0; i < count; i++) {
          deck.push(state.createCardInstance(baseCard));
        }
      }
    });
    
    return deck.sort(() => Math.random() - 0.5);
  },

  createEnemy: (enemyTemplate: EnemyTemplate): Enemy => {
    const state = get();
    const enemyDeck = state.createEnemyDeck(enemyTemplate);
    const enemyHand = enemyDeck.slice(0, GAME_SETTINGS.ENEMY_INITIAL_HAND_SIZE);
    const enemyRemainingDeck = enemyDeck.slice(GAME_SETTINGS.ENEMY_INITIAL_HAND_SIZE);
    
    return {
      id: enemyTemplate.id,
      name: enemyTemplate.name,
      hp: enemyTemplate.hp,
      maxHp: enemyTemplate.hp,
      description: enemyTemplate.description,
      rewards: enemyTemplate.rewards,
      currentHp: enemyTemplate.hp,
      hand: enemyHand,
      deck: enemyRemainingDeck,
      battlefield: [],
      discardPile: [],
      energy: GAME_SETTINGS.ENEMY_INITIAL_ENERGY,
      maxEnergy: GAME_SETTINGS.ENEMY_MAX_ENERGY,
      ai: enemyTemplate.ai,
      startsFirst: enemyTemplate.startsFirst // Przepisujemy informację o pierwszym ruchu
    };
  },

  setNotification: (notification: Notification | null) => {
    set({ notification });
    if (notification) {
      setTimeout(() => {
        set(prevState => ({ ...prevState, notification: null }));
      }, GAME_SETTINGS.NOTIFICATION_TIMEOUT);
    }
  },

  selectAttackTarget: (attacker: Card) => {
    const state = get();
    if (!GameMechanics.canCardAttack(attacker) || !state.currentEnemy) {
      return;
    }

    const possibleTargets = GameMechanics.getPossibleTargets(
      attacker, 
      state.currentEnemy.battlefield, 
      true
    );

    set({
      gamePhase: "selectTarget",
      pendingAction: {
        type: "selectAttackTarget",
        attacker,
        possibleTargets,
        damage: GameMechanics.calculateCardAttack(attacker, state.battlefield)
      },
      selectedCard: attacker
    });
  },

  executeAttack: (attacker: Card, target: Card | "enemy") => {
    set(prevState => {
      if (!prevState.pendingAction || !prevState.currentEnemy) {
        return prevState;
      }

      const damage = GameMechanics.calculateCardAttack(attacker, prevState.battlefield);
      let newState = { ...prevState };

      newState.battlefield = newState.battlefield.map(card => 
        card.instanceId === attacker.instanceId 
          ? { ...card, used: true }
          : card
      );

      if (target === "enemy") {
        // Atak na przeciwnika
        newState.currentEnemy = {
          ...newState.currentEnemy,
          currentHp: Math.max(0, newState.currentEnemy.currentHp - damage)
        };
        newState.eventLog = [
          `⚔️ ${attacker.name} atakuje ${newState.currentEnemy.name} za ${damage} obrażeń!`,
          ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
        ];
      } else {
        // Atak na jednostkę wroga
        const targetCurrentHP = target.currentHP || target.defense;
        const newHP = Math.max(0, targetCurrentHP - damage);
        
        if (newHP > 0) {
          newState.currentEnemy.battlefield = newState.currentEnemy.battlefield.map(card =>
            card.instanceId === target.instanceId 
              ? { ...card, currentHP: newHP }
              : card
          );
          newState.eventLog = [
            `⚔️ ${attacker.name} atakuje ${target.name} za ${damage} obrażeń! (${newHP}/${target.maxHP || target.defense} HP)`,
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        } else {
          newState.currentEnemy.battlefield = newState.currentEnemy.battlefield.filter(card =>
            card.instanceId !== target.instanceId
          );
          newState.currentEnemy.discardPile = [...newState.currentEnemy.discardPile, target];
          newState.eventLog = [
            `💀 ${target.name} pada pod atakiem ${attacker.name}!`,
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        }
      }

      newState.pendingAction = null;
      newState.selectedCard = null;
      newState.gamePhase = "main";

      return newState;
    });
  },

  cancelTargetSelection: () => {
    set({
      pendingAction: null,
      selectedCard: null,
      gamePhase: "main"
    });
  },

  initializeGame: () => {
    set(prevState => {
      const initialDeck: Card[] = [];
      prevState.polishCards.forEach(card => {
        for (let i = 0; i < GAME_SETTINGS.CARDS_PER_DECK_TYPE; i++) {
          initialDeck.push(prevState.createCardInstance(card));
        }
      });
  
      const shuffledDeck = initialDeck.sort(() => Math.random() - 0.5);
      const initialHand = shuffledDeck.slice(0, GAME_SETTINGS.INITIAL_HAND_SIZE);
      const remainingDeck = shuffledDeck.slice(GAME_SETTINGS.INITIAL_HAND_SIZE);
      
      const enemyTemplate = prevState.swedishEnemies[0];
      const enemy = prevState.createEnemy(enemyTemplate);
  
      const newState = {
        ...prevState,
        morale: GAME_SETTINGS.INITIAL_MORALE,
        gold: GAME_SETTINGS.INITIAL_GOLD,
        turn: 1,
        playerHp: GAME_SETTINGS.INITIAL_PLAYER_HP,
        hand: initialHand,
        deck: remainingDeck,
        discardPile: [],
        battlefield: [],
        currentEnemy: enemy,
        energy: GAME_SETTINGS.INITIAL_ENERGY,
        gamePhase: "main" as const,
        eventLog: [
          ...INITIAL_EVENT_LOG,
          `🎯 Scenariusz: ${enemy.name} (${enemy.hp} HP)`,
          `🤖 Styl AI: ${enemy.ai}`,
          `📊 Przeciwnik ma ${enemy.deck.length + enemy.hand.length} kart`,
          enemy.startsFirst 
            ? `⚡ ${enemy.name} zaczyna pierwszy!` 
            : `🛡️ Ty zaczynasz pierwszy!`
        ],
        nextId: initialDeck.length + enemy.deck.length + enemy.hand.length,
        cardsPlayedThisTurn: [],
        enemyTurnCount: 0,
        pendingAction: null,
        selectedCard: null,
        notification: { 
          message: enemy.startsFirst 
            ? `🎮 Nowa gra! ${enemy.name} zaczyna!` 
            : "🎮 Nowa gra rozpoczęta!", 
          type: "success" as const 
        }
      };
  
      return newState;
    });
  
    // Sprawdź czy przeciwnik zaczyna pierwszy
    setTimeout(() => {
      const state = get();
      if (state.currentEnemy?.startsFirst) {
        // Przeciwnik zaczyna - uruchom jego turę
        state.enemyTurn();
      }
    }, AI_SETTINGS.TURN_START_DELAY);
  },
  

  handleVictory: () => {
    set(prevState => {
      const enemy = prevState.currentEnemy;
      const rewards = enemy?.rewards || { gold: 15, cards: 1 };
  
      const newState = {
        ...prevState,
        gamePhase: "victory" as const,
        gold: prevState.gold + rewards.gold,
        morale: Math.min(100, prevState.morale + GAME_SETTINGS.VICTORY_MORALE_BONUS),
        discardPile: [...prevState.discardPile, ...prevState.battlefield],
        battlefield: [],
        eventLog: [
          `🏆 ZWYCIĘSTWO nad ${enemy?.name}!`,
          `💰 Zdobyto: ${rewards.gold} złota, ${rewards.cards} kart`,
          ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 2)
        ]
      };
  
      return newState;
    });
  
    setTimeout(() => {
      const currentState = get();
      const enemy = currentState.currentEnemy;
      const currentEnemyId = enemy?.id || 1;
      const nextEnemyIndex = currentState.swedishEnemies.findIndex(e => e.id === currentEnemyId + 1);
      
      const nextEnemyTemplate = nextEnemyIndex !== -1 
        ? currentState.swedishEnemies[nextEnemyIndex]
        : currentState.swedishEnemies[0];
      
      const nextEnemy = currentState.createEnemy(nextEnemyTemplate);
      
      set(prevState => ({
        ...prevState,
        currentEnemy: nextEnemy,
        gamePhase: "main",
        energy: prevState.maxEnergy,
        cardsPlayedThisTurn: [],
        eventLog: [
          `⚔️ Nowy scenariusz: ${nextEnemy.name}!`,
          `🤖 Styl AI: ${nextEnemy.ai}`,
          `📊 Ma ${nextEnemy.deck.length + nextEnemy.hand.length} kart`,
          nextEnemy.startsFirst 
            ? `⚡ ${nextEnemy.name} zaczyna pierwszy!` 
            : `🛡️ Ty zaczynasz pierwszy!`,
          ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 4)
        ]
      }));
      
      const stateAfterEnemySet = get();
      stateAfterEnemySet.drawCard(enemy?.rewards.cards || 1);
  
      // Sprawdź czy nowy przeciwnik zaczyna pierwszy
      if (nextEnemy.startsFirst) {
        setTimeout(() => {
          const finalState = get();
          finalState.enemyTurn();
        }, AI_SETTINGS.TURN_START_DELAY);
      }
    }, AI_SETTINGS.TURN_START_DELAY);
  },

  drawCard: (count: number = 1) => {
    set(prevState => {
      let newState = { ...prevState };
      let deck = [...newState.deck];
      let discard = [...newState.discardPile];
      let hand = [...newState.hand];

      for (let i = 0; i < count; i++) {
        if (hand.length >= GAME_SETTINGS.MAX_HAND_SIZE) break;
        
        if (deck.length === 0) {
          if (discard.length === 0) break;
          deck = discard.sort(() => Math.random() - 0.5);
          discard = [];
          newState.eventLog = [
            "🔄 Talia przetasowana!", 
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        }
        
        const card = deck.shift();
        if (card) hand.push(card);
      }
      
      return { ...newState, hand, deck, discardPile: discard };
    });
  },

  enemyDrawCard: (count: number = 1) => {
    set(prevState => {
      if (!prevState.currentEnemy) return prevState;
      
      let enemy = { ...prevState.currentEnemy };
      let deck = [...enemy.deck];
      let discard = [...enemy.discardPile];
      let hand = [...enemy.hand];

      for (let i = 0; i < count; i++) {
        if (hand.length >= GAME_SETTINGS.MAX_HAND_SIZE) break;
        
        if (deck.length === 0) {
          if (discard.length === 0) break;
          deck = discard.sort(() => Math.random() - 0.5);
          discard = [];
        }
        
        const card = deck.shift();
        if (card) hand.push(card);
      }
      
      enemy.hand = hand;
      enemy.deck = deck;
      enemy.discardPile = discard;
      
      return { 
        ...prevState, 
        currentEnemy: enemy,
        eventLog: [
          `🎴 Przeciwnik dobiera ${count} kart`, 
          ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
        ]
      };
    });
  },

  canPlayCard: (card: Card): boolean => {
    const state = get();
    return state.energy >= card.cost && state.gamePhase === "main";
  },

  playCard: (card: Card) => {
    set(prevState => {
      if (prevState.energy < card.cost || prevState.gamePhase !== "main") {
        return {
          ...prevState,
          notification: { message: "❌ Nie można zagrać tej karty!", type: "error" }
        };
      }

      let newState = { ...prevState };
      
      newState.hand = newState.hand.filter(c => c.instanceId !== card.instanceId);
      newState.energy -= card.cost;
      newState.cardsPlayedThisTurn = [...newState.cardsPlayedThisTurn, card];
      
      if (card.type === "spell") {
        newState.discardPile = [...newState.discardPile, card];
        
        if (card.name === SPELL_NAMES.POLISH.MOBILIZATION) {
          newState.eventLog = [
            "📜 Mobilizacja - dobierasz 2 karty!", 
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
          setTimeout(() => get().drawCard(GAME_SETTINGS.MOBILIZATION_CARDS_DRAWN), AI_SETTINGS.TURN_START_DELAY);
          
        } else if (card.name === SPELL_NAMES.POLISH.DEFENSE_OF_WARSAW) {
          newState.battlefield = newState.battlefield.map(unit => ({
            ...unit,
            bonusDefense: (unit.bonusDefense || 0) + GAME_SETTINGS.DEFENSE_WARSAW_DEFENSE_BONUS
          }));
          newState.eventLog = [
            "🛡️ Obrona Warszawy - wszystkie jednostki +0/+2!", 
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        }
        
      } else {
        const cardWithHP = GameMechanics.initializeCardHP(card);
        newState.battlefield = [...newState.battlefield, cardWithHP];
        
        if (card.keywords?.includes(CARD_KEYWORDS.SCOUT)) {
          newState.eventLog = [
            `🔍 ${card.name} - Zwiad! Dobierasz kartę`, 
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
          setTimeout(() => get().drawCard(1), AI_SETTINGS.TURN_START_DELAY);
        }
        
        if (card.keywords?.includes(CARD_KEYWORDS.WEALTH)) {
          newState.gold += GAME_SETTINGS.WEALTH_GOLD_BONUS;
          newState.eventLog = [
            `💰 ${card.name} - Bogactwo! +1 złoto`, 
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        }
        
        newState.battlefield = GameMechanics.applyLeadershipEffects(newState.battlefield);
        newState.eventLog = [
          `🎯 ${card.name} wchodzi na pole bitwy!`, 
          ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
        ];
      }
      
      return newState;
    });
  },

  enemyPlayCard: () => {
    set(prevState => {
      if (!prevState.currentEnemy) return prevState;
      
      const enemy = prevState.currentEnemy;
      const cardToPlay = GameMechanics.chooseEnemyCardToPlay(enemy, prevState.battlefield);
      
      if (!cardToPlay) {
        return {
          ...prevState,
          eventLog: [
            `🤖 ${enemy.name} nie może zagrać żadnej karty`, 
            ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ]
        };
      }
      
      let newEnemy: Enemy = { ...enemy };
      
      newEnemy.hand = newEnemy.hand.filter(c => c.instanceId !== cardToPlay.instanceId);
      newEnemy.energy -= cardToPlay.cost;
      
      let newState = { ...prevState, currentEnemy: newEnemy };
      
      if (cardToPlay.type === "spell") {
        newEnemy.discardPile = [...newEnemy.discardPile, cardToPlay];
        
        if (cardToPlay.name === SPELL_NAMES.SWEDISH.MOBILIZATION) {
          newState.eventLog = [
            `📜 ${enemy.name} używa Mobilizacji`, 
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
          setTimeout(() => get().enemyDrawCard(GAME_SETTINGS.MOBILIZATION_CARDS_DRAWN), AI_SETTINGS.TURN_START_DELAY);
          
        } else if (cardToPlay.name === SPELL_NAMES.SWEDISH.ATTACK) {
          newEnemy.battlefield = newEnemy.battlefield.map(unit => ({
            ...unit,
            bonusAttack: (unit.bonusAttack || 0) + GAME_SETTINGS.SWEDISH_ATTACK_ATTACK_BONUS
          }));
          newState.eventLog = [
            `⚔️ ${enemy.name} używa Szturmowego Ataku!`, 
            ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
          ];
        }
        
      } else {
        const cardWithHP = GameMechanics.initializeCardHP(cardToPlay);
        newEnemy.battlefield = [...newEnemy.battlefield, cardWithHP];
        newEnemy.battlefield = GameMechanics.applyLeadershipEffects(newEnemy.battlefield);
        
        newState.eventLog = [
          `🤖 ${enemy.name} gra ${cardToPlay.name}`, 
          ...newState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
        ];
      }
      
      newState.currentEnemy = newEnemy;
      return newState;
    });
  },

  enemyTurn: () => {
    set(prevState => ({
      ...prevState,
      gamePhase: "enemyTurn",
      eventLog: [
        `🔄 Tura przeciwnika`, 
        ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
      ]
    }));
    
    setTimeout(() => {
      const state = get();
      if (!state.currentEnemy) return;

      set(prevState => ({
        ...prevState,
        currentEnemy: {
          ...prevState.currentEnemy!,
          energy: prevState.currentEnemy!.maxEnergy,
          battlefield: prevState.currentEnemy!.battlefield.map(card => ({
            ...card,
            canAttack: true,
            used: false
          }))
        }
      }));

      get().enemyDrawCard(1);
      
      setTimeout(() => {
        const maxCards = Math.floor(Math.random() * AI_SETTINGS.MAX_CARDS_PER_TURN) + 1;
        let cardsPlayed = 0;
        
        const playNextCard = () => {
          const currentState = get();
          if (!currentState.currentEnemy || cardsPlayed >= maxCards) {
            setTimeout(() => enemyAttackPhase(), AI_SETTINGS.CARD_PLAY_DELAY);
            return;
          }
          
          const canPlay = currentState.currentEnemy.hand.some(card => 
            card.cost <= currentState.currentEnemy!.energy
          );
          
          if (canPlay) {
            currentState.enemyPlayCard();
            cardsPlayed++;
            setTimeout(playNextCard, AI_SETTINGS.CARD_PLAY_DELAY);
          } else {
            setTimeout(() => enemyAttackPhase(), AI_SETTINGS.CARD_PLAY_DELAY);
          }
        };
        
        const enemyAttackPhase = () => {
          const currentState = get();
          if (!currentState.currentEnemy) return;
          
          const attackers = currentState.currentEnemy.battlefield.filter(card => 
            GameMechanics.canCardAttack(card)
          );
          
          let attackIndex = 0;
          const executeNextAttack = () => {
            if (attackIndex >= attackers.length) {
              setTimeout(() => {
                set(prevState => ({
                  ...prevState,
                  gamePhase: "main"
                }));
              }, AI_SETTINGS.TURN_END_DELAY);
              return;
            }
            
            const attacker = attackers[attackIndex];
            const currentGameState = get();
            
            const target = GameMechanics.chooseAttackTarget(currentGameState.battlefield);
            
            if (target) {
              const damage = GameMechanics.calculateCardAttack(attacker, currentGameState.currentEnemy!.battlefield);
              const targetCurrentHP = target.currentHP || target.defense;
              const newHP = Math.max(0, targetCurrentHP - damage);
              
              set(prevState => {
                let newBattlefield = [...prevState.battlefield];
                
                if (newHP > 0) {
                  newBattlefield = newBattlefield.map(card =>
                    card.instanceId === target.instanceId 
                      ? { ...card, currentHP: newHP }
                      : card
                  );
                  return {
                    ...prevState,
                    battlefield: newBattlefield,
                    eventLog: [
                      `⚔️ ${attacker.name} atakuje ${target.name} za ${damage} obrażeń! (${newHP}/${target.maxHP || target.defense} HP)`,
                      ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
                    ]
                  };
                } else {
                  newBattlefield = newBattlefield.filter(card => card.instanceId !== target.instanceId);
                  return {
                    ...prevState,
                    battlefield: newBattlefield,
                    discardPile: [...prevState.discardPile, target],
                    eventLog: [
                      `💀 ${target.name} pada pod atakiem ${attacker.name}!`,
                      ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
                    ]
                  };
                }
              });
            } else {
              const damage = GameMechanics.calculateCardAttack(attacker, currentGameState.currentEnemy!.battlefield);
              set(prevState => ({
                ...prevState,
                playerHp: Math.max(0, prevState.playerHp - damage),
                eventLog: [
                  `💔 ${attacker.name} zadaje ci ${damage} obrażeń!`,
                  ...prevState.eventLog.slice(0, GAME_SETTINGS.EVENT_LOG_MAX_SIZE - 1)
                ]
              }));
            }
            
            set(prevState => ({
              ...prevState,
              currentEnemy: {
                ...prevState.currentEnemy!,
                battlefield: prevState.currentEnemy!.battlefield.map(card =>
                  card.instanceId === attacker.instanceId ? { ...card, used: true } : card
                )
              }
            }));
            
            attackIndex++;
            setTimeout(executeNextAttack, AI_SETTINGS.ATTACK_DELAY);
          };
          
          if (attackers.length > 0) {
            executeNextAttack();
          } else {
            setTimeout(() => {
              set(prevState => ({
                ...prevState,
                gamePhase: "main"
              }));
            }, AI_SETTINGS.TURN_END_DELAY);
          }
        };
        
        playNextCard();
      }, AI_SETTINGS.CARD_PLAY_DELAY);
    }, AI_SETTINGS.TURN_START_DELAY);
  },

  endTurn: () => {
    set(prevState => {
      if (prevState.currentEnemy && prevState.currentEnemy.currentHp <= 0) {
        return { ...prevState, gamePhase: "victory" };
      }
      
      if (prevState.playerHp <= 0) {
        return { ...prevState, gamePhase: "defeat" };
      }
      
      const updatedBattlefield = prevState.battlefield.map(card => ({
        ...card,
        canAttack: true,
        used: false,
        bonusDefense: card.keywords?.includes(CARD_KEYWORDS.DEFENSE) ? card.bonusDefense : 0,
        bonusAttack: 0
      }));
      
      return {
        ...prevState,
        battlefield: updatedBattlefield,
        energy: prevState.maxEnergy,
        turn: prevState.turn + 1,
        cardsPlayedThisTurn: []
      };
    });

    setTimeout(() => {
      const currentState = get();
      if (currentState.gamePhase !== "defeat" && currentState.gamePhase !== "victory") {
        currentState.enemyTurn();
      }
    }, AI_SETTINGS.CARD_PLAY_DELAY);

    setTimeout(() => {
      const currentState = get();
      if (currentState.gamePhase === "main") {
        currentState.drawCard(1);
      }
    }, AI_SETTINGS.CARD_PLAY_DELAY * 2);
  },
}));