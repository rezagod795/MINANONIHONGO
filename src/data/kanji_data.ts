import { VocabItem } from "../types";

export interface KanjiVocabItem extends VocabItem {
  id: number;
  kanji: string;
  reading: string;
  meaning: string;
  tier: 'nyuumon' | 'shokyuu1' | 'shokyuu2';
  lesson: number;
}

export const IRODORI_KANJI_LIST: KanjiVocabItem[] = [
  {
    "id": 1,
    "kanji": "名前",
    "reading": "なまえ",
    "meaning": "Nama",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "名前",
    "ind": "Nama"
  },
  {
    "id": 2,
    "kanji": "氏名",
    "reading": "しめい",
    "meaning": "Nama Lengkap",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "氏名",
    "ind": "Nama Lengkap"
  },
  {
    "id": 3,
    "kanji": "前",
    "reading": "まえ",
    "meaning": "Depan",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "前",
    "ind": "Depan"
  },
  {
    "id": 4,
    "kanji": "午前",
    "reading": "ごぜん",
    "meaning": "AM",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "午前",
    "ind": "AM"
  },
  {
    "id": 5,
    "kanji": "国",
    "reading": "くに",
    "meaning": "Negara",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "国",
    "ind": "Negara"
  },
  {
    "id": 6,
    "kanji": "国際交流",
    "reading": "こくさいこうりゅう",
    "meaning": "Pertukaran Lintas Budaya",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "国際交流",
    "ind": "Pertukaran Lintas Budaya"
  },
  {
    "id": 7,
    "kanji": "外国",
    "reading": "がいこく",
    "meaning": "Luar Negeri",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "外国",
    "ind": "Luar Negeri"
  },
  {
    "id": 8,
    "kanji": "私",
    "reading": "わたし",
    "meaning": "Saya",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "私",
    "ind": "Saya"
  },
  {
    "id": 9,
    "kanji": "父",
    "reading": "ちち",
    "meaning": "Ayah",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "父",
    "ind": "Ayah"
  },
  {
    "id": 10,
    "kanji": "お父さん",
    "reading": "おとうさん",
    "meaning": "Ayah",
    "tier": "nyuumon",
    "lesson": 3,
    "jpn": "お父さん",
    "ind": "Ayah"
  },
  {
    "id": 11,
    "kanji": "母",
    "reading": "はは",
    "meaning": "Ibu",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "母",
    "ind": "Ibu"
  },
  {
    "id": 12,
    "kanji": "お母さん",
    "reading": "おかあさん",
    "meaning": "Ibu",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "お母さん",
    "ind": "Ibu"
  },
  {
    "id": 13,
    "kanji": "子ども",
    "reading": "こども",
    "meaning": "Anak-anak",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "子ども",
    "ind": "Anak-anak"
  },
  {
    "id": 14,
    "kanji": "男の子",
    "reading": "おとこのこ",
    "meaning": "Laki-laki",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "男の子",
    "ind": "Laki-laki"
  },
  {
    "id": 15,
    "kanji": "女の子",
    "reading": "おんなのこ",
    "meaning": "Perempuan",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "女の子",
    "ind": "Perempuan"
  },
  {
    "id": 16,
    "kanji": "日本",
    "reading": "にほん",
    "meaning": "Jepang",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "日本",
    "ind": "Jepang"
  },
  {
    "id": 17,
    "kanji": "～曜日",
    "reading": "～ようび",
    "meaning": "Hari～",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "～曜日",
    "ind": "Hari～"
  },
  {
    "id": 18,
    "kanji": "～日",
    "reading": "～にち",
    "meaning": "Tanggal～",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "～日",
    "ind": "Tanggal～"
  },
  {
    "id": 19,
    "kanji": "今日",
    "reading": "きょう",
    "meaning": "Hari Ini",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "今日",
    "ind": "Hari Ini"
  },
  {
    "id": 20,
    "kanji": "日本語",
    "reading": "にほんご",
    "meaning": "Bahasa Jepang",
    "tier": "nyuumon",
    "lesson": 4,
    "jpn": "日本語",
    "ind": "Bahasa Jepang"
  },
  {
    "id": 21,
    "kanji": "昨日",
    "reading": "きのう",
    "meaning": "Kemarin",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "昨日",
    "ind": "Kemarin"
  },
  {
    "id": 22,
    "kanji": "明日",
    "reading": "あした",
    "meaning": "Besok",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "明日",
    "ind": "Besok"
  },
  {
    "id": 23,
    "kanji": "毎日",
    "reading": "まいにち",
    "meaning": "Setiap Hari",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "毎日",
    "ind": "Setiap Hari"
  },
  {
    "id": 24,
    "kanji": "誕生日",
    "reading": "たんじょうび",
    "meaning": "Ulang Tahun",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "誕生日",
    "ind": "Ulang Tahun"
  },
  {
    "id": 25,
    "kanji": "日本",
    "reading": "にほん",
    "meaning": "Jepang",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "日本",
    "ind": "Jepang"
  },
  {
    "id": 26,
    "kanji": "本",
    "reading": "ほん",
    "meaning": "Buku",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "本",
    "ind": "Buku"
  },
  {
    "id": 27,
    "kanji": "日本語",
    "reading": "にほんご",
    "meaning": "Bahasa Jepang",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "日本語",
    "ind": "Bahasa Jepang"
  },
  {
    "id": 28,
    "kanji": "水",
    "reading": "みず",
    "meaning": "Air",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "水",
    "ind": "Air"
  },
  {
    "id": 29,
    "kanji": "水道",
    "reading": "すいどう",
    "meaning": "Kran air",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "水道",
    "ind": "Kran air"
  },
  {
    "id": 30,
    "kanji": "食べます",
    "reading": "たべます",
    "meaning": "Makan",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "食べます",
    "ind": "Makan"
  },
  {
    "id": 31,
    "kanji": "食堂",
    "reading": "しょくどう",
    "meaning": "Kantin",
    "tier": "nyuumon",
    "lesson": 5,
    "jpn": "食堂",
    "ind": "Kantin"
  },
  {
    "id": 32,
    "kanji": "食事",
    "reading": "しょくじ",
    "meaning": "Makan",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "食事",
    "ind": "Makan"
  },
  {
    "id": 33,
    "kanji": "飲みます",
    "reading": "のみます",
    "meaning": "Minum",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "飲みます",
    "ind": "Minum"
  },
  {
    "id": 34,
    "kanji": "飲み物",
    "reading": "のみもの",
    "meaning": "Minuman",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "飲み物",
    "ind": "Minuman"
  },
  {
    "id": 35,
    "kanji": "魚",
    "reading": "さかな",
    "meaning": "Ikan",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "魚",
    "ind": "Ikan"
  },
  {
    "id": 36,
    "kanji": "肉",
    "reading": "にく",
    "meaning": "Daging",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "肉",
    "ind": "Daging"
  },
  {
    "id": 37,
    "kanji": "牛肉",
    "reading": "ぎゅうにく",
    "meaning": "Daging Sapi",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "牛肉",
    "ind": "Daging Sapi"
  },
  {
    "id": 38,
    "kanji": "豚肉",
    "reading": "ぶたにく",
    "meaning": "Daging Babi",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "豚肉",
    "ind": "Daging Babi"
  },
  {
    "id": 39,
    "kanji": "好き（な）",
    "reading": "すき（な）",
    "meaning": "Suka",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "好き（な）",
    "ind": "Suka"
  },
  {
    "id": 40,
    "kanji": "家",
    "reading": "いえ",
    "meaning": "Rumah",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "家",
    "ind": "Rumah"
  },
  {
    "id": 41,
    "kanji": "家族",
    "reading": "かぞく",
    "meaning": "Keluarga",
    "tier": "nyuumon",
    "lesson": 6,
    "jpn": "家族",
    "ind": "Keluarga"
  },
  {
    "id": 42,
    "kanji": "新しい",
    "reading": "あたらしい",
    "meaning": "Baru",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "新しい",
    "ind": "Baru"
  },
  {
    "id": 43,
    "kanji": "広い",
    "reading": "ひろい",
    "meaning": "Luas",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "広い",
    "ind": "Luas"
  },
  {
    "id": 44,
    "kanji": "広場",
    "reading": "ひろば",
    "meaning": "Lapangan",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "広場",
    "ind": "Lapangan"
  },
  {
    "id": 45,
    "kanji": "古い",
    "reading": "ふるい",
    "meaning": "Lama/Kuno/Antik",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "古い",
    "ind": "Lama/Kuno/Antik"
  },
  {
    "id": 46,
    "kanji": "上",
    "reading": "うえ",
    "meaning": "Atas",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "上",
    "ind": "Atas"
  },
  {
    "id": 47,
    "kanji": "上手（な）",
    "reading": "じょうず（な）",
    "meaning": "Pandai/Mahir",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "上手（な）",
    "ind": "Pandai/Mahir"
  },
  {
    "id": 48,
    "kanji": "以上",
    "reading": "いじょう",
    "meaning": "Lebih",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "以上",
    "ind": "Lebih"
  },
  {
    "id": 49,
    "kanji": "下",
    "reading": "した",
    "meaning": "Bawah",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "下",
    "ind": "Bawah"
  },
  {
    "id": 50,
    "kanji": "中",
    "reading": "なか",
    "meaning": "Dalam",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "中",
    "ind": "Dalam"
  },
  {
    "id": 51,
    "kanji": "中止",
    "reading": "ちゅうし",
    "meaning": "Batal",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "中止",
    "ind": "Batal"
  },
  {
    "id": 52,
    "kanji": "3ケ月",
    "reading": "さんかげつ",
    "meaning": "3 Bulan",
    "tier": "nyuumon",
    "lesson": 7,
    "jpn": "3ケ月",
    "ind": "3 Bulan"
  },
  {
    "id": 53,
    "kanji": "3月",
    "reading": "さんがつ",
    "meaning": "Bulan 3",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "3月",
    "ind": "Bulan 3"
  },
  {
    "id": 54,
    "kanji": "今月",
    "reading": "こんげつ",
    "meaning": "Bulan Ini",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "今月",
    "ind": "Bulan Ini"
  },
  {
    "id": 55,
    "kanji": "正月",
    "reading": "しょうがつ",
    "meaning": "Tahun Baru",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "正月",
    "ind": "Tahun Baru"
  },
  {
    "id": 56,
    "kanji": "火曜日",
    "reading": "かようび",
    "meaning": "Hari selasa",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "火曜日",
    "ind": "Hari selasa"
  },
  {
    "id": 57,
    "kanji": "木曜日",
    "reading": "もくようび",
    "meaning": "Hari kamis",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "木曜日",
    "ind": "Hari kamis"
  },
  {
    "id": 58,
    "kanji": "金曜日",
    "reading": "きんようび",
    "meaning": "Hari jumat",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "金曜日",
    "ind": "Hari jumat"
  },
  {
    "id": 59,
    "kanji": "お金",
    "reading": "おかね",
    "meaning": "Uang",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "お金",
    "ind": "Uang"
  },
  {
    "id": 60,
    "kanji": "料金",
    "reading": "りょうきん",
    "meaning": "Harga",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "料金",
    "ind": "Harga"
  },
  {
    "id": 61,
    "kanji": "土曜日",
    "reading": "どようび",
    "meaning": "Hari sabtu",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "土曜日",
    "ind": "Hari sabtu"
  },
  {
    "id": 62,
    "kanji": "朝",
    "reading": "あさ",
    "meaning": "Pagi",
    "tier": "nyuumon",
    "lesson": 8,
    "jpn": "朝",
    "ind": "Pagi"
  },
  {
    "id": 63,
    "kanji": "昼",
    "reading": "ひる",
    "meaning": "Siang",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "昼",
    "ind": "Siang"
  },
  {
    "id": 64,
    "kanji": "夜",
    "reading": "よる",
    "meaning": "Malam",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "夜",
    "ind": "Malam"
  },
  {
    "id": 65,
    "kanji": "時",
    "reading": "じ",
    "meaning": "Jam",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "時",
    "ind": "Jam"
  },
  {
    "id": 66,
    "kanji": "時間",
    "reading": "じかん",
    "meaning": "Waktu",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "時間",
    "ind": "Waktu"
  },
  {
    "id": 67,
    "kanji": "時計",
    "reading": "とけい",
    "meaning": "Jam Dinding",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "時計",
    "ind": "Jam Dinding"
  },
  {
    "id": 68,
    "kanji": "分",
    "reading": "ふん",
    "meaning": "Menit",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "分",
    "ind": "Menit"
  },
  {
    "id": 69,
    "kanji": "自分",
    "reading": "じぶん",
    "meaning": "Diri Sendiri",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "自分",
    "ind": "Diri Sendiri"
  },
  {
    "id": 70,
    "kanji": "分ける",
    "reading": "わける",
    "meaning": "Membagi",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "分ける",
    "ind": "Membagi"
  },
  {
    "id": 71,
    "kanji": "半",
    "reading": "はん",
    "meaning": "Setengah",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "半",
    "ind": "Setengah"
  },
  {
    "id": 72,
    "kanji": "枚",
    "reading": "まい",
    "meaning": "Lembar",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "枚",
    "ind": "Lembar"
  },
  {
    "id": 73,
    "kanji": "読みます",
    "reading": "よみます",
    "meaning": "Membaca",
    "tier": "nyuumon",
    "lesson": 9,
    "jpn": "読みます",
    "ind": "Membaca"
  },
  {
    "id": 74,
    "kanji": "聞きます",
    "reading": "ききます",
    "meaning": "Mendengar/Bertanya",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "聞きます",
    "ind": "Mendengar/Bertanya"
  },
  {
    "id": 75,
    "kanji": "見ます",
    "reading": "みます",
    "meaning": "Melihat",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "見ます",
    "ind": "Melihat"
  },
  {
    "id": 76,
    "kanji": "友だち",
    "reading": "ともだち",
    "meaning": "Teman",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "友だち",
    "ind": "Teman"
  },
  {
    "id": 77,
    "kanji": "何",
    "reading": "なに",
    "meaning": "Apa",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "何",
    "ind": "Apa"
  },
  {
    "id": 78,
    "kanji": "去年",
    "reading": "きょねん",
    "meaning": "Tahun Lalu",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "去年",
    "ind": "Tahun Lalu"
  },
  {
    "id": 79,
    "kanji": "来年",
    "reading": "らいねん",
    "meaning": "Tahun Depan",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "来年",
    "ind": "Tahun Depan"
  },
  {
    "id": 80,
    "kanji": "今年",
    "reading": "ことし",
    "meaning": "Tahun Ini",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "今年",
    "ind": "Tahun Ini"
  },
  {
    "id": 81,
    "kanji": "昨年",
    "reading": "さくねん",
    "meaning": "Tahun Lalu",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "昨年",
    "ind": "Tahun Lalu"
  },
  {
    "id": 82,
    "kanji": "毎年",
    "reading": "まいとし",
    "meaning": "Setiap Tahun",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "毎年",
    "ind": "Setiap Tahun"
  },
  {
    "id": 83,
    "kanji": "今日",
    "reading": "きょう",
    "meaning": "Hari Ini",
    "tier": "nyuumon",
    "lesson": 10,
    "jpn": "今日",
    "ind": "Hari Ini"
  },
  {
    "id": 84,
    "kanji": "今週",
    "reading": "こんしゅう",
    "meaning": "Minggu Ini",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "今週",
    "ind": "Minggu Ini"
  },
  {
    "id": 85,
    "kanji": "今度",
    "reading": "こんど",
    "meaning": "Lain Kali",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "今度",
    "ind": "Lain Kali"
  },
  {
    "id": 86,
    "kanji": "今",
    "reading": "いま",
    "meaning": "Sekarang",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "今",
    "ind": "Sekarang"
  },
  {
    "id": 87,
    "kanji": "今月",
    "reading": "こんげつ",
    "meaning": "Bulan Ini",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "今月",
    "ind": "Bulan Ini"
  },
  {
    "id": 88,
    "kanji": "今年",
    "reading": "ことし",
    "meaning": "Tahun Ini",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "今年",
    "ind": "Tahun Ini"
  },
  {
    "id": 89,
    "kanji": "来週",
    "reading": "らいしゅう",
    "meaning": "Minggu Depan",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "来週",
    "ind": "Minggu Depan"
  },
  {
    "id": 90,
    "kanji": "先週",
    "reading": "せんしゅう",
    "meaning": "Minggu Lalu",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "先週",
    "ind": "Minggu Lalu"
  },
  {
    "id": 91,
    "kanji": "週末",
    "reading": "しゅうまつ",
    "meaning": "Akhir Pekan",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "週末",
    "ind": "Akhir Pekan"
  },
  {
    "id": 92,
    "kanji": "温度",
    "reading": "おんど",
    "meaning": "Suhu Temperatur",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "温度",
    "ind": "Suhu Temperatur"
  },
  {
    "id": 93,
    "kanji": "東",
    "reading": "ひがし",
    "meaning": "Timur",
    "tier": "nyuumon",
    "lesson": 11,
    "jpn": "東",
    "ind": "Timur"
  },
  {
    "id": 94,
    "kanji": "東京",
    "reading": "とうきょう",
    "meaning": "Tokyo",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "東京",
    "ind": "Tokyo"
  },
  {
    "id": 95,
    "kanji": "西",
    "reading": "にし",
    "meaning": "Barat",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "西",
    "ind": "Barat"
  },
  {
    "id": 96,
    "kanji": "南",
    "reading": "みなみ",
    "meaning": "Selatan",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "南",
    "ind": "Selatan"
  },
  {
    "id": 97,
    "kanji": "北",
    "reading": "きた",
    "meaning": "Utara",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "北",
    "ind": "Utara"
  },
  {
    "id": 98,
    "kanji": "会社",
    "reading": "かいしゃ",
    "meaning": "Perusahaan",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "会社",
    "ind": "Perusahaan"
  },
  {
    "id": 99,
    "kanji": "会います",
    "reading": "あいます",
    "meaning": "Bertemu",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "会います",
    "ind": "Bertemu"
  },
  {
    "id": 100,
    "kanji": "会計",
    "reading": "かいけい",
    "meaning": "Total (Bill)",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "会計",
    "ind": "Total (Bill)"
  },
  {
    "id": 101,
    "kanji": "会場",
    "reading": "かいじょう",
    "meaning": "Tempat Pertemuan",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "会場",
    "ind": "Tempat Pertemuan"
  },
  {
    "id": 102,
    "kanji": "神社",
    "reading": "じんじゃ",
    "meaning": "Kuil",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "神社",
    "ind": "Kuil"
  },
  {
    "id": 103,
    "kanji": "来ます",
    "reading": "きます",
    "meaning": "Datang",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "来ます",
    "ind": "Datang"
  },
  {
    "id": 104,
    "kanji": "来年",
    "reading": "らいねん",
    "meaning": "Tahun Depan",
    "tier": "nyuumon",
    "lesson": 12,
    "jpn": "来年",
    "ind": "Tahun Depan"
  },
  {
    "id": 105,
    "kanji": "行きます",
    "reading": "いきます",
    "meaning": "Pergi",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "行きます",
    "ind": "Pergi"
  },
  {
    "id": 106,
    "kanji": "旅行します",
    "reading": "りょこうします",
    "meaning": "Traveling/Jalan-jalan/Tamasya",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "旅行します",
    "ind": "Traveling/Jalan-jalan/Tamasya"
  },
  {
    "id": 107,
    "kanji": "銀行",
    "reading": "ぎんこう",
    "meaning": "Bank",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "銀行",
    "ind": "Bank"
  },
  {
    "id": 108,
    "kanji": "持って行く",
    "reading": "もっていく",
    "meaning": "Membawa Pergi",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "持って行く",
    "ind": "Membawa Pergi"
  },
  {
    "id": 109,
    "kanji": "乗ります",
    "reading": "のります",
    "meaning": "Naik",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "乗ります",
    "ind": "Naik"
  },
  {
    "id": 110,
    "kanji": "大きい",
    "reading": "おおきい",
    "meaning": "Besar",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "大きい",
    "ind": "Besar"
  },
  {
    "id": 111,
    "kanji": "大学",
    "reading": "だいがく",
    "meaning": "Universitas",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "大学",
    "ind": "Universitas"
  },
  {
    "id": 112,
    "kanji": "大人",
    "reading": "おとな",
    "meaning": "Dewasa",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "大人",
    "ind": "Dewasa"
  },
  {
    "id": 113,
    "kanji": "大切（な）",
    "reading": "たいせつ（な）",
    "meaning": "Penting/Berharga",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "大切（な）",
    "ind": "Penting/Berharga"
  },
  {
    "id": 114,
    "kanji": "大変（な）",
    "reading": "たいへん（な）",
    "meaning": "Berat/Sangat",
    "tier": "nyuumon",
    "lesson": 13,
    "jpn": "大変（な）",
    "ind": "Berat/Sangat"
  },
  {
    "id": 115,
    "kanji": "小さい",
    "reading": "ちいさい",
    "meaning": "Kecil",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "小さい",
    "ind": "Kecil"
  },
  {
    "id": 116,
    "kanji": "高い",
    "reading": "たかい",
    "meaning": "Tinggi",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "高い",
    "ind": "Tinggi"
  },
  {
    "id": 117,
    "kanji": "高校",
    "reading": "こうこう",
    "meaning": "SMA",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "高校",
    "ind": "SMA"
  },
  {
    "id": 118,
    "kanji": "低い",
    "reading": "ひくい",
    "meaning": "Rendah",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "低い",
    "ind": "Rendah"
  },
  {
    "id": 119,
    "kanji": "後ろ",
    "reading": "うしろ",
    "meaning": "Belakang",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "後ろ",
    "ind": "Belakang"
  },
  {
    "id": 120,
    "kanji": "午後",
    "reading": "ごご",
    "meaning": "PM",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "午後",
    "ind": "PM"
  },
  {
    "id": 121,
    "kanji": "横",
    "reading": "よこ",
    "meaning": "Di Samping",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "横",
    "ind": "Di Samping"
  },
  {
    "id": 122,
    "kanji": "入口",
    "reading": "いりぐち",
    "meaning": "Pintu Masuk",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "入口",
    "ind": "Pintu Masuk"
  },
  {
    "id": 123,
    "kanji": "入ります",
    "reading": "はいります",
    "meaning": "Masuk",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "入ります",
    "ind": "Masuk"
  },
  {
    "id": 124,
    "kanji": "記入する",
    "reading": "きにゅうする",
    "meaning": "Mengisi (Menulis Formulis dll)",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "記入する",
    "ind": "Mengisi (Menulis Formulis dll)"
  },
  {
    "id": 125,
    "kanji": "入れる",
    "reading": "いれる",
    "meaning": "Memasukan",
    "tier": "nyuumon",
    "lesson": 14,
    "jpn": "入れる",
    "ind": "Memasukan"
  },
  {
    "id": 126,
    "kanji": "入院する",
    "reading": "にゅういんする",
    "meaning": "Masuk (dirawat) Di Rumah Sakit",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "入院する",
    "ind": "Masuk (dirawat) Di Rumah Sakit"
  },
  {
    "id": 127,
    "kanji": "入力する",
    "reading": "にゅうりょくする",
    "meaning": "Menginput (Data,Informasi dll)",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "入力する",
    "ind": "Menginput (Data,Informasi dll)"
  },
  {
    "id": 128,
    "kanji": "出口",
    "reading": "でぐち",
    "meaning": "Pintu Keluar",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "出口",
    "ind": "Pintu Keluar"
  },
  {
    "id": 129,
    "kanji": "口",
    "reading": "くち",
    "meaning": "Mulut",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "口",
    "ind": "Mulut"
  },
  {
    "id": 130,
    "kanji": "窓口",
    "reading": "まどぐち",
    "meaning": "Loket Informasi",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "窓口",
    "ind": "Loket Informasi"
  },
  {
    "id": 131,
    "kanji": "出かける",
    "reading": "でかける",
    "meaning": "Keluar",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "出かける",
    "ind": "Keluar"
  },
  {
    "id": 132,
    "kanji": "出発する",
    "reading": "しゅっぱつする",
    "meaning": "Keberangkatan",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "出発する",
    "ind": "Keberangkatan"
  },
  {
    "id": 133,
    "kanji": "出す",
    "reading": "だす",
    "meaning": "Mengeluarkan/Mengumpulkan",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "出す",
    "ind": "Mengeluarkan/Mengumpulkan"
  },
  {
    "id": 134,
    "kanji": "～階",
    "reading": "～かい",
    "meaning": "Lantai～",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "～階",
    "ind": "Lantai～"
  },
  {
    "id": 135,
    "kanji": "押す",
    "reading": "おす",
    "meaning": "Menekan",
    "tier": "nyuumon",
    "lesson": 15,
    "jpn": "押す",
    "ind": "Menekan"
  },
  {
    "id": 136,
    "kanji": "引く",
    "reading": "ひく",
    "meaning": "Menarik",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "引く",
    "ind": "Menarik"
  },
  {
    "id": 137,
    "kanji": "安い",
    "reading": "やすい",
    "meaning": "Murah",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "安い",
    "ind": "Murah"
  },
  {
    "id": 138,
    "kanji": "一",
    "reading": "いち",
    "meaning": "1",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "一",
    "ind": "1"
  },
  {
    "id": 139,
    "kanji": "二",
    "reading": "に",
    "meaning": "2",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "二",
    "ind": "2"
  },
  {
    "id": 140,
    "kanji": "三",
    "reading": "さん",
    "meaning": "3",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "三",
    "ind": "3"
  },
  {
    "id": 141,
    "kanji": "四",
    "reading": "よん",
    "meaning": "4",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "四",
    "ind": "4"
  },
  {
    "id": 142,
    "kanji": "五",
    "reading": "ご",
    "meaning": "5",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "五",
    "ind": "5"
  },
  {
    "id": 143,
    "kanji": "六",
    "reading": "ろく",
    "meaning": "6",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "六",
    "ind": "6"
  },
  {
    "id": 144,
    "kanji": "七",
    "reading": "なな",
    "meaning": "7",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "七",
    "ind": "7"
  },
  {
    "id": 145,
    "kanji": "八",
    "reading": "はち",
    "meaning": "8",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "八",
    "ind": "8"
  },
  {
    "id": 146,
    "kanji": "九",
    "reading": "きゅう",
    "meaning": "9",
    "tier": "nyuumon",
    "lesson": 16,
    "jpn": "九",
    "ind": "9"
  },
  {
    "id": 147,
    "kanji": "十",
    "reading": "じゅう",
    "meaning": "10",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "十",
    "ind": "10"
  },
  {
    "id": 148,
    "kanji": "百",
    "reading": "ひゃく",
    "meaning": "100",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "百",
    "ind": "100"
  },
  {
    "id": 149,
    "kanji": "千",
    "reading": "せん",
    "meaning": "1000",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "千",
    "ind": "1000"
  },
  {
    "id": 150,
    "kanji": "万",
    "reading": "まん",
    "meaning": "10000",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "万",
    "ind": "10000"
  },
  {
    "id": 151,
    "kanji": "～円",
    "reading": "～えん",
    "meaning": "～Yen (Mata Uang Jepang)",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "～円",
    "ind": "～Yen (Mata Uang Jepang)"
  },
  {
    "id": 152,
    "kanji": "休み",
    "reading": "やすみ",
    "meaning": "Istirahat/Libur",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "休み",
    "ind": "Istirahat/Libur"
  },
  {
    "id": 153,
    "kanji": "映画",
    "reading": "えいが",
    "meaning": "Film/Movie",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "映画",
    "ind": "Film/Movie"
  },
  {
    "id": 154,
    "kanji": "計画",
    "reading": "けいかく",
    "meaning": "Rencana",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "計画",
    "ind": "Rencana"
  },
  {
    "id": 155,
    "kanji": "日本語",
    "reading": "にほんご",
    "meaning": "Bahasa Jepang",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "日本語",
    "ind": "Bahasa Jepang"
  },
  {
    "id": 156,
    "kanji": "英語",
    "reading": "えいご",
    "meaning": "Bahasa Inggris",
    "tier": "nyuumon",
    "lesson": 17,
    "jpn": "英語",
    "ind": "Bahasa Inggris"
  },
  {
    "id": 157,
    "kanji": "勉強します",
    "reading": "べんきょうします",
    "meaning": "Belajar",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "勉強します",
    "ind": "Belajar"
  },
  {
    "id": 158,
    "kanji": "強い",
    "reading": "つよい",
    "meaning": "Kuat",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "強い",
    "ind": "Kuat"
  },
  {
    "id": 159,
    "kanji": "買います",
    "reading": "かいます",
    "meaning": "Membeli",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "買います",
    "ind": "Membeli"
  },
  {
    "id": 160,
    "kanji": "温泉",
    "reading": "おんせん",
    "meaning": "Pemandian air panas alami",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "温泉",
    "ind": "Pemandian air panas alami"
  },
  {
    "id": 161,
    "kanji": "予定",
    "reading": "よてい",
    "meaning": "Jadwal",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "予定",
    "ind": "Jadwal"
  },
  {
    "id": 162,
    "kanji": "予約",
    "reading": "よやく",
    "meaning": "Memesan/Booking (Hotel.Restaurant dll)",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "予約",
    "ind": "Memesan/Booking (Hotel.Restaurant dll)"
  },
  {
    "id": 163,
    "kanji": "指定席",
    "reading": "していせき",
    "meaning": "Kursi Yang Telah Di Pesan (Kereta, Pesawat dll)",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "指定席",
    "ind": "Kursi Yang Telah Di Pesan (Kereta, Pesawat dll)"
  },
  {
    "id": 164,
    "kanji": "設定する",
    "reading": "せっていする",
    "meaning": "Mengatur/Mensetting",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "設定する",
    "ind": "Mengatur/Mensetting"
  },
  {
    "id": 165,
    "kanji": "旅行します",
    "reading": "りょこうします",
    "meaning": "Traveling/Jalan-jalan/Tamasya",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "旅行します",
    "ind": "Traveling/Jalan-jalan/Tamasya"
  },
  {
    "id": 166,
    "kanji": "旅館",
    "reading": "りょかん",
    "meaning": "Penginapan Ala Jepang (Tradisional)",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "旅館",
    "ind": "Penginapan Ala Jepang (Tradisional)"
  },
  {
    "id": 167,
    "kanji": "学生",
    "reading": "がくせい",
    "meaning": "Pelajar",
    "tier": "nyuumon",
    "lesson": 18,
    "jpn": "学生",
    "ind": "Pelajar"
  },
  {
    "id": 168,
    "kanji": "学校",
    "reading": "がっこう",
    "meaning": "Sekolah",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "学校",
    "ind": "Sekolah"
  },
  {
    "id": 169,
    "kanji": "大学",
    "reading": "だいがく",
    "meaning": "Universitas",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "大学",
    "ind": "Universitas"
  },
  {
    "id": 170,
    "kanji": "留学する",
    "reading": "りゅうがくする",
    "meaning": "Belajar Di Luar Negeri",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "留学する",
    "ind": "Belajar Di Luar Negeri"
  },
  {
    "id": 171,
    "kanji": "生活",
    "reading": "せいかつ",
    "meaning": "Kehidupan",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "生活",
    "ind": "Kehidupan"
  },
  {
    "id": 172,
    "kanji": "誕生日",
    "reading": "たんじょうび",
    "meaning": "Ulang Tahun",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "誕生日",
    "ind": "Ulang Tahun"
  },
  {
    "id": 173,
    "kanji": "生まれる",
    "reading": "うまれる",
    "meaning": "Lahir",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "生まれる",
    "ind": "Lahir"
  },
  {
    "id": 174,
    "kanji": "生",
    "reading": "なま",
    "meaning": "Mentah",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "生",
    "ind": "Mentah"
  },
  {
    "id": 175,
    "kanji": "生産する",
    "reading": "せいさんする",
    "meaning": "Memproduksi",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "生産する",
    "ind": "Memproduksi"
  },
  {
    "id": 176,
    "kanji": "学校",
    "reading": "がっこう",
    "meaning": "Sekolah",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "学校",
    "ind": "Sekolah"
  },
  {
    "id": 177,
    "kanji": "高校",
    "reading": "こうこう",
    "meaning": "SMA",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "高校",
    "ind": "SMA"
  },
  {
    "id": 178,
    "kanji": "生活",
    "reading": "せいかつ",
    "meaning": "Kehidupan",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "生活",
    "ind": "Kehidupan"
  },
  {
    "id": 179,
    "kanji": "去年",
    "reading": "きょねん",
    "meaning": "Tahun Lalu",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "去年",
    "ind": "Tahun Lalu"
  },
  {
    "id": 180,
    "kanji": "先週",
    "reading": "せんしゅう",
    "meaning": "Minggu Lalu",
    "tier": "shokyuu1",
    "lesson": 1,
    "jpn": "先週",
    "ind": "Minggu Lalu"
  },
  {
    "id": 181,
    "kanji": "先生",
    "reading": "せんせい",
    "meaning": "Guru/Pengajar/Profesional",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "先生",
    "ind": "Guru/Pengajar/Profesional"
  },
  {
    "id": 182,
    "kanji": "連絡先",
    "reading": "れんらくさき",
    "meaning": "Nomor Yang Dapat Di Hubungi (Kontak)",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "連絡先",
    "ind": "Nomor Yang Dapat Di Hubungi (Kontak)"
  },
  {
    "id": 183,
    "kanji": "仕事",
    "reading": "しごと",
    "meaning": "Pekerjaan",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "仕事",
    "ind": "Pekerjaan"
  },
  {
    "id": 184,
    "kanji": "食事",
    "reading": "しょくじ",
    "meaning": "Makan",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "食事",
    "ind": "Makan"
  },
  {
    "id": 185,
    "kanji": "用事",
    "reading": "ようじ",
    "meaning": "Urusan",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "用事",
    "ind": "Urusan"
  },
  {
    "id": 186,
    "kanji": "工事",
    "reading": "こうじ",
    "meaning": "Pekerjaan Kontruksi",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "工事",
    "ind": "Pekerjaan Kontruksi"
  },
  {
    "id": 187,
    "kanji": "元気（な）",
    "reading": "げんき（な）",
    "meaning": "Sehat/Bugar",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "元気（な）",
    "ind": "Sehat/Bugar"
  },
  {
    "id": 188,
    "kanji": "天気",
    "reading": "てんき",
    "meaning": "Cuaca",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "天気",
    "ind": "Cuaca"
  },
  {
    "id": 189,
    "kanji": "電気",
    "reading": "でんき",
    "meaning": "Listrik/Lampu",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "電気",
    "ind": "Listrik/Lampu"
  },
  {
    "id": 190,
    "kanji": "病気",
    "reading": "びょうき",
    "meaning": "Sakit",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "病気",
    "ind": "Sakit"
  },
  {
    "id": 191,
    "kanji": "忙しい",
    "reading": "いそがしい",
    "meaning": "Sibuk/Terburu-buru",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "忙しい",
    "ind": "Sibuk/Terburu-buru"
  },
  {
    "id": 192,
    "kanji": "働く",
    "reading": "はたらく",
    "meaning": "Bekerja",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "働く",
    "ind": "Bekerja"
  },
  {
    "id": 193,
    "kanji": "作る",
    "reading": "つくる",
    "meaning": "Membuat",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "作る",
    "ind": "Membuat"
  },
  {
    "id": 194,
    "kanji": "人",
    "reading": "ひと",
    "meaning": "Orang",
    "tier": "shokyuu1",
    "lesson": 2,
    "jpn": "人",
    "ind": "Orang"
  },
  {
    "id": 195,
    "kanji": "大人",
    "reading": "おとな",
    "meaning": "Dewasa",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "大人",
    "ind": "Dewasa"
  },
  {
    "id": 196,
    "kanji": "犬",
    "reading": "いぬ",
    "meaning": "Anjing",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "犬",
    "ind": "Anjing"
  },
  {
    "id": 197,
    "kanji": "家族",
    "reading": "かぞく",
    "meaning": "Keluarga",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "家族",
    "ind": "Keluarga"
  },
  {
    "id": 198,
    "kanji": "夕方",
    "reading": "ゆうがた",
    "meaning": "Sore",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "夕方",
    "ind": "Sore"
  },
  {
    "id": 199,
    "kanji": "調理方法",
    "reading": "ちょうりほうほう",
    "meaning": "Resep Makanan",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "調理方法",
    "ind": "Resep Makanan"
  },
  {
    "id": 200,
    "kanji": "方",
    "reading": "かた",
    "meaning": "Cara",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "方",
    "ind": "Cara"
  },
  {
    "id": 201,
    "kanji": "英語",
    "reading": "えいご",
    "meaning": "Bahasa Inggris",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "英語",
    "ind": "Bahasa Inggris"
  },
  {
    "id": 202,
    "kanji": "音",
    "reading": "おと",
    "meaning": "Suara (Yang Bukan Dari Mulut)",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "音",
    "ind": "Suara (Yang Bukan Dari Mulut)"
  },
  {
    "id": 203,
    "kanji": "音楽",
    "reading": "おんがく",
    "meaning": "Lagu/Musik",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "音楽",
    "ind": "Lagu/Musik"
  },
  {
    "id": 204,
    "kanji": "楽しい",
    "reading": "たのしい",
    "meaning": "Menyenangkan",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "楽しい",
    "ind": "Menyenangkan"
  },
  {
    "id": 205,
    "kanji": "習う",
    "reading": "ならう",
    "meaning": "Belajar (Ke Seseorang)",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "習う",
    "ind": "Belajar (Ke Seseorang)"
  },
  {
    "id": 206,
    "kanji": "練習",
    "reading": "れんしゅう",
    "meaning": "Berlatih/Latihan",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "練習",
    "ind": "Berlatih/Latihan"
  },
  {
    "id": 207,
    "kanji": "習慣",
    "reading": "しゅうかん",
    "meaning": "Kebiasaan/Adat Istiadat",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "習慣",
    "ind": "Kebiasaan/Adat Istiadat"
  },
  {
    "id": 208,
    "kanji": "話す",
    "reading": "はなす",
    "meaning": "Berbicara/Berbincang",
    "tier": "shokyuu1",
    "lesson": 3,
    "jpn": "話す",
    "ind": "Berbicara/Berbincang"
  },
  {
    "id": 209,
    "kanji": "電話番号",
    "reading": "でんわばんごう",
    "meaning": "Nomor Telepon",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "電話番号",
    "ind": "Nomor Telepon"
  },
  {
    "id": 210,
    "kanji": "季節",
    "reading": "きせつ",
    "meaning": "Musim",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "季節",
    "ind": "Musim"
  },
  {
    "id": 211,
    "kanji": "春",
    "reading": "はる",
    "meaning": "Musim Semi",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "春",
    "ind": "Musim Semi"
  },
  {
    "id": 212,
    "kanji": "夏",
    "reading": "なつ",
    "meaning": "Musim Panas",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "夏",
    "ind": "Musim Panas"
  },
  {
    "id": 213,
    "kanji": "秋",
    "reading": "あき",
    "meaning": "Musim Gugur",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "秋",
    "ind": "Musim Gugur"
  },
  {
    "id": 214,
    "kanji": "冬",
    "reading": "ふゆ",
    "meaning": "Musim Dingin",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "冬",
    "ind": "Musim Dingin"
  },
  {
    "id": 215,
    "kanji": "花",
    "reading": "はな",
    "meaning": "Bunga",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "花",
    "ind": "Bunga"
  },
  {
    "id": 216,
    "kanji": "同じ",
    "reading": "おなじ",
    "meaning": "Sama",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "同じ",
    "ind": "Sama"
  },
  {
    "id": 217,
    "kanji": "暑い",
    "reading": "あつい",
    "meaning": "Panas (Cuaca)",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "暑い",
    "ind": "Panas (Cuaca)"
  },
  {
    "id": 218,
    "kanji": "寒い",
    "reading": "さむい",
    "meaning": "Dingin (Cuaca)",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "寒い",
    "ind": "Dingin (Cuaca)"
  },
  {
    "id": 219,
    "kanji": "天気",
    "reading": "てんき",
    "meaning": "Cuaca",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "天気",
    "ind": "Cuaca"
  },
  {
    "id": 220,
    "kanji": "晴れ",
    "reading": "はれ",
    "meaning": "Cuaca Cerah",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "晴れ",
    "ind": "Cuaca Cerah"
  },
  {
    "id": 221,
    "kanji": "雨",
    "reading": "あめ",
    "meaning": "Hujan",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "雨",
    "ind": "Hujan"
  },
  {
    "id": 222,
    "kanji": "雪",
    "reading": "ゆき",
    "meaning": "Salju",
    "tier": "shokyuu1",
    "lesson": 4,
    "jpn": "雪",
    "ind": "Salju"
  },
  {
    "id": 223,
    "kanji": "風",
    "reading": "かぜ",
    "meaning": "Angin",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "風",
    "ind": "Angin"
  },
  {
    "id": 224,
    "kanji": "台風",
    "reading": "たいふう",
    "meaning": "Topan",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "台風",
    "ind": "Topan"
  },
  {
    "id": 225,
    "kanji": "昨日",
    "reading": "きのう",
    "meaning": "Kemarin",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "昨日",
    "ind": "Kemarin"
  },
  {
    "id": 226,
    "kanji": "昨年",
    "reading": "さくねん",
    "meaning": "Tahun Lalu",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "昨年",
    "ind": "Tahun Lalu"
  },
  {
    "id": 227,
    "kanji": "明日",
    "reading": "あした",
    "meaning": "Besok",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "明日",
    "ind": "Besok"
  },
  {
    "id": 228,
    "kanji": "説明する",
    "reading": "せつめいする",
    "meaning": "Menjelaskan",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "説明する",
    "ind": "Menjelaskan"
  },
  {
    "id": 229,
    "kanji": "明るい",
    "reading": "あかるい",
    "meaning": "Terang",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "明るい",
    "ind": "Terang"
  },
  {
    "id": 230,
    "kanji": "毎日",
    "reading": "まいにち",
    "meaning": "Setiap Hari",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "毎日",
    "ind": "Setiap Hari"
  },
  {
    "id": 231,
    "kanji": "毎年",
    "reading": "まいとし",
    "meaning": "Setiap Tahun",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "毎年",
    "ind": "Setiap Tahun"
  },
  {
    "id": 232,
    "kanji": "町",
    "reading": "まち",
    "meaning": "Kota",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "町",
    "ind": "Kota"
  },
  {
    "id": 233,
    "kanji": "店",
    "reading": "みせ",
    "meaning": "Toko",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "店",
    "ind": "Toko"
  },
  {
    "id": 234,
    "kanji": "店長",
    "reading": "てんちょう",
    "meaning": "Kepala Toko",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "店長",
    "ind": "Kepala Toko"
  },
  {
    "id": 235,
    "kanji": "店員",
    "reading": "てんいん",
    "meaning": "Pegawai Toko",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "店員",
    "ind": "Pegawai Toko"
  },
  {
    "id": 236,
    "kanji": "食堂",
    "reading": "しょくどう",
    "meaning": "Kantin",
    "tier": "shokyuu1",
    "lesson": 5,
    "jpn": "食堂",
    "ind": "Kantin"
  },
  {
    "id": 237,
    "kanji": "便利（な）",
    "reading": "べんり（な）",
    "meaning": "Praktis",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "便利（な）",
    "ind": "Praktis"
  },
  {
    "id": 238,
    "kanji": "不便（な）",
    "reading": "ふべん（な）",
    "meaning": "Tidak Praktis",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "不便（な）",
    "ind": "Tidak Praktis"
  },
  {
    "id": 239,
    "kanji": "郵便局",
    "reading": "ゆうびんきょく",
    "meaning": "Kantor Pos",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "郵便局",
    "ind": "Kantor Pos"
  },
  {
    "id": 240,
    "kanji": "便利（な）",
    "reading": "べんり（な）",
    "meaning": "Praktis",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "便利（な）",
    "ind": "Praktis"
  },
  {
    "id": 241,
    "kanji": "利用する",
    "reading": "りようする",
    "meaning": "Menggunakan (Fasilitas)",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "利用する",
    "ind": "Menggunakan (Fasilitas)"
  },
  {
    "id": 242,
    "kanji": "不便（な）",
    "reading": "ふべん（な）",
    "meaning": "Tidak Praktis",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "不便（な）",
    "ind": "Tidak Praktis"
  },
  {
    "id": 243,
    "kanji": "静か（な）",
    "reading": "しずか（な）",
    "meaning": "Sunyi/Tenang",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "静か（な）",
    "ind": "Sunyi/Tenang"
  },
  {
    "id": 244,
    "kanji": "有名（な）",
    "reading": "ゆうめい（な）",
    "meaning": "Terkenal",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "有名（な）",
    "ind": "Terkenal"
  },
  {
    "id": 245,
    "kanji": "多い",
    "reading": "おおい",
    "meaning": "Banyak",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "多い",
    "ind": "Banyak"
  },
  {
    "id": 246,
    "kanji": "少ない",
    "reading": "すくない",
    "meaning": "Sedikit",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "少ない",
    "ind": "Sedikit"
  },
  {
    "id": 247,
    "kanji": "少し",
    "reading": "すこし",
    "meaning": "Sedikit",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "少し",
    "ind": "Sedikit"
  },
  {
    "id": 248,
    "kanji": "遠い",
    "reading": "とおい",
    "meaning": "Jauh",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "遠い",
    "ind": "Jauh"
  },
  {
    "id": 249,
    "kanji": "道",
    "reading": "みち",
    "meaning": "Jalan",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "道",
    "ind": "Jalan"
  },
  {
    "id": 250,
    "kanji": "道具",
    "reading": "どうぐ",
    "meaning": "Alat",
    "tier": "shokyuu1",
    "lesson": 6,
    "jpn": "道具",
    "ind": "Alat"
  },
  {
    "id": 251,
    "kanji": "公園",
    "reading": "こうえん",
    "meaning": "Taman",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "公園",
    "ind": "Taman"
  },
  {
    "id": 252,
    "kanji": "動物園",
    "reading": "どうぶつえん",
    "meaning": "Kebun Binatang",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "動物園",
    "ind": "Kebun Binatang"
  },
  {
    "id": 253,
    "kanji": "銀行",
    "reading": "ぎんこう",
    "meaning": "Bank",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "銀行",
    "ind": "Bank"
  },
  {
    "id": 254,
    "kanji": "お寺",
    "reading": "おてら",
    "meaning": "Kuil",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "お寺",
    "ind": "Kuil"
  },
  {
    "id": 255,
    "kanji": "神社",
    "reading": "じんじゃ",
    "meaning": "Kuil",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "神社",
    "ind": "Kuil"
  },
  {
    "id": 256,
    "kanji": "右",
    "reading": "みぎ",
    "meaning": "Kanan",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "右",
    "ind": "Kanan"
  },
  {
    "id": 257,
    "kanji": "左",
    "reading": "ひだり",
    "meaning": "Kiri",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "左",
    "ind": "Kiri"
  },
  {
    "id": 258,
    "kanji": "近く",
    "reading": "ちかく",
    "meaning": "Dekat",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "近く",
    "ind": "Dekat"
  },
  {
    "id": 259,
    "kanji": "近所",
    "reading": "きんじょ",
    "meaning": "Tetangga/Sekitar Rumah",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "近所",
    "ind": "Tetangga/Sekitar Rumah"
  },
  {
    "id": 260,
    "kanji": "最近",
    "reading": "さいきん",
    "meaning": "Akhir-akhir ini",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "最近",
    "ind": "Akhir-akhir ini"
  },
  {
    "id": 261,
    "kanji": "車",
    "reading": "くるま",
    "meaning": "Mobil",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "車",
    "ind": "Mobil"
  },
  {
    "id": 262,
    "kanji": "電車",
    "reading": "でんしゃ",
    "meaning": "Kereta",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "電車",
    "ind": "Kereta"
  },
  {
    "id": 263,
    "kanji": "自転車",
    "reading": "じてんしゃ",
    "meaning": "Sepeda",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "自転車",
    "ind": "Sepeda"
  },
  {
    "id": 264,
    "kanji": "送る",
    "reading": "おくる",
    "meaning": "Mengirim (Benda/Orang)",
    "tier": "shokyuu1",
    "lesson": 7,
    "jpn": "送る",
    "ind": "Mengirim (Benda/Orang)"
  },
  {
    "id": 265,
    "kanji": "時間",
    "reading": "じかん",
    "meaning": "Waktu",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "時間",
    "ind": "Waktu"
  },
  {
    "id": 266,
    "kanji": "場所",
    "reading": "ばしょ",
    "meaning": "Tempat",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "場所",
    "ind": "Tempat"
  },
  {
    "id": 267,
    "kanji": "広場",
    "reading": "ひろば",
    "meaning": "Lapangan/Area Luas",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "広場",
    "ind": "Lapangan/Area Luas"
  },
  {
    "id": 268,
    "kanji": "場合",
    "reading": "ばあい",
    "meaning": "Saat/Dalam Situasi",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "場合",
    "ind": "Saat/Dalam Situasi"
  },
  {
    "id": 269,
    "kanji": "会場",
    "reading": "かいじょう",
    "meaning": "Tempat Pertemuan",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "会場",
    "ind": "Tempat Pertemuan"
  },
  {
    "id": 270,
    "kanji": "住所",
    "reading": "じゅうしょ",
    "meaning": "Alamat",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "住所",
    "ind": "Alamat"
  },
  {
    "id": 271,
    "kanji": "近所",
    "reading": "きんじょ",
    "meaning": "Tetangga/Sekitar Rumah",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "近所",
    "ind": "Tetangga/Sekitar Rumah"
  },
  {
    "id": 272,
    "kanji": "駅",
    "reading": "えき",
    "meaning": "Stasiun",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "駅",
    "ind": "Stasiun"
  },
  {
    "id": 273,
    "kanji": "受付",
    "reading": "うけつけ",
    "meaning": "Meja Informasi",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "受付",
    "ind": "Meja Informasi"
  },
  {
    "id": 274,
    "kanji": "門",
    "reading": "もん",
    "meaning": "Gerbang",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "門",
    "ind": "Gerbang"
  },
  {
    "id": 275,
    "kanji": "電車",
    "reading": "でんしゃ",
    "meaning": "Kereta",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "電車",
    "ind": "Kereta"
  },
  {
    "id": 276,
    "kanji": "電気",
    "reading": "でんき",
    "meaning": "Listrik/Lampu",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "電気",
    "ind": "Listrik/Lampu"
  },
  {
    "id": 277,
    "kanji": "電話番号",
    "reading": "でんわばんごう",
    "meaning": "Nomor Telepon",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "電話番号",
    "ind": "Nomor Telepon"
  },
  {
    "id": 278,
    "kanji": "待つ",
    "reading": "まつ",
    "meaning": "Menunggu",
    "tier": "shokyuu1",
    "lesson": 8,
    "jpn": "待つ",
    "ind": "Menunggu"
  },
  {
    "id": 279,
    "kanji": "止まる",
    "reading": "とまる",
    "meaning": "Berhenti/Menginap",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "止まる",
    "ind": "Berhenti/Menginap"
  },
  {
    "id": 280,
    "kanji": "中止",
    "reading": "ちゅうし",
    "meaning": "Batal",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "中止",
    "ind": "Batal"
  },
  {
    "id": 281,
    "kanji": "禁止",
    "reading": "きんし",
    "meaning": "Larangan/Dilarang",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "禁止",
    "ind": "Larangan/Dilarang"
  },
  {
    "id": 282,
    "kanji": "着く",
    "reading": "つく",
    "meaning": "Tiba (Sampai Di Suatu Tempat)",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "着く",
    "ind": "Tiba (Sampai Di Suatu Tempat)"
  },
  {
    "id": 283,
    "kanji": "着る",
    "reading": "きる",
    "meaning": "Memakai (Baju, Pakaian Dll)",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "着る",
    "ind": "Memakai (Baju, Pakaian Dll)"
  },
  {
    "id": 284,
    "kanji": "到着する",
    "reading": "とうちゃくする",
    "meaning": "Kedatangan",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "到着する",
    "ind": "Kedatangan"
  },
  {
    "id": 285,
    "kanji": "急ぐ",
    "reading": "いそぐ",
    "meaning": "Terburu-buru",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "急ぐ",
    "ind": "Terburu-buru"
  },
  {
    "id": 286,
    "kanji": "急に",
    "reading": "きゅうに",
    "meaning": "Tiba-tiba",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "急に",
    "ind": "Tiba-tiba"
  },
  {
    "id": 287,
    "kanji": "博物館",
    "reading": "はくぶつかん",
    "meaning": "Museum",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "博物館",
    "ind": "Museum"
  },
  {
    "id": 288,
    "kanji": "動物園",
    "reading": "どうぶつえん",
    "meaning": "Kebun Binatang",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "動物園",
    "ind": "Kebun Binatang"
  },
  {
    "id": 289,
    "kanji": "飲み物",
    "reading": "のみもの",
    "meaning": "Minuman",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "飲み物",
    "ind": "Minuman"
  },
  {
    "id": 290,
    "kanji": "図書館",
    "reading": "としょかん",
    "meaning": "Perpustakaan",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "図書館",
    "ind": "Perpustakaan"
  },
  {
    "id": 291,
    "kanji": "動物園",
    "reading": "どうぶつえん",
    "meaning": "Kebun Binatang",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "動物園",
    "ind": "Kebun Binatang"
  },
  {
    "id": 292,
    "kanji": "動く",
    "reading": "うごく",
    "meaning": "Bergerak",
    "tier": "shokyuu1",
    "lesson": 9,
    "jpn": "動く",
    "ind": "Bergerak"
  },
  {
    "id": 293,
    "kanji": "運動する",
    "reading": "うんどうする",
    "meaning": "Berolah Raga",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "運動する",
    "ind": "Berolah Raga"
  },
  {
    "id": 294,
    "kanji": "試合",
    "reading": "しあい",
    "meaning": "Pertandingan",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "試合",
    "ind": "Pertandingan"
  },
  {
    "id": 295,
    "kanji": "都合",
    "reading": "つごう",
    "meaning": "Keadaan",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "都合",
    "ind": "Keadaan"
  },
  {
    "id": 296,
    "kanji": "合格する",
    "reading": "ごうかくする",
    "meaning": "Lulus",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "合格する",
    "ind": "Lulus"
  },
  {
    "id": 297,
    "kanji": "場合",
    "reading": "ばあい",
    "meaning": "Saat/Dalam Situasi",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "場合",
    "ind": "Saat/Dalam Situasi"
  },
  {
    "id": 298,
    "kanji": "難しい",
    "reading": "むずかしい",
    "meaning": "Sulit",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "難しい",
    "ind": "Sulit"
  },
  {
    "id": 299,
    "kanji": "登る",
    "reading": "のぼる",
    "meaning": "Mendaki",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "登る",
    "ind": "Mendaki"
  },
  {
    "id": 300,
    "kanji": "練習",
    "reading": "れんしゅう",
    "meaning": "Berlatih/Latihan",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "練習",
    "ind": "Berlatih/Latihan"
  },
  {
    "id": 301,
    "kanji": "漢字",
    "reading": "かんじ",
    "meaning": "Kanji",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "漢字",
    "ind": "Kanji"
  },
  {
    "id": 302,
    "kanji": "数字",
    "reading": "すうじ",
    "meaning": "Angka",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "数字",
    "ind": "Angka"
  },
  {
    "id": 303,
    "kanji": "無料",
    "reading": "むりょう",
    "meaning": "Gratis",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "無料",
    "ind": "Gratis"
  },
  {
    "id": 304,
    "kanji": "材料",
    "reading": "ざいりょう",
    "meaning": "Bahan",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "材料",
    "ind": "Bahan"
  },
  {
    "id": 305,
    "kanji": "料理",
    "reading": "りょうり",
    "meaning": "Masak",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "料理",
    "ind": "Masak"
  },
  {
    "id": 306,
    "kanji": "料金",
    "reading": "りょうきん",
    "meaning": "Harga",
    "tier": "shokyuu1",
    "lesson": 10,
    "jpn": "料金",
    "ind": "Harga"
  },
  {
    "id": 307,
    "kanji": "言う",
    "reading": "いう",
    "meaning": "Mengatakan",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "言う",
    "ind": "Mengatakan"
  },
  {
    "id": 308,
    "kanji": "書く",
    "reading": "かく",
    "meaning": "Menulis",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "書く",
    "ind": "Menulis"
  },
  {
    "id": 309,
    "kanji": "教科書",
    "reading": "きょうかしょ",
    "meaning": "Buku Pelajaran",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "教科書",
    "ind": "Buku Pelajaran"
  },
  {
    "id": 310,
    "kanji": "図書館",
    "reading": "としょかん",
    "meaning": "Perpustakaan",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "図書館",
    "ind": "Perpustakaan"
  },
  {
    "id": 311,
    "kanji": "貸す",
    "reading": "かす",
    "meaning": "Meminjamkan",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "貸す",
    "ind": "Meminjamkan"
  },
  {
    "id": 312,
    "kanji": "教える",
    "reading": "おしえる",
    "meaning": "Mengajarkan/Memberitahu",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "教える",
    "ind": "Mengajarkan/Memberitahu"
  },
  {
    "id": 313,
    "kanji": "教科書",
    "reading": "きょうかしょ",
    "meaning": "Buku Pelajaran",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "教科書",
    "ind": "Buku Pelajaran"
  },
  {
    "id": 314,
    "kanji": "教室",
    "reading": "きょうしつ",
    "meaning": "Ruang Kelas",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "教室",
    "ind": "Ruang Kelas"
  },
  {
    "id": 315,
    "kanji": "説明する",
    "reading": "せつめいする",
    "meaning": "Menjelaskan",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "説明する",
    "ind": "Menjelaskan"
  },
  {
    "id": 316,
    "kanji": "午前",
    "reading": "ごぜん",
    "meaning": "AM",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "午前",
    "ind": "AM"
  },
  {
    "id": 317,
    "kanji": "午後",
    "reading": "ごご",
    "meaning": "PM",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "午後",
    "ind": "PM"
  },
  {
    "id": 318,
    "kanji": "教科書",
    "reading": "きょうかしょ",
    "meaning": "Buku Pelajaran",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "教科書",
    "ind": "Buku Pelajaran"
  },
  {
    "id": 319,
    "kanji": "教室",
    "reading": "きょうしつ",
    "meaning": "Ruang Kelas",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "教室",
    "ind": "Ruang Kelas"
  },
  {
    "id": 320,
    "kanji": "全部",
    "reading": "ぜんぶ",
    "meaning": "Semuanya",
    "tier": "shokyuu1",
    "lesson": 11,
    "jpn": "全部",
    "ind": "Semuanya"
  },
  {
    "id": 321,
    "kanji": "全員",
    "reading": "ぜんいん",
    "meaning": "Semua Orang",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "全員",
    "ind": "Semua Orang"
  },
  {
    "id": 322,
    "kanji": "全部",
    "reading": "ぜんぶ",
    "meaning": "Semuanya",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "全部",
    "ind": "Semuanya"
  },
  {
    "id": 323,
    "kanji": "回",
    "reading": "かい",
    "meaning": "Kali",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "回",
    "ind": "Kali"
  },
  {
    "id": 324,
    "kanji": "参加する",
    "reading": "さんかする",
    "meaning": "Bergabung/Berpartisipasi",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "参加する",
    "ind": "Bergabung/Berpartisipasi"
  },
  {
    "id": 325,
    "kanji": "用事",
    "reading": "ようじ",
    "meaning": "Urusan",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "用事",
    "ind": "Urusan"
  },
  {
    "id": 326,
    "kanji": "利用する",
    "reading": "りようする",
    "meaning": "Menggunakan (Fasilitas)",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "利用する",
    "ind": "Menggunakan (Fasilitas)"
  },
  {
    "id": 327,
    "kanji": "用意する",
    "reading": "よういする",
    "meaning": "Mempersiapkan",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "用意する",
    "ind": "Mempersiapkan"
  },
  {
    "id": 328,
    "kanji": "意味",
    "reading": "いみ",
    "meaning": "Arti",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "意味",
    "ind": "Arti"
  },
  {
    "id": 329,
    "kanji": "お茶",
    "reading": "おちゃ",
    "meaning": "Teh Jepang",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "お茶",
    "ind": "Teh Jepang"
  },
  {
    "id": 330,
    "kanji": "お酒",
    "reading": "おさけ",
    "meaning": "Osake",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "お酒",
    "ind": "Osake"
  },
  {
    "id": 331,
    "kanji": "材料",
    "reading": "ざいりょう",
    "meaning": "Bahan",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "材料",
    "ind": "Bahan"
  },
  {
    "id": 332,
    "kanji": "野菜",
    "reading": "やさい",
    "meaning": "Sayur-sayuran",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "野菜",
    "ind": "Sayur-sayuran"
  },
  {
    "id": 333,
    "kanji": "牛肉",
    "reading": "ぎゅうにく",
    "meaning": "Daging Sapi",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "牛肉",
    "ind": "Daging Sapi"
  },
  {
    "id": 334,
    "kanji": "牛乳",
    "reading": "ぎゅうにゅう",
    "meaning": "Susu Sapi",
    "tier": "shokyuu1",
    "lesson": 12,
    "jpn": "牛乳",
    "ind": "Susu Sapi"
  },
  {
    "id": 335,
    "kanji": "豚肉",
    "reading": "ぶたにく",
    "meaning": "Daging Babi",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "豚肉",
    "ind": "Daging Babi"
  },
  {
    "id": 336,
    "kanji": "皿",
    "reading": "さら",
    "meaning": "Piring",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "皿",
    "ind": "Piring"
  },
  {
    "id": 337,
    "kanji": "売る",
    "reading": "うる",
    "meaning": "Menjual",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "売る",
    "ind": "Menjual"
  },
  {
    "id": 338,
    "kanji": "持って行く",
    "reading": "もっていく",
    "meaning": "Membawa Pergi",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "持って行く",
    "ind": "Membawa Pergi"
  },
  {
    "id": 339,
    "kanji": "卵",
    "reading": "たまご",
    "meaning": "Telur",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "卵",
    "ind": "Telur"
  },
  {
    "id": 340,
    "kanji": "料理",
    "reading": "りょうり",
    "meaning": "Masakan",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "料理",
    "ind": "Masakan"
  },
  {
    "id": 341,
    "kanji": "理由",
    "reading": "りゆう",
    "meaning": "Alasan",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "理由",
    "ind": "Alasan"
  },
  {
    "id": 342,
    "kanji": "お湯",
    "reading": "おゆ",
    "meaning": "Air Panas",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "お湯",
    "ind": "Air Panas"
  },
  {
    "id": 343,
    "kanji": "調べる",
    "reading": "しらべる",
    "meaning": "Mencari/Menyelidiki",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "調べる",
    "ind": "Mencari/Menyelidiki"
  },
  {
    "id": 344,
    "kanji": "味",
    "reading": "あじ",
    "meaning": "Rasa",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "味",
    "ind": "Rasa"
  },
  {
    "id": 345,
    "kanji": "意味",
    "reading": "いみ",
    "meaning": "Arti",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "意味",
    "ind": "Arti"
  },
  {
    "id": 346,
    "kanji": "甘い",
    "reading": "あまい",
    "meaning": "Manis",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "甘い",
    "ind": "Manis"
  },
  {
    "id": 347,
    "kanji": "辛い",
    "reading": "からい",
    "meaning": "Pedas",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "辛い",
    "ind": "Pedas"
  },
  {
    "id": 348,
    "kanji": "苦手（な）",
    "reading": "にがて（な）",
    "meaning": "Tidak Pandai",
    "tier": "shokyuu1",
    "lesson": 13,
    "jpn": "苦手（な）",
    "ind": "Tidak Pandai"
  },
  {
    "id": 349,
    "kanji": "苦労する",
    "reading": "くろうする",
    "meaning": "Kesulitan (Situasi Sulit)",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "苦労する",
    "ind": "Kesulitan (Situasi Sulit)"
  },
  {
    "id": 350,
    "kanji": "手",
    "reading": "て",
    "meaning": "Tangan",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "手",
    "ind": "Tangan"
  },
  {
    "id": 351,
    "kanji": "歌手",
    "reading": "かしゅ",
    "meaning": "Penyanyi",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "歌手",
    "ind": "Penyanyi"
  },
  {
    "id": 352,
    "kanji": "上手（な）",
    "reading": "じょうず（な）",
    "meaning": "Pandai/Mahir",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "上手（な）",
    "ind": "Pandai/Mahir"
  },
  {
    "id": 353,
    "kanji": "コピー機",
    "reading": "こぴーき",
    "meaning": "Mesin Foto Copy",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "コピー機",
    "ind": "Mesin Foto Copy"
  },
  {
    "id": 354,
    "kanji": "数字",
    "reading": "すうじ",
    "meaning": "Angka",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "数字",
    "ind": "Angka"
  },
  {
    "id": 355,
    "kanji": "机",
    "reading": "つくえ",
    "meaning": "Meja",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "机",
    "ind": "Meja"
  },
  {
    "id": 356,
    "kanji": "都合",
    "reading": "つごう",
    "meaning": "Keadaan",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "都合",
    "ind": "Keadaan"
  },
  {
    "id": 357,
    "kanji": "悪い",
    "reading": "わるい",
    "meaning": "Buruk/Jelek",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "悪い",
    "ind": "Buruk/Jelek"
  },
  {
    "id": 358,
    "kanji": "使う",
    "reading": "つかう",
    "meaning": "Menggunakan/Memakai",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "使う",
    "ind": "Menggunakan/Memakai"
  },
  {
    "id": 359,
    "kanji": "終わる",
    "reading": "おわる",
    "meaning": "Selesai",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "終わる",
    "ind": "Selesai"
  },
  {
    "id": 360,
    "kanji": "お願いします",
    "reading": "おねがいします",
    "meaning": "Mohon Bantuannya",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "お願いします",
    "ind": "Mohon Bantuannya"
  },
  {
    "id": 361,
    "kanji": "氏名",
    "reading": "しめい",
    "meaning": "Nama Lengkap",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "氏名",
    "ind": "Nama Lengkap"
  },
  {
    "id": 362,
    "kanji": "理由",
    "reading": "りゆう",
    "meaning": "Alasan",
    "tier": "shokyuu1",
    "lesson": 14,
    "jpn": "理由",
    "ind": "Alasan"
  },
  {
    "id": 363,
    "kanji": "自由",
    "reading": "じゆう",
    "meaning": "Bebas",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "自由",
    "ind": "Bebas"
  },
  {
    "id": 364,
    "kanji": "連絡先",
    "reading": "れんらくさき",
    "meaning": "Nomor Yang Dapat Di Hubungi (Kontak)",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "連絡先",
    "ind": "Nomor Yang Dapat Di Hubungi (Kontak)"
  },
  {
    "id": 365,
    "kanji": "別に",
    "reading": "べつに",
    "meaning": "Di Pisah",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "別に",
    "ind": "Di Pisah"
  },
  {
    "id": 366,
    "kanji": "特別（な）",
    "reading": "とくべつ（な）",
    "meaning": "Khusus/Spesial",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "特別（な）",
    "ind": "Khusus/Spesial"
  },
  {
    "id": 367,
    "kanji": "税別",
    "reading": "ぜいべつ",
    "meaning": "Belum Termasuk Pajak",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "税別",
    "ind": "Belum Termasuk Pajak"
  },
  {
    "id": 368,
    "kanji": "早く",
    "reading": "はやく",
    "meaning": "Dengan Cepat",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "早く",
    "ind": "Dengan Cepat"
  },
  {
    "id": 369,
    "kanji": "吸う",
    "reading": "すう",
    "meaning": "Menghisap",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "吸う",
    "ind": "Menghisap"
  },
  {
    "id": 370,
    "kanji": "取る",
    "reading": "とる",
    "meaning": "Mengambil",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "取る",
    "ind": "Mengambil"
  },
  {
    "id": 371,
    "kanji": "帰る",
    "reading": "かえる",
    "meaning": "Pulang",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "帰る",
    "ind": "Pulang"
  },
  {
    "id": 372,
    "kanji": "伝える",
    "reading": "つたえる",
    "meaning": "Menyampaikan",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "伝える",
    "ind": "Menyampaikan"
  },
  {
    "id": 373,
    "kanji": "熱",
    "reading": "ねつ",
    "meaning": "Panas",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "熱",
    "ind": "Panas"
  },
  {
    "id": 374,
    "kanji": "薬",
    "reading": "くすり",
    "meaning": "Obat",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "薬",
    "ind": "Obat"
  },
  {
    "id": 375,
    "kanji": "病気",
    "reading": "びょうき",
    "meaning": "Sakit",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "病気",
    "ind": "Sakit"
  },
  {
    "id": 376,
    "kanji": "病院",
    "reading": "びょういん",
    "meaning": "Rumah Sakit",
    "tier": "shokyuu1",
    "lesson": 15,
    "jpn": "病院",
    "ind": "Rumah Sakit"
  },
  {
    "id": 377,
    "kanji": "入院する",
    "reading": "にゅういんする",
    "meaning": "Masuk (dirawat) Di Rumah Sakit",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "入院する",
    "ind": "Masuk (dirawat) Di Rumah Sakit"
  },
  {
    "id": 378,
    "kanji": "医者",
    "reading": "いしゃ",
    "meaning": "Dokter",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "医者",
    "ind": "Dokter"
  },
  {
    "id": 379,
    "kanji": "住所",
    "reading": "じゅうしょ",
    "meaning": "Alamat",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "住所",
    "ind": "Alamat"
  },
  {
    "id": 380,
    "kanji": "住む",
    "reading": "すむ",
    "meaning": "Tinggal",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "住む",
    "ind": "Tinggal"
  },
  {
    "id": 381,
    "kanji": "～才",
    "reading": "～さい",
    "meaning": "～Tahun (Umur)",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "～才",
    "ind": "～Tahun (Umur)"
  },
  {
    "id": 382,
    "kanji": "痛い",
    "reading": "いたい",
    "meaning": "Sakit",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "痛い",
    "ind": "Sakit"
  },
  {
    "id": 383,
    "kanji": "眠い",
    "reading": "ねむい",
    "meaning": "Mengantuk",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "眠い",
    "ind": "Mengantuk"
  },
  {
    "id": 384,
    "kanji": "寝る",
    "reading": "ねる",
    "meaning": "Tidur",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "寝る",
    "ind": "Tidur"
  },
  {
    "id": 385,
    "kanji": "記入する",
    "reading": "きにゅうする",
    "meaning": "Mengisi (Menulis Formulir dll)",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "記入する",
    "ind": "Mengisi (Menulis Formulir dll)"
  },
  {
    "id": 386,
    "kanji": "体",
    "reading": "からだ",
    "meaning": "Tubuh/Badan",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "体",
    "ind": "Tubuh/Badan"
  },
  {
    "id": 387,
    "kanji": "体験",
    "reading": "たいけん",
    "meaning": "Pengalaman",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "体験",
    "ind": "Pengalaman"
  },
  {
    "id": 388,
    "kanji": "顔",
    "reading": "かお",
    "meaning": "Wajah",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "顔",
    "ind": "Wajah"
  },
  {
    "id": 389,
    "kanji": "目",
    "reading": "め",
    "meaning": "Mata",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "目",
    "ind": "Mata"
  },
  {
    "id": 390,
    "kanji": "耳",
    "reading": "みみ",
    "meaning": "Telinga",
    "tier": "shokyuu1",
    "lesson": 16,
    "jpn": "耳",
    "ind": "Telinga"
  },
  {
    "id": 391,
    "kanji": "頭",
    "reading": "あたま",
    "meaning": "Kepala",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "頭",
    "ind": "Kepala"
  },
  {
    "id": 392,
    "kanji": "足",
    "reading": "あし",
    "meaning": "Kaki",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "足",
    "ind": "Kaki"
  },
  {
    "id": 393,
    "kanji": "満足（な）",
    "reading": "まんぞく（な）",
    "meaning": "Puas/Merasa Puas",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "満足（な）",
    "ind": "Puas/Merasa Puas"
  },
  {
    "id": 394,
    "kanji": "起きる",
    "reading": "おきる",
    "meaning": "Bangun",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "起きる",
    "ind": "Bangun"
  },
  {
    "id": 395,
    "kanji": "歩く",
    "reading": "あるく",
    "meaning": "Berjalan",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "歩く",
    "ind": "Berjalan"
  },
  {
    "id": 396,
    "kanji": "走る",
    "reading": "はしる",
    "meaning": "Berlari",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "走る",
    "ind": "Berlari"
  },
  {
    "id": 397,
    "kanji": "運動する",
    "reading": "うんどうする",
    "meaning": "Berolah Raga",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "運動する",
    "ind": "Berolah Raga"
  },
  {
    "id": 398,
    "kanji": "運転",
    "reading": "うんてん",
    "meaning": "Mengemudi",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "運転",
    "ind": "Mengemudi"
  },
  {
    "id": 399,
    "kanji": "兄",
    "reading": "あに",
    "meaning": "Kakak Laki-laki",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "兄",
    "ind": "Kakak Laki-laki"
  },
  {
    "id": 400,
    "kanji": "お兄さん",
    "reading": "おにいさん",
    "meaning": "Kakak Laki-laki",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "お兄さん",
    "ind": "Kakak Laki-laki"
  },
  {
    "id": 401,
    "kanji": "姉",
    "reading": "あね",
    "meaning": "Kakak Perempuan",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "姉",
    "ind": "Kakak Perempuan"
  },
  {
    "id": 402,
    "kanji": "お姉さん",
    "reading": "おねえさん",
    "meaning": "Kakak Perempuan",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "お姉さん",
    "ind": "Kakak Perempuan"
  },
  {
    "id": 403,
    "kanji": "弟",
    "reading": "おとうと",
    "meaning": "Adik Laki-laki",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "弟",
    "ind": "Adik Laki-laki"
  },
  {
    "id": 404,
    "kanji": "妹",
    "reading": "いもうと",
    "meaning": "Adik Perempuan",
    "tier": "shokyuu1",
    "lesson": 17,
    "jpn": "妹",
    "ind": "Adik Perempuan"
  },
  {
    "id": 405,
    "kanji": "夫",
    "reading": "おっと",
    "meaning": "Suami",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "夫",
    "ind": "Suami"
  },
  {
    "id": 406,
    "kanji": "妻",
    "reading": "つま",
    "meaning": "Istri",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "妻",
    "ind": "Istri"
  },
  {
    "id": 407,
    "kanji": "両親",
    "reading": "りょうしん",
    "meaning": "Orang Tua",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "両親",
    "ind": "Orang Tua"
  },
  {
    "id": 408,
    "kanji": "両親",
    "reading": "りょうしん",
    "meaning": "Orang Tua",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "両親",
    "ind": "Orang Tua"
  },
  {
    "id": 409,
    "kanji": "親切（な）",
    "reading": "しんせつ（な）",
    "meaning": "Baik Hati",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "親切（な）",
    "ind": "Baik Hati"
  },
  {
    "id": 410,
    "kanji": "男の子",
    "reading": "おとこのこ",
    "meaning": "Anak Laki-laki",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "男の子",
    "ind": "Anak Laki-laki"
  },
  {
    "id": 411,
    "kanji": "男性",
    "reading": "だんせい",
    "meaning": "Cowok/ Laki-laki",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "男性",
    "ind": "Cowok/ Laki-laki"
  },
  {
    "id": 412,
    "kanji": "女の子",
    "reading": "おんなのこ",
    "meaning": "Anak Perempuan",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "女の子",
    "ind": "Anak Perempuan"
  },
  {
    "id": 413,
    "kanji": "女性",
    "reading": "じょせい",
    "meaning": "Cewek/Perempuan",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "女性",
    "ind": "Cewek/Perempuan"
  },
  {
    "id": 414,
    "kanji": "お祝い",
    "reading": "おいわい",
    "meaning": "Perayaan",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "お祝い",
    "ind": "Perayaan"
  },
  {
    "id": 415,
    "kanji": "誕生日",
    "reading": "たんじょうび",
    "meaning": "Ulang Tahun",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "誕生日",
    "ind": "Ulang Tahun"
  },
  {
    "id": 416,
    "kanji": "結婚",
    "reading": "けっこん",
    "meaning": "Menikah",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "結婚",
    "ind": "Menikah"
  },
  {
    "id": 417,
    "kanji": "時計",
    "reading": "とけい",
    "meaning": "Jam Dinding",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "時計",
    "ind": "Jam Dinding"
  },
  {
    "id": 418,
    "kanji": "会計",
    "reading": "かいけい",
    "meaning": "Total (Bill)",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "会計",
    "ind": "Total (Bill)"
  },
  {
    "id": 419,
    "kanji": "計画",
    "reading": "けいかく",
    "meaning": "Rencana",
    "tier": "shokyuu1",
    "lesson": 18,
    "jpn": "計画",
    "ind": "Rencana"
  },
  {
    "id": 420,
    "kanji": "幸せ（な）",
    "reading": "しあわせ（な）",
    "meaning": "Bahagia",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "幸せ（な）",
    "ind": "Bahagia"
  },
  {
    "id": 421,
    "kanji": "思う",
    "reading": "おもう",
    "meaning": "Berfikir",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "思う",
    "ind": "Berfikir"
  },
  {
    "id": 422,
    "kanji": "選ぶ",
    "reading": "えらぶ",
    "meaning": "Memilih",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "選ぶ",
    "ind": "Memilih"
  },
  {
    "id": 423,
    "kanji": "合格する",
    "reading": "ごうかくする",
    "meaning": "Lulus",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "合格する",
    "ind": "Lulus"
  },
  {
    "id": 424,
    "kanji": "価格",
    "reading": "かかく",
    "meaning": "Harga",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "価格",
    "ind": "Harga"
  },
  {
    "id": 425,
    "kanji": "山",
    "reading": "やま",
    "meaning": "Gunung",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "山",
    "ind": "Gunung"
  },
  {
    "id": 426,
    "kanji": "川",
    "reading": "かわ",
    "meaning": "Sungai",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "川",
    "ind": "Sungai"
  },
  {
    "id": 427,
    "kanji": "海",
    "reading": "うみ",
    "meaning": "Laut",
    "tier": "shokyuu2",
    "lesson": 1,
    "jpn": "海",
    "ind": "Laut"
  },
  {
    "id": 428,
    "kanji": "島",
    "reading": "しま",
    "meaning": "Pulau",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "島",
    "ind": "Pulau"
  },
  {
    "id": 429,
    "kanji": "森",
    "reading": "もり",
    "meaning": "Hutan",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "森",
    "ind": "Hutan"
  },
  {
    "id": 430,
    "kanji": "客",
    "reading": "きゃく",
    "meaning": "Pengunjung",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "客",
    "ind": "Pengunjung"
  },
  {
    "id": 431,
    "kanji": "観光地",
    "reading": "かんこうち",
    "meaning": "Tempat Wisata",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "観光地",
    "ind": "Tempat Wisata"
  },
  {
    "id": 432,
    "kanji": "光る",
    "reading": "ひかる",
    "meaning": "Bersinar",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "光る",
    "ind": "Bersinar"
  },
  {
    "id": 433,
    "kanji": "観光地",
    "reading": "かんこうち",
    "meaning": "Tempat Wisata",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "観光地",
    "ind": "Tempat Wisata"
  },
  {
    "id": 434,
    "kanji": "地震",
    "reading": "じしん",
    "meaning": "Gempa Bumi",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "地震",
    "ind": "Gempa Bumi"
  },
  {
    "id": 435,
    "kanji": "経験",
    "reading": "けいけん",
    "meaning": "Pengalaman",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "経験",
    "ind": "Pengalaman"
  },
  {
    "id": 436,
    "kanji": "体験",
    "reading": "たいけん",
    "meaning": "Pengalaman",
    "tier": "shokyuu2",
    "lesson": 2,
    "jpn": "体験",
    "ind": "Pengalaman"
  },
  {
    "id": 437,
    "kanji": "写真",
    "reading": "しゃしん",
    "meaning": "Foto",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "写真",
    "ind": "Foto"
  },
  {
    "id": 438,
    "kanji": "歌",
    "reading": "うた",
    "meaning": "Lagu",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "歌",
    "ind": "Lagu"
  },
  {
    "id": 439,
    "kanji": "歌手",
    "reading": "かしゅ",
    "meaning": "Penyanyi",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "歌手",
    "ind": "Penyanyi"
  },
  {
    "id": 440,
    "kanji": "長い",
    "reading": "ながい",
    "meaning": "Panjang",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "長い",
    "ind": "Panjang"
  },
  {
    "id": 441,
    "kanji": "店長",
    "reading": "てんちょう",
    "meaning": "Kepala Toko",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "店長",
    "ind": "Kepala Toko"
  },
  {
    "id": 442,
    "kanji": "短い",
    "reading": "みじかい",
    "meaning": "Pendek",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "短い",
    "ind": "Pendek"
  },
  {
    "id": 443,
    "kanji": "立つ",
    "reading": "たつ",
    "meaning": "Berdiri",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "立つ",
    "ind": "Berdiri"
  },
  {
    "id": 444,
    "kanji": "役に立つ",
    "reading": "やくにたつ",
    "meaning": "Bermanfaat",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "役に立つ",
    "ind": "Bermanfaat"
  },
  {
    "id": 445,
    "kanji": "泣く",
    "reading": "なく",
    "meaning": "Menangis",
    "tier": "shokyuu2",
    "lesson": 3,
    "jpn": "泣く",
    "ind": "Menangis"
  },
  {
    "id": 446,
    "kanji": "注文",
    "reading": "ちゅうもん",
    "meaning": "Memesan",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "注文",
    "ind": "Memesan"
  },
  {
    "id": 447,
    "kanji": "文化",
    "reading": "ぶんか",
    "meaning": "Budaya",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "文化",
    "ind": "Budaya"
  },
  {
    "id": 448,
    "kanji": "予約",
    "reading": "よやく",
    "meaning": "Memesan/Booking (Hotel, Restaurant dll)",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "予約",
    "ind": "Memesan/Booking (Hotel, Restaurant dll)"
  },
  {
    "id": 449,
    "kanji": "電話番号",
    "reading": "でんわばんごう",
    "meaning": "Nomor Telepon",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "電話番号",
    "ind": "Nomor Telepon"
  },
  {
    "id": 450,
    "kanji": "ご飯",
    "reading": "ごはん",
    "meaning": "Nasi/Makanan/Hidangan",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "ご飯",
    "ind": "Nasi/Makanan/Hidangan"
  },
  {
    "id": 451,
    "kanji": "牛乳",
    "reading": "ぎゅうにゅう",
    "meaning": "Susu Sapi",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "牛乳",
    "ind": "Susu Sapi"
  },
  {
    "id": 452,
    "kanji": "禁煙",
    "reading": "きんえん",
    "meaning": "Dilarang Merokok",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "禁煙",
    "ind": "Dilarang Merokok"
  },
  {
    "id": 453,
    "kanji": "禁止",
    "reading": "きんし",
    "meaning": "Larangan/Dilarang",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "禁止",
    "ind": "Larangan/Dilarang"
  },
  {
    "id": 454,
    "kanji": "自由",
    "reading": "じゆう",
    "meaning": "Bebas",
    "tier": "shokyuu2",
    "lesson": 4,
    "jpn": "自由",
    "ind": "Bebas"
  },
  {
    "id": 455,
    "kanji": "自然",
    "reading": "しぜん",
    "meaning": "Alam",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "自然",
    "ind": "Alam"
  },
  {
    "id": 456,
    "kanji": "自転車",
    "reading": "じてんしゃ",
    "meaning": "Sepeda",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "自転車",
    "ind": "Sepeda"
  },
  {
    "id": 457,
    "kanji": "事故",
    "reading": "じこ",
    "meaning": "Kecelakaan",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "事故",
    "ind": "Kecelakaan"
  },
  {
    "id": 458,
    "kanji": "自分",
    "reading": "じぶん",
    "meaning": "Diri Sendiri",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "自分",
    "ind": "Diri Sendiri"
  },
  {
    "id": 459,
    "kanji": "自動",
    "reading": "じどう",
    "meaning": "Berpindah",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "自動",
    "ind": "Berpindah"
  },
  {
    "id": 460,
    "kanji": "塩",
    "reading": "しお",
    "meaning": "Garam",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "塩",
    "ind": "Garam"
  },
  {
    "id": 461,
    "kanji": "油",
    "reading": "あぶら",
    "meaning": "Minyak",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "油",
    "ind": "Minyak"
  },
  {
    "id": 462,
    "kanji": "量",
    "reading": "りょう",
    "meaning": "Jumlah",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "量",
    "ind": "Jumlah"
  },
  {
    "id": 463,
    "kanji": "切る",
    "reading": "きる",
    "meaning": "Memotong",
    "tier": "shokyuu2",
    "lesson": 5,
    "jpn": "切る",
    "ind": "Memotong"
  },
  {
    "id": 464,
    "kanji": "親切（な）",
    "reading": "しんせつ（な）",
    "meaning": "Baik Hati",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "親切（な）",
    "ind": "Baik Hati"
  },
  {
    "id": 465,
    "kanji": "大切（な）",
    "reading": "たいせつ（な）",
    "meaning": "Penting/Berharga",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "大切（な）",
    "ind": "Penting/Berharga"
  },
  {
    "id": 466,
    "kanji": "焼く",
    "reading": "やく",
    "meaning": "Memanggang",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "焼く",
    "ind": "Memanggang"
  },
  {
    "id": 467,
    "kanji": "自然",
    "reading": "しぜん",
    "meaning": "Alam",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "自然",
    "ind": "Alam"
  },
  {
    "id": 468,
    "kanji": "交通",
    "reading": "こうつう",
    "meaning": "Lalu Lintas",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "交通",
    "ind": "Lalu Lintas"
  },
  {
    "id": 469,
    "kanji": "交通",
    "reading": "こうつう",
    "meaning": "Lalu Lintas",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "交通",
    "ind": "Lalu Lintas"
  },
  {
    "id": 470,
    "kanji": "普通",
    "reading": "ふつう",
    "meaning": "Biasa",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "普通",
    "ind": "Biasa"
  },
  {
    "id": 471,
    "kanji": "船",
    "reading": "ふね",
    "meaning": "Kapal Laut",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "船",
    "ind": "Kapal Laut"
  },
  {
    "id": 472,
    "kanji": "運転",
    "reading": "うんてん",
    "meaning": "Mengemudi",
    "tier": "shokyuu2",
    "lesson": 6,
    "jpn": "運転",
    "ind": "Mengemudi"
  },
  {
    "id": 473,
    "kanji": "東京",
    "reading": "とうきょう",
    "meaning": "Tokyo",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "東京",
    "ind": "Tokyo"
  },
  {
    "id": 474,
    "kanji": "遊ぶ",
    "reading": "あそぶ",
    "meaning": "Bermain",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "遊ぶ",
    "ind": "Bermain"
  },
  {
    "id": 475,
    "kanji": "出発する",
    "reading": "しゅっぱつする",
    "meaning": "Keberangkatan",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "出発する",
    "ind": "Keberangkatan"
  },
  {
    "id": 476,
    "kanji": "事故",
    "reading": "じこ",
    "meaning": "Kecelakaan",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "事故",
    "ind": "Kecelakaan"
  },
  {
    "id": 477,
    "kanji": "故障",
    "reading": "こしょう",
    "meaning": "Rusak",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "故障",
    "ind": "Rusak"
  },
  {
    "id": 478,
    "kanji": "週末",
    "reading": "しゅうまつ",
    "meaning": "Akhir Pekan",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "週末",
    "ind": "Akhir Pekan"
  },
  {
    "id": 479,
    "kanji": "絵",
    "reading": "え",
    "meaning": "Gambar/Lukisan",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "絵",
    "ind": "Gambar/Lukisan"
  },
  {
    "id": 480,
    "kanji": "空",
    "reading": "そら",
    "meaning": "Langit",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "空",
    "ind": "Langit"
  },
  {
    "id": 481,
    "kanji": "泳ぐ",
    "reading": "およぐ",
    "meaning": "Berenang",
    "tier": "shokyuu2",
    "lesson": 7,
    "jpn": "泳ぐ",
    "ind": "Berenang"
  },
  {
    "id": 482,
    "kanji": "到着する",
    "reading": "とうちゃくする",
    "meaning": "Kedatangan",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "到着する",
    "ind": "Kedatangan"
  },
  {
    "id": 483,
    "kanji": "お知らせ",
    "reading": "おしらせ",
    "meaning": "Pengumuman",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "お知らせ",
    "ind": "Pengumuman"
  },
  {
    "id": 484,
    "kanji": "工事",
    "reading": "こうじ",
    "meaning": "Pekerjaan Kontruksi",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "工事",
    "ind": "Pekerjaan Kontruksi"
  },
  {
    "id": 485,
    "kanji": "条件",
    "reading": "じょうけん",
    "meaning": "Syarat/Kondisi",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "条件",
    "ind": "Syarat/Kondisi"
  },
  {
    "id": 486,
    "kanji": "～以上",
    "reading": "～いじょう",
    "meaning": "～Lebih",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "～以上",
    "ind": "～Lebih"
  },
  {
    "id": 487,
    "kanji": "開く",
    "reading": "ひらく",
    "meaning": "Membuka",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "開く",
    "ind": "Membuka"
  },
  {
    "id": 488,
    "kanji": "開く",
    "reading": "あく",
    "meaning": "Terbuka",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "開く",
    "ind": "Terbuka"
  },
  {
    "id": 489,
    "kanji": "生産する",
    "reading": "せいさんする",
    "meaning": "Memproduksi",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "生産する",
    "ind": "Memproduksi"
  },
  {
    "id": 490,
    "kanji": "世界",
    "reading": "せかい",
    "meaning": "Dunia",
    "tier": "shokyuu2",
    "lesson": 8,
    "jpn": "世界",
    "ind": "Dunia"
  },
  {
    "id": 491,
    "kanji": "紙",
    "reading": "かみ",
    "meaning": "Kertas",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "紙",
    "ind": "Kertas"
  },
  {
    "id": 492,
    "kanji": "始まる",
    "reading": "はじまる",
    "meaning": "Mulai",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "始まる",
    "ind": "Mulai"
  },
  {
    "id": 493,
    "kanji": "申し込む",
    "reading": "もうしこむ",
    "meaning": "Mendaftar",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "申し込む",
    "ind": "Mendaftar"
  },
  {
    "id": 494,
    "kanji": "文化",
    "reading": "ぶんか",
    "meaning": "Budaya",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "文化",
    "ind": "Budaya"
  },
  {
    "id": 495,
    "kanji": "祭り",
    "reading": "まつり",
    "meaning": "Perayaan/Festival",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "祭り",
    "ind": "Perayaan/Festival"
  },
  {
    "id": 496,
    "kanji": "正月",
    "reading": "しょうがつ",
    "meaning": "Tahun Baru",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "正月",
    "ind": "Tahun Baru"
  },
  {
    "id": 497,
    "kanji": "～式",
    "reading": "～しき",
    "meaning": "Perayaan～",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "～式",
    "ind": "Perayaan～"
  },
  {
    "id": 498,
    "kanji": "米",
    "reading": "こめ",
    "meaning": "Beras",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "米",
    "ind": "Beras"
  },
  {
    "id": 499,
    "kanji": "特別（な）",
    "reading": "とくべつ（な）",
    "meaning": "Khusus/Spesial",
    "tier": "shokyuu2",
    "lesson": 9,
    "jpn": "特別（な）",
    "ind": "Khusus/Spesial"
  },
  {
    "id": 500,
    "kanji": "特に",
    "reading": "とくに",
    "meaning": "Khususnya",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "特に",
    "ind": "Khususnya"
  },
  {
    "id": 501,
    "kanji": "服",
    "reading": "ふく",
    "meaning": "Baju",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "服",
    "ind": "Baju"
  },
  {
    "id": 502,
    "kanji": "袋",
    "reading": "ふくろ",
    "meaning": "Kantong",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "袋",
    "ind": "Kantong"
  },
  {
    "id": 503,
    "kanji": "全員",
    "reading": "ぜんいん",
    "meaning": "Semua Orang",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "全員",
    "ind": "Semua Orang"
  },
  {
    "id": 504,
    "kanji": "店員",
    "reading": "てんいん",
    "meaning": "Pegawai Toko",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "店員",
    "ind": "Pegawai Toko"
  },
  {
    "id": 505,
    "kanji": "習慣",
    "reading": "しゅうかん",
    "meaning": "Kebiasaan/Adat Istiadat",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "習慣",
    "ind": "Kebiasaan/Adat Istiadat"
  },
  {
    "id": 506,
    "kanji": "慣れる",
    "reading": "なれる",
    "meaning": "Terbiasa",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "慣れる",
    "ind": "Terbiasa"
  },
  {
    "id": 507,
    "kanji": "普通",
    "reading": "ふつう",
    "meaning": "Biasa",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "普通",
    "ind": "Biasa"
  },
  {
    "id": 508,
    "kanji": "暗い",
    "reading": "くらい",
    "meaning": "Gelap",
    "tier": "shokyuu2",
    "lesson": 10,
    "jpn": "暗い",
    "ind": "Gelap"
  },
  {
    "id": 509,
    "kanji": "怒る",
    "reading": "おこる",
    "meaning": "Marah",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "怒る",
    "ind": "Marah"
  },
  {
    "id": 510,
    "kanji": "色",
    "reading": "いろ",
    "meaning": "Warna",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "色",
    "ind": "Warna"
  },
  {
    "id": 511,
    "kanji": "赤",
    "reading": "あか",
    "meaning": "Merah",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "赤",
    "ind": "Merah"
  },
  {
    "id": 512,
    "kanji": "青",
    "reading": "あお",
    "meaning": "Biru",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "青",
    "ind": "Biru"
  },
  {
    "id": 513,
    "kanji": "黒",
    "reading": "くろ",
    "meaning": "Hitam",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "黒",
    "ind": "Hitam"
  },
  {
    "id": 514,
    "kanji": "白",
    "reading": "しろ",
    "meaning": "Putih",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "白",
    "ind": "Putih"
  },
  {
    "id": 515,
    "kanji": "女性",
    "reading": "じょせい",
    "meaning": "Cewek/Perempuan",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "女性",
    "ind": "Cewek/Perempuan"
  },
  {
    "id": 516,
    "kanji": "男性",
    "reading": "だんせい",
    "meaning": "Cowok/ Laki-laki",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "男性",
    "ind": "Cowok/ Laki-laki"
  },
  {
    "id": 517,
    "kanji": "営業する",
    "reading": "えいぎょうする",
    "meaning": "Membuka/Buka (Bisnis)",
    "tier": "shokyuu2",
    "lesson": 11,
    "jpn": "営業する",
    "ind": "Membuka/Buka (Bisnis)"
  },
  {
    "id": 518,
    "kanji": "営業する",
    "reading": "えいぎょうする",
    "meaning": "Membuka/Buka (Bisnis)",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "営業する",
    "ind": "Membuka/Buka (Bisnis)"
  },
  {
    "id": 519,
    "kanji": "授業",
    "reading": "じゅぎょう",
    "meaning": "Pelajaran",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "授業",
    "ind": "Pelajaran"
  },
  {
    "id": 520,
    "kanji": "卒業する",
    "reading": "そつぎょうする",
    "meaning": "Lulus",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "卒業する",
    "ind": "Lulus"
  },
  {
    "id": 521,
    "kanji": "案内する",
    "reading": "あんないする",
    "meaning": "Memandu (Mengajak Berkeliling)",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "案内する",
    "ind": "Memandu (Mengajak Berkeliling)"
  },
  {
    "id": 522,
    "kanji": "商品",
    "reading": "しょうひん",
    "meaning": "Produk",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "商品",
    "ind": "Produk"
  },
  {
    "id": 523,
    "kanji": "値段",
    "reading": "ねだん",
    "meaning": "Harga",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "値段",
    "ind": "Harga"
  },
  {
    "id": 524,
    "kanji": "価格",
    "reading": "かかく",
    "meaning": "Harga",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "価格",
    "ind": "Harga"
  },
  {
    "id": 525,
    "kanji": "消費税",
    "reading": "しょうひぜい",
    "meaning": "Pajak Makanan",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "消費税",
    "ind": "Pajak Makanan"
  },
  {
    "id": 526,
    "kanji": "消す",
    "reading": "けす",
    "meaning": "Memadamkan/Menghapus",
    "tier": "shokyuu2",
    "lesson": 12,
    "jpn": "消す",
    "ind": "Memadamkan/Menghapus"
  },
  {
    "id": 527,
    "kanji": "税別",
    "reading": "ぜいべつ",
    "meaning": "Belum Termasuk Pajak",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "税別",
    "ind": "Belum Termasuk Pajak"
  },
  {
    "id": 528,
    "kanji": "重い",
    "reading": "おもい",
    "meaning": "Berat",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "重い",
    "ind": "Berat"
  },
  {
    "id": 529,
    "kanji": "軽い",
    "reading": "かるい",
    "meaning": "Ringan",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "軽い",
    "ind": "Ringan"
  },
  {
    "id": 530,
    "kanji": "変わる",
    "reading": "かわる",
    "meaning": "Berubah/Merubah",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "変わる",
    "ind": "Berubah/Merubah"
  },
  {
    "id": 531,
    "kanji": "大変（な）",
    "reading": "たいへん（な）",
    "meaning": "Berat/Sangat",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "大変（な）",
    "ind": "Berat/Sangat"
  },
  {
    "id": 532,
    "kanji": "市",
    "reading": "し",
    "meaning": "Kota",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "市",
    "ind": "Kota"
  },
  {
    "id": 533,
    "kanji": "図書館",
    "reading": "としょかん",
    "meaning": "Perpustakaan",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "図書館",
    "ind": "Perpustakaan"
  },
  {
    "id": 534,
    "kanji": "道具",
    "reading": "どうぐ",
    "meaning": "Alat",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "道具",
    "ind": "Alat"
  },
  {
    "id": 535,
    "kanji": "～点",
    "reading": "～てん",
    "meaning": "Point",
    "tier": "shokyuu2",
    "lesson": 13,
    "jpn": "～点",
    "ind": "Point"
  },
  {
    "id": 536,
    "kanji": "必要（な）",
    "reading": "ひつよう（な）",
    "meaning": "Perlu/Diperlukan",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "必要（な）",
    "ind": "Perlu/Diperlukan"
  },
  {
    "id": 537,
    "kanji": "借りる",
    "reading": "かりる",
    "meaning": "Meminjam",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "借りる",
    "ind": "Meminjam"
  },
  {
    "id": 538,
    "kanji": "返す",
    "reading": "かえす",
    "meaning": "Mengembalikan",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "返す",
    "ind": "Mengembalikan"
  },
  {
    "id": 539,
    "kanji": "閉まる",
    "reading": "しまる",
    "meaning": "Menutup",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "閉まる",
    "ind": "Menutup"
  },
  {
    "id": 540,
    "kanji": "外国",
    "reading": "がいこく",
    "meaning": "Luar Negeri",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "外国",
    "ind": "Luar Negeri"
  },
  {
    "id": 541,
    "kanji": "外",
    "reading": "そと",
    "meaning": "Luar",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "外",
    "ind": "Luar"
  },
  {
    "id": 542,
    "kanji": "情報",
    "reading": "じょうほう",
    "meaning": "Informasi",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "情報",
    "ind": "Informasi"
  },
  {
    "id": 543,
    "kanji": "相談",
    "reading": "そうだん",
    "meaning": "Konsultasi",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "相談",
    "ind": "Konsultasi"
  },
  {
    "id": 544,
    "kanji": "相談",
    "reading": "そうだん",
    "meaning": "Konsultasi",
    "tier": "shokyuu2",
    "lesson": 14,
    "jpn": "相談",
    "ind": "Konsultasi"
  },
  {
    "id": 545,
    "kanji": "質問",
    "reading": "しつもん",
    "meaning": "Pertanyaan",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "質問",
    "ind": "Pertanyaan"
  },
  {
    "id": 546,
    "kanji": "問題",
    "reading": "もんだい",
    "meaning": "Pertanyaan/Masalah",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "問題",
    "ind": "Pertanyaan/Masalah"
  },
  {
    "id": 547,
    "kanji": "窓口",
    "reading": "まどぐち",
    "meaning": "Loket Informasi",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "窓口",
    "ind": "Loket Informasi"
  },
  {
    "id": 548,
    "kanji": "郵便局",
    "reading": "ゆうびんきょく",
    "meaning": "Kantor Pos",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "郵便局",
    "ind": "Kantor Pos"
  },
  {
    "id": 549,
    "kanji": "洗う",
    "reading": "あらう",
    "meaning": "Mencuci",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "洗う",
    "ind": "Mencuci"
  },
  {
    "id": 550,
    "kanji": "入力する",
    "reading": "にゅうりょくする",
    "meaning": "Menginput (Data,Informasi dll)",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "入力する",
    "ind": "Menginput (Data,Informasi dll)"
  },
  {
    "id": 551,
    "kanji": "危険",
    "reading": "きけん",
    "meaning": "Berbahaya",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "危険",
    "ind": "Berbahaya"
  },
  {
    "id": 552,
    "kanji": "危ない",
    "reading": "あぶない",
    "meaning": "Berbahaya",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "危ない",
    "ind": "Berbahaya"
  },
  {
    "id": 553,
    "kanji": "危険",
    "reading": "きけん",
    "meaning": "Berbahaya",
    "tier": "shokyuu2",
    "lesson": 15,
    "jpn": "危険",
    "ind": "Berbahaya"
  },
  {
    "id": 554,
    "kanji": "～種類",
    "reading": "～しゅるい",
    "meaning": "～Macam/Jenis/Model",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "～種類",
    "ind": "～Macam/Jenis/Model"
  },
  {
    "id": 555,
    "kanji": "捨てる",
    "reading": "すてる",
    "meaning": "Membuang",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "捨てる",
    "ind": "Membuang"
  },
  {
    "id": 556,
    "kanji": "燃える",
    "reading": "もえる",
    "meaning": "Membakar",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "燃える",
    "ind": "Membakar"
  },
  {
    "id": 557,
    "kanji": "決める",
    "reading": "きめる",
    "meaning": "Memutuskan",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "決める",
    "ind": "Memutuskan"
  },
  {
    "id": 558,
    "kanji": "地震",
    "reading": "じしん",
    "meaning": "Gempa Bumi",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "地震",
    "ind": "Gempa Bumi"
  },
  {
    "id": 559,
    "kanji": "台風",
    "reading": "たいふう",
    "meaning": "Topan",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "台風",
    "ind": "Topan"
  },
  {
    "id": 560,
    "kanji": "声",
    "reading": "こえ",
    "meaning": "Suara (Yang Berasal Dari Mulut)",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "声",
    "ind": "Suara (Yang Berasal Dari Mulut)"
  },
  {
    "id": 561,
    "kanji": "心配（な）",
    "reading": "しんぱい（な）",
    "meaning": "Cemas",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "心配（な）",
    "ind": "Cemas"
  },
  {
    "id": 562,
    "kanji": "集まる",
    "reading": "あつまる",
    "meaning": "Berkumpul",
    "tier": "shokyuu2",
    "lesson": 16,
    "jpn": "集まる",
    "ind": "Berkumpul"
  },
  {
    "id": 563,
    "kanji": "募集",
    "reading": "ぼしゅう",
    "meaning": "Merekrut (Pekerjaan)",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "募集",
    "ind": "Merekrut (Pekerjaan)"
  },
  {
    "id": 564,
    "kanji": "進む",
    "reading": "すすむ",
    "meaning": "(Pindah) Maju",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "進む",
    "ind": "(Pindah) Maju"
  },
  {
    "id": 565,
    "kanji": "最近",
    "reading": "さいきん",
    "meaning": "Akhir-akhir ini",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "最近",
    "ind": "Akhir-akhir ini"
  },
  {
    "id": 566,
    "kanji": "授業",
    "reading": "じゅぎょう",
    "meaning": "Pelajaran",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "授業",
    "ind": "Pelajaran"
  },
  {
    "id": 567,
    "kanji": "問題",
    "reading": "もんだい",
    "meaning": "Pertanyaan/Masalah",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "問題",
    "ind": "Pertanyaan/Masalah"
  },
  {
    "id": 568,
    "kanji": "困る",
    "reading": "こまる",
    "meaning": "Kesulitan/Kerepotan",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "困る",
    "ind": "Kesulitan/Kerepotan"
  },
  {
    "id": 569,
    "kanji": "違う",
    "reading": "ちがう",
    "meaning": "Berbeda/Salah",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "違う",
    "ind": "Berbeda/Salah"
  },
  {
    "id": 570,
    "kanji": "増える",
    "reading": "ふえる",
    "meaning": "Bertambah/Membludak",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "増える",
    "ind": "Bertambah/Membludak"
  },
  {
    "id": 571,
    "kanji": "笑う",
    "reading": "わらう",
    "meaning": "Tertawa",
    "tier": "shokyuu2",
    "lesson": 17,
    "jpn": "笑う",
    "ind": "Tertawa"
  },
  {
    "id": 572,
    "kanji": "苦労する",
    "reading": "くろうする",
    "meaning": "Kesulitan (Situasi Sulit)",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "苦労する",
    "ind": "Kesulitan (Situasi Sulit)"
  },
  {
    "id": 573,
    "kanji": "希望",
    "reading": "きぼう",
    "meaning": "Harapan",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "希望",
    "ind": "Harapan"
  },
  {
    "id": 574,
    "kanji": "募集",
    "reading": "ぼしゅう",
    "meaning": "Merekrut (Pekerjaan)",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "募集",
    "ind": "Merekrut (Pekerjaan)"
  },
  {
    "id": 575,
    "kanji": "建てる",
    "reading": "たてる",
    "meaning": "Mendirikan/Membangun",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "建てる",
    "ind": "Mendirikan/Membangun"
  },
  {
    "id": 576,
    "kanji": "続ける",
    "reading": "つづける",
    "meaning": "Melanjutkan",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "続ける",
    "ind": "Melanjutkan"
  },
  {
    "id": 577,
    "kanji": "考える",
    "reading": "かんがえる",
    "meaning": "Berfikir",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "考える",
    "ind": "Berfikir"
  },
  {
    "id": 578,
    "kanji": "役に立つ",
    "reading": "やくにたつ",
    "meaning": "Bermanfaat",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "役に立つ",
    "ind": "Bermanfaat"
  },
  {
    "id": 579,
    "kanji": "卒業する",
    "reading": "そつぎょうする",
    "meaning": "Lulus",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "卒業する",
    "ind": "Lulus"
  },
  {
    "id": 580,
    "kanji": "留学する",
    "reading": "りゅうがくする",
    "meaning": "Belajar Di Luar Negeri",
    "tier": "shokyuu2",
    "lesson": 18,
    "jpn": "留学する",
    "ind": "Belajar Di Luar Negeri"
  }
];

// Helper to get items per tier
export const KANJI_TIERS = {
  nyuumon: {
    id: 'nyuumon',
    name: '入門 (Nyuumon / Starter)',
    badge: 'N5 Dasar',
    icon: '🌱',
    desc: 'Bab 3 - 18 (167 Kanji dasar)',
    items: IRODORI_KANJI_LIST.filter(k => k.tier === 'nyuumon'),
  },
  shokyuu1: {
    id: 'shokyuu1',
    name: '初級1 (Shokyuu 1 / Elementary 1)',
    badge: 'N5-N4',
    icon: '⚡',
    desc: 'Bab 1 - 18 (252 Kanji sehari-hari)',
    items: IRODORI_KANJI_LIST.filter(k => k.tier === 'shokyuu1'),
  },
  shokyuu2: {
    id: 'shokyuu2',
    name: '初級2 (Shokyuu 2 / Elementary 2)',
    badge: 'N4 Mahir',
    icon: '👑',
    desc: 'Bab 1 - 18 (161 Kanji praktis kerja & hidup)',
    items: IRODORI_KANJI_LIST.filter(k => k.tier === 'shokyuu2'),
  },
};

// 20-word chunked levels for bite-sized structured mastery (29 levels in total)
export const KANJI_LEVEL_CHUNKS: { [key: number]: { name: string; tier: string; items: KanjiVocabItem[]; icon: string } } = {};
const CHUNK_SIZE = 20;
for (let i = 0; i < IRODORI_KANJI_LIST.length; i += CHUNK_SIZE) {
  const levelNum = Math.floor(i / CHUNK_SIZE) + 1;
  const chunk = IRODORI_KANJI_LIST.slice(i, i + CHUNK_SIZE);
  const sampleTier = chunk[0].tier;
  const tierName = sampleTier === 'nyuumon' ? '入門' : sampleTier === 'shokyuu1' ? '初級1' : '初級2';
  const startId = chunk[0].id;
  const endId = chunk[chunk.length - 1].id;
  KANJI_LEVEL_CHUNKS[levelNum] = {
    name: `Kanji ${startId}-${endId} (${tierName})`,
    tier: sampleTier,
    items: chunk,
    icon: sampleTier === 'nyuumon' ? '🌱' : sampleTier === 'shokyuu1' ? '⚡' : '👑',
  };
}
