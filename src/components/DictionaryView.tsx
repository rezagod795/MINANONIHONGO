import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Search,
  Volume2,
  Star,
  User,
  Users,
  Sun,
  UserCheck,
  Building2,
  Car,
  Trees,
  Utensils,
  Coffee,
  Sparkles,
  ShoppingBag,
  Clock,
  Calendar,
  Briefcase,
  Plane,
  Train,
  ChevronDown
} from 'lucide-react';
import { VocabItem } from '../types';
import { IRODORI_KANJI_LIST } from '../data/kanji_data';

interface DictionaryViewProps {
  darkMode: boolean;
  levelsData: Record<number, any>;
  onBack: () => void;
  onOpenMenu?: () => void;
  onStartStudy?: () => void;
  onStartFavoritesQuiz?: () => void;
  speakJapanese: (text: string) => void;
  isFavorited: (item: VocabItem) => boolean;
  toggleFavorite: (item: VocabItem) => void;
  playSfx: (sound: 'click' | 'correct' | 'wrong' | 'levelup' | 'win') => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export type UnifiedDictItem = {
  id: string;
  type: 'vocab' | 'kanji';
  jpn: string;
  reading?: string;
  ind: string;
  levelNum: number;
  levelName: string;
  levelBadge: string;
  searchStr: string;
};

// Static pre-indexed Kanji items created once in memory
const STATIC_KANJI_ITEMS: UnifiedDictItem[] = IRODORI_KANJI_LIST.map((k) => ({
  id: `kanji-${k.id}`,
  type: 'kanji',
  jpn: k.kanji,
  reading: k.reading || '',
  ind: k.meaning || '',
  levelNum: k.lesson || 1,
  levelName: `Kanji Bab ${k.lesson}`,
  levelBadge: `Lv.${Math.min(Math.ceil((k.lesson || 1) / 4), 5)}`,
  searchStr: `${k.kanji} ${k.reading || ''} ${k.meaning || ''}`.toLowerCase(),
}));

// Number gradients cycling
const NUMBER_GRADIENTS = [
  'from-pink-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-sky-400 to-blue-600',
  'from-teal-400 to-emerald-600',
  'from-amber-400 to-orange-500',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-green-600',
];

// Helper to determine appropriate icon and gradient box
function getDictItemVisual(item: UnifiedDictItem): {
  iconType: string;
  bgGradient: string;
} {
  const jpn = item.jpn;
  const ind = item.ind.toLowerCase();

  if (jpn.includes('わたし') || jpn.includes('私') || ind.includes('saya') || ind.includes('aku')) {
    return { iconType: 'user', bgGradient: 'from-pink-500 to-rose-500' };
  }
  if (jpn.includes('あなた') || jpn.includes('貴方') || ind.includes('anda') || ind.includes('kamu')) {
    return { iconType: 'users', bgGradient: 'from-blue-500 to-indigo-600' };
  }
  if (jpn.includes('あのひと') || jpn.includes('あの方') || ind.includes('orang itu') || ind.includes('dia')) {
    return { iconType: 'sun', bgGradient: 'from-cyan-400 to-blue-500' };
  }
  if (jpn.includes('さん') || jpn.includes('ちゃん') || jpn.includes('くん') || ind.includes('tuan') || ind.includes('nyonya')) {
    return { iconType: 'usercheck', bgGradient: 'from-emerald-400 to-teal-500' };
  }
  if (jpn.includes('いえ') || jpn.includes('家') || jpn.includes('うち') || ind.includes('rumah') || ind.includes('gedung')) {
    return { iconType: 'building', bgGradient: 'from-amber-400 to-orange-500' };
  }
  if (jpn.includes('くるま') || jpn.includes('車') || ind.includes('mobil') || ind.includes('kendaraan')) {
    return { iconType: 'car', bgGradient: 'from-purple-500 to-fuchsia-600' };
  }
  if (jpn.includes('き') || jpn.includes('木') || ind.includes('pohon') || ind.includes('kayu') || ind.includes('hutan')) {
    return { iconType: 'trees', bgGradient: 'from-emerald-500 to-green-600' };
  }
  if (ind.includes('makan') || ind.includes('makanan') || ind.includes('nasi') || ind.includes('roti') || jpn.includes('たべ')) {
    return { iconType: 'utensils', bgGradient: 'from-orange-500 to-amber-600' };
  }
  if (ind.includes('minum') || ind.includes('kopi') || ind.includes('teh') || ind.includes('air') || jpn.includes('の')) {
    return { iconType: 'coffee', bgGradient: 'from-amber-600 to-stone-600' };
  }
  if (ind.includes('sekolah') || ind.includes('buku') || ind.includes('belajar') || jpn.includes('がっこう') || jpn.includes('ほん')) {
    return { iconType: 'book', bgGradient: 'from-indigo-500 to-blue-600' };
  }
  if (ind.includes('waktu') || ind.includes('jam') || ind.includes('menit') || ind.includes('sekarang') || jpn.includes('いま')) {
    return { iconType: 'clock', bgGradient: 'from-sky-500 to-indigo-500' };
  }
  if (ind.includes('hari') || ind.includes('besok') || ind.includes('kemarin') || ind.includes('minggu') || ind.includes('bulan')) {
    return { iconType: 'calendar', bgGradient: 'from-teal-500 to-emerald-600' };
  }
  if (ind.includes('pesawat') || ind.includes('terbang') || jpn.includes('ひこうき')) {
    return { iconType: 'plane', bgGradient: 'from-sky-400 to-blue-600' };
  }
  if (ind.includes('kereta') || jpn.includes('でんしゃ')) {
    return { iconType: 'train', bgGradient: 'from-blue-600 to-cyan-700' };
  }
  if (ind.includes('kantor') || ind.includes('kerja') || ind.includes('perusahaan') || jpn.includes('かいしゃ')) {
    return { iconType: 'briefcase', bgGradient: 'from-slate-600 to-slate-800' };
  }
  if (ind.includes('toko') || ind.includes('belanja') || ind.includes('beli') || jpn.includes('みせ')) {
    return { iconType: 'shop', bgGradient: 'from-rose-500 to-pink-600' };
  }
  if (item.type === 'kanji') {
    return { iconType: 'sparkles', bgGradient: 'from-purple-600 to-indigo-700' };
  }

  return { iconType: 'sparkles', bgGradient: 'from-sky-500 to-indigo-600' };
}

function renderVisualIcon(iconType: string) {
  switch (iconType) {
    case 'user': return <User className="w-5 h-5 text-white" />;
    case 'users': return <Users className="w-5 h-5 text-white" />;
    case 'sun': return <Sun className="w-5 h-5 text-white" />;
    case 'usercheck': return <UserCheck className="w-5 h-5 text-white" />;
    case 'building': return <Building2 className="w-5 h-5 text-white" />;
    case 'car': return <Car className="w-5 h-5 text-white" />;
    case 'trees': return <Trees className="w-5 h-5 text-white" />;
    case 'utensils': return <Utensils className="w-5 h-5 text-white" />;
    case 'coffee': return <Coffee className="w-5 h-5 text-white" />;
    case 'book': return <BookOpen className="w-5 h-5 text-white" />;
    case 'clock': return <Clock className="w-5 h-5 text-white" />;
    case 'calendar': return <Calendar className="w-5 h-5 text-white" />;
    case 'plane': return <Plane className="w-5 h-5 text-white" />;
    case 'train': return <Train className="w-5 h-5 text-white" />;
    case 'briefcase': return <Briefcase className="w-5 h-5 text-white" />;
    case 'shop': return <ShoppingBag className="w-5 h-5 text-white" />;
    default: return <Sparkles className="w-5 h-5 text-white" />;
  }
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  levelsData,
  onBack,
  onOpenMenu,
  onStartStudy,
  speakJapanese,
  isFavorited,
  toggleFavorite,
  playSfx,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'vocab' | 'kanji'>('vocab');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBottomNav, setActiveBottomNav] = useState<'study' | 'list' | 'favorites'>('list');
  const [visibleCount, setVisibleCount] = useState<number>(35);

  // Build unified list of vocabulary and kanji
  const allItems: UnifiedDictItem[] = useMemo(() => {
    const list: UnifiedDictItem[] = [];

    const levelKeys = Object.keys(levelsData);
    for (let i = 0; i < levelKeys.length; i++) {
      const lNum = Number(levelKeys[i]);
      const lData = levelsData[lNum];
      if (lData && lData.vocab) {
        const vocabList = lData.vocab;
        for (let vIdx = 0; vIdx < vocabList.length; vIdx++) {
          const v = vocabList[vIdx];
          list.push({
            id: `vocab-${lNum}-${vIdx}`,
            type: 'vocab',
            jpn: v.jpn,
            reading: v.reading || '',
            ind: v.ind,
            levelNum: lNum,
            levelName: `Level ${lNum}`,
            levelBadge: `Lv.${lNum}`,
            searchStr: `${v.jpn} ${v.reading || ''} ${v.ind}`.toLowerCase(),
          });
        }
      }
    }

    return [...list, ...STATIC_KANJI_ITEMS];
  }, [levelsData]);

  // Filter items based on tab, bottom navigation, and search query
  const filteredItems = useMemo(() => {
    let result = allItems;

    // Bottom nav "favorites" filter
    if (activeBottomNav === 'favorites') {
      result = result.filter((item) => isFavorited({ jpn: item.jpn, ind: item.ind }));
    } else {
      // Tab filter
      if (activeTab === 'vocab') {
        result = result.filter((item) => item.type === 'vocab');
      } else if (activeTab === 'kanji') {
        result = result.filter((item) => item.type === 'kanji');
      }
    }

    // Search query filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter((item) => item.searchStr.includes(q));
    }

    return result;
  }, [allItems, activeTab, activeBottomNav, searchQuery, isFavorited]);

  // Reset pagination on filter or tab change
  const handleTabChange = useCallback((tab: 'all' | 'vocab' | 'kanji') => {
    setActiveTab(tab);
    setActiveBottomNav('list');
    setVisibleCount(35);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(35);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      if (visibleCount < filteredItems.length) {
        setVisibleCount((prev) => Math.min(prev + 35, filteredItems.length));
      }
    }
  };

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  return (
    <div
      className="max-w-[430px] w-full rounded-[44px] shadow-2xl relative z-10 overflow-hidden border border-sky-500/30 flex flex-col h-[90vh] max-h-[860px] bg-[#051124] text-white select-none"
      style={{
        boxShadow: '0 20px 60px -10px rgba(2, 6, 23, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
      }}
    >
      {/* 1. SCENIC JAPANESE HEADER BACKGROUND */}
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-gradient-to-b from-[#0a1f44] to-[#051124]">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=75"
          alt="Scenic Torii & Mount Fuji"
          className="w-full h-full object-cover object-center scale-105 opacity-85"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Traditional Japanese Overlay Visual Enhancements */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f44]/40 via-transparent to-[#051124]" />
        <div className="absolute inset-0 bg-sky-950/20 mix-blend-multiply" />

        {/* Sakura Blossom Petals on Top-Left */}
        <div className="absolute top-2 left-2 text-2xl pointer-events-none opacity-90 animate-pulse">
          🌸
        </div>
        <div className="absolute top-8 left-8 text-sm pointer-events-none opacity-80">
          🌸
        </div>
        <div className="absolute top-4 right-16 text-lg pointer-events-none opacity-70">
          ⛩️
        </div>

        {/* TOP BAR: Back Button, Title Badge, and Menu */}
        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-20">
          {/* Back Button */}
          <button
            id="dict-btn-back"
            onClick={() => {
              playSfx('click');
              onBack();
            }}
            className="w-10 h-10 rounded-full bg-[#0a1f44]/80 hover:bg-[#122e60] active:scale-95 text-white border border-white/25 backdrop-blur-md flex items-center justify-center shadow-lg transition-all cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5 text-white stroke-[2.5]" />
          </button>

          {/* Title Header with Fuji/Torii App Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-white/95 p-1 flex items-center justify-center shadow-md border border-white/60 overflow-hidden shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-b from-sky-400 via-rose-300 to-rose-500 flex flex-col items-center justify-center text-xs relative overflow-hidden">
                <span className="text-sm leading-none">🗻</span>
                <span className="text-[9px] leading-none mt-0.5 font-black text-white">⛩️</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-base font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                Kamus Mini & Kanji 580
              </h1>
              <p className="text-[11px] font-bold text-sky-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight">
                Cari kosakata & 580 kanji Irodori
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <button
            id="dict-btn-menu"
            onClick={() => {
              playSfx('click');
              if (onOpenMenu) {
                onOpenMenu();
              } else {
                onBack();
              }
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#0a1f44]/80 hover:bg-[#122e60] active:scale-95 text-white border border-white/25 backdrop-blur-md flex items-center gap-1.5 text-xs font-bold shadow-lg transition-all cursor-pointer"
            title="Buka Menu"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-300" />
            <span>Menu</span>
          </button>
        </div>

        {/* CATEGORY TABS (Semua, Kosakata (Mini), Kanji 580) */}
        <div className="absolute bottom-3 left-0 right-0 px-4 flex items-center justify-center gap-2 z-20">
          {/* 1. Tab Semua */}
          <button
            id="dict-tab-semua"
            onClick={() => {
              playSfx('click');
              handleTabChange('all');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-pointer ${
              activeTab === 'all' && activeBottomNav !== 'favorites'
                ? 'bg-gradient-to-r from-[#ff3366] to-[#ff5e62] text-white ring-2 ring-white/30 scale-105'
                : 'bg-[#091b38]/85 text-sky-100 border border-sky-400/30 hover:border-sky-300/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua</span>
          </button>

          {/* 2. Tab Kosakata (Mini) */}
          <button
            id="dict-tab-kosakata"
            onClick={() => {
              playSfx('click');
              handleTabChange('vocab');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-pointer ${
              activeTab === 'vocab' && activeBottomNav !== 'favorites'
                ? 'bg-gradient-to-r from-[#ff3366] to-[#ff5e62] text-white ring-2 ring-white/30 scale-105'
                : 'bg-[#091b38]/85 text-sky-100 border border-sky-400/30 hover:border-sky-300/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kosakata (Mini)</span>
          </button>

          {/* 3. Tab Kanji 580 */}
          <button
            id="dict-tab-kanji-580"
            onClick={() => {
              playSfx('click');
              handleTabChange('kanji');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-pointer ${
              activeTab === 'kanji' && activeBottomNav !== 'favorites'
                ? 'bg-gradient-to-r from-[#ff3366] to-[#ff5e62] text-white ring-2 ring-white/30 scale-105'
                : 'bg-[#091b38]/85 text-sky-100 border border-sky-400/30 hover:border-sky-300/60'
            }`}
          >
            <span className="font-japanese text-[11px] font-black">🈁</span>
            <span>Kanji 580</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="px-4 pt-2 pb-2.5 shrink-0 relative z-20">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sky-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="dict-search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari kata, kanji, arti, atau cara baca..."
            maxLength={100}
            className="w-full pl-11 pr-10 py-2.5 rounded-full bg-[#071732]/90 border border-sky-400/35 text-white placeholder-sky-200/50 text-xs font-semibold focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all shadow-inner backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setVisibleCount(35);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. DICTIONARY ITEMS LIST */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 space-y-2.5 pb-20 no-scrollbar relative contain-paint"
      >
        {filteredItems.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center opacity-70">
            <span className="text-4xl mb-2">🔍</span>
            <p className="text-sm font-black text-sky-200">Kata Tidak Ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba kata penelusuran lainnya atau ubah tab kategori</p>
          </div>
        ) : (
          displayedItems.map((item, index) => {
            const isFav = isFavorited({ jpn: item.jpn, ind: item.ind });
            const visual = getDictItemVisual(item);
            const numGrad = NUMBER_GRADIENTS[index % NUMBER_GRADIENTS.length];
            const isFirst = index === 0;

            return (
              <div
                key={`dict-item-${item.id}-${index}`}
                className={`rounded-[24px] p-2.5 px-3.5 flex items-center gap-3 bg-gradient-to-r from-[#0c224a]/95 via-[#081836]/90 to-[#06142c]/95 border transition-colors shadow-sm ${
                  isFirst
                    ? 'border-pink-500/70 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'border-sky-500/25 hover:border-sky-400/50'
                }`}
              >
                {/* 1. Item Index Number Badge */}
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${numGrad} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}
                >
                  {index + 1}
                </div>

                {/* 2. Item Visual Category Icon Box */}
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${visual.bgGradient} flex items-center justify-center shadow-inner shrink-0`}
                >
                  {renderVisualIcon(visual.iconType)}
                </div>

                {/* 3. Word Text & Romaji */}
                <div className="flex-1 min-w-0 pr-1 text-left">
                  <p
                    className="text-base md:text-lg font-black text-white tracking-tight leading-tight truncate font-japanese"
                    translate="no"
                  >
                    {item.jpn}
                  </p>
                  <p className="text-xs font-semibold text-sky-300/90 leading-tight mt-0.5 truncate" translate="no">
                    {item.reading ? item.reading : item.ind}
                    {item.reading && item.ind && (
                      <span className="text-[11px] font-normal text-slate-400 ml-1.5 opacity-80">
                        • {item.ind}
                      </span>
                    )}
                  </p>
                </div>

                {/* 4. Level Badge Pill */}
                <div className="shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                    {item.levelBadge}
                  </span>
                </div>

                {/* 5. Speaker Pronunciation Button */}
                <button
                  onClick={() => {
                    playSfx('click');
                    speakJapanese(item.jpn);
                  }}
                  className="w-8 h-8 rounded-full bg-[#163568] hover:bg-[#204b90] active:scale-90 text-sky-200 hover:text-white flex items-center justify-center transition-transform shadow-xs shrink-0 cursor-pointer"
                  title="Dengar Lafal"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* 6. Favorite Star Button */}
                <button
                  onClick={() => {
                    playSfx('click');
                    toggleFavorite({ jpn: item.jpn, ind: item.ind });
                    if (showToast) {
                      showToast(isFav ? 'Dihapus dari favorit' : 'Disimpan ke favorit ⭐', isFav ? 'info' : 'success');
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-amber-400 hover:text-amber-300 active:scale-90 transition-transform shrink-0 cursor-pointer"
                  title="Simpan Favorit"
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            );
          })
        )}

        {/* Load More Button for large list */}
        {visibleCount < filteredItems.length && (
          <div className="pt-2 pb-4 text-center">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 40, filteredItems.length))}
              className="px-4 py-2 rounded-full bg-[#0d2652] hover:bg-[#143775] text-sky-200 hover:text-white text-xs font-bold border border-sky-400/30 flex items-center gap-1.5 mx-auto transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Muat Lebih Banyak ({filteredItems.length - visibleCount} tersisa)</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. FLOATING BOTTOM NAVIGATION DOCK (Belajar, Daftar, Favorit) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pb-3 bg-gradient-to-t from-[#020712] via-[#040e22]/95 to-transparent z-30 flex items-center justify-center gap-2.5 border-t border-sky-500/20 backdrop-blur-lg">
        {/* Sakura Petals Left & Right */}
        <div className="absolute left-3 bottom-3 text-lg opacity-80 pointer-events-none">
          🌸
        </div>
        <div className="absolute right-3 bottom-3 text-lg opacity-80 pointer-events-none">
          🌸
        </div>

        {/* 1. Button Belajar */}
        <button
          id="dict-nav-belajar"
          onClick={() => {
            playSfx('click');
            if (onStartStudy) {
              onStartStudy();
            } else {
              onBack();
            }
          }}
          className="px-4 py-2 rounded-full bg-[#0c224a]/90 hover:bg-[#143268] active:scale-95 text-sky-100 border border-sky-400/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-sky-300" />
          <span>Belajar</span>
        </button>

        {/* 2. Button Daftar (Active) */}
        <button
          id="dict-nav-daftar"
          onClick={() => {
            playSfx('click');
            setActiveBottomNav('list');
          }}
          className={`px-5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
            activeBottomNav === 'list'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-pink-500/30 scale-105'
              : 'bg-[#0c224a]/90 text-sky-100 border border-sky-400/30'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Daftar</span>
        </button>

        {/* 3. Button Favorit */}
        <button
          id="dict-nav-favorit"
          onClick={() => {
            playSfx('click');
            if (activeBottomNav === 'favorites') {
              setActiveBottomNav('list');
            } else {
              setActiveBottomNav('favorites');
            }
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
            activeBottomNav === 'favorites'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30 scale-105 font-black'
              : 'bg-[#0c224a]/90 hover:bg-[#143268] active:scale-95 text-sky-100 border border-sky-400/30'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${activeBottomNav === 'favorites' ? 'fill-white' : 'text-amber-400'}`} />
          <span>Favorit</span>
        </button>
      </div>
    </div>
  );
};
