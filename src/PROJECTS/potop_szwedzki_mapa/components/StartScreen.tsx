// src/PROJECTS/potop_szwedzki_mapa/components/StartScreen.tsx
import React from "react";
import { useGameStore } from "../store/gameStore";
import ActionButton from "./ActionButton";
import { Scenario } from "../types";

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
      <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading map data...</h2>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
    <div className="relative w-full h-screen bg-amber-50 text-white overflow-hidden">
      {/* Fullscreen map in background */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-70">
        {/* Map component will be rendered here */}
      </div>

      <div className="relative z-10 flex flex-col items-center pt-16 px-4">
        <h1 className="text-5xl font-bold text-amber-800 mb-8 text-center text-shadow-lg">
          Potop Szwedzki
        </h1>
        <h2 className="text-2xl font-semibold text-amber-700 mb-12 text-center">
          The Swedish Deluge: Poland's Fight for Survival (1655-1660)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {scenarios.map((scenario, index) => {
            const status = getScenarioStatus(index);
            const cityInfo = mapData.cities.find(
              (city) => city.id === scenario.cityId
            );

            return (
              <div
                key={index}
                className={`bg-opacity-90 rounded-lg p-6 transition-all duration-300 transform ${
                  status === "locked"
                    ? "bg-gray-800 opacity-50 cursor-not-allowed"
                    : status === "completed"
                    ? "bg-green-800 hover:scale-105 cursor-pointer"
                    : "bg-amber-800 hover:scale-105 cursor-pointer"
                }`}
                onClick={() => status !== "locked" && onSelectScenario(index)}
              >
                <div className="flex items-start mb-3">
                  <div
                    className="w-6 h-6 rounded-full mr-3 mt-1 flex-shrink-0"
                    style={{ backgroundColor: cityInfo?.color || "#888" }}
                  ></div>
                  <h3 className="text-xl font-bold">
                    {scenario.name}
                    {status === "completed" && (
                      <span className="ml-2 text-green-300">✓</span>
                    )}
                  </h3>
                </div>

                <div className="text-sm mb-4 opacity-90">
                  Location: {cityInfo?.name || "Unknown"}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="opacity-80">Your forces:</span>{" "}
                    {scenario.playerStartingCards.length} units
                  </div>
                  <div>
                    <span className="opacity-80">Enemy forces:</span>{" "}
                    {scenario.opponentStartingCards.length} units
                  </div>
                </div>

                <div className="mt-6">
                  {status === "locked" ? (
                    <div className="text-gray-400 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Complete previous scenario to unlock
                    </div>
                  ) : (
                    <ActionButton
                      onClick={() => {
                        onSelectScenario(index);
                      }}
                      className="w-full"
                    >
                      {status === "completed"
                        ? "Replay Scenario"
                        : "Start Scenario"}
                    </ActionButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center text-amber-900 font-semibold">
        <div className="mb-2">Choose a scenario to begin your campaign</div>
        <div className="text-sm">
          Based on historical events of the Polish-Swedish War (1655-1660)
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
