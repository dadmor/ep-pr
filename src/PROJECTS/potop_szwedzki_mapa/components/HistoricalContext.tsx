// src/PROJECTS/potop_szwedzki_mapa/components/HistoricalContext.tsx
import React, { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import ActionButton from "./ActionButton";
import Card from "./Card";
import { Motion, spring } from "react-motion";

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
    <div className="relative w-full h-screen bg-amber-50 overflow-hidden flex flex-col">
      {/* Heading */}
      <div className="bg-amber-900 text-amber-100 py-4 px-6 z-10 shadow-md">
        <h1 className="text-2xl font-bold">{scenario.name} - Historical Background</h1>
        <p className="text-sm opacity-80">
          Page {currentPage + 1} of {history.pages.length}
        </p>
      </div>

      {/* Map with strategic elements */}
      <div className="relative flex-grow">
        {/* SVG overlay for arrows and icons */}
        <svg 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {currentPageData.arrows?.map((arrow, idx) => (
            <Motion
              key={`arrow-${idx}`}
              defaultStyle={{ progress: 0 }}
              style={{ progress: spring(1, { stiffness: 60, damping: 15 }) }}
            >
              {({ progress }) => {
                // Calculate the path for the arrow
                const pathLength = Math.sqrt(
                  Math.pow(arrow.end.x - arrow.start.x, 2) + 
                  Math.pow(arrow.end.y - arrow.start.y, 2)
                );
                
                // Draw only the portion of the path based on animation progress
                const x2 = arrow.start.x + (arrow.end.x - arrow.start.x) * progress;
                const y2 = arrow.start.y + (arrow.end.y - arrow.start.y) * progress;
                
                // Arrow head calculations
                const angle = Math.atan2(y2 - arrow.start.y, x2 - arrow.start.x);
                const headLength = 15; // Length of arrow head
                
                return (
                  <g>
                    {/* Arrow line */}
                    <line
                      x1={arrow.start.x}
                      y1={arrow.start.y}
                      x2={x2}
                      y2={y2}
                      stroke={arrow.color || "#ff5722"}
                      strokeWidth={4}
                      strokeDasharray={arrow.dashed ? "10,10" : "none"}
                      strokeLinecap="round"
                    />
                    
                    {/* Arrow head */}
                    {progress > 0.9 && (
                      <>
                        <line
                          x1={x2}
                          y1={y2}
                          x2={x2 - headLength * Math.cos(angle - Math.PI / 6)}
                          y2={y2 - headLength * Math.sin(angle - Math.PI / 6)}
                          stroke={arrow.color || "#ff5722"}
                          strokeWidth={4}
                          strokeLinecap="round"
                        />
                        <line
                          x1={x2}
                          y1={y2}
                          x2={x2 - headLength * Math.cos(angle + Math.PI / 6)}
                          y2={y2 - headLength * Math.sin(angle + Math.PI / 6)}
                          stroke={arrow.color || "#ff5722"}
                          strokeWidth={4}
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </g>
                );
              }}
            </Motion>
          ))}
          
          {currentPageData.icons?.map((icon, idx) => (
            <Motion
              key={`icon-${idx}`}
              defaultStyle={{ scale: 0, opacity: 0 }}
              style={{ 
                scale: spring(1, { stiffness: 120, damping: 8 }),
                opacity: spring(1, { stiffness: 60, damping: 15 })
              }}
            >
              {({ scale, opacity }) => (
                <g
                  transform={`translate(${icon.position.x}, ${icon.position.y}) scale(${scale})`}
                  opacity={opacity}
                >
                  {/* Circle background */}
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    fill={icon.color || "#2196f3"}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  
                  {/* Icon content (simplified representations) */}
                  {icon.type === "infantry" && (
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">👤</text>
                  )}
                  {icon.type === "cavalry" && (
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">🐎</text>
                  )}
                  {icon.type === "artillery" && (
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">💣</text>
                  )}
                  {icon.type === "navy" && (
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">⚓</text>
                  )}
                  {icon.type === "battle" && (
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">⚔️</text>
                  )}
                  
                  {/* Label */}
                  {icon.label && (
                    <text
                      x="0"
                      y="35"
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      stroke="#000"
                      strokeWidth="4"
                      strokeLinejoin="round"
                      paintOrder="stroke"
                    >
                      {icon.label}
                    </text>
                  )}
                </g>
              )}
            </Motion>
          ))}
        </svg>
        
        {/* Historical text panel */}
        <div className="absolute top-4 left-4 z-30 w-96 max-w-md bg-amber-900 bg-opacity-90 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl text-amber-100 font-bold mb-3">
            {currentPageData.title}
          </h2>
          <div className="text-amber-100 text-sm leading-relaxed mb-4">
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
      
      {/* Navigation buttons */}
      <div className="bg-amber-900 py-4 px-6 flex justify-between z-10">
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