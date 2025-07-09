import React, { useRef, useEffect, useState } from "react";
import { Scenario } from "../types";
import { useGameStore } from "../store/gameStore";

// Map styling constants
const MAP_CONSTANTS = {
  CIRCLE_SIZE_FACTOR: 0.75,
  NODE_RADIUS_FACTOR: 0.12,
  PATH_STROKE_WIDTH: 2,
  PATH_OPACITY: 0.7,
  ZOOM_FACTOR: 1.5, // Zoom factor when focusing on a city
  ZOOM_TRANSITION: 800 // Transition time in ms
};

interface ScenarioMapProps {
  scenarios: Scenario[];
  currentIndex: number;
  onSelectScenario: (index: number) => void;
  isAnimating: boolean;
}

const ScenarioMap: React.FC<ScenarioMapProps> = ({ 
  scenarios, 
  currentIndex, 
  onSelectScenario, 
  isAnimating 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [viewBox, setViewBox] = useState("0 0 800 600");
  const { mapData } = useGameStore();
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Initial size
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Center map on current scenario city
  useEffect(() => {
    if (
      svgRef.current && 
      dimensions.width > 0 && 
      scenarios.length > 0 && 
      mapData && 
      mapData.cities.length > 0
    ) {
      // Get the city ID from the current scenario
      const currentScenario = scenarios[currentIndex];
      const cityId = currentScenario?.cityId;
      
      // Find the city in map data
      const city = mapData.cities.find(c => c.id === cityId);
      
      if (city) {
        // Center and zoom on the city
        const { width, height } = mapData.mapSize;
        const zoomedWidth = width / MAP_CONSTANTS.ZOOM_FACTOR;
        const zoomedHeight = height / MAP_CONSTANTS.ZOOM_FACTOR;
        
        // Calculate the new viewBox
        const x = Math.max(0, city.position.x - zoomedWidth / 2);
        const y = Math.max(0, city.position.y - zoomedHeight / 2);
        
        // Adjust to keep within map bounds
        const adjustedX = Math.min(x, width - zoomedWidth);
        const adjustedY = Math.min(y, height - zoomedHeight);
        
        // Set new viewBox with transition
        const newViewBox = `${adjustedX} ${adjustedY} ${zoomedWidth} ${zoomedHeight}`;
        
        // Transition viewBox animation
        const startTime = Date.now();
        const endTime = startTime + MAP_CONSTANTS.ZOOM_TRANSITION;
        
        // Parse current viewBox
        const currentViewBox = viewBox.split(' ').map(Number);
        const [startX, startY, startWidth, startHeight] = currentViewBox;
        
        const animateViewBox = () => {
          const now = Date.now();
          if (now >= endTime) {
            setViewBox(newViewBox);
            return;
          }
          
          const progress = (now - startTime) / MAP_CONSTANTS.ZOOM_TRANSITION;
          const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Smooth easing
          
          const currentX = startX + (adjustedX - startX) * easeProgress;
          const currentY = startY + (adjustedY - startY) * easeProgress;
          const currentWidth = startWidth + (zoomedWidth - startWidth) * easeProgress;
          const currentHeight = startHeight + (zoomedHeight - startHeight) * easeProgress;
          
          setViewBox(`${currentX} ${currentY} ${currentWidth} ${currentHeight}`);
          requestAnimationFrame(animateViewBox);
        };
        
        requestAnimationFrame(animateViewBox);
      }
    }
  }, [currentIndex, dimensions, scenarios, mapData]);
  
  // Render the map
  if (!mapData || scenarios.length === 0) return <div>Loading map...</div>;
  
  return (
    <div className="w-full h-full" ref={containerRef}>
      <svg 
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render provinces */}
        {mapData.provinces.map(province => (
          <path
            key={`province-${province.id}`}
            d={province.path.map((pt, i) => 
              `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`
            ).join(' ') + 'Z'}
            fill="#3BAF4B"
            stroke={province.color}
            strokeWidth={3}
            opacity={0.7}
          />
        ))}
        
        {/* Render cities */}
        {mapData.cities.map(city => {
          const isScenarioCity = scenarios.some(s => s.cityId === city.id);
          const isCurrentCity = scenarios[currentIndex]?.cityId === city.id;
          
          return (
            <g key={`city-${city.id}`}>
              {/* City shadow */}
              <circle
                cx={city.position.x + 2}
                cy={city.position.y + 4}
                r={city.size}
                fill="rgba(0,0,0,0.4)"
                opacity={0.7}
              />
              
              {/* City base */}
              <circle
                cx={city.position.x}
                cy={city.position.y}
                r={city.size}
                fill="#F8F8F8"
                stroke={city.color}
                strokeWidth={3}
                className={isScenarioCity ? "cursor-pointer" : ""}
                onClick={() => {
                  // Find scenario index for this city
                  const scenarioIndex = scenarios.findIndex(s => s.cityId === city.id);
                  if (scenarioIndex !== -1 && !isAnimating) {
                    onSelectScenario(scenarioIndex);
                  }
                }}
              />
              
              {/* Inner circle */}
              <circle
                cx={city.position.x}
                cy={city.position.y}
                r={city.size * 0.6}
                fill={city.color}
              />
              
              {/* City glow for current scenario */}
              {isCurrentCity && (
                <circle
                  cx={city.position.x}
                  cy={city.position.y}
                  r={city.size + 10}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth={2}
                  opacity={0.8}
                  strokeDasharray="5,5"
                >
                  <animate 
                    attributeName="r" 
                    values={`${city.size + 5};${city.size + 15};${city.size + 5}`}
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="opacity" 
                    values="0.3;0.8;0.3" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </circle>
              )}
              
              {/* City label */}
              <text
                x={city.position.x}
                y={city.position.y + city.size + 15}
                textAnchor="middle"
                fill="white"
                fontSize={12}
                fontWeight={isCurrentCity ? "bold" : "normal"}
                stroke="#000"
                strokeWidth={0.5}
                paintOrder="stroke"
              >
                {city.name}
              </text>
            </g>
          );
        })}
        
        {/* Map legend */}
        <g transform={`translate(20, ${mapData.mapSize.height - 60})`}>
          <rect
            x={0}
            y={0}
            width={180}
            height={50}
            fill="rgba(0,0,0,0.5)"
            rx={5}
          />
          <text
            x={10}
            y={20}
            fill="white"
            fontSize={12}
          >
            Current scenario:
          </text>
          <text
            x={10}
            y={40}
            fill="#FFD700"
            fontSize={14}
            fontWeight="bold"
          >
            {scenarios[currentIndex]?.name || "None"}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default React.memo(ScenarioMap);