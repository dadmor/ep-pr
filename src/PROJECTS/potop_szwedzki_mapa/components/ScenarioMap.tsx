import React, { useRef, useEffect, useState } from "react";
import { Scenario } from "../types";

// Map styling constants
const MAP_CONSTANTS = {
  CIRCLE_SIZE_FACTOR: 0.75,
  NODE_RADIUS_FACTOR: 0.12,
  PATH_STROKE_WIDTH: 2,
  PATH_OPACITY: 0.7
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
  
  // Update dimensions on resize and scroll map to center current scenario
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
  
  // Center map on current scenario
  useEffect(() => {
    if (svgRef.current && dimensions.width > 0 && scenarios.length > 0) {
      // Get the position of the current scenario
      const currentPosition = getCirclePosition(currentIndex, scenarios.length);
      
      // Get SVG viewport dimensions
      const svgElement = svgRef.current;
      
      // Center the view on the current scenario
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      
      // Only apply centering if we have a valid current scenario
      if (currentPosition && currentIndex >= 0) {
        // No need to adjust viewBox, as we're using preserveAspectRatio="xMidYMid meet"
        // The current scenario is already centered in our coordinate system
      }
    }
  }, [currentIndex, dimensions, scenarios.length]);
  
  // Get circle parameters based on container size
  const getCircleParams = () => {
    const { width, height } = dimensions;
    const size = Math.min(width, height) * MAP_CONSTANTS.CIRCLE_SIZE_FACTOR;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = size / 2;
    
    return { centerX, centerY, radius };
  };
  
  // Calculate positions in a circle
  const getCirclePosition = (index: number, total: number) => {
    const { centerX, centerY, radius } = getCircleParams();
    const nodeRadius = radius * MAP_CONSTANTS.NODE_RADIUS_FACTOR;
    
    // Start from top and go clockwise
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    
    return {
      x: centerX + (radius - nodeRadius) * Math.cos(angle),
      y: centerY + (radius - nodeRadius) * Math.sin(angle),
      nodeRadius
    };
  };
  
  // Map background elements - mountains, forests, etc.
  
  if (scenarios.length === 0) return <div>Loading map...</div>;
  
  return (
    <div className="w-full h-full" ref={containerRef}>
      <svg 
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main Path Circle Highlight - more visible */}
        {dimensions.width > 0 && (
          <circle
            cx={getCircleParams().centerX}
            cy={getCircleParams().centerY}
            r={getCircleParams().radius}
            fill="none"
            stroke="#9ca3af"
            strokeWidth={MAP_CONSTANTS.PATH_STROKE_WIDTH}
            strokeDasharray="5,5"
            opacity={MAP_CONSTANTS.PATH_OPACITY}
          />
        )}
        
        {/* Render scenario nodes */}
        {scenarios.map((scenario, index) => {
          if (dimensions.width === 0) return null;
          
          const position = getCirclePosition(index, scenarios.length);
          const isCurrentScenario = index === currentIndex;
          
          return (
            <g key={`scenario-${index}`}>
              {/* Scenario Node */}
              <circle
                cx={position.x}
                cy={position.y}
                r={position.nodeRadius}
                fill={isCurrentScenario ? "#4f46e5" : "#6b7280"}
                stroke={isCurrentScenario ? "#c7d2fe" : "#9ca3af"}
                strokeWidth={isCurrentScenario ? 3 : 1}
                className={!isAnimating ? "cursor-pointer hover:stroke-white transition-colors" : ""}
                onClick={() => !isAnimating && onSelectScenario(index)}
              />
              
              {/* Scenario Label */}
              <text
                x={position.x}
                y={position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={position.nodeRadius * 0.7}
                fontWeight={isCurrentScenario ? "bold" : "normal"}
                pointerEvents="none"
              >
                {index + 1}
              </text>
              
              {/* Scenario Name Tooltip */}
              <text
                x={position.x}
                y={position.y - position.nodeRadius * 1.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={isCurrentScenario ? 14 : 12}
                fontWeight={isCurrentScenario ? "bold" : "normal"}
                opacity={isCurrentScenario ? 1 : 0.7}
                pointerEvents="none"
                className="drop-shadow-md"
              >
                {scenario.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default React.memo(ScenarioMap);