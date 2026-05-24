import React, { useState, useEffect } from "react";
import { Copy, Check, Shuffle } from "lucide-react";

const PREFIXES = ["get", "try", "go", "hq", "the", "smart", "pro", "we", "just", "my", "our"];
const SUFFIXES = ["ly", "hub", "lab", "tech", "ify", "forge", "vibe", "zone", "flow", "base", "space"];
const TLDS = ["com", "io", "ai", "co", "app", "net"];

export default function QuickMixer() {
  const [root, setRoot] = useState("Kayan");
  const [selectedPrefix, setSelectedPrefix] = useState("");
  const [selectedSuffix, setSelectedSuffix] = useState("tech");
  const [selectedTld, setSelectedTld] = useState("com");
  
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Auto compile combinations when inputs shift
  useEffect(() => {
    const cleanRoot = root.toLowerCase().replace(/[^a-z0-9]/gi, "");
    if (!cleanRoot) {
      setResults([]);
      return;
    }

    // Produce 6 structured instant variants
    const variants = [
      // 1. Root + Prefix + Suffix + TLD
      `${selectedPrefix || "get"}${cleanRoot}${selectedSuffix || "ly"}.${selectedTld}`,
      // 2. Root + Suffix  + TLD
      `${cleanRoot}${selectedSuffix || "hub"}.${selectedTld}`,
      // 3. Prefix + Root + TLD
      `${selectedPrefix || "try"}${cleanRoot}.${selectedTld}`,
      // 4. Root + "ify" + TLD
      `${cleanRoot}ify.${selectedTld}`,
      // 5. Root + "hq" + TLD
      `${cleanRoot}hq.${selectedTld}`,
      // 6. Direct clean Root + TLD
      `${cleanRoot}.${selectedTld}`
    ];

    // Filter duplicates
    setResults(Array.from(new Set(variants)));
  }, [root, selectedPrefix, selectedSuffix, selectedTld]);

  const handleRandomize = () => {
    const randomRoots = ["Kayan", "Sama", "Noor", "Fikr", "Athar", "Nibras", "Sahaba", "Nama", "Rana", "Bayan"];
    const randomR = randomRoots[Math.floor(Math.random() * randomRoots.length)];
    const randomPref = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const randomSuff = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const randomTld = TLDS[Math.floor(Math.random() * TLDS.length)];

    setRoot(randomR);
    if (Math.random() > 0.5) setSelectedPrefix(randomPref);
    else setSelectedPrefix("");
    setSelectedSuffix(randomSuff);
    setSelectedTld(randomTld);
  };

  const handleCopyCombo = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-5 text-white shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-xl">
            <Shuffle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight uppercase font-sans">Manual Domain Combinator</h3>
        </div>
        
        <button
          type="button"
          onClick={handleRandomize}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Randomize Root</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Root input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 block">Root Brand Word</label>
          <input
            type="text"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            placeholder="e.g. Kayan"
            className="w-full text-xs font-semibold bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:bg-[#161920]/80 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2.5 outline-none font-mono"
          />
        </div>

        {/* Prefix option */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 block">Prefix Compound</label>
          <select
            value={selectedPrefix}
            onChange={(e) => setSelectedPrefix(e.target.value)}
            className="w-full text-xs bg-white/5 border border-white/10 text-white rounded-lg p-2.5 hover:border-white/20 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
          >
            <option value="" className="bg-[#12151B]">-- None --</option>
            {PREFIXES.map((p) => (
              <option key={p} value={p} className="bg-[#12151B]">{p}</option>
            ))}
          </select>
        </div>

        {/* Suffix option */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 block">Suffix Compound</label>
          <select
            value={selectedSuffix}
            onChange={(e) => setSelectedSuffix(e.target.value)}
            className="w-full text-xs bg-white/5 border border-white/10 text-white rounded-lg p-2.5 hover:border-white/20 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
          >
            <option value="" className="bg-[#12151B]">-- None --</option>
            {SUFFIXES.map((s) => (
              <option key={s} value={s} className="bg-[#12151B]">{s}</option>
            ))}
          </select>
        </div>

        {/* TLD select */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 block">Extension (TLD)</label>
          <select
            value={selectedTld}
            onChange={(e) => setSelectedTld(e.target.value)}
            className="w-full text-xs bg-white/5 border border-white/10 text-indigo-400 rounded-lg p-2.5 hover:border-white/20 focus:ring-1 focus:ring-indigo-500 outline-none font-mono font-bold"
          >
            {TLDS.map((t) => (
              <option key={t} value={t} className="bg-[#12151B]">.{t}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Grid of live variants */}
      <div className="bg-[#12151B] rounded-2xl p-4 border border-white/5 space-y-2 text-left">
        <div className="text-[10px] text-gray-500 font-sans font-semibold mb-1.5">Instant mixed brand variations (click to copy):</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {results.map((res, i) => (
            <button
              key={i}
              type="button"
              className="bg-white/5 border border-white/15 hover:border-indigo-500/50 p-2.5 rounded-xl flex flex-col justify-between items-center text-center group transition-all duration-150 relative h-16 cursor-pointer"
              onClick={() => handleCopyCombo(res, i)}
            >
              <span className="text-xs font-mono font-bold text-gray-200 break-all select-all flex-1 py-1">
                {res}
              </span>
              <div className="flex items-center text-[9px] text-gray-500 group-hover:text-indigo-400 transition-colors font-sans mt-1">
                {copiedIndex === i ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Copy className="w-2.5 h-2.5" /> Copy
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
