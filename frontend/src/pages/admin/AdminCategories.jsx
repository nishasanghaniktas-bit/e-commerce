import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../utils/apiBase";
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Image as ImageIcon,
  Activity,
  ArrowRight,
  Package
} from "lucide-react";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", image: "", subcategories: [{ name: "", petas: [""] }] });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      const res = await axios.get(`${API_BASE}/api/categories`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

      // Clean up empty subcategories and petas
      const cleanedForm = {
        ...form,
        subcategories: (form.subcategories || [])
          .filter(sub => {
            const name = typeof sub === 'string' ? sub : sub.name;
            return name && name.trim() !== '';
          })
          .map(sub => ({
            name: typeof sub === 'string' ? sub : sub.name,
            petas: (sub.petas || []).filter(p => p && p.trim() !== '')
          }))
      };

      if (editing) {
        await axios.put(`${API_BASE}/api/categories/${editing}`, cleanedForm, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      } else {
        await axios.post(`${API_BASE}/api/categories`, cleanedForm, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }
      setForm({ name: "", description: "", image: "", subcategories: [{ name: "", petas: [""] }] });
      setEditing(null);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving category");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      await axios.delete(`${API_BASE}/api/categories/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting category");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
            <Layers className="text-indigo-600 w-9 h-9" /> Categories
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage and organize product categories</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Category Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {editing ? <Edit3 size={20} className="text-indigo-600" /> : <Plus size={20} className="text-indigo-600" />}
                {editing ? "Update Category" : "New Category"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 px-1">Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Smartphones" 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-semibold transition-all" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 px-1">Description</label>
                  <textarea 
                    placeholder="Enter category description..." 
                    value={form.description} 
                    onChange={(e) => setForm({...form, description: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all min-h-[100px] resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 px-1">Thumbnail URL</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Public image link..." 
                      value={form.image} 
                      onChange={(e) => setForm({...form, image: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-xs font-semibold transition-all" 
                    />
                  </div>
                </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 px-1">Subcategories</label>
                    <div className="space-y-2">
                        {form.subcategories?.map((s, idx) => {
                          const name = typeof s === 'string' ? s : (s.name || "");
                          const petas = (typeof s === 'object' && s.petas) ? s.petas : [];
                          return (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Subcategory name"
                                value={name}
                                onChange={(e) => {
                                  const subs = [...(form.subcategories || [])];
                                  const val = e.target.value;
                                  subs[idx] = { ...(typeof subs[idx] === 'object' ? subs[idx] : {}), name: val, petas: petas };
                                  
                                  if (idx === subs.length - 1 && val.trim() !== "") {
                                    subs.push({ name: "", petas: [""] });
                                  }
                                  
                                  setForm({ ...form, subcategories: subs });
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              />
                              <button type="button" onClick={() => {
                                const subs = [...(form.subcategories || [])]; subs.splice(idx, 1); setForm({ ...form, subcategories: subs });
                              }} className="p-2 bg-rose-50 text-rose-600 rounded-lg">Remove</button>
                            </div>
                            <div className="pl-4">
                              <label className="text-xs font-medium text-slate-600">Peta Subcategories</label>
                              <div className="space-y-2 mt-2">
                                {petas.map((p, pidx) => (
                                  <div key={pidx} className="flex items-center gap-2">
                                    <input type="text" value={p} placeholder="Peta name" onChange={(e) => {
                                        const subs = [...(form.subcategories || [])];
                                        const val = e.target.value;
                                        const target = subs[idx] = { ...(typeof subs[idx] === 'object' ? subs[idx] : {}), name, petas: [...petas] };
                                        target.petas[pidx] = val;
                                        
                                        if (pidx === target.petas.length - 1 && val.trim() !== "") {
                                          target.petas.push("");
                                        }
                                        
                                        setForm({ ...form, subcategories: subs });
                                      }} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                    <button type="button" onClick={() => {
                                      const subs = [...(form.subcategories || [])];
                                      const target = subs[idx] = { ...(typeof subs[idx] === 'object' ? subs[idx] : {}), name, petas: [...petas] };
                                      target.petas.splice(pidx, 1);
                                      setForm({ ...form, subcategories: subs });
                                    }} className="p-2 bg-rose-50 text-rose-600 rounded-lg">Remove</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )})}
                      </div>
                  </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm"
                >
                  {editing ? "Save Changes" : "Create Category"}
                </button>
                {editing && (
                  <button 
                    type="button" 
                    onClick={() => { setEditing(null); setForm({ name: "", description: "", image: "", subcategories: [{ name: "", petas: [""] }] }); }} 
                    className="p-3 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" /> Categories
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{categories.length} Available Categories</p>
              </div>
            </div>

            {loading ? (
              <div className="p-24 flex flex-col items-center justify-center space-y-4 text-slate-400">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold">Loading categories...</p>
              </div>
            ) : categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map(cat => (
                      <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/100x100?text=NA"; }} />
                              ) : (
                                <Layers className="text-slate-300" size={18} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 tracking-tight">{cat.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                <p className="text-[10px] font-medium text-slate-500">
                                  {cat.isActive ? "Live" : "Inactive"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs line-clamp-2">
                            {cat.description || "No description provided."}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => navigate(`/admin/products?category=${cat._id}`)}
                              className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                              title="View Products"
                            >
                              <Package size={14} />
                            </button>
                            <button 
                              onClick={async () => { 
                                try {
                                  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
                                  const res = await axios.get(`${API_BASE}/api/categories/${cat._id}/subcategories`, { headers: { Authorization: `Bearer ${token}` } });
                                  const subs = res.data.map(s => {
                                    const petasArray = (s.petas||[]).map(p => p.name);
                                    if (petasArray.length === 0 || petasArray[petasArray.length - 1] !== "") {
                                      petasArray.push("");
                                    }
                                    return { name: s.name, petas: petasArray };
                                  });
                                  if (subs.length === 0 || subs[subs.length - 1].name !== "") {
                                    subs.push({ name: "", petas: [""] });
                                  }
                                  setForm({ name: cat.name, description: cat.description, image: cat.image, subcategories: subs });
                                  setEditing(cat._id);
                                } catch (err) {
                                  setForm({ name: cat.name, description: cat.description, image: cat.image, subcategories: [{ name: "", petas: [""] }] });
                                  setEditing(cat._id);
                                }
                              }} 
                              className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(cat._id)} 
                              className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-24 text-center space-y-6">
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">No Categories Found</h3>
                  <p className="text-slate-500 font-medium">Create your first category to get started.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-10 text-white flex items-center justify-between shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Inventory Access</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">Manage all products associated with your categories.</p>
              <button onClick={() => navigate("/admin/products")} className="mt-6 flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider group-hover:gap-4 transition-all">
                Go to Products <ArrowRight size={14} />
              </button>
            </div>
            <Layers className="absolute -right-12 -bottom-12 w-60 h-60 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
