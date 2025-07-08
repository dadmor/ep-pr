import React, { useRef, useEffect } from "react";
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
  set: (partial: Partial<MapState>) => void;
  addProvince: () => void;
  resetView: () => void;
  clearAll: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  provinces: [],
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
  resetView: () => set({ view: { x: 0, y: 0, scale: 1 } }),
  clearAll: () =>
    set({
      provinces: [],
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

  const {
    provinces,
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
    set,
    addProvince,
    resetView,
    clearAll,
  } = useMapStore();

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];

  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvasRef.current!.width / r.width);
    const y = (e.clientY - r.top) * (canvasRef.current!.height / r.height);
    return { x: (x - view.x) / view.scale, y: (y - view.y) / view.scale };
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
        x: (p.clientWidth - canvasSize.width * s) / 2,
        y: (p.clientHeight - canvasSize.height * s) / 2,
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
      [JSON.stringify({ provinces, mapSize: canvasSize }, null, 2)],
      { type: "application/json" }
    );
    const u = URL.createObjectURL(b),
      a = document.createElement("a");
    a.href = u;
    a.download = "mapa.json";
    a.click();
    URL.revokeObjectURL(u);
  };

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d");
    if (!ctx) return;
  
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
  
    if (bgRef.current)
      ctx.drawImage(bgRef.current, 0, 0, canvasSize.width, canvasSize.height);
  
    provinces.forEach((p) => {
      if (p.path.length < 3) return;
  
      const cx = p.path.reduce((s, pt) => s + pt.x, 0) / p.path.length;
      const cy = p.path.reduce((s, pt) => s + pt.y, 0) / p.path.length;
  
      const offsetX = 3 / view.scale;
      const offsetY = 6 / view.scale;
  
      // Cień pod poligonem
      ctx.beginPath();
      ctx.moveTo(p.path[0].x + offsetX, p.path[0].y + offsetY);
      p.path.forEach((pt) => ctx.lineTo(pt.x + offsetX, pt.y + offsetY));
      ctx.closePath();
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.shadowColor = "rgba(0,0,0,0.2)"; 
      ctx.shadowBlur = 20 / view.scale;
      ctx.fill(); 
  
      // Wypełnienie poligonu
      ctx.beginPath();
      ctx.moveTo(p.path[0].x, p.path[0].y);
      p.path.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.fillStyle = "#3BAF4B";
      ctx.fill();
  
      // Clip dla glow
      ctx.save();
      ctx.clip();
  
      ctx.shadowBlur = 30 / view.scale;
      ctx.shadowColor = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 10 / view.scale;
      ctx.stroke();
  
      ctx.shadowBlur = 20 / view.scale;
      ctx.lineWidth = 6 / view.scale;
      ctx.stroke();
  
      ctx.shadowBlur = 10 / view.scale;
      ctx.lineWidth = 4 / view.scale;
      ctx.stroke();
  
      ctx.restore();
  
      // Cienki wyraźny kontur
      ctx.beginPath();
      ctx.moveTo(p.path[0].x, p.path[0].y);
      p.path.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 / view.scale;
      ctx.stroke();
  
      // Jasny highlight u góry poligonu
      ctx.beginPath();
      ctx.moveTo(p.path[0].x, p.path[0].y);
      p.path.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1 / view.scale;
      ctx.stroke();
  
      // Nazwa prowincji
      ctx.font = `${14 / view.scale}px Arial`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#333";
      ctx.fillText(p.name, cx, cy);
    });
  
    if (current.length) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / view.scale;
      ctx.beginPath();
      ctx.moveTo(current[0].x, current[0].y);
      current.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      current.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 / view.scale, 0, 6.28);
        ctx.fillStyle = i ? "#fff" : color;
        ctx.fill();
      });
    }
  
    if (hover) {
      ctx.beginPath();
      ctx.arc(hover.x, hover.y, 6 / view.scale, 0, 6.28);
      ctx.fillStyle = "#007bff80";
      ctx.fill();
    }
  });
  

  useEffect(() => {
    const c = canvasRef.current;
    const resize = () => {
      const p = c?.parentElement;
      if (p) {
        c.width = p.clientWidth;
        c.height = p.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="h-screen bg-gray-700 text-white flex flex-col">
      <header className="p-2 flex justify-between bg-gray-800">
        <h1>🗺️ Edytor Map</h1>
        <span>Zoom: {Math.round(view.scale * 100)}%</span>
      </header>
      <div className="flex flex-1">
        <aside className="w-60 p-2 space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-fulltext-xs p-2"
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
            placeholder="Nazwa"
            className="w-full text-xs p-2 text-black"
          />
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
          <button
            onClick={addProvince}
            className="w-full bg-green-700 text-xs mt-1 p-2"
          >
            ✅ Dodaj
          </button>
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
                set({ current: [...current, nearest(p) || p] });
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
                set({ hover: nearest(getPos(e)) });
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
        <aside className="w-48 bg-gray-700 p-2 overflow-y-auto">
          {provinces.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center text-xs bg-gray-700 px-1 mb-1"
            >
              <span>{p.name}</span>
              <button
                onClick={() =>
                  set({ provinces: provinces.filter((pp) => pp.id !== p.id) })
                }
              >
                &times;
              </button>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
