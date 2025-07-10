// src/PROJECTS/potop_szwedzki_mapa/components/HistoricalContext.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useGameStore } from "../store/gameStore";
import ActionButton from "./ActionButton";
import Card from "./Card";
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
  
  // Auto-animate refs
  const [unitsContainerRef] = useAutoAnimate<HTMLDivElement>({ 
    duration: 500,
    easing: 'ease-out'
  });
  
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

  // Find the current city info 
  const cityInfo = mapData.cities.find(city => city.id === scenario.cityId);

  return (
    <div className="flex flex-col h-screen relative overflow-hidden"
         style={{
           backgroundImage: "url('/assets/parchment-background.jpg')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundColor: "#f3e8d2" // Jasny kolor pergaminu jako fallback
         }}>
      
      {/* Aged map overlay - semi-transparent */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-30"
           style={{
             backgroundImage: "url('/assets/old-polish-map.jpg')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             filter: "sepia(0.5) contrast(1.05) brightness(1.1)"
           }}></div>
      
      {/* Burned edges overlay */}
      <div className="absolute inset-0 w-full h-full z-0"
           style={{
             background: "radial-gradient(ellipse at center, transparent 60%, rgba(58, 30, 0, 0.3) 100%)",
             pointerEvents: "none"
           }}></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-80 z-10"
           style={{
             backgroundImage: "url('/assets/ornament-corner.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat"
           }}></div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-80 z-10 transform scale-x-[-1]"
           style={{
             backgroundImage: "url('/assets/ornament-corner.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat"
           }}></div>

      {/* Heading */}
      <div className="relative z-10 py-5 px-6 border-b-2 border-amber-800" 
           style={{
             background: "url('/assets/dark-parchment.jpg')",
             backgroundSize: "cover",
             boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
           }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-amber-800 mr-4"
                 style={{ 
                   backgroundColor: cityInfo?.color || "#d4a76a",
                   boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                 }}></div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-amber-900"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                {scenario.name}
              </h1>
              <div className="text-sm text-amber-800 font-serif italic">
                Historical Background - {cityInfo?.name || "Unknown Location"}
              </div>
            </div>
          </div>
          <div className="text-amber-800 font-serif">
            <span className="text-sm border-b border-amber-700 pb-1">
              Chronicle {currentPage + 1} of {history.pages.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow relative z-10 overflow-hidden">
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
          <div className="absolute top-6 left-6 z-30 w-96 max-w-md rounded-lg shadow-lg overflow-hidden backdrop-blur-2xl bg-opacity-70"
               style={{
                 background: "url('/assets/dark-parchment.jpg')",
                 backgroundSize: "cover",
                 border: "2px solid #92400e",
                 boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
               }}>
            <div className="p-5">
              <h2 className="text-xl text-amber-800 font-serif font-bold mb-3"
                  style={{ textShadow: "1px 1px 1px rgba(255,255,255,0.2)" }}>
                {currentPageData.title}
              </h2>
              <div className="text-amber-900 font-serif text-sm leading-relaxed mb-4 max-h-48 overflow-y-auto">
                {currentPageData.text}
              </div>
              <div className="text-xs text-amber-700 italic font-serif border-t border-amber-600 pt-2">
                {currentPageData.date}
              </div>
            </div>
          </div>
          
          {/* Units showcase */}
          {currentPageData.units && currentPageData.units.length > 0 && (
            <div className="absolute bottom-6 right-6 z-30 rounded-lg shadow-lg overflow-hidden"
                 style={{
                   background: "url('/assets/light-parchment.jpg')",
                   backgroundSize: "cover",
                   border: "2px solid #92400e"
                 }}>
              <div className="p-4">
                <h3 className="text-amber-800 text-lg font-serif font-bold mb-3 border-b border-amber-600 pb-1">
                  Forces Involved
                </h3>
                <div 
                  ref={unitsContainerRef}
                  className="flex space-x-4 overflow-x-auto pb-2 max-w-2xl"
                >
                  {currentPageData.units.map((unit, idx) => (
                    <div key={`unit-${idx}`} className="transform transition-all">
                      <Card card={unit} />
                      <div className="text-center text-amber-800 font-serif text-xs mt-1">
                        {unit.faction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Decorative wax seal */}
          <div className="absolute bottom-24 right-24 w-16 h-16 opacity-90 z-20"
               style={{
                 backgroundImage: "url('/assets/wax-seal.png')",
                 backgroundSize: "contain",
                 backgroundRepeat: "no-repeat",
                 transform: "rotate(15deg)"
               }}></div>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="relative z-10 py-4 px-6 flex justify-between border-t-2 border-amber-800"
           style={{
             background: "url('/assets/dark-parchment.jpg')",
             backgroundSize: "cover",
             boxShadow: "0 -4px 8px rgba(0,0,0,0.1)"
           }}>
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 0}
          className={`py-2 px-8 rounded-lg font-serif transition-all duration-300 border-2 ${
            currentPage === 0 
              ? "bg-amber-100 opacity-50 text-amber-700 border-amber-300 cursor-not-allowed" 
              : "bg-amber-100 hover:bg-amber-50 text-amber-900 border-amber-700 hover:border-amber-800"
          }`}
          style={{
            backgroundImage: "url('/assets/light-parchment.jpg')",
            backgroundSize: "cover",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Previous
          </div>
        </button>
        
        <button 
          onClick={handleNextPage}
          className="py-2 px-8 rounded-lg font-serif font-bold transition-all duration-300 border-2 bg-amber-100 hover:bg-amber-50 text-amber-900 border-amber-700"
          style={{
            backgroundImage: "url('/assets/light-parchment.jpg')",
            backgroundSize: "cover",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          <div className="flex items-center">
            {isLastPage ? "Continue to Deck Building" : "Next"}
            <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
      
      {/* Decorative flourish at bottom */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-64 h-12 opacity-70 z-10"
           style={{
             backgroundImage: "url('/assets/decorative-flourish.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat",
             backgroundPosition: "center"
           }}></div>
    </div>
  );
};

export default HistoricalContext;