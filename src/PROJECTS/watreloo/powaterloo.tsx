import { useState, useEffect } from 'react';

interface Region {
  name: string;
  displayName: string;
  icon: string;
  controlled: boolean;
  garrison: number;
  hostility: number;
}

interface GameState {
  stability: number;
  resources: number;
  support: number;
  turn: number;
  regions: Record<string, Region>;
}

interface Event {
  turn: number;
  message: string;
  type: 'normal' | 'success' | 'failure';
}

const PoWaterloo = () => {
  const [gameState, setGameState] = useState<GameState>({
    stability: 50,
    resources: 100,
    support: 30,
    turn: 1,
    regions: {
      paris: { 
        name: 'paris',
        displayName: 'Paryż',
        icon: '🏛️',
        controlled: true, 
        garrison: 5000, 
        hostility: 0 
      },
      normandy: { 
        name: 'normandy',
        displayName: 'Normandia',
        icon: '🌊',
        controlled: false, 
        garrison: 2000, 
        hostility: 3 
      },
      lyon: { 
        name: 'lyon',
        displayName: 'Lyon',
        icon: '🏭',
        controlled: false, 
        garrison: 1000, 
        hostility: 7 
      },
      marseille: { 
        name: 'marseille',
        displayName: 'Marsylia',
        icon: '⛵',
        controlled: false, 
        garrison: 1500, 
        hostility: 5 
      },
      bordeaux: { 
        name: 'bordeaux',
        displayName: 'Bordeaux',
        icon: '🍷',
        controlled: false, 
        garrison: 800, 
        hostility: 8 
      }
    }
  });

  const [events, setEvents] = useState<Event[]>([
    {
      turn: 0,
      message: 'Napoleon abdykował. Francja w chaosie. Koalicja zbliża się do Paryża.',
      type: 'normal'
    },
    {
      turn: 0,
      message: 'Przejmujesz kontrolę nad resztkami francuskiego rządu. Odbuduj kraj!',
      type: 'normal'
    }
  ]);

  const [gameOver, setGameOver] = useState<{
    isOver: boolean;
    message: string;
    victory: boolean;
  }>({
    isOver: false,
    message: '',
    victory: false
  });

  const addEvent = (message: string, type: 'normal' | 'success' | 'failure' = 'normal') => {
    setEvents(prev => [{
      turn: gameState.turn,
      message,
      type
    }, ...prev.slice(0, 9)]);
  };

  const nextTurn = () => {
    setGameState(prev => {
      const newState = { ...prev, turn: prev.turn + 1, resources: prev.resources + 15 };
      
      // Random events
      if (Math.random() < 0.3) {
        const randomEvents = [
          'Pojawily się plotki o powrocie Napoleona.',
          'Koalicja naciska na dalsze ustępstwa.',
          'Wybuchły rozruchy w jednym z miast.',
          'Otrzymano wsparcie od lokalnych notabli.',
          'Pogorszyła się sytuacja ekonomiczna.'
        ];
        
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addEvent(event);
      }
      
      return newState;
    });
  };

  useEffect(() => {
    // Check win/lose conditions
    if (gameState.stability <= 0) {
      setGameOver({
        isOver: true,
        message: 'Przegrałeś! Francja upadła w chaos.',
        victory: false
      });
    }
    
    const controlledRegions = Object.values(gameState.regions).filter(r => r.controlled).length;
    if (controlledRegions === 5 && gameState.support >= 70) {
      setGameOver({
        isOver: true,
        message: 'Wygrałeś! Udało Ci się odbudować Francję!',
        victory: true
      });
    }
  }, [gameState]);

  const recruitTroops = () => {
    if (gameState.resources < 30) {
      addEvent('Brak zasobów na rekrutację!', 'failure');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      resources: prev.resources - 30,
      stability: prev.stability + 5,
      regions: {
        ...prev.regions,
        paris: {
          ...prev.regions.paris,
          garrison: prev.regions.paris.garrison + 2000
        }
      }
    }));
    
    addEvent('Zrekrutowano 2000 nowych żołnierzy w Paryżu.', 'success');
    nextTurn();
  };

  const diplomacy = () => {
    if (gameState.resources < 20) {
      addEvent('Brak zasobów na dyplomację!', 'failure');
      return;
    }
    
    const regions = Object.keys(gameState.regions);
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    
    setGameState(prev => ({
      ...prev,
      resources: prev.resources - 20,
      support: prev.support + 10,
      regions: {
        ...prev.regions,
        [randomRegion]: {
          ...prev.regions[randomRegion],
          hostility: Math.max(0, prev.regions[randomRegion].hostility - 2)
        }
      }
    }));
    
    const regionName = gameState.regions[randomRegion].displayName;
    addEvent(`Udane rokowania zmniejszyły napięcie w regionie ${regionName}.`, 'success');
    nextTurn();
  };

  const economicReform = () => {
    if (gameState.resources < 40) {
      addEvent('Brak zasobów na reformy!', 'failure');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      resources: prev.resources - 40,
      stability: prev.stability + 10,
      support: prev.support + 15
    }));
    
    addEvent('Wprowadzono reformy ekonomiczne. Efekty będą widoczne wkrótce.', 'success');
    
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        resources: prev.resources + 60
      }));
      addEvent('Reformy ekonomiczne zaczęły przynosić owoce!', 'success');
    }, 2000);
    
    nextTurn();
  };

  const militaryCampaign = () => {
    if (gameState.resources < 50) {
      addEvent('Brak zasobów na kampanię wojskową!', 'failure');
      return;
    }
    
    const hostileRegions = Object.keys(gameState.regions).filter(r => 
      !gameState.regions[r].controlled && gameState.regions[r].hostility > 5
    );
    
    if (hostileRegions.length > 0) {
      const target = hostileRegions[Math.floor(Math.random() * hostileRegions.length)];
      const success = Math.random() > 0.4;
      
      setGameState(prev => ({
        ...prev,
        resources: prev.resources - 50,
        stability: prev.stability + (success ? 15 : -10),
        support: prev.support + (success ? 0 : -5),
        regions: {
          ...prev.regions,
          [target]: {
            ...prev.regions[target],
            controlled: success ? true : prev.regions[target].controlled,
            hostility: success ? 0 : prev.regions[target].hostility
          }
        }
      }));
      
      const regionName = gameState.regions[target].displayName;
      if (success) {
        addEvent(`Kampania wojskowa zakończyła się sukcesem! Przejęto kontrolę nad ${regionName}.`, 'success');
      } else {
        addEvent(`Kampania wojskowa w ${regionName} zakończyła się niepowodzeniem.`, 'failure');
      }
    } else {
      setGameState(prev => ({
        ...prev,
        resources: prev.resources - 50
      }));
      addEvent('Brak odpowiednich celów do kampanii wojskowej.', 'failure');
    }
    
    nextTurn();
  };

  const espionage = () => {
    if (gameState.resources < 25) {
      addEvent('Brak zasobów na szpiegostwo!', 'failure');
      return;
    }
    
    const events = [
      'Szpiedzy donoszą o planach rojalistów w Bordeaux.',
      'Przejęto korespondencję wroga - zdobyto cenne informacje.',
      'Sieć szpiegowska została częściowo zdemaskowana.',
      'Udało się przekupić kilku oficerów przeciwnika.',
      'Szpiedzy infiltrowali organizację oporu w Lyon.'
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    setGameState(prev => ({
      ...prev,
      resources: prev.resources - 25,
      stability: prev.stability + 3,
      support: prev.support + 5
    }));
    
    addEvent(randomEvent, 'success');
    nextTurn();
  };

  const resetGame = () => {
    setGameState({
      stability: 50,
      resources: 100,
      support: 30,
      turn: 1,
      regions: {
        paris: { 
          name: 'paris',
          displayName: 'Paryż',
          icon: '🏛️',
          controlled: true, 
          garrison: 5000, 
          hostility: 0 
        },
        normandy: { 
          name: 'normandy',
          displayName: 'Normandia',
          icon: '🌊',
          controlled: false, 
          garrison: 2000, 
          hostility: 3 
        },
        lyon: { 
          name: 'lyon',
          displayName: 'Lyon',
          icon: '🏭',
          controlled: false, 
          garrison: 1000, 
          hostility: 7 
        },
        marseille: { 
          name: 'marseille',
          displayName: 'Marsylia',
          icon: '⛵',
          controlled: false, 
          garrison: 1500, 
          hostility: 5 
        },
        bordeaux: { 
          name: 'bordeaux',
          displayName: 'Bordeaux',
          icon: '🍷',
          controlled: false, 
          garrison: 800, 
          hostility: 8 
        }
      }
    });
    
    setEvents([
      {
        turn: 0,
        message: 'Napoleon abdykował. Francja w chaosie. Koalicja zbliża się do Paryża.',
        type: 'normal'
      },
      {
        turn: 0,
        message: 'Przejmujesz kontrolę nad resztkami francuskiego rządu. Odbuduj kraj!',
        type: 'normal'
      }
    ]);
    
    setGameOver({
      isOver: false,
      message: '',
      victory: false
    });
  };

  const getRegionStatus = (region: Region) => {
    if (region.controlled) return 'Pod kontrolą';
    if (region.hostility > 6) return 'Wrogie nastroje';
    if (region.hostility > 4) return 'Niepewna';
    return 'Neutralna';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-blue-600 p-4 text-gray-100 font-serif">
      <div className="max-w-6xl mx-auto bg-slate-800/90 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8 border-b-3 border-red-600 pb-6">
          <h1 className="text-4xl font-bold text-red-600 drop-shadow-lg">🏰 Po Waterloo 1815 🏰</h1>
          <p className="text-xl mt-2">Odbuduj Francję po klęsce pod Waterloo</p>
        </div>

        {/* Game Over Modal */}
        {gameOver.isOver && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
            <div className={`p-8 rounded-lg shadow-2xl text-center max-w-md ${gameOver.victory ? 'bg-green-800' : 'bg-red-800'}`}>
              <h2 className="text-3xl font-bold mb-4">{gameOver.victory ? '🎉 Zwycięstwo! 🎉' : '😔 Porażka! 😔'}</h2>
              <p className="text-xl mb-6">{gameOver.message}</p>
              <button 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all"
                onClick={resetGame}
              >
                Zagraj ponownie
              </button>
            </div>
          </div>
        )}
        
        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-600/30 p-4 rounded-lg text-center border-2 border-blue-500">
            <h3 className="text-blue-400 font-bold">Stabilność</h3>
            <div className="text-4xl font-bold text-red-500">{gameState.stability}</div>
            <div className="w-full h-5 bg-slate-700/80 rounded-lg overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                style={{ width: `${gameState.stability}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-blue-600/30 p-4 rounded-lg text-center border-2 border-blue-500">
            <h3 className="text-blue-400 font-bold">Zasoby</h3>
            <div className="text-4xl font-bold text-red-500">{gameState.resources}</div>
          </div>
          <div className="bg-blue-600/30 p-4 rounded-lg text-center border-2 border-blue-500">
            <h3 className="text-blue-400 font-bold">Poparcie</h3>
            <div className="text-4xl font-bold text-red-500">{gameState.support}</div>
            <div className="w-full h-5 bg-slate-700/80 rounded-lg overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                style={{ width: `${gameState.support}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Game Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-green-800/20 border-3 border-green-700 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">🗺️ Regiony Francji</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(gameState.regions).map((region) => (
                <div 
                  key={region.name}
                  className={`p-4 rounded-lg transition-all hover:-translate-y-1 cursor-pointer
                    ${region.controlled 
                      ? 'bg-green-500/40 border-2 border-green-500' 
                      : region.hostility > 6 
                        ? 'bg-red-500/40 border-2 border-red-500'
                        : 'bg-yellow-500/30 border-2 border-yellow-500'
                    }`}
                >
                  <div className="font-bold text-lg">{region.icon} {region.displayName}</div>
                  <div>Status: {getRegionStatus(region)}</div>
                  <div>Garnizon: {region.garrison} ludzi</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-purple-800/20 border-3 border-purple-600 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">⚔️ Akcje</h3>
            <button 
              className="w-full py-3 px-4 mb-3 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 hover:-translate-y-1 transition-all shadow-lg disabled:bg-gray-600 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              onClick={recruitTroops}
              disabled={gameState.resources < 30}
            >
              🪖 Rekrutuj Wojsko
              <div className="text-sm font-normal">Koszt: 30 zasobów</div>
            </button>
            
            <button 
              className="w-full py-3 px-4 mb-3 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 hover:-translate-y-1 transition-all shadow-lg disabled:bg-gray-600 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              onClick={diplomacy}
              disabled={gameState.resources < 20}
            >
              🤝 Dyplomacja
              <div className="text-sm font-normal">Koszt: 20 zasobów</div>
            </button>
            
            <button 
              className="w-full py-3 px-4 mb-3 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 hover:-translate-y-1 transition-all shadow-lg disabled:bg-gray-600 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              onClick={economicReform}
              disabled={gameState.resources < 40}
            >
              💰 Reformy Ekonomiczne
              <div className="text-sm font-normal">Koszt: 40 zasobów</div>
            </button>
            
            <button 
              className="w-full py-3 px-4 mb-3 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 hover:-translate-y-1 transition-all shadow-lg disabled:bg-gray-600 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              onClick={militaryCampaign}
              disabled={gameState.resources < 50}
            >
              ⚔️ Kampania Wojskowa
              <div className="text-sm font-normal">Koszt: 50 zasobów</div>
            </button>
            
            <button 
              className="w-full py-3 px-4 mb-3 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 hover:-translate-y-1 transition-all shadow-lg disabled:bg-gray-600 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              onClick={espionage}
              disabled={gameState.resources < 25}
            >
              🕵️ Szpiegostwo
              <div className="text-sm font-normal">Koszt: 25 zasobów</div>
            </button>
          </div>
        </div>
        
        {/* Events Log */}
        <div className="bg-slate-900/80 border-2 border-slate-700 rounded-lg p-4">
          <h3 className="text-xl font-bold mb-2">📜 Kronika Wydarzeń</h3>
          <div className="h-48 overflow-y-auto pr-2 space-y-2">
            {events.map((event, index) => (
              <div 
                key={index} 
                className={`p-3 rounded 
                  ${event.type === 'success' 
                    ? 'border-l-4 border-green-500 bg-green-500/10' 
                    : event.type === 'failure' 
                      ? 'border-l-4 border-red-500 bg-red-500/10' 
                      : 'border-l-4 border-blue-500 bg-blue-500/10'
                  }`}
              >
                <strong>{event.turn === 0 ? 'Początek gry' : `Tura ${event.turn}`}:</strong> {event.message}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center text-gray-400">
          Tura: {gameState.turn}
        </div>
      </div>
    </div>
  );
};

export default PoWaterloo;