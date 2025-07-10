import React, { useState, RefObject, ChangeEvent } from 'react';
import MapEditor from './MapEditor';
import { Card, Scenario, Story, Arrow, Icon, Unit } from '../Scenario';

interface StoriesTabProps {
  stories: Story[];
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
  scenarios: Scenario[];
  cards: Card[];
  importStories: (event: ChangeEvent<HTMLInputElement>) => void;
  exportStories: () => void;
  storiesInputRef: RefObject<HTMLInputElement>;
}

// Komponent zakładki Historie
const StoriesTab: React.FC<StoriesTabProps> = ({ 
  stories, 
  setStories, 
  scenarios, 
  cards,
  importStories, 
  exportStories, 
  storiesInputRef 
}) => {
  // Stany dla obsługi interfejsu
  const [mapVisible, setMapVisible] = useState<boolean>(false);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [showArrowEditor, setShowArrowEditor] = useState<boolean>(false);
  const [showIconEditor, setShowIconEditor] = useState<boolean>(false);
  const [selectedArrowIndex, setSelectedArrowIndex] = useState<number | null>(null);
  const [selectedIconIndex, setSelectedIconIndex] = useState<number | null>(null);
  
  // Dodawanie nowej historii
  const addNewStory = () => {
    if (scenarios.length === 0) {
      alert('Najpierw dodaj scenariusz, aby móc stworzyć historię.');
      return;
    }
    
    // Szablon nowej historii
    const newStory: Story = {
      scenarioId: scenarios[0].id,
      pages: [
        {
          title: "New Page",
          text: "Add your historical narrative here",
          date: "Date here",
          arrows: [],
          icons: [],
          units: []
        }
      ]
    };
    
    setStories([...stories, newStory]);
  };
  
  // Dodawanie nowej strony do historii
  const addNewPage = (storyIndex: number) => {
    const updatedStories = [...stories];
    
    // Szablon nowej strony
    const newPage = {
      title: `New Page ${updatedStories[storyIndex].pages.length + 1}`,
      text: "Add your historical narrative here",
      date: "Date here",
      arrows: [],
      icons: [],
      units: []
    };
    
    updatedStories[storyIndex].pages.push(newPage);
    setStories(updatedStories);
  };
  
  // Edycja strony w historii
  const editPage = (storyIndex: number, pageIndex: number, field: keyof (typeof stories)[0]['pages'][0], value: string) => {
    const updatedStories = [...stories];
    
    if (field === 'title' || field === 'text' || field === 'date') {
      updatedStories[storyIndex].pages[pageIndex][field] = value;
    } else {
      console.error(`Cannot assign string value to field ${field}`);
    }
    
    setStories(updatedStories);
  };
  
  // Dodawanie strzałki do strony
  const addArrow = (storyIndex: number, pageIndex: number) => {
    const updatedStories = [...stories];
    
    // Szablon nowej strzałki
    const newArrow: Arrow = {
      start: { x: 100, y: 100 },
      end: { x: 200, y: 200 },
      color: "#4a6fa5", // Niebieski - Szwedzi
      dashed: false
    };
    
    updatedStories[storyIndex].pages[pageIndex].arrows.push(newArrow);
    setStories(updatedStories);
  };
  
  // Edycja strzałki
  const editArrow = (storyIndex: number, pageIndex: number, arrowIndex: number, field: string, value: number | boolean | string) => {
    const updatedStories = [...stories];
    
    if (field === 'startX') {
      updatedStories[storyIndex].pages[pageIndex].arrows[arrowIndex].start.x = value as number;
    } else if (field === 'startY') {
      updatedStories[storyIndex].pages[pageIndex].arrows[arrowIndex].start.y = value as number;
    } else if (field === 'endX') {
      updatedStories[storyIndex].pages[pageIndex].arrows[arrowIndex].end.x = value as number;
    } else if (field === 'endY') {
      updatedStories[storyIndex].pages[pageIndex].arrows[arrowIndex].end.y = value as number;
    } else if (field === 'color') {
      updatedStories[storyIndex].pages[pageIndex].arrows[arrowIndex].color = value as string;
    } else if (field === 'dashed') {
      updatedStories[storyIndex].pages[pageIndex].arrows[arrowIndex].dashed = value as boolean;
    }
    
    setStories(updatedStories);
  };
  
  // Usuwanie strzałki
  const deleteArrow = (storyIndex: number, pageIndex: number, arrowIndex: number) => {
    const updatedStories = [...stories];
    updatedStories[storyIndex].pages[pageIndex].arrows.splice(arrowIndex, 1);
    setStories(updatedStories);
  };
  
  // Dodawanie ikony do strony
  const addIcon = (storyIndex: number, pageIndex: number) => {
    const updatedStories = [...stories];
    
    // Szablon nowej ikony
    const newIcon: Icon = {
      position: { x: 150, y: 150 },
      type: "infantry",
      color: "#c65d2e", // Pomarańczowy - Polacy
      label: "New Icon"
    };
    
    updatedStories[storyIndex].pages[pageIndex].icons.push(newIcon);
    setStories(updatedStories);
  };
  
  // Edycja ikony
  const editIcon = (storyIndex: number, pageIndex: number, iconIndex: number, field: string, value: number | string) => {
    const updatedStories = [...stories];
    
    if (field === 'positionX') {
      updatedStories[storyIndex].pages[pageIndex].icons[iconIndex].position.x = value as number;
    } else if (field === 'positionY') {
      updatedStories[storyIndex].pages[pageIndex].icons[iconIndex].position.y = value as number;
    } else if (field === 'type') {
      updatedStories[storyIndex].pages[pageIndex].icons[iconIndex].type = value as any;
    } else if (field === 'color') {
      updatedStories[storyIndex].pages[pageIndex].icons[iconIndex].color = value as string;
    } else if (field === 'label') {
      updatedStories[storyIndex].pages[pageIndex].icons[iconIndex].label = value as string;
    }
    
    setStories(updatedStories);
  };
  
  // Usuwanie ikony
  const deleteIcon = (storyIndex: number, pageIndex: number, iconIndex: number) => {
    const updatedStories = [...stories];
    updatedStories[storyIndex].pages[pageIndex].icons.splice(iconIndex, 1);
    setStories(updatedStories);
  };
  
  // Dodawanie jednostki do strony
  const addUnit = (storyIndex: number, pageIndex: number) => {
    if (cards.length === 0) {
      alert('Najpierw dodaj karty, aby móc dodać jednostki.');
      return;
    }
    
    const updatedStories = [...stories];
    
    // Szablon nowej jednostki
    const newUnit: Unit = {
      name: "New Unit",
      template: cards[0].name
    };
    
    updatedStories[storyIndex].pages[pageIndex].units.push(newUnit);
    setStories(updatedStories);
  };
  
  // Edycja jednostki
  const editUnit = (storyIndex: number, pageIndex: number, unitIndex: number, field: keyof Unit, value: string) => {
    const updatedStories = [...stories];
    updatedStories[storyIndex].pages[pageIndex].units[unitIndex][field] = value;
    setStories(updatedStories);
  };
  
  // Usuwanie jednostki
  const deleteUnit = (storyIndex: number, pageIndex: number, unitIndex: number) => {
    const updatedStories = [...stories];
    updatedStories[storyIndex].pages[pageIndex].units.splice(unitIndex, 1);
    setStories(updatedStories);
  };
  
  // Usuwanie strony
  const deletePage = (storyIndex: number, pageIndex: number) => {
    if (stories[storyIndex].pages.length <= 1) {
      alert('Historia musi zawierać co najmniej jedną stronę.');
      return;
    }
    
    if (window.confirm('Czy na pewno chcesz usunąć tę stronę?')) {
      const updatedStories = [...stories];
      updatedStories[storyIndex].pages.splice(pageIndex, 1);
      setStories(updatedStories);
      
      // Aktualizacja wybranego indeksu strony
      if (selectedPageIndex >= updatedStories[storyIndex].pages.length) {
        setSelectedPageIndex(updatedStories[storyIndex].pages.length - 1);
      }
    }
  };
  
  // Usuwanie historii
  const deleteStory = (index: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę historię?')) {
      const updatedStories = [...stories];
      updatedStories.splice(index, 1);
      setStories(updatedStories);
    }
  };
  
  // Renderowanie edytora strzałek
  const renderArrowEditor = () => {
    if (!showArrowEditor) return null;
    
    const storyIndex = stories.findIndex(s => s.scenarioId === selectedStoryId);
    if (storyIndex === -1) return null;
    
    const currentPage = stories[storyIndex].pages[selectedPageIndex];
    const arrow = selectedArrowIndex !== null && currentPage.arrows[selectedArrowIndex];
    
    return (
      <div className="mt-4 p-4 border border-amber-800 rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Edytor Strzałek</h3>
          <button 
            onClick={() => {
              setShowArrowEditor(false);
              setSelectedArrowIndex(null);
            }}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Zamknij
          </button>
        </div>
        
        {selectedArrowIndex !== null && arrow ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Początek X:</label>
              <input 
                type="number"
                value={arrow.start.x}
                onChange={(e) => editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'startX', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Początek Y:</label>
              <input 
                type="number"
                value={arrow.start.y}
                onChange={(e) => editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'startY', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Koniec X:</label>
              <input 
                type="number"
                value={arrow.end.x}
                onChange={(e) => editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'endX', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Koniec Y:</label>
              <input 
                type="number"
                value={arrow.end.y}
                onChange={(e) => editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'endY', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kolor:</label>
              <select 
                value={arrow.color}
                onChange={(e) => editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'color', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="#4a6fa5">Niebieski (Szwedzi)</option>
                <option value="#c65d2e">Pomarańczowy (Polacy)</option>
                <option value="#8b4513">Brązowy</option>
                <option value="#2e8b57">Zielony</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <input 
                type="checkbox"
                checked={arrow.dashed}
                onChange={(e) => editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'dashed', e.target.checked)}
                className="mr-2"
              />
              <label>Przerywana linia</label>
            </div>
            <div className="col-span-2 mt-2">
              <button 
                onClick={() => deleteArrow(storyIndex, selectedPageIndex, selectedArrowIndex)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
              >
                Usuń strzałkę
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>Kliknij na mapie, aby utworzyć nową strzałkę.</p>
            <p className="text-sm text-gray-600">Najpierw ustaw początek, a następnie kliknij ponownie, aby ustawić koniec.</p>
          </div>
        )}
      </div>
    );
  };
  
  // Renderowanie edytora ikon
  const renderIconEditor = () => {
    if (!showIconEditor) return null;
    
    const storyIndex = stories.findIndex(s => s.scenarioId === selectedStoryId);
    if (storyIndex === -1) return null;
    
    const currentPage = stories[storyIndex].pages[selectedPageIndex];
    const icon = selectedIconIndex !== null && currentPage.icons[selectedIconIndex];
    
    return (
      <div className="mt-4 p-4 border border-amber-800 rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Edytor Ikon</h3>
          <button 
            onClick={() => {
              setShowIconEditor(false);
              setSelectedIconIndex(null);
            }}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Zamknij
          </button>
        </div>
        
        {selectedIconIndex !== null && icon ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Pozycja X:</label>
              <input 
                type="number"
                value={icon.position.x}
                onChange={(e) => editIcon(storyIndex, selectedPageIndex, selectedIconIndex, 'positionX', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pozycja Y:</label>
              <input 
                type="number"
                value={icon.position.y}
                onChange={(e) => editIcon(storyIndex, selectedPageIndex, selectedIconIndex, 'positionY', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Typ:</label>
              <select 
                value={icon.type}
                onChange={(e) => editIcon(storyIndex, selectedPageIndex, selectedIconIndex, 'type', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="infantry">Piechota</option>
                <option value="cavalry">Kawaleria</option>
                <option value="artillery">Artyleria</option>
                <option value="navy">Marynarka</option>
                <option value="battle">Bitwa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kolor:</label>
              <select 
                value={icon.color}
                onChange={(e) => editIcon(storyIndex, selectedPageIndex, selectedIconIndex, 'color', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="#4a6fa5">Niebieski (Szwedzi)</option>
                <option value="#c65d2e">Pomarańczowy (Polacy)</option>
                <option value="#8b4513">Brązowy</option>
                <option value="#2e8b57">Zielony</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Etykieta:</label>
              <input 
                type="text"
                value={icon.label}
                onChange={(e) => editIcon(storyIndex, selectedPageIndex, selectedIconIndex, 'label', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-2 mt-2">
              <button 
                onClick={() => deleteIcon(storyIndex, selectedPageIndex, selectedIconIndex)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
              >
                Usuń ikonę
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>Kliknij na mapie, aby utworzyć nową ikonę.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Edytor Historii</h2>
        <div className="space-x-2">
          <input 
            type="file"
            ref={storiesInputRef}
            onChange={importStories}
            className="hidden"
            accept=".json"
          />
          <button 
            onClick={() => storiesInputRef.current?.click()}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Importuj JSON
          </button>
          <button 
            onClick={exportStories}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Eksportuj JSON
          </button>
          <button 
            onClick={addNewStory}
            className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            disabled={scenarios.length === 0}
          >
            Dodaj Historię
          </button>
        </div>
      </div>
      
      {stories.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">Brak historii do wyświetlenia</p>
          <p className="text-sm text-gray-400">Zaimportuj istniejące historie lub dodaj nowe</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story, storyIndex) => {
            const relatedScenario = scenarios.find(s => s.id === story.scenarioId);
            return (
              <div key={storyIndex} className="border rounded-lg overflow-hidden">
                <div className="bg-amber-100 p-4 flex justify-between items-center">
                  <div>
                    <span className="font-medium">
                      Historia dla scenariusza: {relatedScenario ? relatedScenario.name : `ID: ${story.scenarioId}`}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      {story.pages.length} stron
                    </span>
                  </div>
                  <div className="space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedStoryId(story.scenarioId);
                        setSelectedPageIndex(0);
                        setMapVisible(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edytuj
                    </button>
                    <button 
                      onClick={() => deleteStory(storyIndex)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
                
                {selectedStoryId === story.scenarioId && (
                  <div className="p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Scenariusz:</label>
                      <select 
                        value={story.scenarioId}
                        onChange={(e) => {
                          const updatedStories = [...stories];
                          updatedStories[storyIndex].scenarioId = parseInt(e.target.value);
                          setStories(updatedStories);
                        }}
                        className="w-full p-2 border rounded"
                      >
                        {scenarios.map((scenario) => (
                          <option key={scenario.id} value={scenario.id}>
                            {scenario.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Nawigacja stron */}
                    <div className="flex flex-wrap mb-4">
                      {story.pages.map((page, pageIndex) => (
                        <button 
                          key={pageIndex}
                          onClick={() => setSelectedPageIndex(pageIndex)}
                          className={`px-3 py-1 mr-2 mb-2 rounded ${
                            selectedPageIndex === pageIndex 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-amber-100 hover:bg-amber-200'
                          }`}
                        >
                          Strona {pageIndex + 1}
                        </button>
                      ))}
                      <button 
                        onClick={() => addNewPage(storyIndex)}
                        className="px-3 py-1 mr-2 mb-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        + Dodaj stronę
                      </button>
                    </div>
                    
                    {/* Edycja wybranej strony */}
                    {story.pages[selectedPageIndex] && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Tytuł:</label>
                            <input 
                              type="text"
                              value={story.pages[selectedPageIndex].title}
                              onChange={(e) => editPage(storyIndex, selectedPageIndex, 'title', e.target.value)}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Data:</label>
                            <input 
                              type="text"
                              value={story.pages[selectedPageIndex].date}
                              onChange={(e) => editPage(storyIndex, selectedPageIndex, 'date', e.target.value)}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Opis historyczny:</label>
                          <textarea 
                            value={story.pages[selectedPageIndex].text}
                            onChange={(e) => editPage(storyIndex, selectedPageIndex, 'text', e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={4}
                          />
                        </div>
                        
                        {/* Narzędzia do zarządzania elementami mapy */}
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setShowArrowEditor(true);
                              setShowIconEditor(false);
                              setSelectedArrowIndex(null);
                            }}
                            className={`px-3 py-2 rounded ${
                              showArrowEditor 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            Edytuj strzałki
                          </button>
                          <button 
                            onClick={() => {
                              setShowIconEditor(true);
                              setShowArrowEditor(false);
                              setSelectedIconIndex(null);
                            }}
                            className={`px-3 py-2 rounded ${
                              showIconEditor 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            Edytuj ikony
                          </button>
                          <button 
                            onClick={() => addUnit(storyIndex, selectedPageIndex)}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Dodaj jednostkę
                          </button>
                        </div>
                        
                        {/* Podgląd mapy */}
                        {mapVisible && (
                          <MapEditor 
                            story={story}
                            storyIndex={storyIndex}
                            selectedPageIndex={selectedPageIndex}
                            showArrowEditor={showArrowEditor}
                            showIconEditor={showIconEditor}
                            selectedArrowIndex={selectedArrowIndex}
                            setSelectedArrowIndex={setSelectedArrowIndex}
                            editArrow={editArrow}
                            setStories={setStories}
                            stories={stories}
                            selectedIconIndex={selectedIconIndex}
                            setSelectedIconIndex={setSelectedIconIndex}
                          />
                        )}
                        
                        {/* Edytory elementów */}
                        {renderArrowEditor()}
                        {renderIconEditor()}
                        
                        {/* Lista jednostek */}
                        <div className="mt-4">
                          <h3 className="font-medium mb-2">Jednostki</h3>
                          {story.pages[selectedPageIndex].units.length === 0 ? (
                            <p className="text-sm text-gray-500">Brak jednostek. Kliknij "Dodaj jednostkę", aby dodać.</p>
                          ) : (
                            <table className="min-w-full bg-white border">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="py-2 px-4 border-b text-left">Nazwa</th>
                                  <th className="py-2 px-4 border-b text-left">Szablon</th>
                                  <th className="py-2 px-4 border-b text-center">Akcje</th>
                                </tr>
                              </thead>
                              <tbody>
                                {story.pages[selectedPageIndex].units.map((unit, unitIndex) => (
                                  <tr key={unitIndex} className="border-b">
                                    <td className="py-2 px-4">
                                      <input 
                                        type="text"
                                        value={unit.name}
                                        onChange={(e) => editUnit(storyIndex, selectedPageIndex, unitIndex, 'name', e.target.value)}
                                        className="w-full p-1 border rounded"
                                      />
                                    </td>
                                    <td className="py-2 px-4">
                                      <select 
                                        value={unit.template}
                                        onChange={(e) => editUnit(storyIndex, selectedPageIndex, unitIndex, 'template', e.target.value)}
                                        className="w-full p-1 border rounded"
                                      >
                                        {cards.map((card, cardIndex) => (
                                          <option key={cardIndex} value={card.name}>
                                            {card.name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                      <button 
                                        onClick={() => deleteUnit(storyIndex, selectedPageIndex, unitIndex)}
                                        className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                      >
                                        Usuń
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                        
                        {/* Przyciski kontrolne dla strony */}
                        <div className="flex justify-between mt-6">
                          <button 
                            onClick={() => deletePage(storyIndex, selectedPageIndex)}
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            disabled={story.pages.length <= 1}
                          >
                            Usuń stronę
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedStoryId(null);
                              setMapVisible(false);
                            }}
                            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Zakończ edycję
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StoriesTab;