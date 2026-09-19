export interface KanaChar {
  char: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  row: string;
  example: string;
  meaning: string;
  strokeCount?: number;
}

export const HIRAGANA_DATA: KanaChar[] = [
  // Vowels (A-row)
  { char: 'あ', romaji: 'a', type: 'hiragana', row: 'a', example: 'あめ (ame)', meaning: 'Hujan / Permen', strokeCount: 3 },
  { char: 'い', romaji: 'i', type: 'hiragana', row: 'a', example: 'いぬ (inu)', meaning: 'Anjing', strokeCount: 2 },
  { char: 'う', romaji: 'u', type: 'hiragana', row: 'a', example: 'うみ (umi)', meaning: 'Laut', strokeCount: 2 },
  { char: 'え', romaji: 'e', type: 'hiragana', row: 'a', example: 'えき (eki)', meaning: 'Stasiun', strokeCount: 2 },
  { char: 'お', romaji: 'o', type: 'hiragana', row: 'a', example: 'おちゃ (ocha)', meaning: 'Teh hijau', strokeCount: 3 },

  // Ka-row
  { char: 'か', romaji: 'ka', type: 'hiragana', row: 'ka', example: 'かさ (kasa)', meaning: 'Payung', strokeCount: 3 },
  { char: 'き', romaji: 'ki', type: 'hiragana', row: 'ka', example: 'き (ki)', meaning: 'Pohon', strokeCount: 4 },
  { char: 'く', romaji: 'ku', type: 'hiragana', row: 'ka', example: 'くるま (kuruma)', meaning: 'Mobil', strokeCount: 1 },
  { char: 'け', romaji: 'ke', type: 'hiragana', row: 'ka', example: 'けむし (kemushi)', meaning: 'Ulat bulu', strokeCount: 3 },
  { char: 'こ', romaji: 'ko', type: 'hiragana', row: 'ka', example: 'こども (kodomo)', meaning: 'Anak-anak', strokeCount: 2 },

  // Sa-row
  { char: 'さ', romaji: 'sa', type: 'hiragana', row: 'sa', example: 'さくら (sakura)', meaning: 'Bunga Sakura', strokeCount: 3 },
  { char: 'し', romaji: 'shi', type: 'hiragana', row: 'sa', example: 'しま (shima)', meaning: 'Pulau', strokeCount: 1 },
  { char: 'す', romaji: 'su', type: 'hiragana', row: 'sa', example: 'すし (sushi)', meaning: 'Sushi', strokeCount: 2 },
  { char: 'せ', romaji: 'se', type: 'hiragana', row: 'sa', example: 'せんせい (sensei)', meaning: 'Guru', strokeCount: 3 },
  { char: 'そ', romaji: 'so', type: 'hiragana', row: 'sa', example: 'そら (sora)', meaning: 'Langit', strokeCount: 1 },

  // Ta-row
  { char: 'た', romaji: 'ta', type: 'hiragana', row: 'ta', example: 'たまご (tamago)', meaning: 'Telur', strokeCount: 4 },
  { char: 'ち', romaji: 'chi', type: 'hiragana', row: 'ta', example: 'ちず (chizu)', meaning: 'Peta', strokeCount: 2 },
  { char: 'つ', romaji: 'tsu', type: 'hiragana', row: 'ta', example: 'つき (tsuki)', meaning: 'Bulan', strokeCount: 1 },
  { char: 'て', romaji: 'te', type: 'hiragana', row: 'ta', example: 'て (te)', meaning: 'Tangan', strokeCount: 1 },
  { char: 'と', romaji: 'to', type: 'hiragana', row: 'ta', example: 'ともだち (tomodachi)', meaning: 'Teman', strokeCount: 2 },

  // Na-row
  { char: 'な', romaji: 'na', type: 'hiragana', row: 'na', example: 'なつ (natsu)', meaning: 'Musim panas', strokeCount: 4 },
  { char: 'に', romaji: 'ni', type: 'hiragana', row: 'na', example: 'にほん (nihon)', meaning: 'Jepang', strokeCount: 3 },
  { char: 'ぬ', romaji: 'nu', type: 'hiragana', row: 'na', example: 'ぬいぐるみ (nuigurumi)', meaning: 'Boneka', strokeCount: 2 },
  { char: 'ね', romaji: 'ne', type: 'hiragana', row: 'na', example: 'ねこ (neko)', meaning: 'Kucing', strokeCount: 2 },
  { char: 'の', romaji: 'no', type: 'hiragana', row: 'na', example: 'のみもの (nomimono)', meaning: 'Minuman', strokeCount: 1 },

  // Ha-row
  { char: 'は', romaji: 'ha', type: 'hiragana', row: 'ha', example: 'はな (hana)', meaning: 'Bunga / Hidung', strokeCount: 3 },
  { char: 'ひ', romaji: 'hi', type: 'hiragana', row: 'ha', example: 'ひかり (hikari)', meaning: 'Cahaya', strokeCount: 1 },
  { char: 'ふ', romaji: 'fu', type: 'hiragana', row: 'ha', example: 'ふじさん (fujisan)', meaning: 'Gunung Fuji', strokeCount: 4 },
  { char: 'へ', romaji: 'he', type: 'hiragana', row: 'ha', example: 'へや (heya)', meaning: 'Kamar', strokeCount: 1 },
  { char: 'ほ', romaji: 'ho', type: 'hiragana', row: 'ha', example: 'ほし (hoshi)', meaning: 'Bintang', strokeCount: 4 },

  // Ma-row
  { char: 'ま', romaji: 'ma', type: 'hiragana', row: 'ma', example: 'まち (machi)', meaning: 'Kota', strokeCount: 3 },
  { char: 'み', romaji: 'mi', type: 'hiragana', row: 'ma', example: 'みず (mizu)', meaning: 'Air', strokeCount: 2 },
  { char: 'む', romaji: 'mu', type: 'hiragana', row: 'ma', example: 'むし (mushi)', meaning: 'Serangga', strokeCount: 3 },
  { char: 'め', romaji: 'me', type: 'hiragana', row: 'ma', example: 'め (me)', meaning: 'Mata', strokeCount: 2 },
  { char: 'も', romaji: 'mo', type: 'hiragana', row: 'ma', example: 'もり (mori)', meaning: 'Hutan', strokeCount: 3 },

  // Ya-row
  { char: 'や', romaji: 'ya', type: 'hiragana', row: 'ya', example: 'やま (yama)', meaning: 'Gunung', strokeCount: 3 },
  { char: 'ゆ', romaji: 'yu', type: 'hiragana', row: 'ya', example: 'ゆき (yuki)', meaning: 'Salju', strokeCount: 2 },
  { char: 'よ', romaji: 'yo', type: 'hiragana', row: 'ya', example: 'よる (yoru)', meaning: 'Malam', strokeCount: 2 },

  // Ra-row
  { char: 'ら', romaji: 'ra', type: 'hiragana', row: 'ra', example: 'らいおん (raion)', meaning: 'Singa', strokeCount: 2 },
  { char: 'り', romaji: 'ri', type: 'hiragana', row: 'ra', example: 'りんご (ringo)', meaning: 'Apel', strokeCount: 2 },
  { char: 'る', romaji: 'ru', type: 'hiragana', row: 'ra', example: 'るす (rusu)', meaning: 'Tidak di rumah', strokeCount: 1 },
  { char: 'れ', romaji: 're', type: 'hiragana', row: 'ra', example: 'れいぞうこ (reizouko)', meaning: 'Kulkas', strokeCount: 2 },
  { char: 'ろ', romaji: 'ro', type: 'hiragana', row: 'ra', example: 'ろうそく (rousoku)', meaning: 'Lilin', strokeCount: 1 },

  // Wa-row & N
  { char: 'わ', romaji: 'wa', type: 'hiragana', row: 'wa', example: 'わたし (watashi)', meaning: 'Saya', strokeCount: 2 },
  { char: 'を', romaji: 'wo', type: 'hiragana', row: 'wa', example: '〜を (partikel)', meaning: 'Objek kalimat', strokeCount: 3 },
  { char: 'ん', romaji: 'n', type: 'hiragana', row: 'wa', example: 'ほん (hon)', meaning: 'Buku', strokeCount: 1 },

  // Dakuon & Handakuon (Ga, Za, Da, Ba, Pa)
  { char: 'が', romaji: 'ga', type: 'hiragana', row: 'dakuon', example: 'がっこう (gakkou)', meaning: 'Sekolah', strokeCount: 5 },
  { char: 'ぎ', romaji: 'gi', type: 'hiragana', row: 'dakuon', example: 'ぎんこう (ginkou)', meaning: 'Bank', strokeCount: 6 },
  { char: 'ぐ', romaji: 'gu', type: 'hiragana', row: 'dakuon', example: 'ぐらい (gurai)', meaning: 'Kira-kira', strokeCount: 3 },
  { char: 'げ', romaji: 'ge', type: 'hiragana', row: 'dakuon', example: 'げんき (genki)', meaning: 'Sehat', strokeCount: 5 },
  { char: 'ご', romaji: 'go', type: 'hiragana', row: 'dakuon', example: 'ごはん (gohan)', meaning: 'Nasi / Makanan', strokeCount: 4 },

  { char: 'ざ', romaji: 'za', type: 'hiragana', row: 'dakuon', example: 'ざっし (zasshi)', meaning: 'Majalah', strokeCount: 5 },
  { char: 'じ', romaji: 'ji', type: 'hiragana', row: 'dakuon', example: 'じかん (jikan)', meaning: 'Waktu', strokeCount: 3 },
  { char: 'ず', romaji: 'zu', type: 'hiragana', row: 'dakuon', example: 'ずっと (zutto)', meaning: 'Selalu / Terus', strokeCount: 4 },
  { char: 'ぜ', romaji: 'ze', type: 'hiragana', row: 'dakuon', example: 'ぜんぶ (zenbu)', meaning: 'Semua', strokeCount: 5 },
  { char: 'ぞ', romaji: 'zo', type: 'hiragana', row: 'dakuon', example: 'ぞう (zou)', meaning: 'Gajah', strokeCount: 3 },

  { char: 'だ', romaji: 'da', type: 'hiragana', row: 'dakuon', example: 'だいがく (daigaku)', meaning: 'Universitas', strokeCount: 6 },
  { char: 'ぢ', romaji: 'ji', type: 'hiragana', row: 'dakuon', example: 'はなぢ (hanaji)', meaning: 'Mimisan', strokeCount: 4 },
  { char: 'づ', romaji: 'zu', type: 'hiragana', row: 'dakuon', example: 'つづく (tsuzuku)', meaning: 'Berlanjut', strokeCount: 3 },
  { char: 'で', romaji: 'de', type: 'hiragana', row: 'dakuon', example: 'でんしゃ (densha)', meaning: 'Kereta api', strokeCount: 3 },
  { char: 'ど', romaji: 'do', type: 'hiragana', row: 'dakuon', example: 'ドア (doa)', meaning: 'Pintu', strokeCount: 4 },

  { char: 'ば', romaji: 'ba', type: 'hiragana', row: 'dakuon', example: 'ばしょ (basho)', meaning: 'Tempat', strokeCount: 5 },
  { char: 'び', romaji: 'bi', type: 'hiragana', row: 'dakuon', example: 'びょういん (byouin)', meaning: 'Rumah sakit', strokeCount: 3 },
  { char: 'ぶ', romaji: 'bu', type: 'hiragana', row: 'dakuon', example: 'ぶん (bun)', meaning: 'Kalimat', strokeCount: 6 },
  { char: 'べ', romaji: 'be', type: 'hiragana', row: 'dakuon', example: 'べんきょう (benkyou)', meaning: 'Belajar', strokeCount: 3 },
  { char: 'ぼ', romaji: 'bo', type: 'hiragana', row: 'dakuon', example: 'ぼうし (boushi)', meaning: 'Topi', strokeCount: 6 },

  { char: 'ぱ', romaji: 'pa', type: 'hiragana', row: 'dakuon', example: 'ぱん (pan)', meaning: 'Roti', strokeCount: 4 },
  { char: 'ぴ', romaji: 'pi', type: 'hiragana', row: 'dakuon', example: 'ぴかぴか (pikapika)', meaning: 'Berkilau', strokeCount: 2 },
  { char: 'ぷ', romaji: 'pu', type: 'hiragana', row: 'dakuon', example: 'ぷりん (purin)', meaning: 'Puding', strokeCount: 5 },
  { char: 'ぺ', romaji: 'pe', type: 'hiragana', row: 'dakuon', example: 'ぺん (pen)', meaning: 'Pena', strokeCount: 2 },
  { char: 'ぽ', romaji: 'po', type: 'hiragana', row: 'dakuon', example: 'ぽすと (posuto)', meaning: 'Kotak pos', strokeCount: 5 },
];

export const KATAKANA_DATA: KanaChar[] = [
  // Vowels (A-row)
  { char: 'ア', romaji: 'a', type: 'katakana', row: 'a', example: 'アイス (aisu)', meaning: 'Es krim', strokeCount: 2 },
  { char: 'イ', romaji: 'i', type: 'katakana', row: 'a', example: 'インド (indo)', meaning: 'India', strokeCount: 2 },
  { char: 'ウ', romaji: 'u', type: 'katakana', row: 'a', example: 'ウェブ (webu)', meaning: 'Web', strokeCount: 3 },
  { char: 'エ', romaji: 'e', type: 'katakana', row: 'a', example: 'エアコン (eakon)', meaning: 'AC / Air conditioner', strokeCount: 3 },
  { char: 'オ', romaji: 'o', type: 'katakana', row: 'a', example: 'オレンジ (orenji)', meaning: 'Jeruk / Oranye', strokeCount: 3 },

  // Ka-row
  { char: 'カ', romaji: 'ka', type: 'katakana', row: 'ka', example: 'カメラ (kamera)', meaning: 'Kamera', strokeCount: 2 },
  { char: 'キ', romaji: 'ki', type: 'katakana', row: 'ka', example: 'キー (kii)', meaning: 'Kunci', strokeCount: 3 },
  { char: 'ク', romaji: 'ku', type: 'katakana', row: 'ka', example: 'クラス (kurasu)', meaning: 'Kelas', strokeCount: 2 },
  { char: 'ケ', romaji: 'ke', type: 'katakana', row: 'ka', example: 'ケーキ (keeki)', meaning: 'Kue', strokeCount: 3 },
  { char: 'コ', romaji: 'ko', type: 'katakana', row: 'ka', example: 'コーヒー (koohii)', meaning: 'Kopi', strokeCount: 2 },

  // Sa-row
  { char: 'サ', romaji: 'sa', type: 'katakana', row: 'sa', example: 'サラダ (sarada)', meaning: 'Salad', strokeCount: 3 },
  { char: 'シ', romaji: 'shi', type: 'katakana', row: 'sa', example: 'シャツ (shatsu)', meaning: 'Kemeja', strokeCount: 3 },
  { char: 'ス', romaji: 'su', type: 'katakana', row: 'sa', example: 'スポーツ (supootsu)', meaning: 'Olahraga', strokeCount: 2 },
  { char: 'セ', romaji: 'se', type: 'katakana', row: 'sa', example: 'セーター (seetaa)', meaning: 'Sweter', strokeCount: 2 },
  { char: 'ソ', romaji: 'so', type: 'katakana', row: 'sa', example: 'ソファ (sofa)', meaning: 'Sofa', strokeCount: 2 },

  // Ta-row
  { char: 'タ', romaji: 'ta', type: 'katakana', row: 'ta', example: 'タクシー (takushii)', meaning: 'Taksi', strokeCount: 3 },
  { char: 'チ', romaji: 'chi', type: 'katakana', row: 'ta', example: 'チーズ (chiizu)', meaning: 'Keju', strokeCount: 3 },
  { char: 'ツ', romaji: 'tsu', type: 'katakana', row: 'ta', example: 'ツアー (tsuaa)', meaning: 'Tur', strokeCount: 3 },
  { char: 'テ', romaji: 'te', type: 'katakana', row: 'ta', example: 'テレビ (terebi)', meaning: 'Televisi', strokeCount: 3 },
  { char: 'ト', romaji: 'to', type: 'katakana', row: 'ta', example: 'トマト (tomato)', meaning: 'Tomat', strokeCount: 2 },

  // Na-row
  { char: 'ナ', romaji: 'na', type: 'katakana', row: 'na', example: 'ナイフ (naifu)', meaning: 'Pisau', strokeCount: 2 },
  { char: 'ニ', romaji: 'ni', type: 'katakana', row: 'na', example: 'ニュース (nyuusu)', meaning: 'Berita', strokeCount: 2 },
  { char: 'ヌ', romaji: 'nu', type: 'katakana', row: 'na', example: 'ヌードル (nuudoru)', meaning: 'Mie', strokeCount: 2 },
  { char: 'ネ', romaji: 'ne', type: 'katakana', row: 'na', example: 'ネクタイ (nekutai)', meaning: 'Dasi', strokeCount: 4 },
  { char: 'ノ', romaji: 'no', type: 'katakana', row: 'na', example: 'ノート (nooto)', meaning: 'Buku catatan', strokeCount: 1 },

  // Ha-row
  { char: 'ハ', romaji: 'ha', type: 'katakana', row: 'ha', example: 'ハンバーガー (hanbaagaa)', meaning: 'Hamburger', strokeCount: 2 },
  { char: 'ヒ', romaji: 'hi', type: 'katakana', row: 'ha', example: 'ヒーター (hiitaa)', meaning: 'Pemanas', strokeCount: 2 },
  { char: 'フ', romaji: 'fu', type: 'katakana', row: 'ha', example: 'フォーク (fooku)', meaning: 'Garpu', strokeCount: 1 },
  { char: 'ヘ', romaji: 'he', type: 'katakana', row: 'ha', example: 'ヘルメット (herumetto)', meaning: 'Helm', strokeCount: 1 },
  { char: 'ホ', romaji: 'ho', type: 'katakana', row: 'ha', example: 'ホテル (hoteru)', meaning: 'Hotel', strokeCount: 4 },

  // Ma-row
  { char: 'マ', romaji: 'ma', type: 'katakana', row: 'ma', example: 'マスク (masuku)', meaning: 'Masker', strokeCount: 2 },
  { char: 'ミ', romaji: 'mi', type: 'katakana', row: 'ma', example: 'ミルク (miruku)', meaning: 'Susu', strokeCount: 3 },
  { char: 'ム', romaji: 'mu', type: 'katakana', row: 'ma', example: 'ムービー (muubii)', meaning: 'Film', strokeCount: 2 },
  { char: 'メ', romaji: 'me', type: 'katakana', row: 'ma', example: 'メール (meeru)', meaning: 'Email', strokeCount: 2 },
  { char: 'モ', romaji: 'mo', type: 'katakana', row: 'ma', example: 'モニター (monitaa)', meaning: 'Layar monitor', strokeCount: 3 },

  // Ya-row
  { char: 'ヤ', romaji: 'ya', type: 'katakana', row: 'ya', example: 'ヤシ (yashi)', meaning: 'Kelapa', strokeCount: 2 },
  { char: 'ユ', romaji: 'yu', type: 'katakana', row: 'ya', example: 'ユーザー (yuuzaa)', meaning: 'Pengguna', strokeCount: 2 },
  { char: 'ヨ', romaji: 'yo', type: 'katakana', row: 'ya', example: 'ヨーグルト (yooguruto)', meaning: 'Yogurt', strokeCount: 3 },

  // Ra-row
  { char: 'ラ', romaji: 'ra', type: 'katakana', row: 'ra', example: 'ラジオ (rajio)', meaning: 'Radio', strokeCount: 2 },
  { char: 'リ', romaji: 'ri', type: 'katakana', row: 'ra', example: 'リモコン (rimokon)', meaning: 'Remote control', strokeCount: 2 },
  { char: 'ル', romaji: 'ru', type: 'katakana', row: 'ra', example: 'ルール (ruuru)', meaning: 'Aturan', strokeCount: 2 },
  { char: 'レ', romaji: 're', type: 'katakana', row: 'ra', example: 'レストラン (resutoran)', meaning: 'Restoran', strokeCount: 1 },
  { char: 'ロ', romaji: 'ro', type: 'katakana', row: 'ra', example: 'ロボット (robotto)', meaning: 'Robot', strokeCount: 3 },

  // Wa-row & N
  { char: 'ワ', romaji: 'wa', type: 'katakana', row: 'wa', example: 'ワイン (wain)', meaning: 'Anggur / Wine', strokeCount: 2 },
  { char: 'ヲ', romaji: 'wo', type: 'katakana', row: 'wa', example: 'ヲ (partikel)', meaning: 'Penanda objek', strokeCount: 3 },
  { char: 'ン', romaji: 'n', type: 'katakana', row: 'wa', example: 'パン (pan)', meaning: 'Roti', strokeCount: 2 },

  // Dakuon & Handakuon
  { char: 'ガ', romaji: 'ga', type: 'katakana', row: 'dakuon', example: 'ガラス (garasu)', meaning: 'Kaca', strokeCount: 4 },
  { char: 'ギ', romaji: 'gi', type: 'katakana', row: 'dakuon', example: 'ギター (gitaa)', meaning: 'Gitar', strokeCount: 5 },
  { char: 'グ', romaji: 'gu', type: 'katakana', row: 'dakuon', example: 'グループ (guruupu)', meaning: 'Grup', strokeCount: 4 },
  { char: 'ゲ', romaji: 'ge', type: 'katakana', row: 'dakuon', example: 'ゲーム (geemu)', meaning: 'Game', strokeCount: 5 },
  { char: 'ゴ', romaji: 'go', type: 'katakana', row: 'dakuon', example: 'ゴルフ (gorufu)', meaning: 'Golf', strokeCount: 4 },

  { char: 'ザ', romaji: 'za', type: 'katakana', row: 'dakuon', example: 'デザート (dezaato)', meaning: 'Pencuci mulut', strokeCount: 5 },
  { char: 'ジ', romaji: 'ji', type: 'katakana', row: 'dakuon', example: 'ジュース (juusu)', meaning: 'Jus', strokeCount: 5 },
  { char: 'ズ', romaji: 'zu', type: 'katakana', row: 'dakuon', example: 'ズボン (zubon)', meaning: 'Celana', strokeCount: 4 },
  { char: 'ゼ', romaji: 'ze', type: 'katakana', row: 'dakuon', example: 'ゼロ (zero)', meaning: 'Nol', strokeCount: 4 },
  { char: 'ゾ', romaji: 'zo', type: 'katakana', row: 'dakuon', example: 'ゾーン (zoon)', meaning: 'Zona', strokeCount: 4 },

  { char: 'ダ', romaji: 'da', type: 'katakana', row: 'dakuon', example: 'ダンス (dansu)', meaning: 'Tari', strokeCount: 5 },
  { char: 'デ', romaji: 'de', type: 'katakana', row: 'dakuon', example: 'デザイナ (dezainaa)', meaning: 'Desainer', strokeCount: 5 },
  { char: 'ド', romaji: 'do', type: 'katakana', row: 'dakuon', example: 'ドア (doa)', meaning: 'Pintu', strokeCount: 4 },

  { char: 'バ', romaji: 'ba', type: 'katakana', row: 'dakuon', example: 'バス (basu)', meaning: 'Bus', strokeCount: 4 },
  { char: 'ビ', romaji: 'bi', type: 'katakana', row: 'dakuon', example: 'ビール (biiru)', meaning: 'Bir', strokeCount: 4 },
  { char: 'ブ', romaji: 'bu', type: 'katakana', row: 'dakuon', example: 'ブラウス (burausu)', meaning: 'Blus', strokeCount: 3 },
  { char: 'ベ', romaji: 'be', type: 'katakana', row: 'dakuon', example: 'ベッド (beddo)', meaning: 'Tempat tidur', strokeCount: 3 },
  { char: 'ボ', romaji: 'bo', type: 'katakana', row: 'dakuon', example: 'ボール (booru)', meaning: 'Bola', strokeCount: 6 },

  { char: 'パ', romaji: 'pa', type: 'katakana', row: 'dakuon', example: 'パン (pan)', meaning: 'Roti', strokeCount: 3 },
  { char: 'ピ', romaji: 'pi', type: 'katakana', row: 'dakuon', example: 'ピアノ (piano)', meaning: 'Piano', strokeCount: 3 },
  { char: 'プ', romaji: 'pu', type: 'katakana', row: 'dakuon', example: 'プール (puuru)', meaning: 'Kolam renang', strokeCount: 2 },
  { char: 'ペ', romaji: 'pe', type: 'katakana', row: 'dakuon', example: 'ペン (pen)', meaning: 'Pena', strokeCount: 2 },
  { char: 'ポ', romaji: 'po', type: 'katakana', row: 'dakuon', example: 'ポスト (posuto)', meaning: 'Kotak pos', strokeCount: 5 },
];
