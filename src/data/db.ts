import { openDB, type IDBPDatabase } from "idb";
import type { Garment, WallBaseline, WallSection } from "../types/domain";

const DB_NAME = "vm-planner";
const DB_VERSION = 1;

interface BlobRecord {
  id: string;
  blob: Blob;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("garments", { keyPath: "id" });
        db.createObjectStore("wallSections", { keyPath: "id" });
        db.createObjectStore("wallBaselines", { keyPath: "id" });
        db.createObjectStore("blobs", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export async function saveBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put("blobs", { id, blob } satisfies BlobRecord);
}

export async function getBlobUrl(id: string): Promise<string | undefined> {
  const db = await getDb();
  const record = (await db.get("blobs", id)) as BlobRecord | undefined;
  if (!record) return undefined;
  return URL.createObjectURL(record.blob);
}

export async function putGarment(garment: Garment): Promise<void> {
  const db = await getDb();
  await db.put("garments", garment);
}

export async function deleteGarment(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("garments", id);
}

export async function getAllGarments(): Promise<Garment[]> {
  const db = await getDb();
  return db.getAll("garments");
}

export async function putWallSection(section: WallSection): Promise<void> {
  const db = await getDb();
  await db.put("wallSections", section);
}

export async function deleteWallSection(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("wallSections", id);
}

export async function getAllWallSections(): Promise<WallSection[]> {
  const db = await getDb();
  const sections: WallSection[] = await db.getAll("wallSections");
  return sections.sort((a, b) => a.order - b.order);
}

export async function putWallBaseline(baseline: WallBaseline): Promise<void> {
  const db = await getDb();
  await db.put("wallBaselines", baseline);
}

export async function getBaselinesForSection(sectionId: string): Promise<WallBaseline[]> {
  const db = await getDb();
  const all: WallBaseline[] = await db.getAll("wallBaselines");
  return all.filter((b) => b.sectionId === sectionId);
}

export function newId(): string {
  return crypto.randomUUID();
}
