import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to Admin Configuration file (Database)
const CONFIG_PATH = path.join(process.cwd(), "admin_config.json");

function getAdminConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading admin config. Returning default configurations:", err);
  }
  return {
    affiliates: {
      hostinger: "https://www.hostinger.com/domain-name-search?domain={domain}&affulate_id=domaincraft",
      namecheap: "https://www.namecheap.com/domains/registration/results/?domain={domain}&aff=yourlink_id",
      bluehost: "https://www.bluehost.com/registration?flow=domainonly&domain={domain}&utm_medium=affiliate_id",
      godaddy: "https://www.godaddy.com/domainsearch/find?domainToCheck={domain}&key=affiliate_id",
      hostgator: "https://www.hostgator.com/domains?search={domain}&shared_aff=true&id=aff_id",
      domaincom: "https://www.domain.com/registration/?search={domain}&utm_source=affiliate_id"
    },
    adsense: {
      enabled: true,
      clientId: "ca-pub-1234567890123456",
      slotTop: "<div class=\"bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-3xl text-center text-xs sm:text-sm text-gray-300 max-w-3xl mx-auto flex items-center justify-between gap-4\"><div>🚀 <span class=\"font-black text-indigo-400\">عرض خاص من هوستنجر:</span> احصل على خصم إضافي واستضافة سريعة لمشروعك الجديد!</div><a href=\"https://www.hostinger.com\" target=\"_blank\" class=\"bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-1.5 px-3 rounded-lg\">احجز الآن</a></div>",
      slotSidebar: "<div class=\"bg-purple-950/30 border border-purple-500/20 p-4 rounded-3xl text-center text-xs text-gray-400 space-y-2\"><p class=\"font-bold text-purple-300\">🎯 إشهار لعلامتك التجارية</p><p class=\"text-[10px] text-gray-550\">هل تبحث عن خدمات تصميم الهوية البصرية أو الشعار لاسم النطاق الجديد؟ تواصل معنا اليوم!</p></div>",
      slotResults: "<div class=\"bg-blue-900/10 border border-blue-500/10 hover:border-indigo-500/30 p-5 rounded-3xl text-center text-xs text-gray-300 col-span-full transition-all duration-300 flex flex-col items-center justify-center space-y-2\"><div class=\"text-[9px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-wider\">إعلان ممول / Sponsored Partner</div><p class=\"font-bold text-white text-sm\">وفر حتى 70% من مصاريف الاستضافة السنوية</p><p class=\"text-gray-450 text-[11px] max-w-lg\">شركاؤنا يقدمون دومين مجاني وشهادة SSL لحماية موقعك مع سيرفرات فائقة السرعة للمستخدمين العرب.</p></div>"
    },
    adminPassword: "admin"
  };
}

function saveAdminConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write admin config:", err);
    return false;
  }
}

// Lazy-initialize Gemini SDK to fail gracefully if the key is missing on execution, rather than at load-time
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in Settings > Secrets or in your environment.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Ensure pre-flight check endpoint is available so front-end knows if AI is ready
app.get("/api/config", (req, res) => {
  const currentConfig = getAdminConfig();
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    currentTime: new Date().toISOString(),
    adsense: currentConfig.adsense
  });
});

// Admin Configuration Management Endpoints
app.post("/api/admin/get-config", (req, res) => {
  const { password } = req.body;
  const currentConfig = getAdminConfig();
  
  if (password !== currentConfig.adminPassword) {
    return res.status(403).json({ error: "كلمة المرور غير صحيحة / Incorrect admin password" });
  }
  
  res.json(currentConfig);
});

app.post("/api/admin/save-config", (req, res) => {
  const { password, affiliates, adsense, newPassword } = req.body;
  const currentConfig = getAdminConfig();
  
  if (password !== currentConfig.adminPassword) {
    return res.status(403).json({ error: "كلمة المرور غير صحيحة / Incorrect admin password" });
  }

  const updatedConfig = {
    affiliates: affiliates || currentConfig.affiliates,
    adsense: adsense || currentConfig.adsense,
    adminPassword: newPassword && newPassword.trim() ? newPassword.trim() : currentConfig.adminPassword
  };

  const success = saveAdminConfig(updatedConfig);
  if (success) {
    res.json({ success: true, message: "تم حفظ التغييرات بنجاح / Configuration updated successfully" });
  } else {
    res.status(500).json({ error: "فشل حفظ الملف / Failed to write layout config file" });
  }
});

// Domain Generator API
app.post("/api/generate-domains", async (req, res) => {
  try {
    const { keywords, description, selectedTlds, style, maxLength } = req.body;

    // Fallbacks
    const finalKeywords = keywords || "tech, startup";
    const finalDesc = description || "A modern online SaaS portal";
    const finalTlds = selectedTlds && selectedTlds.length > 0 ? selectedTlds : ["com", "io", "co"];
    const finalStyle = style || "modern";
    const finalMaxLength = maxLength || 15;

    const ai = getGenAI();

    const promptText = `You are an elite, creative domain branding consultant and internet asset broker.
We need exactly 24 domain names based on the following instructions (this larger selection of exactly 24 domains keeps site engagement extremely high):
- Idea/Description: "${finalDesc}"
- Keywords: "${finalKeywords}"
- Branding style category: "${finalStyle}" (Values: "modern" means futuristic blends; "brandable" means short catchy words; "tech" means cyber/code elements; "creative" means metaphoric names; "arabic-flavor" means transliterated Arabic keywords combined with English prefixes/suffixes/TLDs for dual cultural appeal; "short" means concise compounds under 8 letters)
- Target Top-Level Domains (TLDs): ${finalTlds.join(", ")}
- Maximum length: ${finalMaxLength} characters.

Strict Requirements:
1. ONLY use the requested TLD extensions (${finalTlds.join(", ")}). Don't suggest other extensions.
2. Ensure second-level domains (SLD) contain only letters and numbers (no dashes if possible, absolutely no spaces, symbols, underscores, or invalid characters).
3. Max length constraint of ${finalMaxLength} characters must be respected.
4. For the "arabic-flavor" style, generate elegant transliterated Arabic words with a professional English branding spin (e.g. Kayan, Athar, Fikr, Noor, Sama, Nibras, Nama, Masar, Sahaba combined as kayantech, atharly, fikrhub, noorapp, samavibe, etc.). Provide a meaningful brand story for why these fit.
5. Provide a clear reasoning/concept for each suggested domain in English (conceptAr should contain a neat short description, and conceptEn can contain an optional deeper business context).
6. Calculate a realistic BRANDABILITY score out of 100 based on length, pronunciation, and marketability.
7. Classify the pronunciation flow in English (pronounceability list: "Excellent", "Good", "Fair").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are a domain generation machine. You output structured JSON lists of original, highly premium, brandable domain names tailored to user inputs.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            domains: {
              type: Type.ARRAY,
              description: "Array of exactly 24 domain suggestions",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Full domain name (e.g., 'samaforge.io')" },
                  sld: { type: Type.STRING, description: "Second level domain without dot or extension (e.g., 'samaforge')" },
                  tld: { type: Type.STRING, description: "Domain extension (e.g., 'io')" },
                  conceptAr: { type: Type.STRING, description: "Main English branding idea and meaning behind the name" },
                  conceptEn: { type: Type.STRING, description: "Deeper business context or brand story" },
                  pronounceability: { type: Type.STRING, enum: ["Excellent", "Good", "Fair"], description: "Ease of pronunciation in English" },
                  score: { type: Type.INTEGER, description: "Premium score out of 100 (based on length and brand appeal)" },
                  style: { type: Type.STRING, description: "Applied style label" },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "2-3 relevant descriptive tags"
                  }
                },
                required: ["name", "sld", "tld", "conceptAr", "conceptEn", "pronounceability", "score", "style", "keywords"]
              }
            }
          },
          required: ["domains"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Model returned empty response.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Domain Generator Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during domain generation." });
  }
});

// Mock WHOIS / Availability check API
app.post("/api/check-availability", async (req, res) => {
  try {
    const { domainName } = req.body;
    if (!domainName) {
      return res.status(400).json({ error: "domainName occurs as required parameter" });
    }

    // Simulate DNS/WHOIS round-trip delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Determinitic availability based on string hash so same domain always gives the same result in a session
    let hash = 0;
    for (let i = 0; i < domainName.length; i++) {
      hash = domainName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // We want roughly 70% of generated names to be "available" as premium suggestions,
    // and 30% to be registered to make the application realistic and useful.
    const isAvailable = Math.abs(hash) % 10 < 7; 

    // Retrieve active affiliate options from admin configurations database
    const currentConfig = getAdminConfig();
    const affs = currentConfig.affiliates || {};
    const domainEncoded = encodeURIComponent(domainName);
    const renderLink = (pattern: string, fallback: string) => {
      if (!pattern) return fallback;
      return pattern.replace(/{domain}/g, domainEncoded);
    };

    // Return status
    res.json({
      domainName,
      isAvailable,
      checkedAt: new Date().toISOString(),
      registrarLinks: {
        godaddy: renderLink(affs.godaddy, `https://www.godaddy.com/domainsearch/find?domainToCheck=${domainEncoded}`),
        namecheap: renderLink(affs.namecheap, `https://www.namecheap.com/domains/registration/results/?domain=${domainEncoded}`),
        namesilo: `https://www.namesilo.com/domain/search-domains?query=${domainEncoded}`,
        hostinger: renderLink(affs.hostinger, `https://www.hostinger.com/domain-name-search?domain=${domainEncoded}`),
        bluehost: renderLink(affs.bluehost, `https://www.bluehost.com/registration?flow=domainonly&domain=${domainEncoded}`),
        hostgator: renderLink(affs.hostgator, `https://www.hostgator.com/domains?search=${domainEncoded}`),
        domaincom: renderLink(affs.domaincom, `https://www.domain.com/registration/?search=${domainEncoded}`)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to verify domain availability." });
  }
});

async function startServer() {
  // Vite integration middleware for development, static express serve for production.
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build routing mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Domain Name Generator server running on http://localhost:${PORT}`);
  });
}

startServer();
