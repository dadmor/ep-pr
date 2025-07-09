import React, { useRef, useEffect, useState } from "react";
import { Scenario, HistoricalArrow, HistoricalIcon } from "../types";
import { useGameStore } from "../store/gameStore";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import BattleArrow from "./tacticsMap/BattleArrow"; 
import MapPatterns from "./tacticsMap/MapPatterns";

// Map styling constants with historical aesthetics
const MAP_CONSTANTS = {
  CIRCLE_SIZE_FACTOR: 0.75,
  NODE_RADIUS_FACTOR: 0.12,
  PATH_STROKE_WIDTH: 2,
  PATH_OPACITY: 0.8,
  ZOOM_FACTOR: 1.5,
  ZOOM_TRANSITION: 800,
};

interface ScenarioMapProps {
  scenarios: Scenario[];
  currentIndex: number;
  onSelectScenario: (index: number) => void;
  isAnimating: boolean;
  // Props for historical elements
  historyMode?: boolean;
  historyArrows?: HistoricalArrow[];
  historyIcons?: HistoricalIcon[];
}

const ScenarioMap: React.FC<ScenarioMapProps> = ({
  scenarios,
  currentIndex,
  onSelectScenario,
  isAnimating,
  historyMode = false,
  historyArrows = [],
  historyIcons = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [viewBox, setViewBox] = useState("0 0 800 600");
  const { mapData } = useGameStore();
  
  // Auto-animate refs for historical elements
  const [arrowsContainerRef] = useAutoAnimate<SVGGElement>({
    duration: 800,
    easing: 'ease-in-out'
  });
  
  const [iconsContainerRef] = useAutoAnimate<SVGGElement>({
    duration: 500,
    easing: 'ease-out'
  });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
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
      const city = mapData.cities.find((c) => c.id === cityId);

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
        const currentViewBox = viewBox.split(" ").map(Number);
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
          const currentWidth =
            startWidth + (zoomedWidth - startWidth) * easeProgress;
          const currentHeight =
            startHeight + (zoomedHeight - startHeight) * easeProgress;

          setViewBox(
            `${currentX} ${currentY} ${currentWidth} ${currentHeight}`
          );
          requestAnimationFrame(animateViewBox);
        };

        requestAnimationFrame(animateViewBox);
      }
    }
  }, [currentIndex, dimensions, scenarios, mapData, viewBox]);

  // Render the map
  if (!mapData || scenarios.length === 0) return <div>Loading map...</div>;

  return (
    <div className="w-full h-full bg-amber-50" ref={containerRef}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pattern and filter definitions */}
        <defs>
          {/* Wzory zostały wydzielone do osobnego komponentu */}
          <MapPatterns />
          
          {/* Filtry pozostają w głównym komponencie */}
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0" />
            <feComposite operator="in" in2="SourceGraphic" result="noisy" />
          </filter>
          
          <filter id="aged" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="0.5" />
            <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.95 0" />
          </filter>
          
          <filter id="cityGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="cityInnerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset result="offOut" in="SourceGraphic" dx="1" dy="1" />
            <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" />
            <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="1" />
            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
          </filter>
        </defs>
        
        {/* Background with paper texture and grid */}
        <rect
          x="0"
          y="0"
          width={mapData.mapSize.width}
          height={mapData.mapSize.height}
          fill="url(#gridPattern)"
          filter="url(#aged)"
        />
        
        {/* Render provinces with historical textures */}
        {mapData.provinces.map((province, idx) => (
          <path
            key={`province-${province.id}`}
            d={
              province.path
                .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`)
                .join(" ") + "Z"
            }
            fill={`url(#provinceTexture${(idx % 4) + 1})`} 
            stroke={province.color}
            strokeWidth={3}
            opacity={0.9}
          />
        ))}
        
        {/* Province labels */}
        {mapData.provinces.map((province) => {
          // Calculate province center
          const sumX = province.path.reduce((sum, pt) => sum + pt.x, 0);
          const sumY = province.path.reduce((sum, pt) => sum + pt.y, 0);
          const centerX = sumX / province.path.length;
          const centerY = sumY / province.path.length;
          
          return (
            <text
              key={`province-label-${province.id}`}
              x={centerX}
              y={centerY}
              textAnchor="middle"
              fill="#5d4037"
              fontSize="14"
              fontFamily="'Playfair Display', serif"
              fontStyle="italic"
              opacity="0.7"
              filter="url(#textShadow)"
            >
              {province.name}
            </text>
          );
        })}

        {/* Render cities with historical styling */}
        {mapData.cities.map((city) => {
          const isScenarioCity = scenarios.some((s) => s.cityId === city.id);
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

              {/* City base - wszystkie miasta jako okręgi z wewnętrznym outlineiem i blur */}
              <circle
                cx={city.position.x}
                cy={city.position.y}
                r={city.size}
                fill="#e8d9c0"
                filter="url(#cityInnerGlow)"
                className={
                  isScenarioCity && !historyMode ? "cursor-pointer" : ""
                }
                onClick={() => {
                  // Find scenario index for this city
                  const scenarioIndex = scenarios.findIndex(
                    (s) => s.cityId === city.id
                  );
                  if (scenarioIndex !== -1 && !isAnimating && !historyMode) {
                    onSelectScenario(scenarioIndex);
                  }
                }}
              />
              
              {/* City border - wewnętrzny kontur */}
              <circle
                cx={city.position.x}
                cy={city.position.y}
                r={city.size - 2}
                fill="none"
                stroke={city.color}
                strokeWidth={3}
                strokeOpacity={0.9}
              />

              {/* Inner decoration */}
              <circle
                cx={city.position.x}
                cy={city.position.y}
                r={city.size * 0.5}
                fill={city.color}
                opacity={0.8}
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
                    values={`${city.size + 5};${city.size + 15};${
                      city.size + 5
                    }`}
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

              {/* City label with historical font */}
              <text
                x={city.position.x}
                y={city.position.y + city.size + 15}
                textAnchor="middle"
                fill="#3e2723"
                fontSize={14}
                fontFamily="'Playfair Display', serif"
                fontWeight={isCurrentCity ? "bold" : "normal"}
                filter="url(#textShadow)"
              >
                {city.name}
              </text>
            </g>
          );
        })}

        {/* HISTORICAL ELEMENTS */}
        {historyMode && (
          <>
            {/* Render historical arrows with auto-animate */}
            <g ref={arrowsContainerRef}>
              {historyArrows.map((arrow, idx) => (
                <BattleArrow 
                  key={`arrow-${idx}`} 
                  arrow={arrow} 
                />
              ))}
            </g>

            {/* Render historical icons with auto-animate */}
            <g ref={iconsContainerRef}>
              {historyIcons.map((icon, idx) => (
                <g
                  key={`icon-${idx}`}
                  transform={`translate(${icon.position.x}, ${icon.position.y})`}
                  className="transition-all duration-500"
                >
                  {/* Icon background */}
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    fill={icon.color || "#2196f3"}
                    stroke="#e8d9c0"
                    strokeWidth="2"
                    filter="url(#cityGlow)"
                  />

                  {/* Icon content - using historical symbols */}
                  {icon.type === "infantry" && (
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill="#e8d9c0"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      👤
                    </text>
                  )}
                  {icon.type === "cavalry" && (
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill="#e8d9c0"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      🐎
                    </text>
                  )}
                  {icon.type === "artillery" && (
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill="#e8d9c0"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      💣
                    </text>
                  )}
                  {icon.type === "navy" && (
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill="#e8d9c0"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      ⚓
                    </text>
                  )}
                  {icon.type === "battle" && (
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill="#e8d9c0"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      ⚔️
                    </text>
                  )}

                  {/* Label with historical style */}
                  {icon.label && (
                    <text
                      x="0"
                      y="35"
                      textAnchor="middle"
                      fill="#3e2723"
                      fontSize="12"
                      fontFamily="'Playfair Display', serif"
                      fontWeight="bold"
                      filter="url(#textShadow)"
                    >
                      {icon.label}
                    </text>
                  )}
                </g>
              ))}
            </g>
          </>
        )}
      </svg>
    </div>
  );
};

export default React.memo(ScenarioMap);