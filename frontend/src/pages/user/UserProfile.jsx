import { useEffect, useState } from "react";
import { 
  LogOut, 
  User, 
  Bell, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Fingerprint, 
  Activity, 
  Zap, 
  ChevronRight, 
  Upload,
  CheckCircle,
  X
} from "lucide-react";
import { API_BASE } from "../../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";

function UserProfile() {
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

    const [user, setUser] = useState(null);
    const [edit, setEdit] = useState(false);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        image: null
    });

    const [notifications, setNotifications] = useState({
        orders: true,
        promotions: true,
        products: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setUser(data);
            setForm({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                image: null
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setForm({ ...form, image: file });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("phone", form.phone);
            formData.append("address", form.address);
            if (form.image) {
                formData.append("image", form.image);
            }

            const res = await fetch(`${API_BASE}/api/user/profile`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            alert("Profile Updated Successfully.");
            setEdit(false);
            fetchProfile();
            // Local storage update if needed
            const current = JSON.parse(localStorage.getItem("currentUser"));
            localStorage.setItem("currentUser", JSON.stringify({ ...current, name: form.name }));
        } catch (error) {
            alert("Update Failed.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    if (!user) return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
      </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-32 pt-10 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 mb-2">
                            <User size={18} /> User Profile
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900">My Account</h1>
                        <p className="text-slate-500 mt-2">Manage your personal information and security preferences</p>
                    </div>
                </div>

                {/* Profile Banner */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                    <div className="flex items-center gap-8 relative z-10">
                        <label className={`relative group/avatar cursor-pointer ${edit ? 'ring-4 ring-indigo-100 ring-offset-4' : ''} rounded-[2.5rem] transition-all`}>
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm relative">
                                {preview ? (
                                    <img src={preview} className="w-full h-full object-cover" />
                                ) : user.profileImage ? (
                                    <img
                                        src={getImageUrl(user.profileImage)}
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.target.src = getPlaceholder("No Image"))}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <User size={32} />
                                    </div>
                                )}
                                {edit && (
                                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <Upload size={20} />
                                    </div>
                                )}
                            </div>
                            {edit && <input type="file" accept="image/*" onChange={handleImage} className="hidden" />}
                        </label>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {user.name}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                                <Activity size={16} className="text-indigo-500" /> Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                            </p>
                            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-xs font-semibold w-fit">
                                <CheckCircle size={14} /> Verified Account
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (edit) setEdit(false);
                            else setEdit(true);
                        }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            edit 
                            ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100" 
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        {edit ? "Cancel Edit" : "Edit Profile"}
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Group: Info & Notifications */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* PERSONAL INFORMATION */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <User size={20} className="text-indigo-500" /> Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 px-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                                        <input
                                            disabled={!edit}
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 px-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            disabled
                                            value={form.email}
                                            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-12 pr-4 py-3 outline-none text-sm font-medium opacity-60 text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 px-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                                        <input
                                            disabled={!edit}
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 px-1">Delivery Address</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                                        <input
                                            disabled={!edit}
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all disabled:opacity-60"
                                        />
                                    </div>
                                </div>
                            </div>
                            {edit && (
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors mt-6"
                                >
                                    {loading ? "Saving Changes..." : "Save Changes"}
                                </button>
                            )}
                        </div>

                        {/* NOTIFICATIONS */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Bell size={20} className="text-indigo-500" /> Notifications
                            </h3>

                            <div className="space-y-6">
                                {[
                                    { key: "orders", title: "Order Status", desc: "Get updates on your order progress" },
                                    { key: "promotions", title: "Promotions", desc: "Receive exclusive offers and discounts" },
                                    { key: "products", title: "New Products", desc: "Get notified about new product arrivals" }
                                ].map((n) => (
                                    <div key={n.key} className="flex justify-between items-center bg-slate-50 p-6 rounded-xl border border-slate-200">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-slate-900 tracking-tight">{n.title}</p>
                                            <p className="text-sm font-medium text-slate-500">{n.desc}</p>
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={notifications[n.key]}
                                                onChange={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key] })}
                                            />
                                            <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6" />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Group: Security & Actions */}
                    <div className="space-y-8">
                        {/* SECURITY */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Shield size={20} className="text-indigo-500" /> Security Settings
                            </h3>

                            <div className="space-y-4">
                                <button className="w-full text-left p-5 bg-slate-50 border border-slate-200 rounded-xl group hover:border-indigo-300 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-900">Change Password</p>
                                            <p className="text-xs font-medium text-slate-500">Last updated 3 months ago</p>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </button>

                                <button className="w-full text-left p-5 bg-slate-50 border border-slate-200 rounded-xl group hover:border-indigo-300 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-900">Two-Factor Authentication</p>
                                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                              <Zap size={10} fill="currentColor" /> Active
                                            </p>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 bg-white text-rose-600 py-3.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-colors mt-4"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>

                        {/* Integration Banner */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-indigo-900">
                           <div className="space-y-2">
                               <h4 className="text-lg font-bold flex items-center gap-2"><Zap size={18} className="text-indigo-600"/> Account Sync</h4>
                               <p className="text-sm font-medium text-indigo-700/80 leading-relaxed">Your profile information is synced across all devices for a seamless shopping experience.</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
