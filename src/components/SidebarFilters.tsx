import React, { useState } from "react";
import { Sparkles, Sliders, Info } from "lucide-react";
import { GeneratorConfig, DomainStyle } from "../types";

interface SidebarFiltersProps {
  onGenerate: (config: GeneratorConfig) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    title: "🌸 Premium Organic Perfumes Shop",
    desc: "A boutique e-commerce shop specializing in organic rose scents and luxury natural oud oils",
    keys: "beauty, perfume, oud, luxury",
    style: "arabic-flavor" as DomainStyle,
    tlds: ["com", "store", "co"]
  },
  {
    title: "🤖 AI Education & Tutoring Platform",
    desc: "An intelligent web app that provides smart homework assistance and interactive tutorials",
    keys: "ai, helper, auto, task, math",
    style: "tech" as DomainStyle,
    tlds: ["ai", "io", "app"]
  },
  {
    title: "☕ Specialty Coffee Ordering App",
    desc: "A mobile application connecting local roasters directly with coffee enthusiasts nearby",
    keys: "coffee, drip, local, brew",
    style: "brandable" as DomainStyle,
    tlds: ["com", "app", "co"]
  },
  {
    title: "⚡ Smart Routes & Express Logistics",
    desc: "Fast and reliable shipment tracking using automated pathfinders and shipping routers",
    keys: "express, delivery, track, ship",
    style: "modern" as DomainStyle,
    tlds: ["com", "net", "io"]
  }
];

export default function SidebarFilters({ onGenerate, isLoading }: SidebarFiltersProps) {
  // Config States
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedTlds, setSelectedTlds] = useState<string[]>(["com", "io", "ai"]);
  const [style, setStyle] = useState<DomainStyle>("modern");
  const [maxLength, setMaxLength] = useState(15);

  const availableTlds = ["com", "io", "ai", "co", "app", "net", "org", "store", "tech", "online"];

  const handleTldToggle = (tld: string) => {
    if (selectedTlds.includes(tld)) {
      if (selectedTlds.length > 1) { // Keep at least one selected
        setSelectedTlds(selectedTlds.filter(t => t !== tld));
      }
    } else {
      setSelectedTlds([...selectedTlds, tld]);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setDescription(preset.desc);
    setKeywords(preset.keys);
    setStyle(preset.style);
    setSelectedTlds(preset.tlds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      keywords,
      description,
      selectedTlds,
      style,
      maxLength
    });
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-6 text-white text-left">
      <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
        <Sliders className="w-4 h-4 text-indigo-400" />
        <h2 className="text-sm font-bold tracking-tight uppercase font-sans">Domain Parameters</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Describe your startup or project idea</span>
            <span className="text-[10px] text-gray-500 font-normal">English or Arabic</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            placeholder="e.g., A luxury e-commerce brand selling natural lavender oils and organic cosmetics..."
            className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500 focus:bg-[#161920]/80 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 outline-none text-white transition-all placeholder:text-gray-500 font-sans resize-none"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Core Brand Keywords</span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-medium">Highly recommended</span>
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., beauty, perfume, luxury, green"
            className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500 focus:bg-[#161920]/80 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 outline-none text-white transition-all placeholder:text-gray-500 font-sans"
          />
          <p className="text-[9px] text-gray-500">Separate keywords with commas (,)</p>
        </div>

        {/* Naming Style Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-gray-300 block">Naming Theme & Vibe</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "modern", title: "🚀 Modern & Slick", desc: "SaaSify, SmartOud" },
              { id: "brandable", title: "✨ Brandable", desc: "Kayan, Noha, Lure" },
              { id: "tech", title: "💻 Tech-focused", desc: "ByteLab, CloudCore" },
              { id: "arabic-flavor", title: "🌴 Arabic Flavor", desc: "NoorApp, SamaFlow" },
              { id: "creative", title: "🎨 Metaphorical", desc: "BlueOasis, PinkDrop" },
              { id: "short", title: "⚡ Short & Concise", desc: "OudX, Fikr" },
            ].map((styleOption) => (
              <button
                key={styleOption.id}
                type="button"
                onClick={() => setStyle(styleOption.id as DomainStyle)}
                className={`p-3 text-left border rounded-xl transition-all duration-200 cursor-pointer ${
                  style === styleOption.id
                    ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md"
                    : "border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-gray-300"
                }`}
              >
                <div className="text-xs font-bold font-sans">{styleOption.title}</div>
                <div className="text-[10px] text-gray-500 font-mono mt-1">{styleOption.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Max Characters Slider */}
        <div className="space-y-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-300">Max Name Length (excluding TLDs)</span>
            <span className="text-indigo-400 font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">{maxLength} chars</span>
          </div>
          <input
            type="range"
            min={5}
            max={25}
            value={maxLength}
            onChange={(e) => setMaxLength(parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg cursor-pointer my-2"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Short (5 letters)</span>
            <span>Compound (25 letters)</span>
          </div>
        </div>

        {/* Extensions checklist */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-gray-300 block">Preferred Extensions (TLDs)</label>
          <div className="flex flex-wrap gap-1.5">
            {availableTlds.map((tld) => {
              const active = selectedTlds.includes(tld);
              return (
                <button
                  key={tld}
                  type="button"
                  onClick={() => handleTldToggle(tld)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-mono font-bold ${
                    active
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  .{tld}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trigger Button */}
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className={`w-full py-3.5 px-4 rounded-xl text-xs font-black tracking-wider text-white shadow-lg cursor-pointer flex items-center justify-center space-x-2 transition-all duration-200 uppercase italic ${
            isLoading || !description.trim()
              ? "bg-white/5 border border-white/5 pointer-events-none text-gray-500"
              : "bg-indigo-600 hover:bg-indigo-500 active:scale-98 shadow-indigo-600/20"
          }`}
        >
          <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
          <span>{isLoading ? "Generating Names..." : "Generate Smart Brand Domains"}</span>
        </button>
      </form>

      {/* Interactive Templates block */}
      <div className="border-t border-white/5 pt-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-gray-500" />
          <span>Choose Quick Examples:</span>
        </h3>
        <div className="space-y-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(p)}
              className="w-full text-left p-3 text-xs text-gray-300 hover:text-white bg-white/[0.01] hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer"
            >
              <div className="font-bold flex justify-between">
                <span>{p.title}</span>
                <span className="text-[9px] font-mono text-gray-500 capitalize">.{p.style}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
