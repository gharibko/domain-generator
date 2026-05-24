import React from "react";
import { Globe, Heart, Sparkles, Settings } from "lucide-react";

interface HeaderProps {
  onShowFavorites: () => void;
  favoritesCount: number;
  onShowAdmin: () => void;
}

export default function Header({ onShowFavorites, favoritesCount, onShowAdmin }: HeaderProps) {
  return (
    <header className="border-b border-white/5 bg-[#0F1115]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand/Logo in English */}
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Globe id="app-logo-icon" className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tighter italic text-white flex items-center gap-1.5 font-sans">
              <span>Domain.<span className="text-indigo-500">Smart</span></span>
              <span className="text-white/10 font-light text-sm">|</span>
              <span className="text-gray-400 font-bold text-xs font-mono uppercase tracking-widest hidden sm:inline-block">AI Generator</span>
            </h1>
          </div>
        </div>

        {/* Info, Admin & Favorites */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          <div className="hidden md:flex items-center space-x-1.5 text-[11px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Powered by Gemini 3.5 Flash</span>
          </div>

          {/* Admin Gear Console */}
          <button
            onClick={onShowAdmin}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 p-2.5 rounded-xl text-xs font-bold transition-all duration-250 active:scale-95 cursor-pointer"
            title="لوحة التحكم بالروابط والإعلانات"
          >
            <Settings className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          </button>

          <button
            onClick={onShowFavorites}
            className="relative flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-xs font-black tracking-tight transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/20 uppercase"
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            <span>Saved</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center animate-pulse">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
