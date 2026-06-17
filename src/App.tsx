import { useEffect, useState } from "react";
import "./App.css";
import type { Garment, WallSection } from "./types/domain";
import { getAllGarments, getAllWallSections } from "./data/db";
import { WallSetupPanel } from "./components/WallSetupPanel";
import { GarmentForm } from "./components/GarmentForm";
import { GarmentList } from "./components/GarmentList";
import { WallView } from "./components/WallView";
import { Wall3DView } from "./components/Wall3DView";

type Tab = "wall" | "add" | "garments" | "setup";
type WallMode = "2d" | "3d";

function App() {
  const [tab, setTab] = useState<Tab>("wall");
  const [wallMode, setWallMode] = useState<WallMode>("2d");
  const [sections, setSections] = useState<WallSection[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);

  async function refresh() {
    setSections(await getAllWallSections());
    setGarments(await getAllGarments());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>VM Planner</h1>
        <nav>
          <button className={tab === "wall" ? "active" : ""} onClick={() => setTab("wall")}>
            Wall View
          </button>
          <button className={tab === "add" ? "active" : ""} onClick={() => setTab("add")}>
            Add Garment
          </button>
          <button className={tab === "garments" ? "active" : ""} onClick={() => setTab("garments")}>
            Garments
          </button>
          <button className={tab === "setup" ? "active" : ""} onClick={() => setTab("setup")}>
            Wall Setup
          </button>
        </nav>
      </header>

      <main>
        {tab === "setup" && <WallSetupPanel sections={sections} onChange={refresh} />}
        {tab === "add" && <GarmentForm existingGarments={garments} onAdded={refresh} />}
        {tab === "garments" && <GarmentList garments={garments} onChange={refresh} />}
        {tab === "wall" && (
          <div className="panel">
            {sections.length === 0 && (
              <p className="hint">No wall sections yet — add one in Wall Setup to get started.</p>
            )}
            {sections.length > 0 && (
              <div className="wall-mode-toggle">
                <button className={wallMode === "2d" ? "active" : ""} onClick={() => setWallMode("2d")}>
                  2D
                </button>
                <button className={wallMode === "3d" ? "active" : ""} onClick={() => setWallMode("3d")}>
                  3D
                </button>
              </div>
            )}
            {sections.map((s) =>
              wallMode === "2d" ? <WallView key={s.id} section={s} /> : <Wall3DView key={s.id} section={s} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
