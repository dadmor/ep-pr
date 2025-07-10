import React from 'react';

// Komponent zakładki Karty
const CardsTab = ({ cards, setCards, importCards, exportCards, cardsInputRef }) => {
  // Dodawanie nowej karty
  const addNewCard = () => {
    // Szablon nowej karty
    const newCard = {
      name: `New Card ${cards.length + 1}`,
      maxHp: 10,
      armor: 1,
      attack: 3,
      cost: 3,
      goldValue: 6,
      faction: "Polish-Lithuanian Commonwealth"
    };
    
    setCards([...cards, newCard]);
  };
  
  // Edycja karty
  const editCard = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };
  
  // Usuwanie karty
  const deleteCard = (index) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę kartę?')) {
      const updatedCards = [...cards];
      updatedCards.splice(index, 1);
      setCards(updatedCards);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Edytor Kart</h2>
        <div className="space-x-2">
          <input 
            type="file"
            ref={cardsInputRef}
            onChange={importCards}
            className="hidden"
            accept=".json"
          />
          <button 
            onClick={() => cardsInputRef.current.click()}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Importuj JSON
          </button>
          <button 
            onClick={exportCards}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Eksportuj JSON
          </button>
          <button 
            onClick={addNewCard}
            className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Dodaj Kartę
          </button>
        </div>
      </div>
      
      {cards.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">Brak kart do wyświetlenia</p>
          <p className="text-sm text-gray-400">Zaimportuj istniejące karty lub dodaj nowe</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Nazwa</th>
                <th className="py-2 px-4 border-b text-center">HP</th>
                <th className="py-2 px-4 border-b text-center">Pancerz</th>
                <th className="py-2 px-4 border-b text-center">Atak</th>
                <th className="py-2 px-4 border-b text-center">Koszt</th>
                <th className="py-2 px-4 border-b text-center">Złoto</th>
                <th className="py-2 px-4 border-b text-left">Frakcja</th>
                <th className="py-2 px-4 border-b text-center">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <input 
                      type="text"
                      value={card.name}
                      onChange={(e) => editCard(index, 'name', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input 
                      type="number"
                      value={card.maxHp}
                      onChange={(e) => editCard(index, 'maxHp', parseInt(e.target.value))}
                      className="w-20 p-1 border rounded text-center"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input 
                      type="number"
                      value={card.armor}
                      onChange={(e) => editCard(index, 'armor', parseInt(e.target.value))}
                      className="w-20 p-1 border rounded text-center"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input 
                      type="number"
                      value={card.attack}
                      onChange={(e) => editCard(index, 'attack', parseInt(e.target.value))}
                      className="w-20 p-1 border rounded text-center"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input 
                      type="number"
                      value={card.cost}
                      onChange={(e) => editCard(index, 'cost', parseInt(e.target.value))}
                      className="w-20 p-1 border rounded text-center"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input 
                      type="number"
                      value={card.goldValue}
                      onChange={(e) => editCard(index, 'goldValue', parseInt(e.target.value))}
                      className="w-20 p-1 border rounded text-center"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <select 
                      value={card.faction}
                      onChange={(e) => editCard(index, 'faction', e.target.value)}
                      className="w-full p-1 border rounded"
                    >
                      <option value="Polish-Lithuanian Commonwealth">Rzeczpospolita</option>
                      <option value="Swedish Empire">Szwecja</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button 
                      onClick={() => deleteCard(index)}
                      className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CardsTab;