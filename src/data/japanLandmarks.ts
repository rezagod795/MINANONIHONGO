export interface JapanLandmark {
  level: number | 'favorit';
  name: string;
  japaneseName: string;
  city: string;
  prefecture: string;
  category: 'Kota' | 'Bangunan Bersejarah' | 'Tempat Wisata Alam';
  imageUrl: string;
  themePill: string;
  funFact: string;
}

export const JAPAN_LANDMARKS: Record<number | string, JapanLandmark> = {
  1: {
    level: 1,
    name: 'Tokyo Tower & Sakura',
    japaneseName: '東京タワーと桜',
    city: 'Minato, Tokyo',
    prefecture: 'Tokyo',
    category: 'Bangunan Bersejarah',
    imageUrl: '/tokyo_tower_clear.jpg',
    themePill: 'Cerah ☀️',
    funFact: 'Menara Tokyo setinggi 332,9 meter terinspirasi oleh Menara Eiffel Paris dan dicat putih-oranye cerah untuk standar penerbangan internasional.'
  },
  2: {
    level: 2,
    name: 'Fushimi Inari Taisha',
    japaneseName: '伏見稲荷大社',
    city: 'Fushimi, Kyoto',
    prefecture: 'Kyoto',
    category: 'Tempat Wisata Alam',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Senja ⛩️',
    funFact: 'Memiliki lebih dari 10.000 gerbang torii merah bata yang didonasikan oleh berbagai pengusaha di Jepang sebagai wujud syukur kemakmuran.'
  },
  3: {
    level: 3,
    name: 'Gunung Fuji & Pagoda Chureito',
    japaneseName: '富士山と忠霊塔',
    city: 'Fujiyoshida',
    prefecture: 'Yamanashi',
    category: 'Tempat Wisata Alam',
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Pagi 🗻',
    funFact: 'Spot paling terkenal di dunia untuk memotret keindahan Gunung Fuji bersalju bersama pagoda bertingkat lima dan bunga sakura mekar.'
  },
  4: {
    level: 4,
    name: 'Dotonbori & Kanal Namba',
    japaneseName: '道頓堀・難波',
    city: 'Osaka',
    prefecture: 'Osaka',
    category: 'Kota',
    imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Malam 🌃',
    funFact: 'Pusat kuliner takoyaki & okonomiyaki paling ramai di Osaka, terkenal dengan papan reklame neon atlet Glico Man raksasa yang legendaris.'
  },
  5: {
    level: 5,
    name: 'Kuil Emas Kinkaku-ji',
    japaneseName: '金閣寺（鹿苑寺）',
    city: 'Kita-ku, Kyoto',
    prefecture: 'Kyoto',
    category: 'Bangunan Bersejarah',
    imageUrl: 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Siang ☀️',
    funFact: 'Dua lantai teratas kuil Buddha Zen ini seluruhnya dilapisi daun emas murni yang memantulkan kilau memukau di atas danau cermin Kyoko-chi.'
  },
  6: {
    level: 6,
    name: 'Shibuya Crossing & Tokyo Neon',
    japaneseName: '渋谷スクランブル交差点',
    city: 'Shibuya, Tokyo',
    prefecture: 'Tokyo',
    category: 'Kota',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Malam ⚡',
    funFact: 'Persimpangan penyeberangan jalan paling padat di planet bumi, dapat dilewati hingga 3.000 orang sekaligus setiap satu kali lampu hijau pejalan kaki.'
  },
  7: {
    level: 7,
    name: 'Kuil Itsukushima & Torii Apung',
    japaneseName: '厳島神社・大鳥居',
    city: 'Miyajima, Hatsukaichi',
    prefecture: 'Hiroshima',
    category: 'Tempat Wisata Alam',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Senja 🌊',
    funFact: 'Gerbang Torii kayu kamper setinggi 16 meter yang dibangun tepat di atas laut, tampak melayang megah di atas gelombang air saat pasang.'
  },
  8: {
    level: 8,
    name: 'Kastil Himeji (Bangau Putih)',
    japaneseName: '姫路城（白鷺城）',
    city: 'Himeji',
    prefecture: 'Hyogo',
    category: 'Bangunan Bersejarah',
    imageUrl: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Sore 🏯',
    funFact: 'Kastil warisan UNESCO tak ternilai yang berhasil selamat dari berbagai peperangan dan gempa bumi selama lebih dari 400 tahun tanpa pernah runtuh.'
  },
  9: {
    level: 9,
    name: 'Kuil Senso-ji & Kaminarimon',
    japaneseName: '浅草寺・雷門',
    city: 'Asakusa, Tokyo',
    prefecture: 'Tokyo',
    category: 'Bangunan Bersejarah',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Sore 🏮',
    funFact: 'Kuil tertua di ibu kota Tokyo yang didirikan pada tahun 628 Masehi, ikonik dengan lentera merah raksasa bertuliskan Kaminarimon (Gerbang Halilintar).'
  },
  10: {
    level: 10,
    name: 'Desa Salju Shirakawa-go',
    japaneseName: '白川郷 合掌造り',
    city: 'Shirakawa, Ono',
    prefecture: 'Gifu',
    category: 'Tempat Wisata Alam',
    imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Musim Salju ❄️',
    funFact: 'Rumah-rumah tradisional Gassho-zukuri dengan atap jerami curam bersudut 60 derajat yang sengaja dirancang menahan tumpukan salju tebal pegunungan.'
  },
  11: {
    level: 11,
    name: 'Hutan Bambu Arashiyama',
    japaneseName: '嵐山 竹林の小径',
    city: 'Ukyo-ku, Kyoto',
    prefecture: 'Kyoto',
    category: 'Tempat Wisata Alam',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Pagi 🎋',
    funFact: 'Suara gemersik batang bambu tertiup angin di lorong ini terdaftar secara resmi oleh Kementerian Lingkungan Hidup Jepang sebagai 100 Suara Terbaik Jepang.'
  },
  12: {
    level: 12,
    name: 'Akihabara Electric Town',
    japaneseName: '秋葉原 電気街',
    city: 'Chiyoda, Tokyo',
    prefecture: 'Tokyo',
    category: 'Kota',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Malam 🎮',
    funFact: 'Ibu kota budaya Otaku dan gaming dunia dengan ratusan toko komponen elektronik langka, maid cafe, game center bertingkat, dan figur anime.'
  },
  13: {
    level: 13,
    name: 'Taman Rusa Nara & Todai-ji',
    japaneseName: '奈良公園と東大寺',
    city: 'Nara',
    prefecture: 'Nara',
    category: 'Tempat Wisata Alam',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Sore 🦌',
    funFact: 'Dihuni lebih dari 1.000 rusa liar jinak yang dianggap sebagai utusan dewa suci Shinto dan telah belajar membungkuk (ojigi) saat meminta biskuit rusa shika-senbei.'
  },
  14: {
    level: 14,
    name: 'Yokohama Minato Mirai 21',
    japaneseName: '横浜みなとみらい21',
    city: 'Yokohama',
    prefecture: 'Kanagawa',
    category: 'Kota',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Malam 🎡',
    funFact: 'Kawasan pelabuhan masa depan dengan jam bianglala raksasa Cosmo Clock 21 yang memancarkan pertunjukan cahaya spektakuler di atas Teluk Tokyo.'
  },
  15: {
    level: 15,
    name: 'Kastil Gagak Hitam Matsumoto',
    japaneseName: '松本城（烏城）',
    city: 'Matsumoto',
    prefecture: 'Nagano',
    category: 'Bangunan Bersejarah',
    imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Sore 🏯',
    funFact: 'Salah satu dari 5 kastil yang berstatus Harta Karun Nasional Jepang, memiliki dinding kayu hitam arang elegan dengan latar belakang puncak Alpen Jepang bersalju.'
  },
  16: {
    level: 16,
    name: 'Kanal Bersejarah Otaru',
    japaneseName: '小樽運河',
    city: 'Otaru',
    prefecture: 'Hokkaido',
    category: 'Kota',
    imageUrl: 'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Musim Dingin 🕯️',
    funFact: 'Kanal bersejarah di utara Jepang yang diapit gudang batu bata merah tua zaman Meiji dan 63 lampu gas minyak antik yang menyala hangat di tengah salju dingin.'
  },
  17: {
    level: 17,
    name: 'Kuil Nikko Toshogu & Jembatan Shinkyo',
    japaneseName: '日光東照宮・神橋',
    city: 'Nikko',
    prefecture: 'Tochigi',
    category: 'Bangunan Bersejarah',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Musim Gugur 🍁',
    funFact: 'Kuil pemakaman agung Shogun Tokugawa Ieyasu dengan ukiran kayu terindah di dunia, termasuk ukiran legendaris Tiga Monyet Bijak (Mizaru, Kikazaru, Iwazaru).'
  },
  favorit: {
    level: 'favorit',
    name: 'Fajar Emas Gunung Fuji & Danau Kawaguchi',
    japaneseName: '富士山と河口湖（朝焼け）',
    city: 'Fujikawaguchiko',
    prefecture: 'Yamanashi',
    category: 'Tempat Wisata Alam',
    imageUrl: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=1200&q=80',
    themePill: 'Fajar Emas 🌅',
    funFact: 'Koleksi kosakata emas pilihan Anda berlatar danau Kawaguchi saat sinar matahari pertama memeluk puncak suci Gunung Fuji.'
  }
};

export const getLandmarkForLevel = (level: number, isFavorites: boolean): JapanLandmark => {
  if (isFavorites) {
    return JAPAN_LANDMARKS['favorit'];
  }
  return JAPAN_LANDMARKS[level] || JAPAN_LANDMARKS[1];
};
