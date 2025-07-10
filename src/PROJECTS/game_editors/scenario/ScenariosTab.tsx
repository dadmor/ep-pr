import React, { RefObject, ChangeEvent } from 'react';
import { Card, Scenario } from '../Scenario';

interface ScenariosTabProps {
  scenarios: Scenario[];
  setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>;
  cards: Card[];
  importScenarios: (event: ChangeEvent<HTMLInputElement>) => void;
  exportScenarios: () => void;
  scenariosInputRef: RefObject<HTMLInputElement>;
}

// Komponent zakładki Scenariusze
const ScenariosTab: React.FC<ScenariosTabProps> = ({ 
  scenarios, 
  setScenarios, 
  cards,
  importScenarios, 
  exportScenarios, 
  scenariosInputRef 
}) => {
  // Dodawanie nowego scenariusza
  const addNewScenario = () => {
    // Szablon nowego scenariusza
    const newScenario: Scenario = {
      id: scenarios.length,
      name: `New Scenario ${scenarios.length + 1}`,
      description: "Add your description here",
      playerStartingCards: [],
      opponentStartingCards: [],
      startingPlayer: "player",
      playerStartingGold: 5,
      opponentStartingGold: 5,
      cityId: 1
    };
    
    setScenarios([...scenarios, newScenario]);
  };
  
  // Edycja scenariusza
  const editScenario = (index: number, field: keyof Scenario, value: string | number) => {
    const updatedScenarios = [...scenarios];
    
    if (field === 'name' || field === 'description' || field === 'startingPlayer') {
      // Handle string fields
      updatedScenarios[index][field] = value as any;
    } else {
      // Handle numeric fields
      updatedScenarios[index][field] = Number(value) as any;
    }
    
    setScenarios(updatedScenarios);
  };
  
  // Edycja kart startowych w scenariuszu
  const editStartingCards = (scenarioIndex: number, playerType: 'player' | 'opponent', cards: string[]) => {
    const updatedScenarios = [...scenarios];
    const field = playerType === 'player' ? 'playerStartingCards' : 'opponentStartingCards';
    updatedScenarios[scenarioIndex][field] = cards;
    setScenarios(updatedScenarios);
  };
  
  // Usuwanie scenariusza
  const deleteScenario = (index: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten scenariusz?')) {
      const updatedScenarios = [...scenarios];
      updatedScenarios.splice(index, 1);
      
      // Aktualizacja ID scenariuszy
      updatedScenarios.forEach((scenario, idx) => {
        scenario.id = idx;
      });
      
      setScenarios(updatedScenarios);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Edytor Scenariuszy</h2>
        <div className="space-x-2">
          <input 
            type="file"
            ref={scenariosInputRef}
            onChange={importScenarios}
            className="hidden"
            accept=".json"
          />
          <button 
            onClick={() => scenariosInputRef.current?.click()}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Importuj JSON
          </button>
          <button 
            onClick={exportScenarios}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Eksportuj JSON
          </button>
          <button 
            onClick={addNewScenario}
            className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Dodaj Scenariusz
          </button>
        </div>
      </div>
      
      {scenarios.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">Brak scenariuszy do wyświetlenia</p>
          <p className="text-sm text-gray-400">Zaimportuj istniejące scenariusze lub dodaj nowe</p>
        </div>
      ) : (
        <div className="space-y-6">
          {scenarios.map((scenario, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-amber-100 p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium text-lg">{scenario.name}</span>
                  <span className="ml-2 text-sm text-gray-600">ID: {scenario.id}</span>
                </div>
                <button 
                  onClick={() => deleteScenario(index)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Usuń
                </button>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nazwa:</label>
                    <input 
                      type="text"
                      value={scenario.name}
                      onChange={(e) => editScenario(index, 'name', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ID Miasta:</label>
                    <input 
                      type="number"
                      value={scenario.cityId}
                      onChange={(e) => editScenario(index, 'cityId', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Opis:</label>
                    <textarea 
                      value={scenario.description}
                      onChange={(e) => editScenario(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kto zaczyna:</label>
                    <select 
                      value={scenario.startingPlayer}
                      onChange={(e) => editScenario(index, 'startingPlayer', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="player">Gracz</option>
                      <option value="opponent">Przeciwnik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Złoto gracza:</label>
                    <input 
                      type="number"
                      value={scenario.playerStartingGold}
                      onChange={(e) => editScenario(index, 'playerStartingGold', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Złoto przeciwnika:</label>
                    <input 
                      type="number"
                      value={scenario.opponentStartingGold}
                      onChange={(e) => editScenario(index, 'opponentStartingGold', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Karty startowe gracza:</label>
                    <select 
                      multiple
                      value={scenario.playerStartingCards}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        editStartingCards(index, 'player', selectedOptions);
                      }}
                      className="w-full p-2 border rounded h-32"
                    >
                      {cards.map((card, cardIdx) => (
                        <option key={cardIdx} value={card.name}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Przytrzymaj Ctrl, aby wybrać wiele kart</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Karty startowe przeciwnika:</label>
                    <select 
                      multiple
                      value={scenario.opponentStartingCards}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        editStartingCards(index, 'opponent', selectedOptions);
                      }}
                      className="w-full p-2 border rounded h-32"
                    >
                      {cards.map((card, cardIdx) => (
                        <option key={cardIdx} value={card.name}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Przytrzymaj Ctrl, aby wybrać wiele kart</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenariosTab;