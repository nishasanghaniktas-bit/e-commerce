import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../../utils/apiBase";
import ProductCard from "../../components/ProductCard";
import SelectDropdown from "../../components/SelectDropdown";
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  Package,
  Layers,
  ArrowUpDown,
  X,
  Image as ImageIcon,
  Edit,
  DollarSign,
  Tag,
  Hash
} from "lucide-react";

const emptyForm = {
  name: "",
  category: "",
  subcategory: "",
  peta_subcategory: "",
  price: "",
  stock: "",
  description: "",
  image: "",
  images: [],
  brand: "",
  specifications: [{ key: "", value: "" }],
};

function AdminProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [petaSubcategories, setPetaSubcategories] = useState([]);
  const [filters, setFilters] = useState(() => {
    const query = new URLSearchParams(location.search);
    return {
      category: query.get("category") || "",
      minPrice: "",
      maxPrice: "",
      search: ""
    };
  });
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Fetch products error:", errorData);
        throw new Error(errorData.message || "Failed to fetch products");
      }
      const data = await res.json();
      const items = data.data || data;
      setProducts(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.category || form.price === "" || form.stock === "") {
      alert("Please fill in all required fields (Name, Category, Price, Stock).");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      if (form.subcategory) formData.append("subcategory", form.subcategory);
      if (form.peta_subcategory) formData.append("peta_subcategory", form.peta_subcategory);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("description", form.description);
      if (form.brand) formData.append("brand", form.brand);
      
      const specs = (form.specifications || []).filter(s => s.key && s.key.trim() !== "");
      if (specs.length > 0) formData.append("specifications", JSON.stringify(specs));

      if (form.image && !imageFile) formData.append("image", form.image);
      if (imageFile) formData.append("image", imageFile);

      galleryFiles.forEach((file) => formData.append("images", file));

      if (!galleryFiles.length && Array.isArray(form.images)) {
        form.images.forEach((img) => formData.append("images", img));
      }

      const endpoint = editId
        ? `${API_BASE}/api/products/${editId}`
        : `${API_BASE}/api/products`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setShowModal(false);
        setEditId(null);
        setForm(emptyForm);
        setImageFile(null);
        setGalleryFiles([]);
        fetchProducts();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
    await fetch(`${API_BASE}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchProducts();
  };

  const handleEdit = (product) => {
    const catVal = product.category?._id || product.category || "";
    const subVal = product.subcategory?._id || product.subcategory || "";
    const petaVal = product.peta_subcategory?._id || product.peta_subcategory || "";
    setForm({
      ...product,
      category: catVal,
      subcategory: subVal,
      peta_subcategory: petaVal,
      images: product.images || [],
      specifications: product.specifications && product.specifications.length > 0 ? product.specifications : [{ key: "", value: "" }],
    });
    if (catVal) {
      fetch(`${API_BASE}/api/categories/${catVal}/subcategories`).then(r => r.ok ? r.json() : []).then(d => setSubcategories(d)).catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }

    if (subVal) {
      fetch(`${API_BASE}/api/categories/subcategories/${subVal}/petasubcategories`).then(r => r.ok ? r.json() : []).then(d => setPetaSubcategories(d)).catch(() => setPetaSubcategories([]));
    } else {
      setPetaSubcategories([]);
    }

    setEditId(product._id);
    setImageFile(null);
    setGalleryFiles([]);
    setShowModal(true);

  };

  const stats = useMemo(() => ({
    total: products.length,
    lowStock: products.filter(p => p.stock < 10).length,
    inStock: products.filter(p => p.stock >= 10).length,
  }), [products]);

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => {
        const pCat = product.category?._id || product.category || "";
        if (filters.category && pCat !== filters.category) return false;
        if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
        if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const aLow = a.stock < 10;
        const bLow = b.stock < 10;
        if (aLow && !bLow) return -1;
        if (!aLow && bLow) return 1;
        return 0;
      });
  }, [products, filters]);

  const resetFilters = () => {
    setFilters({ category: "", minPrice: "", maxPrice: "", search: "" });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Smartphone className="text-indigo-600 w-8 h-8" /> Products
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setForm(emptyForm);
            setImageFile(null);
            setGalleryFiles([]);
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Total Products</p>
            <h2 className="text-2xl font-bold text-slate-900">{stats.total}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.lowStock > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"}`}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Low Stock Alert</p>
            <h2 className={`text-2xl font-bold ${stats.lowStock > 0 ? "text-rose-600" : "text-slate-900"}`}>{stats.lowStock}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">In Stock</p>
            <h2 className="text-2xl font-bold text-slate-900">{stats.inStock}</h2>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid lg:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="lg:col-span-5 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="lg:col-span-3 relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <SelectDropdown
              value={filters.category}
              onChange={(val) => setFilters({ ...filters, category: val })}
              options={[{ value: "", label: "All Categories" }, ...(categories || []).map((cat) => ({ value: cat._id, label: cat.name }))]}
              className="w-full"
              buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-10 py-3 text-sm font-medium"
            />
          </div>

          {/* Price Range */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                placeholder="Min"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-3 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-3 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors shadow-sm flex-shrink-0"
            title="Reset Filters"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-sm">Loading products...</p>
        </div>
      ) : visibleProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onView={(id) => navigate(`/admin/products/${id}`)}
              renderActions={() => (
                <div className="flex gap-3 w-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(product);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-100"
                  >
                    <Edit size={16} /> Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product._id);
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-[0.95] transition border border-rose-100"
                    title="Delete Product"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
            <Filter className="w-10 h-10 text-slate-300" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">No Products Found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">None of our current products match your selected filters.</p>
          </div>
          <button onClick={resetFilters} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Reset Filters</button>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowModal(false)} />

          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editId ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Fill in the details below to {editId ? "update the" : "add a new"} product.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 px-1">Product Images</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group min-h-[140px]">
                      <div className="absolute inset-0 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-indigo-400 transition-all overflow-hidden">
                        {imageFile || form.image ? (
                          <img
                            src={imageFile ? URL.createObjectURL(imageFile) : (form.image?.startsWith("http") ? form.image : `${API_BASE}/${form.image}`)}
                            alt="Preview"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="mx-auto mb-1 text-slate-400" size={20} />
                            <p className="text-xs font-semibold text-slate-500">Main Image</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="relative group min-h-[140px]">
                      <div className="absolute inset-0 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-indigo-400 transition-all overflow-hidden">
                        {galleryFiles.length > 0 || (form.images && form.images.length > 0) ? (
                          <div className="grid grid-cols-2 gap-1 p-2 w-full h-full overflow-y-auto">
                            {(galleryFiles.length > 0 ? galleryFiles : form.images).map((file, idx) => (
                              <img
                                key={idx}
                                src={typeof file === "string" ? (file.startsWith("http") ? file : `${API_BASE}/${file}`) : URL.createObjectURL(file)}
                                alt="Gallery"
                                className="w-full h-full object-cover rounded-md"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center">
                            <Plus className="mx-auto mb-1 text-slate-400" size={20} />
                            <p className="text-xs font-semibold text-slate-500">Gallery</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
                      />
                    </div>
                    {(galleryFiles.length > 0 || (form.images && form.images.length > 0)) && (
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => { setGalleryFiles([]); setForm({ ...form, images: [] }); }}
                          className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                        >
                          Clear Gallery
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Reference Image URL (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  {(imageFile || form.image) && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setForm({ ...form, image: "" }); }}
                      className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline ml-1"
                    >
                      Clear Main Image
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Product Name</label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                      <input
                        type="text"
                        placeholder="e.g. iPhone 15 Pro"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Category</label>
                    <div className="relative group">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                      <SelectDropdown
                        value={form.category}
                        onChange={async (val) => {
                          const valStr = val;
                          setForm({ ...form, category: valStr, subcategory: "", peta_subcategory: "" });
                          if (valStr) {
                            try {
                              const res = await fetch(`${API_BASE}/api/categories/${valStr}/subcategories`);
                              if (res.ok) {
                                const data = await res.json();
                                setSubcategories(data);
                              } else setSubcategories([]);
                            } catch (err) {
                              setSubcategories([]);
                            }
                          } else setSubcategories([]);
                        }}
                        options={[{ value: "", label: "Select Category" }, ...(categories || []).map((cat) => ({ value: cat._id, label: cat.name }))]}
                        className="w-full"
                        buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-10 py-3 text-sm font-medium"
                      />
                    </div>
                  </div>
                  {subcategories && subcategories.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 px-1">Subcategory</label>
                      <div className="relative group">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <SelectDropdown
                          value={form.subcategory}
                          onChange={async (val) => {
                            const valStr = val;
                            setForm({ ...form, subcategory: valStr, peta_subcategory: "" });
                            if (valStr) {
                              try {
                                const res = await fetch(`${API_BASE}/api/categories/subcategories/${valStr}/petasubcategories`);
                                if (res.ok) {
                                  const data = await res.json();
                                  setPetaSubcategories(data);
                                } else setPetaSubcategories([]);
                              } catch (err) { setPetaSubcategories([]); }
                            } else setPetaSubcategories([]);
                          }}
                          options={[{ value: "", label: "Select Subcategory" }, ...(subcategories || []).map((s) => ({ value: s._id, label: s.name }))]}
                          className="w-full"
                          buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-10 py-3 text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {petaSubcategories && petaSubcategories.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 px-1">Peta Subcategory</label>
                      <div className="relative group">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <SelectDropdown
                          value={form.peta_subcategory}
                          onChange={(val) => setForm({ ...form, peta_subcategory: val })}
                          options={[{ value: "", label: "Select Peta Subcategory" }, ...(petaSubcategories || []).map((p) => ({ value: p._id, label: p.name }))]}
                          className="w-full"
                          buttonClassName="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-10 py-3 text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Price (₹)</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Stock</label>
                    <div className="relative group">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Brand</label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                      <input
                        type="text"
                        placeholder="e.g. Apple"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 px-1">Description</label>
                  <textarea
                    placeholder="Enter product description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all min-h-[120px] resize-none"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-slate-700">Specifications</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, specifications: [...(form.specifications || []), { key: "", value: "" }] })}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      + Add Field
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(form.specifications || []).length === 0 && (
                      <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-sm font-medium text-slate-500">No specifications added</p>
                      </div>
                    )}
                    {(form.specifications || []).map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <input
                          type="text"
                          placeholder="Name (e.g. Display)"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
                          value={spec.key}
                          onChange={(e) => {
                            const newSpecs = [...(form.specifications || [])];
                            newSpecs[idx] = { ...spec, key: e.target.value };
                            setForm({ ...form, specifications: newSpecs });
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 6.1-inch OLED)"
                          className="flex-[2] bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium transition-all"
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...(form.specifications || [])];
                            newSpecs[idx] = { ...spec, value: e.target.value };
                            setForm({ ...form, specifications: newSpecs });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newSpecs = (form.specifications || []).filter((_, i) => i !== idx);
                            setForm({ ...form, specifications: newSpecs });
                          }}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors shrink-0"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {editId ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
