import React, { useState, useMemo } from 'react';

// Typy TypeScript
interface HexCoordinate {
  q: number;
  r: number;
  s: number;
}

interface TerrainType {
  color: string;
  name: string;
}

interface CityType {
  size: number;
  color: string;
  name: string;
}

interface City {
  type: keyof typeof CITY_TYPES;
  name: string;
}

interface HexGridProps {
  width: number;
  height: number;
  children: React.ReactNode;
  viewBox: string;
}

interface LayoutProps {
  size: { x: number; y: number };
  flat: boolean;
  spacing: number;
  origin: { x: number; y: number };
  children: React.ReactNode;
}

interface HexagonProps {
  q: number;
  r: number;
  s: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Symulacja biblioteki react-hexgrid z poprawkami
const HexGrid: React.FC<HexGridProps> = ({ width, height, children, viewBox }) => (
  <svg width={width} height={height} viewBox={viewBox} className="w-full h-auto">
    {children}
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ size, flat, spacing, origin, children }) => (
  <g transform={`translate(${origin.x}, ${origin.y})`}>
    {children}
  </g>
);

const Hexagon: React.FC<HexagonProps> = ({ 
  q, r, s, fill, stroke, strokeWidth, onClick, className, style, children, ...props 
}) => {
  const size = 30;
  const height = Math.sqrt(3) * size;
  
  // Konwersja współrzędnych cube na pixel (flat-top orientation)
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  
  // Punkty heksagonu (flat-top)
  const points = [
    [x + size, y],
    [x + size/2, y + height/2],
    [x - size/2, y + height/2],
    [x - size, y],
    [x - size/2, y - height/2],
    [x + size/2, y - height/2]
  ].map(([px, py]) => `${px},${py}`).join(' ');

  return (
    <g>
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onClick={onClick}
        className={className}
        style={style}
        {...props}
      />
      {children && (
        <g transform={`translate(${x}, ${y})`}>
          {children}
        </g>
      )}
    </g>
  );
};

const GridGenerator = {
  rectangle: (width: number, height: number): HexCoordinate[] => {
    const hexagons: HexCoordinate[] = [];
    for (let q = 0; q < width; q++) {
      for (let r = 0; r < height; r++) {
        hexagons.push({ q, r, s: -q - r });
      }
    }
    return hexagons;
  }
};

const HexUtils = {
  getID: (hex: HexCoordinate): string => `${hex.q},${hex.r},${hex.s}`,
  
  hexToPixel: (hex: HexCoordinate, size: number): { x: number; y: number } => {
    const x = size * (3/2 * hex.q);
    const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
    return { x, y };
  },

  // Dodana funkcja do sprawdzania czy hex jest w mapie
  isValidHex: (hex: HexCoordinate, width: number, height: number): boolean => {
    return hex.q >= 0 && hex.q < width && hex.r >= 0 && hex.r < height;
  }
};

// Konfiguracja
const CONFIG = {
  hexSize: 30,
  mapWidth: 6,
  mapHeight: 8,
  svgWidth: 800,
  svgHeight: 600
};

// Dane statyczne
const TERRAIN_TYPES: Record<string, TerrainType> = {
  plains: { color: '#90EE90', name: 'Równiny' },
  forest: { color: '#228B22', name: 'Las' },
  hills: { color: '#D2691E', name: 'Wzgórza' },
  water: { color: '#4682B4', name: 'Woda' },
  mountain: { color: '#696969', name: 'Góry' }
};

const CITY_TYPES: Record<string, CityType> = {
  large: { size: 12, color: '#FF4500', name: 'Duże miasto' },
  medium: { size: 10, color: '#FF6347', name: 'Średnie miasto' },
  small: { size: 8, color: '#FFA500', name: 'Małe miasto' },
  fortress: { size: 10, color: '#8B0000', name: 'Twierdza' },
  monastery: { size: 9, color: '#4B0082', name: 'Klasztor' }
};

// Mapowanie danych z oryginalnego formatu na nowy
const TERRAIN_MAP: Record<string, string> = {
  '0,0,0': 'plains', '1,0,-1': 'forest', '2,0,-2': 'hills', '3,0,-3': 'plains', '4,0,-4': 'water', '5,0,-5': 'plains',
  '0,1,-1': 'water', '1,1,-2': 'plains', '2,1,-3': 'plains', '3,1,-4': 'forest', '4,1,-5': 'plains', '5,1,-6': 'hills',
  '0,2,-2': 'plains', '1,2,-3': 'hills', '2,2,-4': 'plains', '3,2,-5': 'plains', '4,2,-6': 'forest', '5,2,-7': 'plains',
  '0,3,-3': 'water', '1,3,-4': 'plains', '2,3,-5': 'plains', '3,3,-6': 'hills', '4,3,-7': 'plains', '5,3,-8': 'forest',
  '0,4,-4': 'plains', '1,4,-5': 'forest', '2,4,-6': 'plains', '3,4,-7': 'plains', '4,4,-8': 'plains', '5,4,-9': 'water',
  '0,5,-5': 'water', '1,5,-6': 'plains', '2,5,-7': 'plains', '3,5,-8': 'hills', '4,5,-9': 'plains', '5,5,-10': 'plains',
  '0,6,-6': 'plains', '1,6,-7': 'hills', '2,6,-8': 'plains', '3,6,-9': 'plains', '4,6,-10': 'forest', '5,6,-11': 'plains',
  '0,7,-7': 'water', '1,7,-8': 'plains', '2,7,-9': 'forest', '3,7,-10': 'plains', '4,7,-11': 'plains', '5,7,-12': 'hills'
};

const CITIES: Record<string, City> = {
  '2,3,-5': { type: 'large', name: 'Stolica' },
  '4,4,-8': { type: 'medium', name: 'Handlowe' },
  '3,1,-4': { type: 'fortress', name: 'Strażnica' },
  '1,5,-6': { type: 'small', name: 'Wioska' },
  '4,2,-6': { type: 'monastery', name: 'Opactwo' }
};

// Komponenty
const SVGPatterns: React.FC = () => (
  <defs>
    <pattern id="religiousPattern" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill="#4a90e2" opacity="0.1"/>
      <path d="M0,0 L8,8 M0,8 L8,0" stroke="#4a90e2" strokeWidth="0.5" opacity="0.4"/>
    </pattern>
    <pattern id="pandemicPattern" patternUnits="userSpaceOnUse" width="6" height="6">
      <rect width="6" height="6" fill="#e74c3c" opacity="0.1"/>
      <path d="M0,3 L6,3 M3,0 L3,6" stroke="#e74c3c" strokeWidth="0.5" opacity="0.4"/>
    </pattern>
  </defs>
);

interface HexTileProps {
  hex: HexCoordinate;
  terrain: string;
  city?: City;
  isSelected: boolean;
  hasReligiousInfluence: boolean;
  hasPandemicInfluence: boolean;
  onClick: (hex: HexCoordinate) => void;
}

const HexTile: React.FC<HexTileProps> = ({ 
  hex, 
  terrain, 
  city, 
  isSelected, 
  hasReligiousInfluence, 
  hasPandemicInfluence,
  onClick 
}) => {
  const hexId = HexUtils.getID(hex);
  
  // Punkty heksagonu do wzorów
  const patternPoints = `${CONFIG.hexSize},0 ${CONFIG.hexSize/2},${Math.sqrt(3)*CONFIG.hexSize/2} ${-CONFIG.hexSize/2},${Math.sqrt(3)*CONFIG.hexSize/2} ${-CONFIG.hexSize},0 ${-CONFIG.hexSize/2},${-Math.sqrt(3)*CONFIG.hexSize/2} ${CONFIG.hexSize/2},${-Math.sqrt(3)*CONFIG.hexSize/2}`;
  
  return (
    <Hexagon
      q={hex.q}
      r={hex.r}
      s={hex.s}
      fill={TERRAIN_TYPES[terrain].color}
      stroke={isSelected ? "#FFD700" : "#333"}
      strokeWidth={isSelected ? 3 : 1}
      onClick={() => onClick(hex)}
      className="cursor-pointer hover:opacity-90 transition-opacity"
      style={{ opacity: 0.8 }}
    >
      {/* Wzory wpływów */}
      {hasReligiousInfluence && (
        <polygon 
          points={patternPoints}
          fill="url(#religiousPattern)" 
          pointerEvents="none" 
        />
      )}
      {hasPandemicInfluence && (
        <polygon 
          points={patternPoints}
          fill="url(#pandemicPattern)" 
          pointerEvents="none" 
        />
      )}
      
      {/* Miasto */}
      {city && (
        <g>
          <circle
            cx={0}
            cy={0}
            r={CITY_TYPES[city.type].size}
            fill={CITY_TYPES[city.type].color}
            stroke="#000"
            strokeWidth="2"
            pointerEvents="none"
          />
          <text
            x={0}
            y={25}
            textAnchor="middle"
            fontSize="10"
            fill="#000"
            fontWeight="bold"
            pointerEvents="none"
          >
            {city.name}
          </text>
        </g>
      )}

      {/* Współrzędne */}
      <text
        x={0}
        y={-15}
        textAnchor="middle"
        fontSize="8"
        fill="#666"
        pointerEvents="none"
      >
        {hex.q},{hex.r}
      </text>
    </Hexagon>
  );
};

interface PlayerBorderProps {
  playerTerritory: Set<string>;
  hexagons: HexCoordinate[];
}

const PlayerBorder: React.FC<PlayerBorderProps> = ({ playerTerritory, hexagons }) => {
  const borderSegments = useMemo(() => {
    const segments: Array<{
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];
    const size = CONFIG.hexSize;
    
    for (const hexId of playerTerritory) {
      const hex = hexagons.find(h => HexUtils.getID(h) === hexId);
      if (!hex) continue;
      
      const { x, y } = HexUtils.hexToPixel(hex, size);
      
      // Sąsiedzi w cube coordinates (poprawiona kolejność)
      const neighbors: HexCoordinate[] = [
        { q: hex.q + 1, r: hex.r, s: hex.s - 1 },      // E (prawo)
        { q: hex.q, r: hex.r + 1, s: hex.s - 1 },      // SE (prawo-dół)
        { q: hex.q - 1, r: hex.r + 1, s: hex.s },      // SW (lewo-dół)
        { q: hex.q - 1, r: hex.r, s: hex.s + 1 },      // W (lewo)
        { q: hex.q, r: hex.r - 1, s: hex.s + 1 },      // NW (lewo-góra)
        { q: hex.q + 1, r: hex.r - 1, s: hex.s }       // NE (prawo-góra)
      ];
      
      // Kąty dla każdej strony heksagonu (flat-top, zaczynając od prawej strony)
      const edgeAngles = [
        { start: 0, end: Math.PI / 3 },                    // E->SE
        { start: Math.PI / 3, end: 2 * Math.PI / 3 },      // SE->SW
        { start: 2 * Math.PI / 3, end: Math.PI },          // SW->W
        { start: Math.PI, end: 4 * Math.PI / 3 },          // W->NW
        { start: 4 * Math.PI / 3, end: 5 * Math.PI / 3 },  // NW->NE
        { start: 5 * Math.PI / 3, end: 2 * Math.PI }       // NE->E
      ];
      
      for (let i = 0; i < 6; i++) {
        const neighbor = neighbors[i];
        const neighborId = HexUtils.getID(neighbor);
        
        // Sprawdź czy sąsiad jest poza mapą lub nie należy do gracza
        const isNeighborOutside = !HexUtils.isValidHex(neighbor, CONFIG.mapWidth, CONFIG.mapHeight);
        const isNeighborNotPlayer = !playerTerritory.has(neighborId);
        
        if (isNeighborOutside || isNeighborNotPlayer) {
          const { start, end } = edgeAngles[i];
          
          const x1 = x + size * Math.cos(start);
          const y1 = y + size * Math.sin(start);
          const x2 = x + size * Math.cos(end);
          const y2 = y + size * Math.sin(end);
          
          segments.push({
            key: `${hexId}-border-${i}`,
            x1, y1, x2, y2
          });
        }
      }
    }
    return segments;
  }, [playerTerritory, hexagons]);

  return (
    <g>
      {borderSegments.map(segment => (
        <line
          key={segment.key}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          stroke="#FF0000"
          strokeWidth="4"
          strokeDasharray="5,3"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

interface LegendProps {
  selectedHex: string | null;
  playerTerritory: Set<string>;
}

const Legend: React.FC<LegendProps> = ({ selectedHex, playerTerritory }) => (
  <div className="w-64 bg-white p-4 rounded-lg shadow-lg">
    <h2 className="text-lg font-bold mb-3 text-gray-900">Legenda</h2>

    {/* Typy terenu */}
    <div className="mb-4">
      <h3 className="font-semibold mb-2 text-gray-800">Typy terenu:</h3>
      <div className="space-y-1">
        {Object.entries(TERRAIN_TYPES).map(([key, type]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 border border-gray-400 rounded-sm"
              style={{ backgroundColor: type.color }}
            />
            <span className="text-sm text-gray-700">{type.name}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Miasta */}
    <div className="mb-4">
      <h3 className="font-semibold mb-2 text-gray-800">Miasta:</h3>
      <div className="space-y-1">
        {Object.entries(CITY_TYPES).map(([key, city]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-black"
              style={{ backgroundColor: city.color }}
            />
            <span className="text-sm text-gray-700">{city.name}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Obszary wpływu */}
    <div className="mb-4">
      <h3 className="font-semibold mb-2 text-gray-800">Obszary wpływu:</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 bg-blue-200 border border-gray-400 rounded-sm"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #4a90e2 2px, #4a90e2 4px)'
            }}
          />
          <span className="text-sm text-gray-700">Wpływ religijny</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 bg-red-200 border border-gray-400 rounded-sm"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #e74c3c 2px, #e74c3c 4px)'
            }}
          />
          <span className="text-sm text-gray-700">Wpływ pandemii</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1 border-t-4 border-red-500 border-dashed" />
          <span className="text-sm text-gray-700 ml-1">Granica gracza</span>
        </div>
      </div>
    </div>

    {/* Info o wybranym polu */}
    {selectedHex && (
      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="font-semibold mb-2 text-gray-800">Wybrane pole:</h3>
        <div className="text-sm space-y-1">
          <div className="text-gray-700">Pozycja: {selectedHex}</div>
          <div className="text-gray-700">
            Teren: {TERRAIN_TYPES[TERRAIN_MAP[selectedHex] || 'plains'].name}
          </div>
          {CITIES[selectedHex] && (
            <div className="text-gray-700">Miasto: {CITIES[selectedHex].name}</div>
          )}
          {playerTerritory.has(selectedHex) && (
            <div className="text-red-600 font-semibold">Twój obszar</div>
          )}
        </div>
      </div>
    )}
  </div>
);

const OptimizedHexMapLibrary: React.FC = () => {
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  
  // Generowanie siatki hexów używając biblioteki
  const hexagons = useMemo(() => {
    return GridGenerator.rectangle(CONFIG.mapWidth, CONFIG.mapHeight);
  }, []);
  
  // Stan aplikacji
  const gameState = {
    playerTerritory: new Set(['2,3,-5', '3,3,-6', '2,4,-6', '3,4,-7', '4,4,-8', '3,5,-8']),
    religiousInfluence: new Set(['4,2,-6', '3,2,-5', '4,3,-7', '4,1,-5']),
    pandemicInfluence: new Set(['1,6,-7', '2,6,-8', '1,7,-8', '2,7,-9'])
  };

  const handleHexClick = (hex: HexCoordinate) => {
    setSelectedHex(HexUtils.getID(hex));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Naprawiona Mapa Hex z Poprawnymi Granicami
          </h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Wybrane pole: {selectedHex || 'Brak'}</span>
            <span>Granice gracza są teraz poprawnie wyrysowane</span>
          </div>
        </header>

        <div className="flex gap-6">
          {/* Mapa */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <HexGrid 
                width={CONFIG.svgWidth} 
                height={CONFIG.svgHeight}
                viewBox={`0 0 ${CONFIG.svgWidth} ${CONFIG.svgHeight}`}
              >
                <SVGPatterns />
                <Layout 
                  size={{ x: CONFIG.hexSize, y: CONFIG.hexSize }} 
                  flat={true} 
                  spacing={1.1} 
                  origin={{ x: 100, y: 100 }}
                >
                  {hexagons.map((hex) => {
                    const hexId = HexUtils.getID(hex);
                    return (
                      <HexTile
                        key={hexId}
                        hex={hex}
                        terrain={TERRAIN_MAP[hexId] || 'plains'}
                        city={CITIES[hexId]}
                        isSelected={selectedHex === hexId}
                        hasReligiousInfluence={gameState.religiousInfluence.has(hexId)}
                        hasPandemicInfluence={gameState.pandemicInfluence.has(hexId)}
                        onClick={handleHexClick}
                      />
                    );
                  })}
                  <PlayerBorder 
                    playerTerritory={gameState.playerTerritory}
                    hexagons={hexagons}
                  />
                </Layout>
              </HexGrid>
            </div>
          </div>

          {/* Legenda */}
          <Legend 
            selectedHex={selectedHex}
            playerTerritory={gameState.playerTerritory}
          />
        </div>
      </div>
    </div>
  );
};

export default OptimizedHexMapLibrary;