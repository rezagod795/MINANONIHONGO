import { LevelsMap } from "./types";
import { levels1_5 } from "./data/levels1_5";
import { levels6_11 } from "./data/levels6_11";
import { levels12_17 } from "./data/levels12_17";

export const levelsData: LevelsMap = {
  1: { name: "Lv.1 (Dasar)", vocab: levels1_5[1], icon: "📘" },
  2: { name: "Lv.2 (Percakapan)", vocab: levels1_5[2], icon: "📗" },
  3: { name: "Lv.3 (Aktivitas)", vocab: levels1_5[3], icon: "📙" },
  4: { name: "Lv.4 (Makan)", vocab: levels1_5[4], icon: "🍎" },
  5: { name: "Lv.5 (Keluarga)", vocab: levels1_5[5], icon: "👨‍👩‍👧‍👦" },
  6: { name: "Lv.6 (Uang/Tempat)", vocab: levels6_11[6], icon: "💰" },
  7: { name: "Lv.7 (Musim/Waktu)", vocab: levels6_11[7], icon: "🍂" },
  8: { name: "Lv.8 (Pekerjaan)", vocab: levels6_11[8], icon: "💼" },
  9: { name: "Lv.9 (Jalan-jalan)", vocab: levels6_11[9], icon: "🚶" },
  10: { name: "Lv.10 (Sakit/Kondisi)", vocab: levels6_11[10], icon: "🏥" },
  11: { name: "Lv.11 (Peraturan)", vocab: levels6_11[11], icon: "📋" },
  12: { name: "Lv.12 (Masa Depan)", vocab: levels12_17[12], icon: "🚀" },
  13: { name: "Lv.13 (Kebiasaan)", vocab: levels12_17[13], icon: "☕" },
  14: { name: "Lv.14 (Rencana)", vocab: levels12_17[14], icon: "📅" },
  15: { name: "Lv.15 (Upacara)", vocab: levels12_17[15], icon: "🎎" },
  16: { name: "Lv.16 (Larangan)", vocab: levels12_17[16], icon: "🚫" },
  17: { name: "Lv.17 (Bahan Masakan)", vocab: levels12_17[17], icon: "🍳" },
};
