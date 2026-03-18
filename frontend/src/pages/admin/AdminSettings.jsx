import { useState } from "react";
import { Bell, Settings, Shield, Database, LogOut } from "lucide-react";
import SelectDropdown from "../../components/SelectDropdown";

function AdminSettings() {

const [edit,setEdit] = useState(false);

const [settings,setSettings] = useState({
siteName:"Mobilesale Admin Portal",
timezone:"Asia/Kolkata",
currency:"INR",
theme:"Light",
language:"English"
});

const [notifications,setNotifications] = useState({
orders:true,
stock:true,
users:false,
email:true
});


/* ================= SAVE SETTINGS ================= */

const handleSave = ()=>{

alert("Settings Saved Successfully");

setEdit(false);

};


/* ================= EXPORT DATA ================= */

const exportData = ()=>{

const data = {
settings,
notifications
};

const json = JSON.stringify(data,null,2);

const blob = new Blob([json],{type:"application/json"});

const url = URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;
a.download = "admin-settings.json";

a.click();

URL.revokeObjectURL(url);

};


return (
  <div className="space-y-10 animate-in fade-in duration-700 pb-20">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="text-indigo-600 w-9 h-9" /> Settings
        </h1>
        <p className="text-slate-500 font-medium mt-1">Configure your store settings and preferences</p>
      </div>
      <button
        onClick={() => setEdit(!edit)}
        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm border ${
          edit 
            ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50" 
            : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {edit ? "Cancel" : "Modify Settings"}
      </button>
    </div>



    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings size={18} className="text-indigo-600" /> General Store Config
        </h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Store Name</label>
          <input
            disabled={!edit}
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-semibold transition-all disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Default Timezone</label>
          {!edit ? (
            <select
              disabled
              value={settings.timezone}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none text-sm font-semibold disabled:opacity-60"
            >
              <option>UTC</option>
              <option>Asia/Kolkata</option>
            </select>
          ) : (
            <SelectDropdown
              value={settings.timezone}
              onChange={(val) => setSettings({ ...settings, timezone: val })}
              options={[{ value: "UTC", label: "UTC" }, { value: "Asia/Kolkata", label: "Asia/Kolkata" }]}
              className="w-full"
              buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold"
            />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Currency Unit</label>
          {!edit ? (
            <select disabled value={settings.currency} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none text-sm font-semibold disabled:opacity-60">
              <option>USD</option>
              <option>INR</option>
            </select>
          ) : (
            <SelectDropdown
              value={settings.currency}
              onChange={(val) => setSettings({ ...settings, currency: val })}
              options={[{ value: "USD", label: "USD" }, { value: "INR", label: "INR" }]}
              className="w-full"
              buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold"
            />
          )}
        </div>
      </div>
      {edit && (
        <div className="px-6 pb-6 mt-2">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
          >
            Commit Changes
          </button>
        </div>
      )}
    </div>



    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bell size={18} className="text-indigo-600" /> Notifications
        </h2>
      </div>
      <div className="p-6 space-y-4">
        {[
          { key: "orders", title: "Order Placements", desc: "Real-time alerts for new purchases" },
          { key: "stock", title: "Inventory Status", desc: "Low stock and restock notifications" },
          { key: "users", title: "Account Activity", desc: "New customer and account updates" },
          { key: "email", title: "Email Dispatch", desc: "System automated email reports" }
        ].map(n => (
          <div key={n.key} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
            <div>
              <p className="font-bold text-slate-800 leading-tight">{n.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!edit}
                checked={notifications[n.key]}
                onChange={() => setNotifications({
                  ...notifications,
                  [n.key]: !notifications[n.key]
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        ))}
      </div>
    </div>



    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">Personalization</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Dashboard Theme</label>
          {!edit ? (
            <select disabled value={settings.theme} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none text-sm font-semibold disabled:opacity-60">
              <option>Light</option>
              <option>Dark</option>
            </select>
          ) : (
            <SelectDropdown
              value={settings.theme}
              onChange={(val) => setSettings({ ...settings, theme: val })}
              options={[{ value: "Light", label: "Light" }, { value: "Dark", label: "Dark" }]}
              className="w-full"
              buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold"
            />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">Interface Language</label>
          {!edit ? (
            <select disabled value={settings.language} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none text-sm font-semibold disabled:opacity-60">
              <option>English</option>
              <option>Hindi</option>
            </select>
          ) : (
            <SelectDropdown
              value={settings.language}
              onChange={(val) => setSettings({ ...settings, language: val })}
              options={[{ value: "English", label: "English" }, { value: "Hindi", label: "Hindi" }]}
              className="w-full"
              buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold"
            />
          )}
        </div>
      </div>
    </div>



    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Shield size={18} className="text-indigo-600" /> Security
        </h2>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <button className="bg-white border border-slate-200 py-3 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs shadow-sm shadow-slate-100 active:translate-y-0.5">
          Reset Password
        </button>
        <button className="bg-white border border-slate-200 py-3 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs shadow-sm shadow-slate-100 active:translate-y-0.5">
          MFA Authentication
        </button>
        <button className="border border-slate-200 py-3 rounded-lg col-span-2 hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs shadow-sm shadow-slate-100 active:translate-y-0.5">
          Access Log Records
        </button>
      </div>
    </div>



    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Database size={18} className="text-indigo-600" /> Database Management
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={exportData}
            className="border border-slate-200 py-3 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs active:translate-y-0.5"
          >
            Export Backup
          </button>
          <button className="border border-slate-200 py-3 rounded-lg hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs active:translate-y-0.5">
            Cloud Backup
          </button>
        </div>
        <button className="w-full bg-rose-50 text-rose-600 border border-rose-100 py-3 rounded-lg font-bold text-xs hover:bg-rose-600 hover:text-white transition-all shadow-sm">
          Purge System Cache
        </button>
      </div>
    </div>

    <button className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95">
      <LogOut size={18} /> Exit Admin Dashboard
    </button>
  </div>
);

}

export default AdminSettings;