///home/grzegorz/code/EP-PROJECTS/src/PROJECTS/potop_szwedzki_mapa/map.tsx
import React, { useState, useMemo } from 'react';

// === FUNKCJA POMOCNICZA: SPRAWDZANIE PUNKTU W WIELOKĄCIE ===
const isPointInPolygon = (point, polygon) => {
  let isInside = false;
  const { x, y } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

const PotopHexMap = () => {
  const [selectedYear, setSelectedYear] = useState(1655);
  const [hoveredElement, setHoveredElement] = useState(null);

  const events = {
    1655: {
      title: "Inwazja Szwedzka i Rosyjska",
      color: "#DC143C",
      zones: ["swedish-main", "russian-east"],
      battles: [
        { name: "Ujście", x: 250, y: 230, description: "Kapitulacja Wielkopolski" }
      ],
      description: "Armia szwedzka wkracza do Wielkopolski, a wojska rosyjskie zajmują wschodnie tereny Wielkiego Księstwa Litewskiego."
    },
    1656: {
      title: "Apogeum Potopu",
      color: "#4169E1",
      zones: ["swedish-expanded", "russian-east"],
      battles: [
        { name: "Jasna Góra", x: 360, y: 300, description: "Obrona klasztoru (XI-XII)", type: "siege" },
        { name: "Warszawa", x: 400, y: 240, description: "Trzydniowa bitwa (VII)" },
        { name: "Prostki", x: 500, y: 160, description: "Zwycięstwo polsko-litewskie (X)" },
        // ZMODYFIKOWANE: Dodano obronę Zamościa
        { name: "Obrona Zamościa", x: 480, y: 330, description: "Skuteczna obrona twierdzy", type: "siege" },
      ],
      description: "Niemal cała Korona pod okupacją. Obrona Jasnej Góry i Zamościa stają się symbolami oporu, który narasta w całym kraju."
    },
    1657: {
      title: "Kontrofensywa i nowi wrogowie",
      color: "#228B22",
      zones: ["polish-central", "russian-east", "swedish-north", "rakoczy-south"],
      battles: [
        { name: "Traktat w Radnot", x: 550, y: 400, description: "Próba rozbioru Rzeczypospolitej", type: "treaty" }
      ],
      description: "Wojska polskie pod wodzą Stefana Czarnieckiego odzyskują inicjatywę. Na południu pojawia się nowe zagrożenie - najazd Jerzego II Rakoczego."
    },
    1658: {
      title: "Wyparcie Szwedów i ugoda z Kozakami",
      color: "#B8860B",
      zones: ["polish-main", "russian-east-reduced", "swedish-pomerania"],
      battles: [
        { name: "Unia w Hadziaczu", x: 520, y: 320, description: "Próba stworzenia Rzeczypospolitej Trojga Narodów", type: "treaty" },
      ],
      description: "Szwedzi zostają w większości wyparci. Trwają ciężkie walki z Rosją. Unia hadziacka ma na celu pozyskanie Kozaków."
    },
    1659: {
      title: "Walki w Prusach i na wschodzie",
      color: "#8B008B",
      zones: ["polish-main", "russian-east-stable", "swedish-pomerania"],
      battles: [
        { name: "Oblężenie Grudziądza", x: 340, y: 160, description: "Odzyskiwanie kontroli w Prusach", type: "siege" }
      ],
      description: "Główne działania wojenne przenoszą się do Prus Królewskich. Jednocześnie trwa wojna z Rosją o tereny ukrainne i litewskie."
    },
    1660: {
      title: "Pokój w Oliwie",
      color: "#FF4500",
      zones: ["polish-restored"],
      battles: [
        { name: "Oliwa", x: 320, y: 120, description: "Podpisanie traktatu pokojowego", type: "treaty" }
      ],
      description: "Koniec wojny ze Szwecją. Rzeczpospolita odzyskuje większość terytoriów, ale wychodzi z konfliktu niezwykle zniszczona i osłabiona."
    }
  };

  const cities = [
    { name: "Warszawa", x: 400, y: 240, importance: "high" },
    { name: "Kraków", x: 350, y: 340, importance: "high" },
    { name: "Poznań", x: 280, y: 240, importance: "medium" },
    { name: "Gdańsk", x: 320, y: 120, importance: "high" },
    { name: "Częstochowa", x: 360, y: 300, importance: "high" },
    { name: "Lwów", x: 520, y: 360, importance: "medium" },
    { name: "Wilno", x: 510, y: 140, importance: "medium" },
    { name: "Toruń", x: 320, y: 180, importance: "medium" },
    // NOWOŚĆ: Dodano miasto Zamość
    { name: "Zamość", x: 480, y: 330, importance: "high" },
  ];

  const zoneDefinitions = {
    'swedish-main': { color: '#DC143C', opacity: 0.4, name: 'Okupacja szwedzka', polygon: [{x: 220, y: 120}, {x: 350, y: 110}, {x: 420, y: 220}, {x: 380, y: 300}, {x: 260, y: 280}, {x: 230, y: 200}]},
    'swedish-expanded': { color: '#4169E1', opacity: 0.3, name: 'Maksymalna ekspansja szwedzka', polygon: [{x: 220, y: 120}, {x: 480, y: 110}, {x: 520, y: 200}, {x: 500, y: 340}, {x: 450, y: 370}, {x: 300, y: 360}, {x: 230, y: 280}]},
    'swedish-north': { color: '#1E90FF', opacity: 0.3, name: 'Kontrola szwedzka w Prusach', polygon: [{x: 280, y: 110}, {x: 400, y: 100}, {x: 420, y: 180}, {x: 300, y: 200}]},
    'swedish-pomerania': { color: '#1E90FF', opacity: 0.4, name: 'Szwedzi w Prusach/Pomorzu', polygon: [{x: 260, y: 110}, {x: 360, y: 100}, {x: 380, y: 160}, {x: 280, y: 180}]},
    'russian-east': { color: '#8B0000', opacity: 0.4, name: 'Okupacja rosyjska', polygon: [{x: 450, y: 110}, {x: 600, y: 120}, {x: 580, y: 350}, {x: 480, y: 300}, {x: 460, y: 200}]},
    'russian-east-reduced': { color: '#8B0000', opacity: 0.35, name: 'Okupacja rosyjska (zmniejszona)', polygon: [{x: 480, y: 110}, {x: 600, y: 120}, {x: 590, y: 320}, {x: 500, y: 280}, {x: 490, y: 180}]},
    'russian-east-stable': { color: '#8B0000', opacity: 0.3, name: 'Front wschodni', polygon: [{x: 500, y: 120}, {x: 600, y: 130}, {x: 590, y: 300}, {x: 520, y: 260}]},
    'polish-central': { color: '#228B22', opacity: 0.4, name: 'Tereny wyzwolone / opór', polygon: [{x: 280, y: 280}, {x: 480, y: 380}, {x: 510, y: 340}, {x: 300, y: 320}]},
    'rakoczy-south': { color: '#FF8C00', opacity: 0.4, name: 'Najazd Rakoczego', polygon: [{x: 360, y: 350}, {x: 550, y: 350}, {x: 540, y: 420}, {x: 350, y: 420}]},
    'polish-main': { color: '#32CD32', opacity: 0.4, name: 'Kontrola polska', polygon: [{x: 220, y: 150}, {x: 480, y: 140}, {x: 500, y: 280}, {x: 520, y: 380}, {x: 250, y: 380}, {x: 240, y: 250}]},
    'polish-restored': { color: '#228B22', opacity: 0.5, name: 'Ziemie Rzeczypospolitej', polygon: [{x: 200, y: 150}, {x: 180, y: 200}, {x: 200, y: 350}, {x: 250, y: 400}, {x: 400, y: 410}, {x: 520, y: 380}, {x: 580, y: 350}, {x: 580, y: 200}, {x: 550, y: 140}, {x: 480, y: 120}, {x: 400, y: 110}, {x: 320, y: 120}, {x: 250, y: 140}]}
  };

  // ZMODYFIKOWANE: Generowanie siatki heksów, aby była bardziej centralna
  const hexes = useMemo(() => {
    const hexArray = [];
    const hexRadius = 18;
    const hexWidth = hexRadius * 2 * Math.cos(Math.PI / 6);
    const hexHeight = hexRadius * 1.5;
    
    // Zmniejszono pętle i zmieniono offsety, aby usunąć zbędne marginesy
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 16; col++) {
        const xOffset = (row % 2) * (hexWidth / 2);
        const x = col * hexWidth + xOffset + 100; // Offset X dla centrowania
        const y = row * hexHeight + 60;        // Offset Y dla centrowania
        
        hexArray.push({ x, y, row, col, id: `hex-${row}-${col}` });
      }
    }
    return hexArray;
  }, []);
  
  const currentEvent = events[selectedYear];

  const isHexInZone = (hex, zoneName) => {
    const zone = zoneDefinitions[zoneName];
    if (!zone || !zone.polygon) return false;
    return isPointInPolygon({ x: hex.x, y: hex.y }, zone.polygon);
  };

  const createHexPath = (centerX, centerY, radius) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * Math.PI / 180;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  const getBattleIcon = (battle) => {
    switch (battle.type) {
      case 'siege': return '🏰';
      case 'treaty': return '📜';
      default: return '⚔️';
    }
  };

  // NOWOŚĆ: Definicja ścieżki dla stałej granicy Rzeczypospolitej
  const commonwealthBorderPolygon = zoneDefinitions['polish-restored'].polygon;
  const commonwealthBorderPath = `M ${commonwealthBorderPolygon.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg shadow-xl">
      <div className="mb-6 text-center">
        <h2 className="text-4xl font-bold text-amber-900 mb-2 font-serif">Potop Szwedzki (1655-1660)</h2>
        <p className="text-amber-700 text-xl">{`Rok ${selectedYear}: ${currentEvent.title}`}</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {Object.keys(events).map(year => (
            <button key={year} onClick={() => setSelectedYear(parseInt(year))} className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 ${selectedYear === parseInt(year) ? 'bg-amber-800 text-white shadow-lg scale-105 ring-2 ring-amber-400' : 'bg-amber-200 text-amber-800 hover:bg-amber-300 hover:shadow-md'}`}>
              {year}
            </button>
          ))}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: currentEvent.color }}>
          <h3 className="font-bold text-lg mb-2" style={{ color: currentEvent.color }}>
            Wydarzenia roku {selectedYear}
          </h3>
          <p className="text-gray-700">{currentEvent.description}</p>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 shadow-lg border border-amber-200">
        <svg viewBox="0 0 700 500" className="w-full h-auto rounded-lg bg-white">
          {/* NOWOŚĆ: Stała warstwa z granicami Rzeczypospolitej */}
          <path
            d={commonwealthBorderPath}
            fill="#f5f3ef"
            stroke="#b0a08a"
            strokeWidth="1.5"
          />

          {/* USUNIĘTO: Stara, myląca ścieżka graniczna */}

          {hexes.map(hex => {
            const activeZone = currentEvent.zones.find(zone => isHexInZone(hex, zone));
            return (
              <path
                key={hex.id}
                d={createHexPath(hex.x, hex.y, 18)}
                fill={activeZone ? zoneDefinitions[activeZone].color : 'transparent'}
                fillOpacity={activeZone ? zoneDefinitions[activeZone].opacity : 0}
                stroke={activeZone ? 'transparent' : '#d1d1d1'}
                strokeWidth="0.2"
                className="transition-all duration-500"
              />
            );
          })}

          {/* ZMODYFIKOWANE: Miasta renderowane jako heksy */}
          {cities.map(city => (
            <g key={city.name} onMouseEnter={() => setHoveredElement({type: 'city', data: city})} onMouseLeave={() => setHoveredElement(null)}>
              <path
                d={createHexPath(city.x, city.y, city.importance === 'high' ? 8 : 6)}
                fill={city.importance === 'high' ? '#6B240C' : '#994D1C'}
                stroke="#F5E8C7"
                strokeWidth="1.5"
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
              />
              <text x={city.x} y={city.y - 12} textAnchor="middle" className="text-xs font-bold fill-gray-800 pointer-events-none" style={{ fontSize: '10px' }}>
                {city.name}
              </text>
            </g>
          ))}
          
          {currentEvent.battles.map(battle => (
             <g key={`${selectedYear}-${battle.name}`} onMouseEnter={() => setHoveredElement({type: 'battle', data: battle})} onMouseLeave={() => setHoveredElement(null)}>
               <text x={battle.x} y={battle.y + 7} textAnchor="middle" className="text-2xl cursor-pointer transition-transform duration-200 hover:scale-125 drop-shadow-lg" style={{filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))'}}>
                  {getBattleIcon(battle)}
               </text>
                <text x={battle.x} y={battle.y + 22} textAnchor="middle" className="text-xs font-bold fill-red-800 pointer-events-none" style={{ fontSize: '9px' }}>
                  {battle.name}
                </text>
             </g>
          ))}

          {hoveredElement && (
            <g className="pointer-events-none transition-opacity duration-200" style={{opacity: 1}}>
              <rect x={hoveredElement.data.x + 15} y={hoveredElement.data.y - 25} width="160" height="40" fill="rgba(0,0,0,0.8)" rx="5"/>
              <text x={hoveredElement.data.x + 22} y={hoveredElement.data.y - 10} className="fill-white font-bold" style={{ fontSize: '11px' }}>
                {hoveredElement.data.name}
              </text>
              <text x={hoveredElement.data.x + 22} y={hoveredElement.data.y + 5} className="fill-gray-300" style={{ fontSize: '10px' }}>
                {hoveredElement.type === 'city' ? `Znaczenie: ${hoveredElement.data.importance}` : hoveredElement.data.description}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-bold text-amber-900 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 mb-4">
          {currentEvent.zones.map(zoneId => {
            const zone = zoneDefinitions[zoneId];
            if (!zone) return null;
            return (
              <div key={zoneId} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-gray-400" style={{ backgroundColor: zone.color, opacity: zone.opacity + 0.3 }}></div>
                <span className="text-sm font-medium text-gray-700">{zone.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PotopHexMap;