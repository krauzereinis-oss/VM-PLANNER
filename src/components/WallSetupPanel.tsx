import { useState } from "react";
import type { WallSection } from "../types/domain";
import { newId, putWallSection, deleteWallSection, putWallBaseline, saveBlob } from "../data/db";

interface Props {
  sections: WallSection[];
  onChange: () => void;
}

export function WallSetupPanel({ sections, onChange }: Props) {
  const [brand, setBrand] = useState("Nike");
  const [startMeter, setStartMeter] = useState(0);
  const [endMeter, setEndMeter] = useState(3);
  const [isComplete, setIsComplete] = useState(false);

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    const section: WallSection = {
      id: newId(),
      brand,
      startMeter,
      endMeter,
      isComplete,
      order: sections.length,
    };
    await putWallSection(section);
    onChange();
  }

  async function removeSection(id: string) {
    await deleteWallSection(id);
    onChange();
  }

  return (
    <div className="panel">
      <h2>Wall Sections</h2>
      <p className="hint">
        Define each brand section of the wall in left-to-right order. A partial section (not
        yet fully photographed) flows product left-to-right; mark it complete once the full
        brand run is built, to enable center-out symmetrical placement.
      </p>
      <form onSubmit={addSection} className="row">
        <label>
          Brand
          <input value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </label>
        <label>
          Start (m)
          <input
            type="number"
            step="0.25"
            value={startMeter}
            onChange={(e) => setStartMeter(Number(e.target.value))}
          />
        </label>
        <label>
          End (m)
          <input
            type="number"
            step="0.25"
            value={endMeter}
            onChange={(e) => setEndMeter(Number(e.target.value))}
          />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={isComplete} onChange={(e) => setIsComplete(e.target.checked)} />
          Complete (full brand run)
        </label>
        <button type="submit">Add Section</button>
      </form>

      <ul className="section-list">
        {sections.map((s) => (
          <SectionRow key={s.id} section={s} onRemove={() => removeSection(s.id)} onChange={onChange} />
        ))}
      </ul>
    </div>
  );
}

function SectionRow({
  section,
  onRemove,
  onChange,
}: {
  section: WallSection;
  onRemove: () => void;
  onChange: () => void;
}) {
  async function captureBaseline(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobId = newId();
    await saveBlob(blobId, file);
    await putWallBaseline({
      id: newId(),
      sectionId: section.id,
      imageBlobId: blobId,
      kind: file.type.startsWith("video") ? "video" : "photo",
      capturedAt: Date.now(),
    });
    onChange();
  }

  return (
    <li className="section-row">
      <span>
        <strong>{section.brand}</strong> {section.startMeter}m–{section.endMeter}m
        {section.isComplete ? " (complete)" : " (partial — flows left-to-right)"}
      </span>
      <label className="upload-btn">
        Capture baseline
        <input type="file" accept="image/*,video/*" onChange={captureBaseline} hidden />
      </label>
      <button className="danger" onClick={onRemove}>
        Remove
      </button>
    </li>
  );
}
