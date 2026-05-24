import React, { useState } from "react";
import { X, ShieldAlert, Settings, Save, Lock, AlertCircle, Sparkles, Check, RefreshCw } from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export default function AdminPanel({ isOpen, onClose, onConfigSaved }: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable configurations state
  const [affiliates, setAffiliates] = useState({
    hostinger: "",
    namecheap: "",
    bluehost: "",
    godaddy: "",
    hostgator: "",
    domaincom: ""
  });

  const [adsense, setAdsense] = useState({
    enabled: true,
    clientId: "",
    slotTop: "",
    slotSidebar: "",
    slotResults: ""
  });

  const [newPassword, setNewPassword] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/get-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Incorrect admin password.");
      }

      const data = await res.json();
      setAffiliates(data.affiliates || {});
      setAdsense(data.adsense || {});
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || "فشلت عملية المصادقة");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          affiliates,
          adsense,
          newPassword: newPassword.trim() || undefined
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "فشل حفظ التعديلات");
      }

      const result = await res.json();
      setSuccessMsg(result.message || "تم حفظ الإعدادات بنجاح!");
      if (newPassword.trim()) {
        setPassword(newPassword.trim());
        setNewPassword("");
      }
      onConfigSaved();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "خطأ أثناء حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Main Container Card */}
      <div className="relative bg-[#0F1115] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white shadow-2xl z-10 flex flex-col">
        
        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#12151B] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-black tracking-tight uppercase">لوحة تحكم المسؤول / Admin Settings Dashboard</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Unauthenticated Password Mask */}
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-5 py-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 mb-2">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold tracking-tight uppercase text-white">تحتاج إلى المصادقة / Authentication Required</h3>
                <p className="text-[11px] text-gray-500">أدخل كلمة مرور المسؤول لفتح لوحة تعديل روابط الأفيلييت وإعلانات جوجل.</p>
                <div className="text-[10px] bg-white/5 text-gray-400 py-1 px-2.5 rounded-md inline-block mt-2">
                  Default password is: <span className="text-indigo-400 font-bold font-mono">admin</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs text-center flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2 text-left">
                <label className="text-xs text-gray-400 block font-semibold">كلمة المرور / Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500 focus:bg-[#161920]/80 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-3 outline-none text-white font-mono tracking-widest text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-xs font-black tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "دخول / Verify Identity"}
              </button>
            </form>
          ) : (
            // Full Administrator Controls Form
            <form onSubmit={handleSave} className="space-y-6 text-left">
              
              {/* Alert Boxes */}
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 animate-bounce" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Guidance Badge */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-2xl text-[11px] text-gray-401 leading-relaxed space-y-1">
                <span className="font-bold text-indigo-400 block mb-0.5">ℹ️ دليل كتابة روابط الأفيلييت / Affiliate Guide</span>
                استخدم المتغير <code className="text-yellow-400 font-mono font-bold font-sans bg-white/5 px-1 rounded">{"{domain}"}</code> ليحل محل النطاق الذي يبحث عنه الزائر تلقائياً عند نقره على زر الشراء.
                مثال: <code className="text-gray-400 font-mono font-bold block text-[10px] mt-1">https://www.hostinger.com/search?domain={"{domain}"}&affulate_id=YOUR_ID</code>
              </div>

              {/* Affiliate Form Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider border-b border-white/5 pb-2">
                  🔗 روابط التسويق بالعمولة / Custom Affiliate Links
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hostinger */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-300 block">Hostinger Affiliate Link</label>
                    <input
                      type="text"
                      value={affiliates.hostinger}
                      onChange={(e) => setAffiliates({ ...affiliates, hostinger: e.target.value })}
                      placeholder="https://www.hostinger.com/domain-name-search?domain={domain}&affulate_id=YOUR_ID"
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>

                  {/* Namecheap */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-300 block">Namecheap Affiliate Link</label>
                    <input
                      type="text"
                      value={affiliates.namecheap}
                      onChange={(e) => setAffiliates({ ...affiliates, namecheap: e.target.value })}
                      placeholder="..."
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>

                  {/* Bluehost */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-300 block">Bluehost Affiliate Link</label>
                    <input
                      type="text"
                      value={affiliates.bluehost}
                      onChange={(e) => setAffiliates({ ...affiliates, bluehost: e.target.value })}
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>

                  {/* GoDaddy */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-300 block">GoDaddy Affiliate Link</label>
                    <input
                      type="text"
                      value={affiliates.godaddy}
                      onChange={(e) => setAffiliates({ ...affiliates, godaddy: e.target.value })}
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>

                  {/* Hostgator */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-300 block">HostGator Affiliate Link</label>
                    <input
                      type="text"
                      value={affiliates.hostgator}
                      onChange={(e) => setAffiliates({ ...affiliates, hostgator: e.target.value })}
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>

                  {/* Domaincom */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-300 block">Domain.com Affiliate Link</label>
                    <input
                      type="text"
                      value={affiliates.domaincom}
                      onChange={(e) => setAffiliates({ ...affiliates, domaincom: e.target.value })}
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Ad Integration Form Section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                    📢 إعلانات جوجل والبنرات / Google AdSense & Ads
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400">تفعيل الإعلانات:</span>
                    <input
                      type="checkbox"
                      checked={adsense.enabled}
                      onChange={(e) => setAdsense({ ...adsense, enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-550 border-white/10 accent-indigo-600 bg-white/10 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-300 block">Google AdSense Publisher Client ID</label>
                    <input
                      type="text"
                      value={adsense.clientId}
                      onChange={(e) => setAdsense({ ...adsense, clientId: e.target.value })}
                      placeholder="e.g., ca-pub-1234567890123456"
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>

                  {/* Custom Ad HTML Top */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-gray-300">أعلى الموقع / Top Slot Ad HTML</label>
                      <span className="text-[9px] text-gray-500">موضعه: أسفل العنوان مباشرة</span>
                    </div>
                    <textarea
                      value={adsense.slotTop}
                      onChange={(e) => setAdsense({ ...adsense, slotTop: e.target.value })}
                      rows={3}
                      placeholder="<div class='my-ads'>...</div>"
                      className="w-full text-xs font-mono bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none resize-none"
                    />
                  </div>

                  {/* Custom Ad HTML Sidebar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-gray-300">القائمة الجانبية / Sidebar Slot Ad HTML</label>
                      <span className="text-[9px] text-gray-500">موضعه: أسفل أداة التركيب والدمج السريع</span>
                    </div>
                    <textarea
                      value={adsense.slotSidebar}
                      onChange={(e) => setAdsense({ ...adsense, slotSidebar: e.target.value })}
                      rows={3}
                      placeholder="<div class='sidebar-ad'>...</div>"
                      className="w-full text-xs font-mono bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none resize-none"
                    />
                  </div>

                  {/* Custom Ad HTML Results Grid */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-gray-300">وسط الفهرس / In-Between Cards Ad HTML</label>
                      <span className="text-[9px] text-gray-500">موضعه: داخل شبكة النطاقات بعد الكارت رقم 8</span>
                    </div>
                    <textarea
                      value={adsense.slotResults}
                      onChange={(e) => setAdsense({ ...adsense, slotResults: e.target.value })}
                      rows={3}
                      placeholder="<div class='results-inline-ad'>...</div>"
                      className="w-full text-xs font-mono bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2.5 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password Management */}
              <div className="space-y-3 pt-4 border-t border-white/5 bg-white/[0.01] p-4 rounded-2xl">
                <h4 className="text-[11px] bold uppercase font-bold text-gray-300">تغيير كلمة مرور المشرف / Update Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5 font-sans">
                    <span className="text-[10px] text-gray-400 block font-normal">كلمة المرور الجديدة / New Password</span>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="اتركه فارغاً للاحتفاظ بالحالية"
                      className="w-full text-xs bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg p-2 outline-none font-mono"
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 p-1">
                    بعد حفظ كلمة المرور الجديدة، ستحتاج إلى استخدامها عند فتح هذه اللوحة مستقبلاً.
                  </div>
                </div>
              </div>

              {/* Operations Bar */}
              <div className="pt-4 flex items-center justify-between border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAuthenticated(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 transition-all"
                >
                  تسجيل الخروج / Logout
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "حفظ التعديلات..." : "حفظ التعديلات / Save Changes"}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
