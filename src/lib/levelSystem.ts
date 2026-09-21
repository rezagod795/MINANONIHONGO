export interface ProfileLevelInfo {
  level: number;
  title: string;
  kanjiTitle: string;
  totalXp: number;
  currentLevelXp: number;
  requiredXpForNext: number;
  progressPercent: number;
  totalXpForNextLevel: number;
}

export const LEVEL_TIERS: { level: number; title: string; kanji: string; req: number }[] = [
  { level: 1, title: 'Pemula', kanji: '初心者', req: 100 },
  { level: 2, title: 'Pelajar Giat', kanji: '見習い', req: 150 },
  { level: 3, title: 'Petualang Bahasa', kanji: '冒険者', req: 200 },
  { level: 4, title: 'Prajurit Kata', kanji: '武士', req: 250 },
  { level: 5, title: 'Cendekiawan', kanji: '学者', req: 300 },
  { level: 6, title: 'Pendekar Kanji', kanji: '達人', req: 400 },
  { level: 7, title: 'Sensei', kanji: '先生', req: 500 },
  { level: 8, title: 'Master Nihongo', kanji: '名人', req: 600 },
  { level: 9, title: 'Legenda Tokyo', kanji: '伝説', req: 700 },
  { level: 10, title: 'Shogun Bahasa', kanji: '将軍', req: 800 },
];

export function calculateProfileLevel(totalXp: number): ProfileLevelInfo {
  const xp = Math.max(0, Math.floor(totalXp || 0));
  let accumulatedXp = 0;

  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    const tier = LEVEL_TIERS[i];
    if (xp < accumulatedXp + tier.req) {
      const currentLevelXp = xp - accumulatedXp;
      const requiredXpForNext = tier.req;
      const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / requiredXpForNext) * 100)));
      return {
        level: tier.level,
        title: tier.title,
        kanjiTitle: tier.kanji,
        totalXp: xp,
        currentLevelXp,
        requiredXpForNext,
        progressPercent,
        totalXpForNextLevel: accumulatedXp + tier.req,
      };
    }
    accumulatedXp += tier.req;
  }

  // Beyond Level 10 (High Master Levels)
  const excessXp = xp - accumulatedXp;
  const reqPerHigherLevel = 1000;
  const additionalLevels = Math.floor(excessXp / reqPerHigherLevel);
  const finalLevel = 10 + additionalLevels;
  const currentLevelXp = excessXp % reqPerHigherLevel;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / reqPerHigherLevel) * 100)));

  return {
    level: finalLevel,
    title: finalLevel >= 20 ? 'Kaisar Bahasa' : 'Shogun Senior',
    kanjiTitle: finalLevel >= 20 ? '大君' : '大将軍',
    totalXp: xp,
    currentLevelXp,
    requiredXpForNext: reqPerHigherLevel,
    progressPercent,
    totalXpForNextLevel: accumulatedXp + (additionalLevels + 1) * reqPerHigherLevel,
  };
}
