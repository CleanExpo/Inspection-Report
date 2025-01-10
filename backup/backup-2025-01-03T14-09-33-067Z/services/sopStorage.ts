import { saveOffline, loadOffline } from "./offlineStorage";
import { SOP } from "../types/sop";

const SOP_KEY = "sops";

export const saveSops = async (sops: SOP[]): Promise<void> => {
  await saveOffline(SOP_KEY, sops);
};

export const loadSops = async (): Promise<SOP[]> => {
  return (await loadOffline<SOP[]>(SOP_KEY)) ?? [];
};

export const addSop = async (content: string): Promise<SOP> => {
  const sops = await loadSops();
  
  const newSop: SOP = {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveSops([...sops, newSop]);
  return newSop;
};

export const removeSop = async (id: string): Promise<void> => {
  const sops = await loadSops();
  const updatedSops = sops.filter(sop => sop.id !== id);
  await saveSops(updatedSops);
};

export const updateSop = async (id: string, content: string): Promise<SOP> => {
  const sops = await loadSops();
  const sopIndex = sops.findIndex(sop => sop.id === id);
  
  if (sopIndex === -1) {
    throw new Error(`SOP with id ${id} not found`);
  }

  const updatedSop: SOP = {
    ...sops[sopIndex],
    content,
    updatedAt: new Date().toISOString()
  };

  sops[sopIndex] = updatedSop;
  await saveSops(sops);
  
  return updatedSop;
};
