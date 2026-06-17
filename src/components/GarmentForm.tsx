import { useState } from "react";
import type { Garment, GarmentCategory, Season } from "../types/domain";
import { CATEGORY_DEFAULT_WIDTH } from "../rules/wallEngine";
import { newId, putGarment, saveBlob } from "../data/db";
import { CATEGORY_OPTIONS, SUBTYPE_SUGGESTIONS } from "../utils/constants";

interface Props {
  existingGarments: Garment[];
  onAdded: () => void;
}

export function GarmentForm({ existingGarments, onAdded }: Props) {
  const [category, setCategory] = useState<GarmentCategory>("TShirt");
  const [subtype, setSubtype] = useState("");
  const [colour, setColour] = useState("");
  const [brand, setBrand] = useState("Nike");
  const [material, setMaterial] = useState("Cotton");
  const [season, setSeason] = useState<Season>("AllSeason");
  const [setId, setSetId] = useState("");
  const [isZipHoodie, setIsZipHoodie] = useState(false);
  const [layeredBehindId, setLayeredBehindId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const existingSetIds = Array.from(
    new Set(existingGarments.map((g) => g.setId).filter((s): s is string => Boolean(s)))
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      alert("Photograph the garment before saving — the photo attaches directly to this record.");
      return;
    }
    setSaving(true);
    const blobId = newId();
    await saveBlob(blobId, file);
    const garment: Garment = {
      id: newId(),
      category,
      subtype: subtype || SUBTYPE_SUGGESTIONS[category][0],
      colour,
      brand,
      material,
      imageBlobId: blobId,
      width: CATEGORY_DEFAULT_WIDTH[category],
      season,
      setId: setId || undefined,
      isZipHoodie: category === "ZipHoodie" ? isZipHoodie : undefined,
      layeredBehindId: layeredBehindId || undefined,
      createdAt: Date.now(),
    };
    await putGarment(garment);
    setSaving(false);
    setColour("");
    setSubtype("");
    setFile(null);
    onAdded();
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2>Add Garment</h2>
      <p className="hint">
        One photo per garment — it attaches directly to this record and the wall view places it
        automatically, following the VM rules.
      </p>

      <label>
        Photo
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </label>

      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value as GarmentCategory)}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        Subtype
        <input
          list="subtype-suggestions"
          value={subtype}
          onChange={(e) => setSubtype(e.target.value)}
          placeholder={SUBTYPE_SUGGESTIONS[category][0]}
        />
        <datalist id="subtype-suggestions">
          {SUBTYPE_SUGGESTIONS[category].map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      <label>
        Colour
        <input value={colour} onChange={(e) => setColour(e.target.value)} required />
      </label>

      <label>
        Brand
        <input value={brand} onChange={(e) => setBrand(e.target.value)} required />
      </label>

      <label>
        Material
        <input value={material} onChange={(e) => setMaterial(e.target.value)} required />
      </label>

      <label>
        Season
        <select value={season} onChange={(e) => setSeason(e.target.value as Season)}>
          <option value="AllSeason">All Season</option>
          <option value="Summer">Summer</option>
          <option value="Winter">Winter</option>
        </select>
      </label>

      {category === "ZipHoodie" && (
        <label className="checkbox">
          <input type="checkbox" checked={isZipHoodie} onChange={(e) => setIsZipHoodie(e.target.checked)} />
          Has a working zip (vs. a jacket without one)
        </label>
      )}

      <label>
        Set ID <span className="hint-inline">(matching tee+pant+hoodie — same ID links them)</span>
        <input list="set-suggestions" value={setId} onChange={(e) => setSetId(e.target.value)} />
        <datalist id="set-suggestions">
          {existingSetIds.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      <label>
        Layer behind <span className="hint-inline">(same-hanger layering — this garment hangs behind another)</span>
        <select value={layeredBehindId} onChange={(e) => setLayeredBehindId(e.target.value)}>
          <option value="">— none —</option>
          {existingGarments.map((g) => (
            <option key={g.id} value={g.id}>
              {g.category} · {g.subtype} · {g.colour}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Garment"}
      </button>
    </form>
  );
}
