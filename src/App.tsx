/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SidebarFilters from "./components/SidebarFilters";
import DomainCard from "./components/DomainCard";
import SavedDomainsList from "./components/SavedDomainsList";
import QuickMixer from "./components/QuickMixer";
import AdminPanel from "./components/AdminPanel";
import { GeneratorConfig, DomainSuggestion } from "./types";
import { Sparkles, Globe, AlertCircle, Flame } from "lucide-react";

export default function App() {
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [favorites, setFavorites] = useState<DomainSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [hasServerKey, setHasServerKey] = useState<boolean>(true);
  const [adsenseConfig, setAdsenseConfig] = useState<any>(null);

  // Initialize and load saved favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fav_domains");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse saved domains from localStorage", err);
      }
    }

    // Verify system key status and load dynamic layouts configuration database
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasGeminiKey === false) {
          setHasServerKey(false);
        }
        if (data && data.adsense) {
          setAdsenseConfig(data.adsense);
        }
      })
      .catch((e) => console.log("Config verification failed, using defaults."));
  }, []);

  const reloadConfig = () => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.adsense) {
          setAdsenseConfig(data.adsense);
        }
      })
      .catch((e) => console.log("Failed to reload system config."));
  };

  // Save favorites helper
  const saveFavoritesToDisk = (updatedFavs: DomainSuggestion[]) => {
    setFavorites(updatedFavs);
    localStorage.setItem("fav_domains", JSON.stringify(updatedFavs));
  };

  // Toggle favorite
  const handleToggleFavorite = (suggestion: DomainSuggestion) => {
    const exists = favorites.some((f) => f.name.toLowerCase() === suggestion.name.toLowerCase());
    let nextFavs: DomainSuggestion[];
    if (exists) {
      nextFavs = favorites.filter((f) => f.name.toLowerCase() !== suggestion.name.toLowerCase());
    } else {
      nextFavs = [...favorites, suggestion];
    }
    saveFavoritesToDisk(nextFavs);
  };

  // Clear all favorites
  const handleClearAllFavorites = () => {
    saveFavoritesToDisk([]);
  };

  // Main Generator Function using server-side Gemini
  const handleGenerateDomains = async (config: GeneratorConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to generate domain names from the server.");
      }

      const data = await response.json();
      if (data && Array.isArray(data.domains)) {
        setSuggestions(data.domains);
      } else {
        throw new Error("Unexpected data format received from generator.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Sorry, we encountered an error while communicating with the AI server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white" dir="ltr">
      
      {/* Visual background ambient grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header */}
      <Header 
        onShowFavorites={() => setIsFavoritesOpen(true)} 
        favoritesCount={favorites.length}
        onShowAdmin={() => setIsAdminOpen(true)}
      />

      {/* Dynamic Top Ad slot */}
      {adsenseConfig?.enabled && adsenseConfig?.slotTop && (
        <div 
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4"
          dangerouslySetInnerHTML={{ __html: adsenseConfig.slotTop }}
        />
      )}

      {/* Hero Mega Section - Bold Typography styled */}
      <section className="relative pt-12 pb-16 px-4 max-w-7xl mx-auto w-full text-center overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* AI Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 border border-indigo-500/30 bg-indigo-500/10 rounded-full text-indigo-400 text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>EXPRESS AI-POWERED DOMAIN GENERATOR</span>
          </div>

          {/* Epic English Bold Typography Title */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl leading-[0.9] font-black tracking-tighter uppercase italic text-white flex flex-col items-center">
            <span className="block mb-2">CRAFT YOUR</span>
            <span className="text-indigo-500 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">DIGITAL BRAND</span>
          </h1>

          <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Describe your idea and keywords. Our smart branding assistant instantly devises <span className="text-white font-bold">24 prime domain ideas</span> with custom meanings, brandability scores, and live registrar lookup.
          </p>

          {!hasServerKey && (
            <div className="max-w-md mx-auto bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Gemini API Key is not set. Please configure it in Settings &gt; Secrets on the dashboard to experience full AI creation.</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Interactive Workflow Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls column - English LTR side grid */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
            <SidebarFilters onGenerate={handleGenerateDomains} isLoading={isLoading} />

            {/* Dynamic Sidebar Ad slot */}
            {adsenseConfig?.enabled && adsenseConfig?.slotSidebar && (
              <div 
                className="w-full text-center"
                dangerouslySetInnerHTML={{ __html: adsenseConfig.slotSidebar }}
              />
            )}
          </div>

          {/* Output & Results column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Loading / Active State */}
            {isLoading && (
              <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6 min-h-[400px]">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Globe className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-100 font-sans">Finding standard-setting matches...</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                    Gemini 3.5 Flash is analyzing your brand story to brainstorm original linguistic combinations, verify target TLDs, and score premium results.
                  </p>
                </div>
              </div>
            )}

            {/* Error fallback message */}
            {error && !isLoading && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-left space-y-4">
                <div className="flex items-center space-x-3 text-red-400">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <h3 className="font-bold text-sm">Failed to generate suggestions</h3>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{error}</p>
                <div className="pt-2 text-[11px] text-gray-400">Try simplifying your keywords or providing a clearer description of your project.</div>
              </div>
            )}

            {/* Primary Domain Output List */}
            {!isLoading && !error && suggestions.length > 0 && (
              <div className="space-y-6">
                
                {/* Visual Section Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-xl">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-sans">Your AI Domain Candidates ({suggestions.length})</h2>
                      <p className="text-[11px] text-gray-400">Click on "Verify Domain" to check actual live registrars and find available deals.</p>
                    </div>
                  </div>
                </div>

                 {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((item, index) => {
                    const cards = [];
                    cards.push(
                      <DomainCard
                        key={`dom-${index}`}
                        suggestion={item}
                        onToggleFavorite={handleToggleFavorite}
                        isFavorite={favorites.some((f) => f.name.toLowerCase() === item.name.toLowerCase())}
                      />
                    );

                    // Inject custom in-between results sponsor Ad after the 8th candidate (index = 7)
                    if (index === 7 && adsenseConfig?.enabled && adsenseConfig?.slotResults) {
                      cards.push(
                        <div 
                          key="results-inline-ad" 
                          className="col-span-1 md:col-span-2 p-2 w-full text-center"
                          dangerouslySetInnerHTML={{ __html: adsenseConfig.slotResults }}
                        />
                      );
                    }
                    return cards;
                  })}
                </div>
              </div>
            )}

            {/* Default Empty Screen - Guides to generate first name */}
            {!isLoading && !error && suggestions.length === 0 && (
              <div className="bg-white/5 border border-white/5 rounded-3xl p-10 text-center min-h-[350px] flex flex-col justify-center items-center space-y-6">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/5">
                  <Globe className="w-8 h-8 animate-pulse" />
                </div>
                
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-white">Start Your Digital Identity Voyage</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Provide project keywords and details in the left settings panel, or run one of our <span className="text-indigo-400 font-bold">pre-made presets</span> to experience immediate AI creation.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-lg pt-4">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="text-indigo-400 font-bold text-xs mb-1">.com</div>
                    <div className="text-[10px] text-gray-500">Gold Standard</div>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="text-indigo-400 font-bold text-xs mb-1">.ai</div>
                    <div className="text-[10px] text-gray-500">Tech & Mind</div>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="text-indigo-400 font-bold text-xs mb-1">.io</div>
                    <div className="text-[10px] text-gray-500">SaaS & Startups</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick manual mixer for users who want immediate instant combination */}
            <QuickMixer />

          </div>

        </div>

      </main>

      {/* Sidebar drawer of favorite saved domains */}
      <SavedDomainsList
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        savedDomains={favorites}
        onRemoveDomain={handleToggleFavorite}
        onClearAll={handleClearAllFavorites}
      />

      {/* Dynamic Administrator Controls Dashboard */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onConfigSaved={reloadConfig}
      />

      {/* System Status Footer styled correctly */}
      <footer className="mt-auto border-t border-white/5 bg-[#0A0B0E] py-8 text-center text-xs text-gray-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:items-start gap-1">
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Stable Host Node</div>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-gray-400 text-xs">Over 1,000,000+ AI Domain candidates generated worldwide</span>
            </div>
          </div>

          <div className="text-gray-600 text-[11px] font-sans">
            Copyright © {new Date().getFullYear()} - DomainCraft Studio | Kayan Brand Master 
          </div>

          <div className="flex gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-gray-500 hover:text-white cursor-pointer transition-all">𝕏</span>
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-gray-500 hover:text-white cursor-pointer transition-all font-sans">in</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
