import React, { useRef, useEffect, useState } from "react";
import { create } from "zustand";

interface Point {
  x: number;
  y: number;
}
interface Province {
  id: number;
  name: string;
  path: Point[];
  color: string;
}
interface City {
  id: number;
  name: string;
  position: Point;
  size: number;
  color: string;
}
interface View {
  x: number;
  y: number;
  scale: number;
}
interface CanvasSize {
  width: number;
  height: number;
}
interface MapState {
  provinces: Province[];
  cities: City[];
  current: Point[];
  name: string;
  color: string;
  view: View;
  drag: boolean;
  dragStart: Point;
  hover: Point | null;
  snap: boolean;
  snapDist: number;
  canvasSize: CanvasSize;
  mode: "province" | "city";
  citySize: number;
  pixelPerfect: boolean;
  set: (partial: Partial<MapState>) => void;
  addProvince: () => void;
  addCity: (position: Point) => void;
  resetView: () => void;
  clearAll: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  provinces: [],
  cities: [],
  current: [],
  name: "",
  color: "#FF6B6B",
  view: { x: 0, y: 0, scale: 1 },
  drag: false,
  dragStart: { x: 0, y: 0 },
  hover: null,
  snap: true,
  snapDist: 15,
  canvasSize: { width: 800, height: 600 },
  mode: "province",
  citySize: 20,
  pixelPerfect: true,
  set: (partial) => set((state) => ({ ...state, ...partial })),
  addProvince: () =>
    set((s) => {
      if (s.current.length < 3 || !s.name.trim()) return s;
      return {
        provinces: [
          ...s.provinces,
          { id: Date.now(), name: s.name, path: s.current, color: s.color },
        ],
        current: [],
        name: "",
        color: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][
          Math.floor(Math.random() * 4)
        ],
      };
    }),
  addCity: (position) =>
    set((s) => {
      if (!s.name.trim()) return s;
      return {
        cities: [
          ...s.cities,
          {
            id: Date.now(),
            name: s.name,
            position,
            size: s.citySize,
            color: s.color,
          },
        ],
        name: "",
        color: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][
          Math.floor(Math.random() * 4)
        ],
      };
    }),
  resetView: () => set({ view: { x: 0, y: 0, scale: 1 } }),
  clearAll: () =>
    set({
      provinces: [],
      cities: [],
      current: [],
      hover: null,
      view: { x: 0, y: 0, scale: 1 },
    }),
}));

export default function ProvinceMapEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio || 1);

  const {
    provinces,
    cities,
    current,
    name,
    color,
    view,
    drag,
    dragStart,
    hover,
    snap,
    snapDist,
    canvasSize,
    mode,
    citySize,
    pixelPerfect,
    set,
    addProvince,
    addCity,
    resetView,
    clearAll,
  } = useMapStore();

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];

  // Helper function to snap a value to the nearest pixel
  const snapToPixel = (value: number) => {
    if (!pixelPerfect) return value;
    return Math.round(value);
  };

  // Helper function to snap a point to the nearest pixel
  const snapPointToPixel = (point: Point): Point => {
    if (!pixelPerfect) return point;
    return {
      x: snapToPixel(point.x),
      y: snapToPixel(point.y)
    };
  };

  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvasRef.current!.width / r.width);
    const y = (e.clientY - r.top) * (canvasRef.current!.height / r.height);
    const point = { x: (x - view.x) / view.scale, y: (y - view.y) / view.scale };
    return pixelPerfect ? snapPointToPixel(point) : point;
  };

  const nearest = (p: Point): Point | null => {
    if (!snap) return null;
    let n: Point | null = null;
    let d = snapDist / view.scale;
    provinces
      .flatMap((x) => x.path)
      .forEach((pt) => {
        const dist = Math.hypot(pt.x - p.x, pt.y - p.y);
        if (dist < d) {
          d = dist;
          n = pt;
        }
      });
    return n;
  };

  const fit = () => {
    const c = canvasRef.current,
      p = c?.parentElement;
    if (!p) return;
    const s = Math.min(
      (p.clientWidth - 40) / canvasSize.width,
      (p.clientHeight - 40) / canvasSize.height,
      1
    );
    set({
      view: {
        scale: s,
        x: snapToPixel((p.clientWidth - canvasSize.width * s) / 2),
        y: snapToPixel((p.clientHeight - canvasSize.height * s) / 2),
      },
    });
  };

  const loadFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    cb: (r: string) => void
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => cb(ev.target?.result as string);
    f.type.startsWith("image/") ? r.readAsDataURL(f) : r.readAsText(f);
    e.target.value = "";
  };

  const loadImage = (d: string) => {
    const i = new Image();
    i.onload = () => {
      bgRef.current = i;
      set({ canvasSize: { width: i.width, height: i.height } });
      setTimeout(fit, 50);
    };
    i.src = d;
  };

  const importJSON = (j: string) => {
    try {
      const d = JSON.parse(j);
      set({
        provinces: d.provinces || [],
        cities: d.cities || [],
        canvasSize: d.mapSize || canvasSize,
        current: [],
      });
      resetView();
      alert("Mapa wczytana!");
    } catch {
      alert("Błąd importu.");
    }
  };

  const exportJSON = () => {
    const b = new Blob(
      [JSON.stringify({ provinces, cities, mapSize: canvasSize }, null, 2)],
      { type: "application/json" }
    );
    const u = URL.createObjectURL(b),
      a = document.createElement("a");
    a.href = u;
    a.download = "mapa.json";
    a.click();
    URL.revokeObjectURL(u);
  };

  // Configure canvas for high DPI screens
  useEffect(() => {
    const updatePixelRatio = () => {
      setDevicePixelRatio(window.devicePixelRatio || 1);
    };
    
    window.addEventListener('resize', updatePixelRatio);
    return () => window.removeEventListener('resize', updatePixelRatio);
  }, []);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d");
    if (!ctx) return;
  
    // Clear and prepare canvas with pixel-perfect scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    
    // Apply pixel-perfect transform
    let transformX = view.x;
    let transformY = view.y;
    
    if (pixelPerfect) {
      transformX = snapToPixel(view.x);
      transformY = snapToPixel(view.y);
    }
    
    ctx.setTransform(view.scale, 0, 0, view.scale, transformX, transformY);
  
    if (bgRef.current)
      ctx.drawImage(bgRef.current, 0, 0, canvasSize.width, canvasSize.height);
  
    // Rysowanie prowincji
    provinces.forEach((p) => {
      if (p.path.length < 3) return;
  
      const cx = p.path.reduce((s, pt) => s + pt.x, 0) / p.path.length;
      const cy = p.path.reduce((s, pt) => s + pt.y, 0) / p.path.length;
  
      const offsetX = pixelPerfect ? snapToPixel(3 / view.scale) : 3 / view.scale;
      const offsetY = pixelPerfect ? snapToPixel(6 / view.scale) : 6 / view.scale;
  
      // Cień pod poligonem
      ctx.beginPath();
      ctx.moveTo(
        pixelPerfect ? snapToPixel(p.path[0].x + offsetX) : p.path[0].x + offsetX, 
        pixelPerfect ? snapToPixel(p.path[0].y + offsetY) : p.path[0].y + offsetY
      );
      
      p.path.forEach((pt) => ctx.lineTo(
        pixelPerfect ? snapToPixel(pt.x + offsetX) : pt.x + offsetX, 
        pixelPerfect ? snapToPixel(pt.y + offsetY) : pt.y + offsetY
      ));
      
      ctx.closePath();
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.shadowColor = "rgba(0,0,0,0.2)"; 
      ctx.shadowBlur = pixelPerfect ? snapToPixel(20 / view.scale) : 20 / view.scale;
      ctx.fill(); 
  
      // Wypełnienie poligonu
      ctx.beginPath();
      ctx.moveTo(
        pixelPerfect ? snapToPixel(p.path[0].x) : p.path[0].x, 
        pixelPerfect ? snapToPixel(p.path[0].y) : p.path[0].y
      );
      
      p.path.forEach((pt) => ctx.lineTo(
        pixelPerfect ? snapToPixel(pt.x) : pt.x, 
        pixelPerfect ? snapToPixel(pt.y) : pt.y
      ));
      
      ctx.closePath();
      ctx.fillStyle = "#3BAF4B";
      ctx.fill();
  
      // Clip dla glow
      ctx.save();
      ctx.clip();
  
      ctx.shadowBlur = pixelPerfect ? snapToPixel(30 / view.scale) : 30 / view.scale;
      ctx.shadowColor = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = pixelPerfect ? snapToPixel(10 / view.scale) : 10 / view.scale;
      ctx.stroke();
  
      ctx.shadowBlur = pixelPerfect ? snapToPixel(20 / view.scale) : 20 / view.scale;
      ctx.lineWidth = pixelPerfect ? snapToPixel(6 / view.scale) : 6 / view.scale;
      ctx.stroke();
  
      ctx.shadowBlur = pixelPerfect ? snapToPixel(10 / view.scale) : 10 / view.scale;
      ctx.lineWidth = pixelPerfect ? snapToPixel(4 / view.scale) : 4 / view.scale;
      ctx.stroke();
  
      ctx.restore();
  
      // Cienki wyraźny kontur
      ctx.beginPath();
      ctx.moveTo(
        pixelPerfect ? snapToPixel(p.path[0].x) : p.path[0].x, 
        pixelPerfect ? snapToPixel(p.path[0].y) : p.path[0].y
      );
      
      p.path.forEach((pt) => ctx.lineTo(
        pixelPerfect ? snapToPixel(pt.x) : pt.x, 
        pixelPerfect ? snapToPixel(pt.y) : pt.y
      ));
      
      ctx.closePath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = pixelPerfect ? snapToPixel(3 / view.scale) : 3 / view.scale;
      ctx.stroke();
  
      // Jasny highlight u góry poligonu
      ctx.beginPath();
      ctx.moveTo(
        pixelPerfect ? snapToPixel(p.path[0].x) : p.path[0].x, 
        pixelPerfect ? snapToPixel(p.path[0].y) : p.path[0].y
      );
      
      p.path.forEach((pt) => ctx.lineTo(
        pixelPerfect ? snapToPixel(pt.x) : pt.x, 
        pixelPerfect ? snapToPixel(pt.y) : pt.y
      ));
      
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = pixelPerfect ? snapToPixel(1 / view.scale) : 1 / view.scale;
      ctx.stroke();
  
      // Nazwa prowincji
      ctx.font = `${pixelPerfect ? snapToPixel(14 / view.scale) : 14 / view.scale}px Arial`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#333";
      ctx.fillText(p.name, pixelPerfect ? snapToPixel(cx) : cx, pixelPerfect ? snapToPixel(cy) : cy);
    });
  
    // Rysowanie miast
    cities.forEach((city) => {
      const { position, size, name, color } = city;
      const radius = pixelPerfect ? snapToPixel(size / view.scale) : size / view.scale;
      const x = pixelPerfect ? snapToPixel(position.x) : position.x;
      const y = pixelPerfect ? snapToPixel(position.y) : position.y;
      
      // Cień pod miastem
      ctx.beginPath();
      ctx.arc(
        pixelPerfect ? snapToPixel(x + 2 / view.scale) : x + 2 / view.scale,
        pixelPerfect ? snapToPixel(y + 4 / view.scale) : y + 4 / view.scale,
        radius, 0, Math.PI * 2
      );
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = pixelPerfect ? snapToPixel(10 / view.scale) : 10 / view.scale;
      ctx.fill();
      
      // Główne koło miasta
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#F8F8F8";
      ctx.fill();
      
      // Kontur miasta
      ctx.strokeStyle = color;
      ctx.lineWidth = pixelPerfect ? snapToPixel(3 / view.scale) : 3 / view.scale;
      ctx.stroke();
      
      // Wewnętrzny krąg
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Nazwa miasta z cieniem
      const fontSize = pixelPerfect 
        ? snapToPixel(Math.max(12, Math.min(size * 0.7, 20)) / view.scale) 
        : Math.max(12, Math.min(size * 0.7, 20)) / view.scale;
      
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#333";
      ctx.shadowColor = "rgba(255,255,255,0.8)";
      ctx.shadowBlur = pixelPerfect ? snapToPixel(3 / view.scale) : 3 / view.scale;
      ctx.fillText(
        name, 
        x, 
        pixelPerfect ? snapToPixel(y + radius + 5 / view.scale) : y + radius + 5 / view.scale
      );
      
      // Wielkość miasta (jako liczba)
      const innerFontSize = pixelPerfect 
        ? snapToPixel(Math.max(10, Math.min(size * 0.5, 16)) / view.scale) 
        : Math.max(10, Math.min(size * 0.5, 16)) / view.scale;
      
      ctx.font = `${innerFontSize}px Arial`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 0;
      ctx.fillText(size.toString(), x, y);
    });
    
    // Rysowanie aktualnie tworzonej prowincji
    if (mode === "province" && current.length) {
      ctx.strokeStyle = color;
      ctx.lineWidth = pixelPerfect ? snapToPixel(2 / view.scale) : 2 / view.scale;
      ctx.beginPath();
      
      const startX = pixelPerfect ? snapToPixel(current[0].x) : current[0].x;
      const startY = pixelPerfect ? snapToPixel(current[0].y) : current[0].y;
      
      ctx.moveTo(startX, startY);
      
      current.forEach((p) => {
        const px = pixelPerfect ? snapToPixel(p.x) : p.x;
        const py = pixelPerfect ? snapToPixel(p.y) : p.y;
        ctx.lineTo(px, py);
      });
      
      ctx.stroke();
      
      current.forEach((p, i) => {
        const px = pixelPerfect ? snapToPixel(p.x) : p.x;
        const py = pixelPerfect ? snapToPixel(p.y) : p.y;
        const dotRadius = pixelPerfect ? snapToPixel(4 / view.scale) : 4 / view.scale;
        
        ctx.beginPath();
        ctx.arc(px, py, dotRadius, 0, 6.28);
        ctx.fillStyle = i ? "#fff" : color;
        ctx.fill();
      });
    }
    
    // Rysowanie punktu przyciągania
    if (hover) {
      const hx = pixelPerfect ? snapToPixel(hover.x) : hover.x;
      const hy = pixelPerfect ? snapToPixel(hover.y) : hover.y;
      const hoverRadius = pixelPerfect ? snapToPixel(6 / view.scale) : 6 / view.scale;
      
      ctx.beginPath();
      ctx.arc(hx, hy, hoverRadius, 0, 6.28);
      ctx.fillStyle = "#007bff80";
      ctx.fill();
    }
    
    // Podgląd miasta w trybie dodawania miast
    if (mode === "city" && hover) {
      const hx = pixelPerfect ? snapToPixel(hover.x) : hover.x;
      const hy = pixelPerfect ? snapToPixel(hover.y) : hover.y;
      const radius = pixelPerfect ? snapToPixel(citySize / view.scale) : citySize / view.scale;
      
      ctx.beginPath();
      ctx.arc(hx, hy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = pixelPerfect ? snapToPixel(2 / view.scale) : 2 / view.scale;
      ctx.stroke();
    }
  });

  // Handle canvas sizing and pixel ratio adjustments
  useEffect(() => {
    const c = canvasRef.current;
    const resize = () => {
      if (!c) return;
      const p = c.parentElement;
      if (p) {
        // Calculate logical size based on parent container
        const logicalWidth = p.clientWidth;
        const logicalHeight = p.clientHeight;
        
        // Set CSS size
        c.style.width = `${logicalWidth}px`;
        c.style.height = `${logicalHeight}px`;
        
        // Scale for high DPI displays
        c.width = Math.floor(logicalWidth * devicePixelRatio);
        c.height = Math.floor(logicalHeight * devicePixelRatio);
        
        // Adjust the context scale for high DPI
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.resetTransform();
          ctx.scale(devicePixelRatio, devicePixelRatio);
        }
      }
    };
    
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [devicePixelRatio]);

  return (
    <div className="h-screen bg-gray-700 text-white flex flex-col">
      <header className="p-2 flex justify-between bg-gray-800">
        <div className="flex items-center space-x-2">
          <h1>🗺️ Edytor Map</h1>
          <div className="flex bg-gray-700 rounded overflow-hidden">
            <button
              onClick={() => set({ mode: "province" })}
              className={`px-2 py-1 text-xs ${mode === "province" ? "bg-blue-600" : ""}`}
            >
              Prowincje
            </button>
            <button
              onClick={() => set({ mode: "city" })}
              className={`px-2 py-1 text-xs ${mode === "city" ? "bg-blue-600" : ""}`}
            >
              Miasta
            </button>
          </div>
        </div>
        <span>Zoom: {Math.round(view.scale * 100)}%</span>
      </header>
      <div className="flex flex-1">
        <aside className="w-60 p-2 space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-xs p-2 bg-gray-600"
          >
            📷 Wczytaj tło
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => loadFile(e, loadImage)}
            className="hidden"
          />
          <input
            value={name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={mode === "province" ? "Nazwa prowincji" : "Nazwa miasta"}
            className="w-full text-xs p-2 text-black"
          />
          
          {mode === "city" && (
            <div className="flex flex-col">
              <label className="text-xs mb-1">Wielkość miasta: {citySize}</label>
              <input
                type="range"
                min="5"
                max="50"
                value={citySize}
                onChange={(e) => set({ citySize: +e.target.value })}
                className="w-full"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => set({ color: c })}
                style={{ background: c }}
                className={`h-5 ${color === c ? "border border-white" : ""}`}
              />
            ))}
          </div>
          
          {mode === "province" && (
            <button
              onClick={addProvince}
              className="w-full bg-green-700 text-xs mt-1 p-2"
              disabled={current.length < 3 || !name.trim()}
            >
              ✅ Dodaj prowincję
            </button>
          )}
          
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={snap}
              onChange={(e) => set({ snap: e.target.checked })}
              className="mr-1"
            />
            Przyciąganie
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={snapDist}
            onChange={(e) => set({ snapDist: +e.target.value })}
            disabled={!snap}
            className="w-full"
          />
          
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={pixelPerfect}
              onChange={(e) => set({ pixelPerfect: e.target.checked })}
              className="mr-1"
            />
            Pixel Perfect
          </label>
          
          <button
            onClick={exportJSON}
            className="w-full bg-green-700 text-xs mt-1 p-2"
          >
            📁 Eksport
          </button>
          <button
            onClick={() => jsonInputRef.current?.click()}
            className="w-full bg-purple-700 text-xs mt-1 p-2"
          >
            📂 Import
          </button>
          <button
            onClick={() => {
              bgRef.current = null;
              clearAll();
            }}
            className="w-full bg-red-700 text-xs mt-1 p-2"
          >
            🗑️ Wyczyść
          </button>
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            onChange={(e) => loadFile(e, importJSON)}
            className="hidden"
          />
        </aside>
        <main className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => {
              if (e.button === 2 || e.ctrlKey) {
                set({ drag: true, dragStart: { x: e.clientX, y: e.clientY } });
              } else {
                const p = getPos(e);
                if (mode === "province") {
                  set({ current: [...current, nearest(p) || p] });
                } else if (mode === "city" && name.trim()) {
                  addCity(nearest(p) || p);
                }
              }
            }}
            onMouseMove={(e) => {
              if (drag) {
                set({
                  view: {
                    ...view,
                    x: view.x + e.clientX - dragStart.x,
                    y: view.y + e.clientY - dragStart.y,
                  },
                  dragStart: { x: e.clientX, y: e.clientY },
                });
              } else {
                set({ hover: nearest(getPos(e)) || getPos(e) });
              }
            }}
            onMouseUp={() => set({ drag: false })}
            onWheel={(e) => {
              e.preventDefault();
              const r = canvasRef.current!.getBoundingClientRect();
              const mx =
                (e.clientX - r.left) * (canvasRef.current!.width / r.width);
              const my =
                (e.clientY - r.top) * (canvasRef.current!.height / r.height);
              const ns = Math.min(
                Math.max(view.scale * (e.deltaY > 0 ? 0.9 : 1.1), 0.1),
                5
              );
              set({
                view: {
                  scale: ns,
                  x: mx - ((mx - view.x) * ns) / view.scale,
                  y: my - ((my - view.y) * ns) / view.scale,
                },
              });
            }}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full cursor-crosshair"
          />
        </main>
        <aside className="w-48 bg-gray-800 p-2 overflow-y-auto">
          <div className="mb-2">
            <h3 className="text-sm font-bold border-b border-gray-600 pb-1 mb-1">Prowincje</h3>
            {provinces.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center text-xs bg-gray-700 px-2 py-1 mb-1 rounded"
              >
                <span>{p.name}</span>
                <button
                  onClick={() =>
                    set({ provinces: provinces.filter((pp) => pp.id !== p.id) })
                  }
                  className="text-red-400 hover:text-red-200"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="text-sm font-bold border-b border-gray-600 pb-1 mb-1">Miasta</h3>
            {cities.map((city) => (
              <div
                key={city.id}
                className="flex justify-between items-center text-xs bg-gray-700 px-2 py-1 mb-1 rounded"
              >
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: city.color }}
                  ></div>
                  <span>{city.name} ({city.size})</span>
                </div>
                <button
                  onClick={() =>
                    set({ cities: cities.filter((c) => c.id !== city.id) })
                  }
                  className="text-red-400 hover:text-red-200"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}