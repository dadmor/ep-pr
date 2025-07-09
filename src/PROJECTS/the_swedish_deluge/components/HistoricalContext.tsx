// src/PROJECTS/potop_szwedzki_mapa/components/HistoricalContext.tsx
import React, { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import ActionButton from "./ActionButton";
import Card from "./Card";
import { Motion, spring } from "react-motion";
import ScenarioMap from "./ScenarioMap";

interface HistoricalContextProps {
  scenarioIndex: number;
  onContinue: () => void;
}

const HistoricalContext: React.FC<HistoricalContextProps> = ({ 
  scenarioIndex, 
  onContinue 
}) => {
  const { scenarios, mapData, scenarioHistories } = useGameStore();
  const [currentPage, setCurrentPage] = useState(0);
  const scenario = scenarios[scenarioIndex];
  const history = scenarioHistories[scenarioIndex];
  
  // If there's no history data for this scenario, skip to the next step
  useEffect(() => {
    if (!history || history.pages.length === 0) {
      onContinue();
    }
  }, [history, onContinue]);

  if (!mapData || !scenario || !history || history.pages.length === 0) {
    return null;
  }
  
  const currentPageData = history.pages[currentPage];
  const isLastPage = currentPage === history.pages.length - 1;
  
  const handleNextPage = () => {
    if (isLastPage) {
      onContinue();
    } else {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* Heading */}
      <div className="bg-amber-900 text-amber-100 py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold">{scenario.name} - Historical Background</h1>
        <p className="text-sm opacity-80">
          Page {currentPage + 1} of {history.pages.length}
        </p>
      </div>

      {/* Main content area - Z DODANYM SCROLLEM! */}
      <div className="flex-grow overflow-auto">
        <div className="relative" style={{ height: "calc(100vh - 140px)" }}>
          {/* ScenarioMap component */}
          <ScenarioMap
            scenarios={scenarios}
            currentIndex={scenarioIndex}
            onSelectScenario={() => {}} // Disabled in history mode
            isAnimating={false}
            historyMode={true}  // Enable history mode
            historyArrows={currentPageData.arrows || []}  // Pass current arrows
            historyIcons={currentPageData.icons || []}    // Pass current icons
          />

          {/* Historical text panel */}
          <div className="absolute top-4 left-4 z-30 w-96 max-w-md bg-amber-900 bg-opacity-90 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl text-amber-100 font-bold mb-3">
              {currentPageData.title}
            </h2>
            <div className="text-amber-100 text-sm leading-relaxed mb-4 max-h-48 overflow-y-auto">
              {currentPageData.text}
            </div>
            <div className="text-xs text-amber-200 italic">
              {currentPageData.date}
            </div>
          </div>
          
          {/* Units showcase */}
          {currentPageData.units && currentPageData.units.length > 0 && (
            <div className="absolute bottom-4 right-4 z-30 bg-gray-900 bg-opacity-80 rounded-lg p-4 shadow-lg">
              <h3 className="text-white text-lg font-bold mb-3">Forces Involved</h3>
              <div className="flex space-x-4 overflow-x-auto pb-2 max-w-2xl">
                {currentPageData.units.map((unit, idx) => (
                  <Motion
                    key={`unit-${idx}`}
                    defaultStyle={{ y: 50, opacity: 0 }}
                    style={{ 
                      y: spring(0, { stiffness: 120, damping: 14 }),
                      opacity: spring(1, { stiffness: 60, damping: 15 })
                    }}
                  >
                    {({ y, opacity }) => (
                      <div style={{ transform: `translateY(${y}px)`, opacity }}>
                        <Card card={unit} />
                        <div className="text-center text-white text-xs mt-1">
                          {unit.faction}
                        </div>
                      </div>
                    )}
                  </Motion>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="bg-amber-900 py-4 px-6 flex justify-between shadow-inner">
        <ActionButton 
          onClick={handlePrevPage} 
          disabled={currentPage === 0}
          className="w-36"
        >
          Previous
        </ActionButton>
        
        <ActionButton 
          onClick={handleNextPage}
          className="w-36"
        >
          {isLastPage ? "Continue to Deck Building" : "Next"}
        </ActionButton>
      </div>
    </div>
  );
};

export default HistoricalContext;