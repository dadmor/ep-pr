import { useState, useEffect, useRef, ChangeEvent } from "react";
import CardsTab from "./scenario/CardsTab";
import ScenariosTab from "./scenario/ScenariosTab";
import StoriesTab from "./scenario/StoriesTab";

// Define interfaces for our data types
export interface Card {
  name: string;
  maxHp: number;
  armor: number;
  attack: number;
  cost: number;
  goldValue: number;
  faction: string;
}

export interface Scenario {
  id: number;
  name: string;
  description: string;
  playerStartingCards: string[];
  opponentStartingCards: string[];
  startingPlayer: "player" | "opponent";
  playerStartingGold: number;
  opponentStartingGold: number;
  cityId: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Arrow {
  start: Position;
  end: Position;
  color: string;
  dashed: boolean;
}

export interface Icon {
  position: Position;
  type: "infantry" | "cavalry" | "artillery" | "navy" | "battle";
  color: string;
  label: string;
}

export interface Unit {
  name: string;
  template: string;
}

export interface Page {
  title: string;
  text: string;
  date: string;
  arrows: Arrow[];
  icons: Icon[];
  units: Unit[];
}

export interface Story {
  scenarioId: number;
  pages: Page[];
}

// Główny komponent edytora
export default function SwedishDelugeEditor() {
  // Stany dla przechowywania danych
  const [cards, setCards] = useState<Card[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [stories, setStories] = useState<Story[]>([]);

  // Stan dla aktywnej zakładki
  const [activeTab, setActiveTab] = useState<"cards" | "scenarios" | "stories">(
    "cards"
  );

  // Referencje do inputów plików
  const cardsInputRef = useRef<HTMLInputElement>(null);
  const scenariosInputRef = useRef<HTMLInputElement>(null);
  const storiesInputRef = useRef<HTMLInputElement>(null);

  // Funkcje do importu plików JSON
  const importCards = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === "string") {
            const data = JSON.parse(result) as Card[];
            setCards(data);
            alert(`Pomyślnie zaimportowano ${data.length} kart!`);
          }
        } catch (error) {
          alert(
            "Błąd podczas parsowania pliku JSON: " + (error as Error).message
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const importScenarios = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === "string") {
            const data = JSON.parse(result) as Scenario[];
            setScenarios(data);
            alert(`Pomyślnie zaimportowano ${data.length} scenariuszy!`);
          }
        } catch (error) {
          alert(
            "Błąd podczas parsowania pliku JSON: " + (error as Error).message
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const importStories = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === "string") {
            const data = JSON.parse(result) as Story[];
            setStories(data);
            alert(`Pomyślnie zaimportowano ${data.length} historii!`);
          }
        } catch (error) {
          alert(
            "Błąd podczas parsowania pliku JSON: " + (error as Error).message
          );
        }
      };
      reader.readAsText(file);
    }
  };

  // Funkcje do eksportu danych do plików JSON
  const exportToJson = (data: any[], filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCards = () => {
    if (cards.length === 0) {
      alert("Brak kart do eksportu. Najpierw zaimportuj lub dodaj karty.");
      return;
    }
    exportToJson(cards, "cards.json");
  };

  const exportScenarios = () => {
    if (scenarios.length === 0) {
      alert(
        "Brak scenariuszy do eksportu. Najpierw zaimportuj lub dodaj scenariusze."
      );
      return;
    }
    exportToJson(scenarios, "scenarios.json");
  };

  const exportStories = () => {
    if (stories.length === 0) {
      alert(
        "Brak historii do eksportu. Najpierw zaimportuj lub dodaj historie."
      );
      return;
    }
    exportToJson(stories, "stories.json");
  };

  return (
    <div className="p-6">
      <div className="bg-amber-50 p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-900 text-center mb-6">
          Game Cards and Scenario Editor
        </h1>

        {/* Zakładki nawigacyjne */}
        <div className="flex border-b border-amber-300 mb-6">
          <button
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-2 ${
              activeTab === "cards"
                ? "bg-amber-200 font-bold rounded-t-lg"
                : "text-amber-800"
            }`}
          >
            Karty
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`px-4 py-2 ${
              activeTab === "scenarios"
                ? "bg-amber-200 font-bold rounded-t-lg"
                : "text-amber-800"
            }`}
          >
            Scenariusze
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-2 ${
              activeTab === "stories"
                ? "bg-amber-200 font-bold rounded-t-lg"
                : "text-amber-800"
            }`}
          >
            Historie
          </button>
        </div>

        {/* Renderowanie odpowiedniej zakładki */}
        {activeTab === "cards" && (
          <CardsTab
            cards={cards}
            setCards={setCards}
            importCards={importCards}
            exportCards={exportCards}
            cardsInputRef={cardsInputRef}
          />
        )}

        {activeTab === "scenarios" && (
          <ScenariosTab
            scenarios={scenarios}
            setScenarios={setScenarios}
            cards={cards}
            importScenarios={importScenarios}
            exportScenarios={exportScenarios}
            scenariosInputRef={scenariosInputRef}
          />
        )}

        {activeTab === "stories" && (
          <StoriesTab
            stories={stories}
            setStories={setStories}
            scenarios={scenarios}
            cards={cards}
            importStories={importStories}
            exportStories={exportStories}
            storiesInputRef={storiesInputRef}
          />
        )}
      </div>
    </div>
  );
}
