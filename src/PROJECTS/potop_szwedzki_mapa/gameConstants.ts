// === GAME CONSTANTS ===

export const GAME_SETTINGS = {
    // Podstawowe wartości gry
    INITIAL_PLAYER_HP: 100,
    INITIAL_MORALE: 100,
    INITIAL_GOLD: 50,
    INITIAL_ENERGY: 3,
    MAX_ENERGY: 5,
    INITIAL_HAND_SIZE: 5,
    MAX_HAND_SIZE: 7,
    ENEMY_INITIAL_ENERGY: 2,
    ENEMY_MAX_ENERGY: 2,
    ENEMY_INITIAL_HAND_SIZE: 4,
    
    // Mechaniki gry
    CARDS_PER_DECK_TYPE: 2, // Ile kopii każdej karty w talii
    NOTIFICATION_TIMEOUT: 3000, // ms
    EVENT_LOG_MAX_SIZE: 10,
    
    // Nagrody za zwycięstwo
    VICTORY_MORALE_BONUS: 20,
    
    // Efekty czarów
    MOBILIZATION_CARDS_DRAWN: 2,
    DEFENSE_WARSAW_DEFENSE_BONUS: 2,
    SWEDISH_ATTACK_ATTACK_BONUS: 2,
    
    // Fortyfikacje
    CZESTOCHOWA_DAMAGE_REDUCTION: 3,
    SWEDISH_FORTIFICATION_DAMAGE_REDUCTION: 2,
    
    // Bogactwo
    WEALTH_GOLD_BONUS: 1,
  } as const;
  
  export const AI_SETTINGS = {
    MAX_CARDS_PER_TURN: 3,
    CARD_PLAY_DELAY: 1000, // ms
    ATTACK_DELAY: 1500, // ms
    TURN_END_DELAY: 1000, // ms
    TURN_START_DELAY: 500, // ms
  } as const;
  
  export const POLISH_CARDS_DATA = [
    {
      id: 1,
      name: "Husaria",
      cost: 4,
      attack: 6,
      defense: 3,
      type: "unit" as const,
      rarity: "legendary" as const,
      description: "Szarża: +50% obrażeń przeciwko wrogom ze słabością",
      keywords: ["Szarża", "Elita"]
    },
    {
      id: 2,
      name: "Partyzanci",
      cost: 2,
      attack: 2,
      defense: 2,
      type: "unit" as const, 
      rarity: "common" as const,
      description: "Rójka: +1 atak za każdego innego Partyzanta na polu",
      keywords: ["Rójka", "Szybkość"]
    },
    {
      id: 3,
      name: "Częstochowa",
      cost: 3,
      attack: 0,
      defense: 8,
      type: "fortification" as const,
      rarity: "rare" as const,
      description: "Obrona: Redukuje obrażenia zadawane graczowi o 3",
      keywords: ["Obrona", "Święte"]
    },
    {
      id: 4,
      name: "Jan Kazimierz",
      cost: 5,
      attack: 4,
      defense: 4,
      type: "hero" as const,
      rarity: "legendary" as const, 
      description: "Dowództwo: Wszystkie inne jednostki +1/+1",
      keywords: ["Dowództwo", "Król"]
    },
    {
      id: 5,
      name: "Kozacy Zaporoscy",
      cost: 3,
      attack: 4,
      defense: 2,
      type: "unit" as const,
      rarity: "uncommon" as const,
      description: "Zwiad: Dobierz kartę gdy wchodzi na pole bitwy",
      keywords: ["Zwiad", "Kawaleria"]
    },
    {
      id: 6,
      name: "Mobilizacja",
      cost: 1,
      attack: 0,
      defense: 0,
      type: "spell" as const,
      rarity: "common" as const,
      description: "Dobierz 2 karty",
      keywords: ["Natychmiastowe"]
    },
    {
      id: 7,
      name: "Obrona Warszawy",
      cost: 2,
      attack: 0,
      defense: 0,
      type: "spell" as const,
      rarity: "uncommon" as const,
      description: "Wszystkie jednostki +0/+2 do końca tury",
      keywords: ["Natychmiastowe", "Taktyka"]
    },
    {
      id: 8,
      name: "Szlachta Polska",
      cost: 2,
      attack: 2,
      defense: 3,
      type: "unit" as const,
      rarity: "common" as const,
      description: "Bogactwo: +1 złoto gdy wchodzi na pole bitwy",
      keywords: ["Bogactwo", "Szlachta"]
    }
  ] as const;
  
  export const SWEDISH_CARDS_DATA = [
    {
      id: 101,
      name: "Szwedzka Piechota",
      cost: 2,
      attack: 3,
      defense: 3,
      type: "unit" as const,
      rarity: "common" as const,
      description: "Podstawowa jednostka piechoty",
      keywords: ["Piechota"]
    },
    {
      id: 102,
      name: "Szwedzka Kawaleria",
      cost: 3,
      attack: 4,
      defense: 1,
      type: "unit" as const,
      rarity: "common" as const,
      description: "Szybka kawaleria",
      keywords: ["Kawaleria", "Szybkość"]
    },
    {
      id: 103,
      name: "Szwedzka Armata",
      cost: 4,
      attack: 5,
      defense: 1,
      type: "unit" as const,
      rarity: "uncommon" as const,
      description: "Potężna armata oblężnicza",
      keywords: ["Artyleria", "Oblężenie"]
    },
    {
      id: 104,
      name: "Szwedzka Fortyfikacja",
      cost: 3,
      attack: 0,
      defense: 6,
      type: "fortification" as const,
      rarity: "uncommon" as const,
      description: "Obrona: Redukuje obrażenia o 2",
      keywords: ["Obrona"]
    },
    {
      id: 105,
      name: "Generał Magnus",
      cost: 5,
      attack: 5,
      defense: 4,
      type: "hero" as const,
      rarity: "rare" as const,
      description: "Dowództwo: Wszystkie jednostki +1/+1",
      keywords: ["Dowództwo", "Generał"]
    },
    {
      id: 106,
      name: "Szwedzka Mobilizacja",
      cost: 2,
      attack: 0,
      defense: 0,
      type: "spell" as const,
      rarity: "common" as const,
      description: "Dobierz 2 karty",
      keywords: ["Natychmiastowe"]
    },
    {
      id: 107,
      name: "Król Karol X",
      cost: 6,
      attack: 6,
      defense: 5,
      type: "hero" as const,
      rarity: "legendary" as const,
      description: "Dowództwo: Wszystkie jednostki +2/+2",
      keywords: ["Dowództwo", "Król", "Elita"]
    },
    {
      id: 108,
      name: "Szwedzki Atak",
      cost: 1,
      attack: 0,
      defense: 0,
      type: "spell" as const,
      rarity: "common" as const,
      description: "Wszystkie jednostki +2/+0 do końca tury",
      keywords: ["Natychmiastowe", "Taktyka"]
    }
  ] as const;
  
// Zaktualizowane ENEMY_SCENARIOS w gameConstants.ts

export const ENEMY_SCENARIOS = [
  {
    id: 1,
    name: "Bitwa pod Ujściem",
    hp: 35,
    description: "1655 - Pierwsze starcie z regularną piechotą szwedzką",
    rewards: { gold: 15, cards: 1 },
    ai: "aggressive" as const,
    startsFirst: true, // Przeciwnik zaczyna
    deckComposition: [
      { cardId: 101, count: 4 }, // Szwedzka Piechota
      { cardId: 102, count: 2 }, // Szwedzka Kawaleria
      { cardId: 106, count: 2 }, // Szwedzka Mobilizacja
      { cardId: 108, count: 2 }  // Szwedzki Atak
    ]
  },
  {
    id: 2,
    name: "Oblężenie Krakowa", 
    hp: 30,
    description: "1655 - Szybki rajd kawalerii szwedzkich huzarów",
    rewards: { gold: 18, cards: 1 },
    ai: "aggressive" as const,
    startsFirst: true, // Przeciwnik zaczyna (szybki atak)
    deckComposition: [
      { cardId: 102, count: 4 }, // Szwedzka Kawaleria
      { cardId: 101, count: 2 }, // Szwedzka Piechota
      { cardId: 108, count: 3 }, // Szwedzki Atak
      { cardId: 106, count: 1 }  // Szwedzka Mobilizacja
    ]
  },
  {
    id: 3,
    name: "Bitwa pod Warszawą",
    hp: 45,
    description: "1656 - Generał Magnus dowodzi zorganizowanym atakiem",
    rewards: { gold: 25, cards: 2 },
    ai: "balanced" as const,
    startsFirst: false, // Gracz zaczyna (planowany atak)
    deckComposition: [
      { cardId: 105, count: 1 }, // Generał Magnus
      { cardId: 101, count: 3 }, // Szwedzka Piechota
      { cardId: 102, count: 2 }, // Szwedzka Kawaleria
      { cardId: 104, count: 2 }, // Szwedzka Fortyfikacja
      { cardId: 106, count: 2 }  // Szwedzka Mobilizacja
    ]
  },
  {
    id: 4,
    name: "Oblężenie Częstochowy",
    hp: 40,
    description: "1655 - Potężne armaty oblężnicze atakują świętą fortecę",
    rewards: { gold: 22, cards: 1 },
    ai: "defensive" as const,
    startsFirst: true, // Przeciwnik zaczyna (pierwsze bombardowanie)
    deckComposition: [
      { cardId: 103, count: 3 }, // Szwedzka Armata
      { cardId: 104, count: 3 }, // Szwedzka Fortyfikacja
      { cardId: 101, count: 2 }, // Szwedzka Piechota
      { cardId: 106, count: 2 }  // Szwedzka Mobilizacja
    ]
  },
  {
    id: 5,
    name: "Finalna Bitwa - Karol X",
    hp: 60,
    description: "1657 - Sam król Szwecji prowadzi ostateczny szturm",
    rewards: { gold: 50, cards: 3 },
    ai: "balanced" as const,
    startsFirst: true, // Przeciwnik zaczyna (królewski atak)
    deckComposition: [
      { cardId: 107, count: 1 }, // Król Karol X
      { cardId: 105, count: 1 }, // Generał Magnus
      { cardId: 101, count: 2 }, // Szwedzka Piechota
      { cardId: 102, count: 2 }, // Szwedzka Kawaleria
      { cardId: 103, count: 2 }, // Szwedzka Armata
      { cardId: 104, count: 2 }, // Szwedzka Fortyfikacja
      { cardId: 106, count: 2 }  // Szwedzka Mobilizacja
    ]
  }
] as const;
  
  export const KEYWORDS_EFFECTS = {
    // Efekty mechanik kart
    LEADERSHIP_BONUS: { attack: 1, defense: 1 },
    ELITE_LEADERSHIP_BONUS: { attack: 2, defense: 2 }, // Dla Karola X
    SWARM_ATTACK_BONUS: 1, // Rójka
    
    // Typy AI
    AI_TYPES: ["aggressive", "defensive", "balanced"] as const,
    
    // Typy kart
    CARD_TYPES: ["unit", "hero", "fortification", "spell"] as const,
    
    // Rzadkości kart
    CARD_RARITIES: ["common", "uncommon", "rare", "legendary"] as const,
    
    // Fazy gry
    GAME_PHASES: ["main", "combat", "selectTarget", "enemyTurn", "victory", "defeat"] as const,
    
    // Typy notyfikacji
    NOTIFICATION_TYPES: ["info", "success", "warning", "error"] as const,
  } as const;
  
  export const INITIAL_EVENT_LOG = [
    "⚔️ Rok 1655. Szwedzi przekroczyli granice Polski. Podczas licznych podbojów dotarli do Częstochowy, świętego miejsca ówczesnej rzeczypospolitej"
  ] as const;
  
  export const SPELL_NAMES = {
    POLISH: {
      MOBILIZATION: "Mobilizacja",
      DEFENSE_OF_WARSAW: "Obrona Warszawy"
    },
    SWEDISH: {
      MOBILIZATION: "Szwedzka Mobilizacja", 
      ATTACK: "Szwedzki Atak"
    }
  } as const;
  
  export const CARD_KEYWORDS = {
    // Słowa kluczowe polskich kart
    CHARGE: "Szarża",
    ELITE: "Elita", 
    SWARM: "Rójka",
    SPEED: "Szybkość",
    DEFENSE: "Obrona",
    HOLY: "Święte",
    LEADERSHIP: "Dowództwo",
    KING: "Król",
    SCOUT: "Zwiad",
    CAVALRY: "Kawaleria",
    INSTANT: "Natychmiastowe",
    TACTICS: "Taktyka",
    WEALTH: "Bogactwo",
    NOBILITY: "Szlachta",
    
    // Słowa kluczowe szwedzkich kart
    INFANTRY: "Piechota",
    ARTILLERY: "Artyleria", 
    SIEGE: "Oblężenie",
    GENERAL: "Generał"
  } as const;