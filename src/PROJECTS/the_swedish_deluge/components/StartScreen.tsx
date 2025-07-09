import React from "react";
import { useGameStore } from "../store/gameStore";
import ActionButton from "./ActionButton";

interface StartScreenProps {
  onSelectScenario: (index: number) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onSelectScenario }) => {
  const { scenarios, currentScenarioIndex, mapData, completedScenarios } =
    useGameStore();

  // Determine the highest unlocked scenario
  const highestUnlockedIndex = Math.max(
    completedScenarios.length > 0 ? Math.max(...completedScenarios) + 1 : 0,
    currentScenarioIndex
  );

  if (!mapData) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50 text-amber-900">
        <div className="text-center">
          <h2 className="text-xl mb-4 font-serif">Ładowanie mapy Rzeczypospolitej...</h2>
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const getScenarioStatus = (
    index: number
  ): "active" | "completed" | "locked" => {
    if (completedScenarios.includes(index)) return "completed";
    if (index <= highestUnlockedIndex) return "active";
    return "locked";
  };

  return (
    <div className="relative w-full h-screen overflow-hidden"
         style={{
           backgroundImage: "url('/assets/parchment-background.jpg')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundColor: "#f3e8d2" // Jasny kolor pergaminu jako fallback
         }}>
      {/* Burned edges overlay */}
      <div className="absolute inset-0 w-full h-full z-0"
           style={{
             background: "radial-gradient(ellipse at center, transparent 50%, rgba(58, 30, 0, 0.4) 100%)",
             pointerEvents: "none"
           }}></div>
           
      {/* Aged map overlay */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-60"
           style={{
             backgroundImage: "url('/assets/old-polish-map.jpg')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             filter: "sepia(0.5) contrast(1.05) brightness(1.1)"
           }}></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-90 z-10"
           style={{
             backgroundImage: "url('/assets/ornament-corner.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat"
           }}></div>
      <div className="absolute top-0 right-0 w-40 h-40 opacity-90 z-10 transform scale-x-[-1]"
           style={{
             backgroundImage: "url('/assets/ornament-corner.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat"
           }}></div>
      
      <div className="relative z-10 flex flex-col items-center pt-10 px-4">
        {/* Title with decorative elements */}
        <div className="relative mb-6">
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 h-16 w-24 opacity-90"
               style={{
                 backgroundImage: "url('/assets/polish-eagle.png')",
                 backgroundSize: "contain",
                 backgroundRepeat: "no-repeat",
                 backgroundPosition: "center"
               }}></div>
          <h1 className="text-5xl font-serif font-bold text-amber-800 mb-2 text-center"
              style={{
                textShadow: "2px 2px 4px rgba(0,0,0,0.25)",
                letterSpacing: "0.05em"
              }}>
            The Swedish Deluge
          </h1>
          <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 h-16 w-24 opacity-90"
               style={{
                 backgroundImage: "url('/assets/swedish-three-crowns.png')",
                 backgroundSize: "contain",
                 backgroundRepeat: "no-repeat",
                 backgroundPosition: "center"
               }}></div>
        </div>
        
        <h2 className="text-2xl font-serif text-amber-700 mb-10 text-center italic"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.15)" }}>
          Poland's Fight for Survival (1655-1660)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {scenarios.map((scenario, index) => {
            const status = getScenarioStatus(index);
            const cityInfo = mapData.cities.find(
              (city) => city.id === scenario.cityId
            );

            return (
              <div
                key={index}
                className={`rounded-lg p-6 transition-all duration-300 transform ${
                  status === "locked"
                    ? "cursor-not-allowed opacity-75"
                    : status === "completed"
                    ? "hover:scale-105 cursor-pointer"
                    : "hover:scale-105 cursor-pointer"
                }`}
                style={{
                  background: status === "locked" 
                    ? "url('/assets/dark-parchment.jpg')"
                    : status === "completed"
                    ? "url('/assets/victory-parchment.jpg')"
                    : "url('/assets/light-parchment.jpg')",
                  backgroundSize: "cover",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  border: status === "completed" 
                    ? "2px solid #b7791f" 
                    : status === "locked"
                    ? "2px solid #8a7e63"
                    : "2px solid #92400e"
                }}
                onClick={() => status !== "locked" && onSelectScenario(index)}
              >
                <div className="flex items-start mb-3">
                  <div
                    className="w-8 h-8 rounded-full mr-3 mt-1 flex-shrink-0 border-2 border-amber-700"
                    style={{ 
                      backgroundColor: cityInfo?.color || "#d4a76a",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  ></div>
                  <h3 className={`text-xl font-serif font-bold ${
                    status === "locked" ? "text-gray-700" : 
                    status === "completed" ? "text-amber-800" : "text-amber-900"
                  }`}>
                    {scenario.name}
                    {status === "completed" && (
                      <span className="ml-2 text-amber-600">✓</span>
                    )}
                  </h3>
                </div>

                <div className={`text-sm mb-4 font-serif ${
                  status === "locked" ? "text-gray-600" : "text-amber-800 opacity-90"
                }`}>
                  Location: {cityInfo?.name || "Unknown"}
                </div>

                <div className={`flex justify-between items-center text-sm font-serif ${
                  status === "locked" ? "text-gray-600" : "text-amber-800"
                }`}>
                  <div className="border-b border-amber-600 pb-1 mb-2 font-semibold">
                    <span className="opacity-90">Historical Deployment:</span>
                  </div>
                </div>
                
                <div className={`space-y-2 items-center text-sm font-serif ${
                  status === "locked" ? "text-gray-600" : "text-amber-800"
                }`}>
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-1 rounded-full bg-red-700 border border-amber-900"></div>
                    <span className="opacity-90">Polish Forces:</span>{" "}
                    <span className="font-bold ml-1">{scenario.playerStartingCards.length} units</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-1 rounded-full bg-blue-700 border border-amber-900"></div>
                    <span className="opacity-90">Swedish Forces:</span>{" "}
                    <span className="font-bold ml-1">{scenario.opponentStartingCards.length} units</span>
                  </div>
                </div>
                
                <div className="mt-3 text-xs font-serif italic text-amber-800 opacity-80">
                  Additional troops available in unit cards
                </div>

                <div className="mt-6">
                  {status === "locked" ? (
                    <div className="text-gray-700 flex items-center justify-center font-serif border-2 border-gray-600 rounded-lg py-2 px-3"
                         style={{
                           backgroundImage: "url('/assets/seal-background.jpg')",
                           backgroundSize: "cover",
                           opacity: 0.85
                         }}>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Complete previous scenario
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScenario(index);
                        }}
                        className={`w-full py-2 px-4 rounded-lg font-serif font-bold transition-all duration-300 border-2 ${
                          status === "completed"
                            ? "bg-amber-700 hover:bg-amber-600 text-amber-50 border-amber-500"
                            : "bg-amber-600 hover:bg-amber-500 text-amber-50 border-amber-800"
                        }`}
                        style={{
                          backgroundImage: status === "completed" 
                            ? "linear-gradient(to bottom, #b45309, #92400e)" 
                            : "linear-gradient(to bottom, #b45309, #78350f)",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                      >
                        {status === "completed"
                          ? "Replay Scenario"
                          : "Start Scenario"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center text-amber-800 font-serif">
        <div className="mb-2 text-lg">Choose a scenario to begin your campaign</div>
        <div className="text-sm opacity-90">
          Based on historical events of the Polish-Swedish War (1655-1660)
        </div>
        <div className="mt-4 text-xs opacity-80 italic">
          "During the reign of King John Casimir, Poland was flooded with blood and tears..."
        </div>
      </div>
      
      {/* Decorative flourish at bottom */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-12 opacity-70"
           style={{
             backgroundImage: "url('/assets/decorative-flourish.png')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat",
             backgroundPosition: "center"
           }}></div>
    </div>
  );
};

export default StartScreen;