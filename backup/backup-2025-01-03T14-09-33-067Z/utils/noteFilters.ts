import type { VoiceNote } from '@/types/voice';

interface FilterOptions {
  searchQuery?: string;
  type?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export function filterNotes(notes: VoiceNote[], options: FilterOptions): VoiceNote[] {
  const { searchQuery, type, dateRange, tags } = options;

  return notes.filter(note => {
    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const contentMatch = note.content.toLowerCase().includes(searchLower);
      const authorMatch = note.author?.toLowerCase().includes(searchLower);
      const typeMatch = note.type?.toLowerCase().includes(searchLower);
      const tagsMatch = note.tags?.some(tag => 
        tag.toLowerCase().includes(searchLower)
      );

      if (!(contentMatch || authorMatch || typeMatch || tagsMatch)) {
        return false;
      }
    }

    // Type filter
    if (type && note.type !== type) {
      return false;
    }

    // Date range filter
    if (dateRange) {
      const noteDate = new Date(note.createdAt);
      if (noteDate < dateRange.start || noteDate > dateRange.end) {
        return false;
      }
    }

    // Tags filter
    if (tags?.length) {
      const noteTags = note.tags || [];
      if (!tags.every(tag => noteTags.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

export function sortNotes(
  notes: VoiceNote[],
  field: keyof VoiceNote = 'createdAt',
  direction: 'asc' | 'desc' = 'desc'
): VoiceNote[] {
  return [...notes].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    return 0;
  });
}

export function groupNotesByDate(notes: VoiceNote[]): Record<string, VoiceNote[]> {
  const groups: Record<string, VoiceNote[]> = {};

  notes.forEach(note => {
    const date = new Date(note.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(note);
  });

  return groups;
}

export function groupNotesByType(notes: VoiceNote[]): Record<string, VoiceNote[]> {
  const groups: Record<string, VoiceNote[]> = {};

  notes.forEach(note => {
    const type = note.type || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(note);
  });

  return groups;
}
