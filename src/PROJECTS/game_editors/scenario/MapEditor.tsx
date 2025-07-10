import React from 'react';

// Komponent do edycji mapy (renderowania strzałek i ikon)
const MapEditor = ({ 
  story, 
  storyIndex, 
  selectedPageIndex, 
  showArrowEditor,
  showIconEditor,
  selectedArrowIndex,
  setSelectedArrowIndex,
  editArrow,
  stories,
  setStories,
  selectedIconIndex,
  setSelectedIconIndex
}) => {
  const currentPage = story.pages[selectedPageIndex];
  
  return (
    <div className="mt-4 border-2 border-amber-800 rounded-lg bg-amber-50 relative h-96 overflow-hidden">
      <div className="text-center p-2 bg-amber-200 font-semibold border-b border-amber-800">
        Podgląd Mapy - {currentPage.title}
      </div>
      
      {/* Nakładka z informacją o interakcji */}
      <div className="absolute top-2 right-2 bg-white/80 p-2 rounded text-xs z-10">
        Kliknij i przeciągnij, aby umieścić elementy
      </div>
      
      {/* Wyrenderowane strzałki */}
      {currentPage.arrows.map((arrow, idx) => (
        <div key={`arrow-${idx}`} className="absolute" style={{
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          overflow: 'visible'
        }}>
          <svg width="100%" height="100%" style={{position: 'absolute', top: 0, left: 0, overflow: 'visible'}}>
            <defs>
              <marker
                id={`arrowhead-${idx}`}
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={arrow.color} />
              </marker>
            </defs>
            <line
              x1={arrow.start.x}
              y1={arrow.start.y}
              x2={arrow.end.x}
              y2={arrow.end.y}
              stroke={arrow.color}
              strokeWidth="3"
              strokeDasharray={arrow.dashed ? "5,5" : "none"}
              markerEnd={`url(#arrowhead-${idx})`}
              onClick={() => {
                setSelectedArrowIndex(idx);
              }}
              className="cursor-pointer"
            />
          </svg>
        </div>
      ))}
      
      {/* Wyrenderowane ikony */}
      {currentPage.icons.map((icon, idx) => (
        <div
          key={`icon-${idx}`}
          className="absolute cursor-pointer flex flex-col items-center"
          style={{
            left: icon.position.x - 20,
            top: icon.position.y - 20,
          }}
          onClick={() => {
            setSelectedIconIndex(idx);
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{backgroundColor: icon.color}}
          >
            {icon.type === "infantry" && "👤"}
            {icon.type === "cavalry" && "🐎"}
            {icon.type === "artillery" && "💣"}
            {icon.type === "navy" && "⚓"}
            {icon.type === "battle" && "⚔️"}
          </div>
          {icon.label && (
            <div className="text-xs mt-1 bg-white/80 px-1 rounded">{icon.label}</div>
          )}
        </div>
      ))}
      
      {/* Obszar do interakcji */}
      <div 
        className="absolute inset-0 cursor-crosshair"
        onClick={(e) => {
          // Pobierz pozycję kliknięcia względem elementu
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.round(e.clientX - rect.left);
          const y = Math.round(e.clientY - rect.top);
          
          if (showArrowEditor) {
            // Dodaj nową strzałkę lub edytuj istniejącą
            if (selectedArrowIndex !== null) {
              // Edytuj końcówkę istniejącej strzałki
              editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'endX', x);
              editArrow(storyIndex, selectedPageIndex, selectedArrowIndex, 'endY', y);
              setSelectedArrowIndex(null);
            } else {
              // Dodaj nową strzałkę
              const updatedStories = [...stories];
              const newArrow = {
                start: { x, y },
                end: { x: x + 100, y: y },
                color: "#4a6fa5",
                dashed: false
              };
              updatedStories[storyIndex].pages[selectedPageIndex].arrows.push(newArrow);
              setStories(updatedStories);
              setSelectedArrowIndex(updatedStories[storyIndex].pages[selectedPageIndex].arrows.length - 1);
            }
          } else if (showIconEditor) {
            // Dodaj nową ikonę
            const updatedStories = [...stories];
            const newIcon = {
              position: { x, y },
              type: "infantry",
              color: "#c65d2e",
              label: "New Icon"
            };
            updatedStories[storyIndex].pages[selectedPageIndex].icons.push(newIcon);
            setStories(updatedStories);
            setSelectedIconIndex(updatedStories[storyIndex].pages[selectedPageIndex].icons.length - 1);
          }
        }}
      />
    </div>
  );
};

export default MapEditor;