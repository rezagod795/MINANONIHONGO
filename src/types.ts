export interface VocabItem {
  jpn: string;
  ind: string;
  kanji?: string;
  reading?: string;
  meaning?: string;
  tier?: 'nyuumon' | 'shokyuu1' | 'shokyuu2' | string;
  lesson?: number;
  id?: number;
}

export interface LevelData {
  name: string;
  vocab: VocabItem[];
  icon: string;
}

export interface LevelsMap {
  [key: number]: LevelData;
}
