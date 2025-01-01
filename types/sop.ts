export interface SOP {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type SOPInput = Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>;
