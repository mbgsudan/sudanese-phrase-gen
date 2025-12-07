export enum Category {
  DAILY = 'DAILY',
  SALES = 'SALES',
  CONVERSATION = 'CONVERSATION'
}

export interface PhraseData {
  arabicText: string;
  phonetic: string;
  englishTranslation: string;
  usageContext: string;
}

export interface SavedPhrase extends PhraseData {
  id: string;
  timestamp: number;
  source: 'generated' | 'manual';
  category: Category;
}

export interface GeneratedAudio {
  audioData: string; // Base64 string
}