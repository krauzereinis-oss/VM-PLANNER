import type { Garment } from "../types/domain";
import { deleteGarment } from "../data/db";
import { useObjectUrl } from "../utils/useObjectUrl";

interface Props {
  garments: Garment[];
  onChange: () => void;
}

export function GarmentList({ garments, onChange }: Props) {
  return (
    <div className="panel">
      <h2>Garments ({garments.length})</h2>
      <ul className="garment-grid">
        {garments
          .slice()
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((g) => (
            <GarmentCard key={g.id} garment={g} onRemove={() => deleteGarment(g.id).then(onChange)} />
          ))}
      </ul>
    </div>
  );
}

function GarmentCard({ garment, onRemove }: { garment: Garment; onRemove: () => void }) {
  const url = useObjectUrl(garment.imageBlobId);
  return (
    <li className="garment-card">
      {url && <img src={url} alt={garment.subtype} />}
      <div className="garment-meta">
        <strong>{garment.category}</strong>
        <span>{garment.subtype}</span>
        <span>{garment.colour}</span>
        {garment.setId && <span className="badge">set: {garment.setId}</span>}
      </div>
      <button className="danger" onClick={onRemove}>
        Remove
      </button>
    </li>
  );
}
