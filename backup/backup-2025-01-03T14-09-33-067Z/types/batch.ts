import type { VoiceNote } from './voice';
import type { PhotoAttachment } from './photo';

export interface BatchItemBase {
  id: string;
  tags?: string[];
}

export type BatchItem = (VoiceNote | PhotoAttachment) & BatchItemBase;

export interface TagUpdate {
  tags: string[];
}

export interface BatchOperationResult {
  success: boolean;
  message: string;
  error?: string;
  affectedItems?: string[];
}

export type BatchOperationType = 
  | 'tag'
  | 'delete'
  | 'download'
  | 'archive'
  | 'share'
  | 'compress'
  | 'createGallery';

export interface BatchOperationOptions {
  showConfirmation?: boolean;
  allowUndo?: boolean;
  processInBackground?: boolean;
}

export interface BatchOperationHandler<T extends BatchItem> {
  type: BatchOperationType;
  handler: (items: T[], options?: BatchOperationOptions) => Promise<BatchOperationResult>;
  options?: BatchOperationOptions;
}

export interface BatchSelectionState {
  selectedIds: string[];
  lastSelected?: string;
  selectionMode: 'single' | 'multiple';
}

export interface BatchProcessingState {
  isProcessing: boolean;
  progress?: number;
  currentOperation?: BatchOperationType;
  error?: string;
}
