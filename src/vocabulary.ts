import { LevelsMap } from "./types";
import { levels1_5 } from "./data/levels1_5";
import { levels6_11 } from "./data/levels6_11";
import { levels12_17 } from "./data/levels12_17";
import { JAPAN_LANDMARKS } from "./data/japanLandmarks";

export const levelsData: LevelsMap = {
  1: { name: "Lv.1 (Dasar)", vocab: levels1_5[1], icon: "📘", imageUrl: JAPAN_LANDMARKS[1].imageUrl, landmark: JAPAN_LANDMARKS[1].name },
  2: { name: "Lv.2 (Percakapan)", vocab: levels1_5[2], icon: "📗", imageUrl: JAPAN_LANDMARKS[2].imageUrl, landmark: JAPAN_LANDMARKS[2].name },
  3: { name: "Lv.3 (Aktivitas)", vocab: levels1_5[3], icon: "📙", imageUrl: JAPAN_LANDMARKS[3].imageUrl, landmark: JAPAN_LANDMARKS[3].name },
  4: { name: "Lv.4 (Makan)", vocab: levels1_5[4], icon: "🍎", imageUrl: JAPAN_LANDMARKS[4].imageUrl, landmark: JAPAN_LANDMARKS[4].name },
  5: { name: "Lv.5 (Keluarga)", vocab: levels1_5[5], icon: "👨‍👩‍👧‍👦", imageUrl: JAPAN_LANDMARKS[5].imageUrl, landmark: JAPAN_LANDMARKS[5].name },
  6: { name: "Lv.6 (Uang/Tempat)", vocab: levels6_11[6], icon: "💰", imageUrl: JAPAN_LANDMARKS[6].imageUrl, landmark: JAPAN_LANDMARKS[6].name },
  7: { name: "Lv.7 (Musim/Waktu)", vocab: levels6_11[7], icon: "🍂", imageUrl: JAPAN_LANDMARKS[7].imageUrl, landmark: JAPAN_LANDMARKS[7].name },
  8: { name: "Lv.8 (Pekerjaan)", vocab: levels6_11[8], icon: "💼", imageUrl: JAPAN_LANDMARKS[8].imageUrl, landmark: JAPAN_LANDMARKS[8].name },
  9: { name: "Lv.9 (Jalan-jalan)", vocab: levels6_11[9], icon: "🚶", imageUrl: JAPAN_LANDMARKS[9].imageUrl, landmark: JAPAN_LANDMARKS[9].name },
  10: { name: "Lv.10 (Sakit/Kondisi)", vocab: levels6_11[10], icon: "🏥", imageUrl: JAPAN_LANDMARKS[10].imageUrl, landmark: JAPAN_LANDMARKS[10].name },
  11: { name: "Lv.11 (Peraturan)", vocab: levels6_11[11], icon: "📋", imageUrl: JAPAN_LANDMARKS[11].imageUrl, landmark: JAPAN_LANDMARKS[11].name },
  12: { name: "Lv.12 (Masa Depan)", vocab: levels12_17[12], icon: "🚀", imageUrl: JAPAN_LANDMARKS[12].imageUrl, landmark: JAPAN_LANDMARKS[12].name },
  13: { name: "Lv.13 (Kebiasaan)", vocab: levels12_17[13], icon: "☕", imageUrl: JAPAN_LANDMARKS[13].imageUrl, landmark: JAPAN_LANDMARKS[13].name },
  14: { name: "Lv.14 (Rencana)", vocab: levels12_17[14], icon: "📅", imageUrl: JAPAN_LANDMARKS[14].imageUrl, landmark: JAPAN_LANDMARKS[14].name },
  15: { name: "Lv.15 (Upacara)", vocab: levels12_17[15], icon: "🎎", imageUrl: JAPAN_LANDMARKS[15].imageUrl, landmark: JAPAN_LANDMARKS[15].name },
  16: { name: "Lv.16 (Larangan)", vocab: levels12_17[16], icon: "🚫", imageUrl: JAPAN_LANDMARKS[16].imageUrl, landmark: JAPAN_LANDMARKS[16].name },
  17: { name: "Lv.17 (Bahan Masakan)", vocab: levels12_17[17], icon: "🍳", imageUrl: JAPAN_LANDMARKS[17].imageUrl, landmark: JAPAN_LANDMARKS[17].name },
};
