import React, { useState } from 'react';
import { X, Save, Type } from 'lucide-react';
import { Category, SavedPhrase } from '../types';

interface AddPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phrase: Omit<SavedPhrase, 'id' | 'timestamp' | 'source'>) => void;
}

export const AddPhraseModal: React.FC<AddPhraseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [arabicText, setArabicText] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [usageContext, setUsageContext] = useState('');
  const [category, setCategory] = useState<Category>(Category.DAILY);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arabicText) return;

    onSave({
      arabicText,
      phonetic: phonetic || '---',
      englishTranslation: englishTranslation || '---',
      usageContext: usageContext || 'Custom phrase',
      category
    });
    
    // Reset and close
    setArabicText('');
    setPhonetic('');
    setEnglishTranslation('');
    setUsageContext('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Type className="w-5 h-5" />
            أضف جملتك الخاصة
          </h2>
          <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">النص (بالسوداني)</label>
            <textarea
              required
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none h-24 bg-stone-50"
              placeholder="اكتب هنا..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">النطق (اختياري)</label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-stone-50 text-left dir-ltr"
                placeholder="Phonetic..."
              />
            </div>
            <div>
               <label className="block text-sm font-bold text-stone-700 mb-1">الترجمة (اختياري)</label>
              <input
                type="text"
                value={englishTranslation}
                onChange={(e) => setEnglishTranslation(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-stone-50 text-left dir-ltr"
                placeholder="Translation..."
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-stone-700 mb-1">متين بنقولها؟ (السياق)</label>
             <input
                type="text"
                value={usageContext}
                onChange={(e) => setUsageContext(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-stone-50"
                placeholder="مثلاً: عند الدخول للمحل..."
              />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">التصنيف</label>
            <div className="flex gap-2">
              {[
                { label: 'يوميات', val: Category.DAILY },
                { label: 'مبيعات', val: Category.SALES },
                { label: 'ونسة', val: Category.CONVERSATION }
              ].map((c) => (
                <button
                  key={c.val}
                  type="button"
                  onClick={() => setCategory(c.val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors
                    ${category === c.val 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'}
                  `}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <Save className="w-5 h-5" />
              حفظ في المكتبة
            </button>
             <button
              type="button"
              onClick={onClose}
              className="px-6 bg-stone-100 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors"
            >
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};