import { useState, useEffect, useRef } from 'react';
import CardsTab from './scenario/CardsTab';
import ScenariosTab from './scenario/ScenariosTab';
import StoriesTab from './scenario/StoriesTab';

// Główny komponent edytora
export default function SwedishDelugeEditor() {
  // Stany dla przechowywania danych
  const [cards, setCards] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [stories, setStories] = useState([]);
  
  // Stan dla aktywnej zakładki
  const [activeTab, setActiveTab] = useState('cards');
  
  // Referencje do inputów plików
  const cardsInputRef = useRef(null);
  const scenariosInputRef = useRef(null);
  const storiesInputRef = useRef(null);
  
  // Funkcje do importu plików JSON
  const importCards = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setCards(data);
          alert(`Pomyślnie zaimportowano ${data.length} kart!`);
        } catch (error) {
          alert('Błąd podczas parsowania pliku JSON: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };
  
  const importScenarios = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setScenarios(data);
          alert(`Pomyślnie zaimportowano ${data.length} scenariuszy!`);
        } catch (error) {
          alert('Błąd podczas parsowania pliku JSON: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };
  
  const importStories = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setStories(data);
          alert(`Pomyślnie zaimportowano ${data.length} historii!`);
        } catch (error) {
          alert('Błąd podczas parsowania pliku JSON: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };
  
  // Funkcje do eksportu danych do plików JSON
  const exportToJson = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const exportCards = () => {
    if (cards.length === 0) {
      alert('Brak kart do eksportu. Najpierw zaimportuj lub dodaj karty.');
      return;
    }
    exportToJson(cards, 'cards.json');
  };
  
  const exportScenarios = () => {
    if (scenarios.length === 0) {
      alert('Brak scenariuszy do eksportu. Najpierw zaimportuj lub dodaj scenariusze.');
      return;
    }
    exportToJson(scenarios, 'scenarios.json');
  };
  
  const exportStories = () => {
    if (stories.length === 0) {
      alert('Brak historii do eksportu. Najpierw zaimportuj lub dodaj historie.');
      return;
    }
    exportToJson(stories, 'stories.json');
  };
  
  return (
    <div className="bg-amber-50 p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-900 text-center mb-6">
        Edytor "The Swedish Deluge"
      </h1>
      
      {/* Zakładki nawigacyjne */}
      <div className="flex border-b border-amber-300 mb-6">
        <button 
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 ${activeTab === 'cards' ? 'bg-amber-200 font-bold rounded-t-lg' : 'text-amber-800'}`}
        >
          Karty
        </button>
        <button 
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 ${activeTab === 'scenarios' ? 'bg-amber-200 font-bold rounded-t-lg' : 'text-amber-800'}`}
        >
          Scenariusze
        </button>
        <button 
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-2 ${activeTab === 'stories' ? 'bg-amber-200 font-bold rounded-t-lg' : 'text-amber-800'}`}
        >
          Historie
        </button>
      </div>
      
      {/* Renderowanie odpowiedniej zakładki */}
      {activeTab === 'cards' && (
        <CardsTab 
          cards={cards} 
          setCards={setCards} 
          importCards={importCards}
          exportCards={exportCards}
          cardsInputRef={cardsInputRef}
        />
      )}
      
      {activeTab === 'scenarios' && (
        <ScenariosTab 
          scenarios={scenarios} 
          setScenarios={setScenarios}
          cards={cards}
          importScenarios={importScenarios}
          exportScenarios={exportScenarios}
          scenariosInputRef={scenariosInputRef}
        />
      )}
      
      {activeTab === 'stories' && (
        <StoriesTab 
          stories={stories}
          setStories={setStories}
          scenarios={scenarios}
          cards={cards}
          importStories={importStories}
          exportStories={exportStories}
          storiesInputRef={storiesInputRef}
        />
      )}
    </div>
  );
}