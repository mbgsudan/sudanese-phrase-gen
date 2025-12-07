import React from 'react';
import { SavedPhrase, Category } from '../types';
import * as XLSX from 'xlsx';
import { Download, Trash2, Calendar, Tag, ExternalLink, Archive } from 'lucide-react';

interface LibraryViewProps {
  phrases: SavedPhrase[];
  onDelete: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ phrases, onDelete }) => {

  const handleExport = () => {
    const dataToExport = phrases.map(p => ({
      "النص": p.arabicText,
      "النطق": p.phonetic,
      "الترجمة": p.englishTranslation,
      "الاستخدام": p.usageContext,
      "التصنيف": p.category === Category.SALES ? 'مبيعات' : p.category === Category.DAILY ? 'يوميات' : 'ونسة',
      "المصدر": p.source === 'generated' ? 'توليد' : 'يدوي',
      "التاريخ": new Date(p.timestamp).toLocaleDateString('ar-SD')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport, { rtl: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الجمل المحفوظة");
    XLSX.writeFile(wb, "Sudanese_Phrases.xlsx");
  };

  const getCategoryLabel = (cat: Category) => {
    switch(cat) {
      case Category.SALES: return 'مبيعات';
      case Category.CONVERSATION: return 'ونسة';
      case Category.DAILY: return 'يوميات';
      default: return 'عام';
    }
  };

  const getCategoryColor = (cat: Category) => {
    switch(cat) {
      case Category.SALES: return 'bg-blue-100 text-blue-700';
      case Category.CONVERSATION: return 'bg-purple-100 text-purple-700';
      case Category.DAILY: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const generatedCount = phrases.filter(p => p.source === 'generated').length;
  const manualCount = phrases.filter(p => p.source === 'manual').length;

  if (phrases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-stone-400 bg-white rounded-3xl border border-stone-100 shadow-sm min-h-[300px]">
        <div className="bg-stone-50 p-4 rounded-full mb-4">
          <Archive className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-xl font-medium">لسه ما حفظت ليك أي جملة</p>
        <p className="text-sm mt-2 opacity-70">اعمل حفظ للجمل المقترحة أو ضيف جملتك الخاصة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-emerald-700 font-mono">{phrases.length}</span>
            <span className="text-sm font-medium text-emerald-900/60 mt-1">مجموع الجمل</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-stone-700 font-mono">{generatedCount}</span>
            <span className="text-xs text-stone-400 mt-1">من المولد</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-blue-600 font-mono">{manualCount}</span>
            <span className="text-xs text-stone-400 mt-1">إضافة يدوية</span>
        </div>
        <button 
           onClick={handleExport}
           className="bg-stone-900 hover:bg-stone-800 text-white p-4 rounded-2xl border border-stone-800 flex flex-col items-center justify-center transition-all group"
        >
             <Download className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
             <span className="text-xs font-bold">تصدير Excel</span>
        </button>
      </div>

      {/* Phrases List */}
      <div className="grid gap-4">
        {phrases.map((phrase) => (
          <div key={phrase.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(phrase.category)}`}>
                {getCategoryLabel(phrase.category)}
              </span>
              <button 
                onClick={() => onDelete(phrase.id)}
                className="text-stone-300 hover:text-red-500 transition-colors p-1"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-stone-800 mb-2 leading-relaxed font-cairo">{phrase.arabicText}</h3>
            
            <div className="flex flex-col gap-1 mb-4">
               <p className="text-emerald-600 text-sm italic dir-ltr text-right opacity-90">{phrase.phonetic}</p>
               <p className="text-stone-500 text-sm">{phrase.englishTranslation}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-50 text-xs text-stone-400">
              <div className="flex items-center gap-1.5" title="Usage Context">
                <Tag className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{phrase.usageContext}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1">
                   <Calendar className="w-3 h-3" />
                   <span>{new Date(phrase.timestamp).toLocaleDateString('ar-SD')}</span>
                 </div>
                 {phrase.source === 'manual' && (
                   <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] border border-blue-100 font-bold">يدوي</span>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};