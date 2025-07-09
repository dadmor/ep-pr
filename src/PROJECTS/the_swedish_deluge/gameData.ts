// gameData.ts - Updated with historical context data
import { Card, Scenario, ScenarioHistory } from './types';
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
    faction: "Polish-Lithuanian Commonwealth"
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
    faction: "Polish-Lithuanian Commonwealth"
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
    faction: "Polish-Lithuanian Commonwealth"
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
    faction: "Swedish Empire"
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
    faction: "Swedish Empire"
  },
  // New units with historical flavor
  {
    id: uuidv4(),
    name: "Hussar",
    hp: 12,
    maxHp: 12,
    armor: 1,
    attack: 6,
    cost: 6,
    goldValue: 12,
    hasAttacked: false,
    faction: "Polish-Lithuanian Commonwealth"
  },
  {
    id: uuidv4(),
    name: "Musketeer",
    hp: 8,
    maxHp: 8,
    armor: 1,
    attack: 5,
    cost: 4,
    goldValue: 8,
    hasAttacked: false,
    faction: "Swedish Empire"
  },
  {
    id: uuidv4(),
    name: "Cannon",
    hp: 6,
    maxHp: 6,
    armor: 0,
    attack: 8,
    cost: 7,
    goldValue: 14,
    hasAttacked: false,
    faction: "Swedish Empire"
  },
  {
    id: uuidv4(),
    name: "Peasant Militia",
    hp: 6,
    maxHp: 6,
    armor: 0,
    attack: 1,
    cost: 1,
    goldValue: 2,
    hasAttacked: false,
    faction: "Polish-Lithuanian Commonwealth"
  }
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
    name: "The Swedish Invasion",
    description: "July 1655: Swedish forces invade Poland from the north, starting the conflict.",
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
    name: "The Battle of Warsaw",
    description: "September 1655: Swedish forces led by King Charles X Gustav lay siege to Warsaw.",
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
    name: "The Defense of Częstochowa",
    description: "November 1655: The legendary defense of Jasna Góra Monastery turns the tide of war.",
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
    name: "The Treaty of Bromberg",
    description: "November 1657: Poland secures Brandenburg-Prussia as an ally against Sweden.",
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

// Historical context data for scenarios
export const scenarioHistories: ScenarioHistory[] = [
  {
    scenarioId: 0,
    pages: [
      {
        title: "The Swedish Invasion Begins",
        text: "In July 1655, taking advantage of Poland's ongoing war with Russia, King Charles X Gustav of Sweden launched an invasion of the Polish-Lithuanian Commonwealth. Swedish forces crossed into Polish territory from Swedish Pomerania and East Prussia.",
        date: "July 1655",
        arrows: [
          {
            start: { x: 180, y: 100 },
            end: { x: 250, y: 180 },
            color: "#4a6fa5", // Swedish blue
            dashed: false
          }
        ],
        icons: [
          {
            position: { x: 180, y: 100 },
            type: "infantry",
            color: "#4a6fa5", // Swedish blue
            label: "Swedish Army"
          }
        ],
        units: [
          getNewCardInstance({...allCards[6], name: "Swedish Musketeer"}), // Musketeer
          getNewCardInstance({...allCards[3], name: "Swedish Pikeman"}) // Goblin (renamed)
        ]
      },
      {
        title: "The Fall of Poznań",
        text: "By late July, the Swedish army had secured much of northern Poland. Several Polish nobles and military commanders swore allegiance to the Swedish king in what became known as the Capitulation of Ujście. The city of Poznań fell without resistance.",
        date: "July 25, 1655",
        arrows: [
          {
            start: { x: 250, y: 180 },
            end: { x: 250, y: 240 },
            color: "#4a6fa5" // Swedish blue
          }
        ],
        icons: [
          {
            position: { x: 250, y: 240 },
            type: "battle",
            color: "#4a6fa5", // Swedish blue
            label: "Poznań Falls"
          }
        ],
        units: [
          getNewCardInstance({...allCards[6], name: "Swedish Musketeer"}), // Musketeer
          getNewCardInstance({...allCards[7], name: "Swedish Artillery"}) // Cannon
        ]
      },
      {
        title: "The March to Warsaw",
        text: "After securing Greater Poland, Swedish forces moved towards Warsaw. The Polish king, John II Casimir, fled to Silesia. Without strong leadership, Polish defenses were poorly coordinated, and Warsaw prepared for the inevitable Swedish assault.",
        date: "August 1655",
        arrows: [
          {
            start: { x: 250, y: 240 },
            end: { x: 360, y: 250 },
            color: "#4a6fa5" // Swedish blue
          }
        ],
        icons: [
          {
            position: { x: 360, y: 250 },
            type: "infantry",
            color: "#4a6fa5", // Swedish blue
            label: "Swedish Forces"
          },
          {
            position: { x: 300, y: 200 },
            type: "cavalry",
            color: "#c65d2e", // Polish red
            label: "Polish Retreat"
          }
        ],
        units: [
          getNewCardInstance({...allCards[0], name: "Polish Knight"}), // Knight
          getNewCardInstance({...allCards[6], name: "Swedish Commander"}) // Musketeer
        ]
      }
    ]
  },
  {
    scenarioId: 1,
    pages: [
      {
        title: "Siege of Warsaw",
        text: "On September 8, 1655, Warsaw surrendered to the Swedish army after minimal resistance. The city's defenses were inadequate against the well-equipped Swedish forces, and many Polish nobles had already pledged loyalty to Charles X Gustav.",
        date: "September 8, 1655",
        arrows: [
          {
            start: { x: 300, y: 200 },
            end: { x: 360, y: 250 },
            color: "#4a6fa5" // Swedish blue
          }
        ],
        icons: [
          {
            position: { x: 360, y: 250 },
            type: "battle",
            color: "#4a6fa5", // Swedish blue
            label: "Swedish Siege"
          }
        ],
        units: [
          getNewCardInstance({...allCards[7], name: "Swedish Artillery"}), // Cannon
          getNewCardInstance({...allCards[6], name: "Swedish Infantry"}) // Musketeer
        ]
      },
      {
        title: "The Great Pillage",
        text: "After capturing Warsaw, Swedish forces began looting the city and surrounding areas. Artwork, books, and treasures were taken back to Sweden. This period became known as the 'Swedish Deluge' due to the extensive destruction and looting.",
        date: "September-October 1655",
        icons: [
          {
            position: { x: 360, y: 250 },
            type: "infantry",
            color: "#4a6fa5", // Swedish blue
            label: "Looting Forces"
          },
          {
            position: { x: 420, y: 300 },
            type: "infantry",
            color: "#4a6fa5", // Swedish blue
            label: "Southern Advance"
          }
        ],
        units: [
          getNewCardInstance({...allCards[6], name: "Swedish Plunderer"}), // Musketeer
          getNewCardInstance({...allCards[8], name: "Polish Citizen"}) // Peasant Militia
        ]
      },
      {
        title: "Swedish Advance to Kraków",
        text: "By October, the Swedish forces had advanced to Kraków, Poland's cultural and historical capital. The city fell on October 13, 1655, further strengthening the Swedish position in Poland. Within just a few months, much of Poland had fallen under Swedish control.",
        date: "October 13, 1655",
        arrows: [
          {
            start: { x: 360, y: 250 },
            end: { x: 470, y: 330 },
            color: "#4a6fa5" // Swedish blue
          }
        ],
        icons: [
          {
            position: { x: 470, y: 330 },
            type: "battle",
            color: "#4a6fa5", // Swedish blue
            label: "Fall of Kraków"
          }
        ],
        units: [
          getNewCardInstance({...allCards[4], name: "Swedish Heavy Infantry"}), // Ogre
          getNewCardInstance({...allCards[6], name: "Swedish Commander"}) // Musketeer
        ]
      }
    ]
  },
  {
    scenarioId: 2,
    pages: [
      {
        title: "The Monastery of Jasna Góra",
        text: "In November 1655, a small force of Swedish troops approached the Jasna Góra Monastery in Częstochowa, which housed the revered Black Madonna icon. Despite overwhelming Swedish strength across the country, the monastery's defenders refused to surrender.",
        date: "November 18, 1655",
        arrows: [
          {
            start: { x: 470, y: 330 },
            end: { x: 420, y: 380 },
            color: "#4a6fa5", // Swedish blue
            dashed: true
          }
        ],
        icons: [
          {
            position: { x: 420, y: 380 },
            type: "infantry",
            color: "#4a6fa5", // Swedish blue
            label: "Swedish Forces"
          },
          {
            position: { x: 450, y: 380 },
            type: "battle",
            color: "#c65d2e", // Polish red
            label: "Monastery Defense"
          }
        ],
        units: [
          getNewCardInstance({...allCards[2], name: "Monastery Defender"}), // Defender
          getNewCardInstance({...allCards[6], name: "Swedish Attacker"}) // Musketeer
        ]
      },
      {
        title: "The Siege of Jasna Góra",
        text: "Led by Prior Augustyn Kordecki, the monastery defenders - consisting of only 160 infantry, 70 monks, and about 80 volunteers - managed to hold out against 2,250 Swedish troops. The siege lasted 40 days, from November 18 to December 27, 1655.",
        date: "November-December 1655",
        icons: [
          {
            position: { x: 450, y: 380 },
            type: "battle",
            color: "#c65d2e", // Polish red
            label: "Heroic Defense"
          }
        ],
        units: [
          getNewCardInstance({...allCards[8], name: "Polish Volunteer"}), // Peasant Militia
          getNewCardInstance({...allCards[2], name: "Monk Defender"}) // Defender
        ]
      },
      {
        title: "The Turning Point",
        text: "The successful defense of Jasna Góra became a symbol of Polish resistance. It galvanized the Polish people against the invaders and turned the tide of the war. Many viewed it as a miracle and a sign of divine intervention. A national uprising against the Swedes began to gain momentum.",
        date: "December 27, 1655",
        arrows: [
          {
            start: { x: 450, y: 380 },
            end: { x: 420, y: 300 },
            color: "#c65d2e", // Polish red
          },
          {
            start: { x: 450, y: 380 },
            end: { x: 360, y: 250 },
            color: "#c65d2e", // Polish red
          }
        ],
        icons: [
          {
            position: { x: 420, y: 300 },
            type: "infantry",
            color: "#c65d2e", // Polish red
            label: "Polish Uprising"
          }
        ],
        units: [
          getNewCardInstance({...allCards[5], name: "Polish Hussar"}), // Hussar
          getNewCardInstance({...allCards[0], name: "Polish Knight"}) // Knight
        ]
      }
    ]
  },
  {
    scenarioId: 3,
    pages: [
      {
        title: "The Treaty of Bromberg",
        text: "By 1657, the tide had turned against Sweden. On November 6, 1657, Frederick William, Elector of Brandenburg-Prussia, switched sides and signed the Treaty of Bromberg (Bydgoszcz) with Poland. This was a significant diplomatic victory for the Polish-Lithuanian Commonwealth.",
        date: "November 6, 1657",
        arrows: [
          {
            start: { x: 200, y: 180 },
            end: { x: 250, y: 240 },
            color: "#c65d2e", // Polish red
          }
        ],
        icons: [
          {
            position: { x: 250, y: 240 },
            type: "battle",
            color: "#c65d2e", // Polish red
            label: "Bromberg Treaty"
          }
        ],
        units: [
          getNewCardInstance({...allCards[0], name: "Polish Diplomat"}), // Knight
          getNewCardInstance({...allCards[0], name: "Prussian Representative"}) // Knight
        ]
      },
      {
        title: "Polish Counteroffensive",
        text: "With Brandenburg-Prussia now an ally, Poland launched counteroffensives against the Swedish forces. The Polish army, supported by Tatar forces and new allies, began to reclaim territories previously lost to Sweden. Charles X Gustav's position was rapidly deteriorating.",
        date: "1657-1658",
        arrows: [
          {
            start: { x: 360, y: 250 },
            end: { x: 240, y: 130 },
            color: "#c65d2e", // Polish red
          },
          {
            start: { x: 250, y: 240 },
            end: { x: 240, y: 130 },
            color: "#c65d2e", // Polish red
          }
        ],
        icons: [
          {
            position: { x: 300, y: 200 },
            type: "cavalry",
            color: "#c65d2e", // Polish red
            label: "Polish-Tatar Forces"
          }
        ],
        units: [
          getNewCardInstance({...allCards[5], name: "Polish Winged Hussar"}), // Hussar
          getNewCardInstance({...allCards[0], name: "Tatar Cavalry"}) // Knight
        ]
      },
      {
        title: "The End of the Deluge",
        text: "The war officially ended with the Treaty of Oliva on May 3, 1660. While the Polish-Lithuanian Commonwealth survived the 'Swedish Deluge,' it was severely weakened. The country had lost almost a third of its population and suffered enormous economic damage that would affect it for decades to come.",
        date: "May 3, 1660",
        icons: [
          {
            position: { x: 240, y: 130 },
            type: "battle",
            color: "#c65d2e", // Polish red
            label: "Treaty of Oliva"
          }
        ],
        units: [
          getNewCardInstance({...allCards[0], name: "Polish Diplomat"}), // Knight
          getNewCardInstance({...allCards[6], name: "Swedish Diplomat"}) // Musketeer
        ]
      }
    ]
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