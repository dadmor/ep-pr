import React, { useRef, useEffect, useState } from "react";
import { Scenario, HistoricalArrow, HistoricalIcon } from "../types";
import { useGameStore } from "../store/gameStore";
import { Motion, spring } from "react-motion";

// Map styling constants
const MAP_CONSTANTS = {
  CIRCLE_SIZE_FACTOR: 0.75,
  NODE_RADIUS_FACTOR: 0.12,
  PATH_STROKE_WIDTH: 2,
  PATH_OPACITY: 0.7,
  ZOOM_FACTOR: 1.5, // Zoom factor when focusing on a city
  ZOOM_TRANSITION: 800, // Transition time in ms
};

interface ScenarioMapProps {
  scenarios: Scenario[];
  currentIndex: number;
  onSelectScenario: (index: number) => void;
  isAnimating: boolean;
  // New props for historical elements
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

    // Initial size
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Cleanup
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
        {mapData.provinces.map((province) => (
          <path
            key={`province-${province.id}`}
            d={
              province.path
                .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`)
                .join(" ") + "Z"
            }
            fill="#3BAF4B"
            stroke={province.color}
            strokeWidth={3}
            opacity={0.7}
          />
        ))}

        {/* Render cities */}
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

              {/* City base */}
              <circle
                cx={city.position.x}
                cy={city.position.y}
                r={city.size}
                fill="#F8F8F8"
                stroke={city.color}
                strokeWidth={3}
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

        {/* HISTORICAL ELEMENTS - Now integrated directly in the map */}
        {historyMode && (
          <>
            {/* Render historical arrows */}
            {historyArrows.map((arrow, idx) => (
              <Motion
                key={`arrow-${idx}`}
                defaultStyle={{ progress: 0 }}
                style={{ progress: spring(1, { stiffness: 60, damping: 15 }) }}
              >
                {({ progress }) => {
                  // Draw only the portion of the path based on animation progress
                  const x2 =
                    arrow.start.x + (arrow.end.x - arrow.start.x) * progress;
                  const y2 =
                    arrow.start.y + (arrow.end.y - arrow.start.y) * progress;

                  // Arrow head calculations
                  const angle = Math.atan2(
                    y2 - arrow.start.y,
                    x2 - arrow.start.x
                  );
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

            {/* Render historical icons */}
            {historyIcons.map((icon, idx) => (
              <Motion
                key={`icon-${idx}`}
                defaultStyle={{ scale: 0, opacity: 0 }}
                style={{
                  scale: spring(1, { stiffness: 120, damping: 8 }),
                  opacity: spring(1, { stiffness: 60, damping: 15 }),
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
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="white"
                        fontSize="14"
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
                        fill="white"
                        fontSize="14"
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
                        fill="white"
                        fontSize="14"
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
                        fill="white"
                        fontSize="14"
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
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        ⚔️
                      </text>
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
          </>
        )}
      </svg>
    </div>
  );
};

export default React.memo(ScenarioMap);
