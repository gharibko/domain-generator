import React from "react";
import { X, Heart, Trash2, Copy, ArrowUpRight, Check } from "lucide-react";
import { DomainSuggestion } from "../types";

interface SavedDomainsListProps {
  isOpen: boolean;
  onClose: () => void;
  savedDomains: DomainSuggestion[];
  onRemoveDomain: (domain: DomainSuggestion) => void;
  onClearAll: () => void;
}

export default function SavedDomainsList({
  isOpen,
  onClose,
  savedDomains,
  onRemoveDomain,
  onClearAll
}: SavedDomainsListProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop with frosted dark glass effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F1115] text-white shadow-2xl flex flex-col h-full border-l border-white/5">
          
          {/* Drawer Header inside Bold Typography theme */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#12151B]">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <h2 className="text-sm font-black tracking-tight uppercase">Saved Domains ({savedDomains.length})</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List Items Scroll Box */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {savedDomains.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-64 space-y-4">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 shadow-sm animate-bounce">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-150 uppercase">Your tray is empty</h3>
                  <p className="text-[10px] text-gray-500 max-w-[250px] mx-auto mt-2 leading-relaxed">
                    Tap the small heart icon next to any suggested brand name to save it here for quick reference and purchase later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* Clear all action */}
                <div className="flex justify-end pb-2">
                  <button 
                    onClick={onClearAll}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear saved tray</span>
                  </button>
                </div>

                {savedDomains.map((dom, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/20 rounded-2xl transition-all duration-150 flex items-center justify-between"
                  >
                    <div className="space-y-1 text-left">
                      <div className="font-bold text-sm text-white italic tracking-tight flex items-baseline gap-0.5">
                        <span>{dom.sld}</span>
                        <span className="text-indigo-400 font-mono text-xs text-left">.{dom.tld}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans line-clamp-1">{dom.conceptAr}</div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopy(dom.name, idx)}
                        className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                        title="Copy Domain Name"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <a
                        href={`https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(dom.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center cursor-pointer"
                        title="View Prices & Checkout"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => onRemoveDomain(dom)}
                        className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-red-400 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Remove Favorite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer disclaimer inside saved drawer */}
          {savedDomains.length > 0 && (
            <div className="p-6 border-t border-white/5 bg-[#12151B] space-y-2">
              <p className="text-[10px] text-gray-500 text-center leading-normal">
                These domain ideas are stored on your local browser storage. Registration lookup speeds and live prices might vary across different registrars. Save yours before someone else does!
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
