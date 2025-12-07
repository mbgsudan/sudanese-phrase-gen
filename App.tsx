import React, { useState, useCallback, useEffect } from 'react';
import { Category, PhraseData, SavedPhrase } from './types';
import { generateSudanesePhrase, generateSpeech } from './services/geminiService';
import { playBase64Audio } from './services/audioUtils';
import { TabButton } from './components/TabButton';
import { LibraryView } from './components/LibraryView';
import { AddPhraseModal } from './components/AddPhraseModal';
import { 
  MessageCircle, 
  ShoppingBag, 
  Sun, 
  Volume2, 
  Copy, 
  Share2,
  Loader2,
  Quote,
  Heart,
  Book,
  Plus,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'generator' | 'library'>('generator');

  // Generator State
  const [activeCategory, setActiveCategory] = useState<Category>(Category.DAILY);
  const [phraseData, setPhraseData] = useState<PhraseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Library State
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>(() => {
    const saved = localStorage.getItem('sudanese_phrases');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('sudanese_phrases', JSON.stringify(savedPhrases));
  }, [savedPhrases]);

  // Generators
  const handleGenerate = useCallback(async (category: Category = activeCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateSudanesePhrase(category);
      setPhraseData(data);
    } catch (err) {
      setError("معليش، حصلت مشكلة في الاتصال. حاول تاني.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (!phraseData && !loading && view === 'generator') {
        handleGenerate(Category.DAILY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audio Handler
  const handlePlayAudio = async () => {
    if (!phraseData?.arabicText) return;
    
    setAudioLoading(true);
    try {
      const audioBase64 = await generateSpeech(phraseData.arabicText);
      await playBase64Audio(audioBase64);
    } catch (err) {
      console.error("Failed to play audio", err);
      alert("عفواً، الصوت ما شغال حالياً.");
    } finally {
      setAudioLoading(false);
    }
  };

  // Utilities
  const handleCopy = () => {
    if (phraseData) {
      navigator.clipboard.writeText(`${phraseData.arabicText}\n${phraseData.englishTranslation}`);
    }
  };

  const handleSavePhrase = () => {
    if (!phraseData) return;
    const newPhrase: SavedPhrase = {
      ...phraseData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      source: 'generated',
      category: activeCategory
    };
    setSavedPhrases(prev => [newPhrase, ...prev]);
  };

  const handleManualAdd = (data: Omit<SavedPhrase, 'id' | 'timestamp' | 'source'>) => {
    const newPhrase: SavedPhrase = {
      ...data,
      id: Date.now().toString(),
      timestamp: Date.now(),
      source: 'manual'
    };
    setSavedPhrases(prev => [newPhrase, ...prev]);
    // Optional: Switch to library view to see it
    setView('library');
  };

  const handleDeletePhrase = (id: string) => {
    setSavedPhrases(prev => prev.filter(p => p.id !== id));
  };

  const isCurrentPhraseSaved = phraseData && savedPhrases.some(p => p.arabicText === phraseData.arabicText);

  return (
    <div className="min-h-screen bg-stone-50 font-cairo text-stone-900 pb-12">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm/50 backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇸🇩</span>
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">يا زول</h1>
          </div>
          
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setView('generator')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'generator' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              المولد
            </button>
            <button 
              onClick={() => setView('library')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'library' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              مكتبتي
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${view === 'library' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                {savedPhrases.length}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {view === 'generator' ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Text */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800">مولد الجمل السودانية</h2>
              <p className="text-stone-500">اختار الموضوع وخليهو علينا</p>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-3 gap-3">
              <TabButton 
                label="يوميات" 
                category={Category.DAILY} 
                isActive={activeCategory === Category.DAILY} 
                onClick={(c) => { setActiveCategory(c); handleGenerate(c); }}
                icon={<Sun className="w-5 h-5" />}
              />
              <TabButton 
                label="سوق" 
                category={Category.SALES} 
                isActive={activeCategory === Category.SALES} 
                onClick={(c) => { setActiveCategory(c); handleGenerate(c); }}
                icon={<ShoppingBag className="w-5 h-5" />}
              />
              <TabButton 
                label="ونسة" 
                category={Category.CONVERSATION} 
                isActive={activeCategory === Category.CONVERSATION} 
                onClick={(c) => { setActiveCategory(c); handleGenerate(c); }}
                icon={<MessageCircle className="w-5 h-5" />}
              />
            </div>

            {/* Main Generator Card */}
            <div className="relative bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden min-h-[420px] flex flex-col transition-all duration-300">
              
              {/* Decorative Header */}
              <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

              <div className="flex-grow p-8 md:p-10 flex flex-col items-center justify-center text-center">
                
                {loading ? (
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                       <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-stone-600 font-bold text-lg">يا زول دقيقة...</p>
                       <p className="text-stone-400 text-sm">بنفتش ليك في كلام سمح</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-sm">
                    <p className="font-bold mb-2">عفواً</p>
                    <p>{error}</p>
                    <button onClick={() => handleGenerate()} className="mt-4 text-sm font-bold underline">جرب مرة تانية</button>
                  </div>
                ) : phraseData ? (
                  <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Tags */}
                    <div className="mb-6">
                      <span className="inline-block px-4 py-1.5 bg-stone-100 text-stone-500 rounded-full text-xs font-bold tracking-wide border border-stone-200">
                        {phraseData.usageContext}
                      </span>
                    </div>

                    {/* Main Text */}
                    <div className="relative mb-8 group cursor-default">
                      <Quote className="absolute -top-8 -right-4 text-emerald-100 w-20 h-20 transform -scale-x-100 z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                      <h2 className="text-3xl md:text-5xl font-black text-stone-800 leading-tight relative z-10 font-cairo drop-shadow-sm">
                        {phraseData.arabicText}
                      </h2>
                    </div>

                    {/* Translation Details */}
                    <div className="space-y-2 mb-10 bg-stone-50/50 p-4 rounded-xl border border-stone-100/50">
                       <p className="text-emerald-700 font-medium text-lg dir-ltr font-mono tracking-tight opacity-90">
                        /{phraseData.phonetic}/
                      </p>
                      <p className="text-stone-500 font-medium pt-1">
                        {phraseData.englishTranslation}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button 
                        onClick={handlePlayAudio}
                        disabled={audioLoading}
                        className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:shadow-none hover:-translate-y-0.5"
                      >
                        {audioLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                        <span className="font-bold">اسمعها</span>
                      </button>

                      <button 
                        onClick={handleSavePhrase}
                        disabled={!!isCurrentPhraseSaved}
                        className={`
                          flex items-center gap-2 px-5 py-3 rounded-xl transition-all border font-bold
                          ${isCurrentPhraseSaved 
                            ? 'bg-rose-50 text-rose-400 border-rose-100 cursor-default' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50'}
                        `}
                      >
                        <Heart className={`w-5 h-5 ${isCurrentPhraseSaved ? 'fill-rose-400' : ''}`} />
                        <span>{isCurrentPhraseSaved ? 'محفوظة' : 'حفظ'}</span>
                      </button>

                      <button 
                        onClick={handleCopy}
                        className="p-3.5 bg-white text-stone-400 border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-600 transition-colors"
                        title="نسخ"
                      >
                        <Copy className="w-5 h-5" />
                      </button>

                       <button 
                        onClick={() => navigator.share?.({ title: 'Sudanese Phrase', text: phraseData.arabicText })}
                        className="p-3.5 bg-white text-stone-400 border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-600 transition-colors"
                        title="مشاركة"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                ) : null}
              </div>

              {/* Footer Button */}
              <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-center">
                 <button
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-stone-800 text-white px-8 py-4 rounded-xl hover:bg-stone-900 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:bg-stone-300 disabled:shadow-none disabled:active:scale-100"
                >
                  <Sparkles className={`w-5 h-5 ${loading ? 'animate-spin' : 'text-yellow-400'}`} />
                  <span className="font-bold text-lg">
                     {loading ? 'جاري التحضير...' : 'جملة جديدة'}
                  </span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-500">
            {/* Library Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
               <div className="space-y-1">
                 <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
                   <Book className="w-8 h-8 text-emerald-600" />
                   قاموسي
                 </h2>
                 <p className="text-stone-500">الجمل المحفوظة وإضافاتك الخاصة</p>
               </div>
               
               <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg font-bold"
               >
                 <Plus className="w-5 h-5" />
                 <span>أضف جملة خاصة</span>
               </button>
            </div>

            <LibraryView phrases={savedPhrases} onDelete={handleDeletePhrase} />
          </div>
        )}
      </main>

      <AddPhraseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleManualAdd}
      />

    </div>
  );
};

export default App;