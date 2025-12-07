import React from 'react';
import { Category } from '../types';

interface TabButtonProps {
  label: string;
  category: Category;
  isActive: boolean;
  onClick: (cat: Category) => void;
  icon: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, category, isActive, onClick, icon }) => {
  return (
    <button
      onClick={() => onClick(category)}
      className={`
        flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-all duration-300 w-full font-bold text-sm md:text-base
        ${isActive 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 transform scale-[1.02]' 
          : 'bg-white text-stone-500 hover:bg-emerald-50 hover:text-emerald-600 border border-stone-100 shadow-sm'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};