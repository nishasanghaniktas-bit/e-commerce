import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  SlidersHorizontal, 
  Search, 
  Star, 
  ChevronRight, 
  X, 
  Zap, 
  Cpu, 
  Layers, 
  Filter, 
  ArrowUpRight,
  TrendingUp,
  History
} from "lucide-react";
import { API_BASE } from "../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../utils/imageUrl";
import ProductCard from "../components/ProductCard";
import SelectDropdown from "../components/SelectDropdown";

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [petaSubcategories, setPetaSubcategories] = useState([]);
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "", rating: "" });
  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products`),
        axios.get(`${API_BASE}/api/categories`)
      ]);
      setProducts(productsRes.data?.data || productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(p => {
        const pCat = p.category?._id || p.category || "";
        return pCat === filters.category;
      });
    }
    if (filters.subcategory) {
      filtered = filtered.filter(p => {
        const pSub = p.subcategory?._id || p.subcategory || "";
        return pSub === filters.subcategory;
      });
    }
    if (filters.peta_subcategory) {
      filtered = filtered.filter(p => {
        const pPeta = p.peta_subcategory?._id || p.peta_subcategory || "";
        return pPeta === filters.peta_subcategory;
      });
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(filters.maxPrice));
    }
    if (filters.rating) {
      filtered = filtered.filter(p => p.rating >= Number(filters.rating));
    }

    if (sort === "price_low") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "price_high") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "rating") filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [products, filters, sort, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header / Hero Area */}
      <div className="bg-white border-b border-slate-200 py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                <Layers size={14} /> Global Catalog
              </div>
              <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-none">
                {filters.category ? (
                  <><span className="text-indigo-600">{(categories.find(c => c._id === filters.category)?.name) || filters.category}</span> Collection</>
                ) : "Our Products"}
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Explore our extensive collection of premium smartphones and accessories. {filteredProducts.length} items found.
              </p>
              {filters.category && subcategories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {subcategories.map(s => (
                    <button key={s._id} onClick={() => setFilters({...filters, subcategory: s._id})} className={`px-3 py-1 rounded-full text-xs ${filters.subcategory===s._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..." 
                  className="w-full sm:w-80 bg-slate-100 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold text-sm"
                />
              </div>
              <div className="relative w-full sm:w-60">
                <SelectDropdown
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: "newest", label: "Newest Arrivals" },
                    { value: "price_low", label: "Price: Low to High" },
                    { value: "price_high", label: "Price: High to Low" },
                    { value: "rating", label: "Top Rated" },
                  ]}
                  className="w-full font-semibold"
                  buttonClassName="w-full rounded-2xl py-4 px-6 bg-white border border-slate-200"
                />
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 space-y-12 shrink-0">
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 flex items-center">
                  <Filter className="w-4 h-4 mr-2" /> Global Filters
                </h3>
                {(filters.category || filters.minPrice || filters.maxPrice || filters.rating || searchQuery) && (
                  <button 
                    onClick={() => {
                      setFilters({ category: "", minPrice: "", maxPrice: "", rating: "" });
                      setSearchQuery("");
                    }}
                    className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                {petaSubcategories.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-bold text-slate-900 block">Peta Subcategories</label>
                      <div className="mt-2">
                        <SelectDropdown
                          value={filters.peta_subcategory}
                          onChange={(val) => setFilters({ ...filters, peta_subcategory: val })}
                          options={[{ value: "", label: "All" }, ...(petaSubcategories || []).map((ps) => ({ value: ps._id, label: ps.name }))]}
                          className="w-full"
                          buttonClassName="w-full rounded-xl py-2 px-4 bg-white border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>
                )}
              </div>
              
                <div className="space-y-6">
                  <label className="text-sm font-bold text-slate-900 block">Categories</label>
                  <div>
                    <SelectDropdown
                      value={filters.category}
                      onChange={async (val) => {
                        setFilters({ ...filters, category: val, subcategory: "", peta_subcategory: "" });
                        if (val) {
                          try {
                            const res = await axios.get(`${API_BASE}/api/categories/${val}/subcategories`);
                            setSubcategories(res.data || []);
                          } catch (err) {
                            setSubcategories([]);
                          }
                        } else {
                          setSubcategories([]);
                          setPetaSubcategories([]);
                        }
                      }}
                      options={[{ value: "", label: "All Items" }, ...(categories || []).map((c) => ({ value: c._id, label: c.name }))]}
                      className="w-full"
                      buttonClassName="w-full rounded-xl py-2 px-4 bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  {subcategories.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-bold text-slate-900 block">Subcategories</label>
                      <div className="mt-2">
                        <SelectDropdown
                          value={filters.subcategory}
                          onChange={async (val) => {
                            setFilters({ ...filters, subcategory: val, peta_subcategory: "" });
                            if (val) {
                              try {
                                const res = await axios.get(`${API_BASE}/api/categories/subcategories/${val}/petasubcategories`);
                                setPetaSubcategories(res.data || []);
                              } catch (err) {
                                setPetaSubcategories([]);
                              }
                            } else {
                              setPetaSubcategories([]);
                            }
                          }}
                          options={[{ value: "", label: "All" }, ...(subcategories || []).map((s) => ({ value: s._id, label: s.name }))]}
                          className="w-full"
                          buttonClassName="w-full rounded-xl py-2 px-4 bg-white border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-6">
                <label className="text-sm font-bold text-slate-900 block">Price Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">Min Price</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={filters.minPrice} 
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:ring-4 focus:ring-indigo-50 outline-none font-semibold text-sm transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">Max Price</span>
                    <input 
                      type="number" 
                      placeholder="∞" 
                      value={filters.maxPrice} 
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:ring-4 focus:ring-indigo-50 outline-none font-semibold text-sm transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-bold text-slate-900 block">Customer Rating</label>
                <div className="space-y-2">
                  {[4, 3, 2].map(r => (
                    <button 
                      key={r}
                      onClick={() => setFilters({...filters, rating: r.toString()})}
                      className={`flex items-center justify-between w-full px-5 py-4 rounded-xl transition-all border ${filters.rating === r.toString() ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r ? 'text-indigo-500 fill-indigo-500' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{r} Stars & Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 relative overflow-hidden group">
              <Zap className="absolute -right-10 -top-10 w-40 h-40 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              <div className="relative z-10">
                <h4 className="text-xl font-bold tracking-tight leading-none mb-2">Exclusive Deals</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Join our membership program to get early access to new launches and exclusive discounts.</p>
                <button className="mt-6 w-full py-4 bg-white text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-95">Learn More</button>
              </div>
            </section>
          </aside>

          {/* Grid Area */}
          <main className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onView={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">No Results Found</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">We couldn't find any products that match your search filters. Try using different criteria.</p>
                </div>
                <button 
                  onClick={() => {
                    setFilters({ category: "", minPrice: "", maxPrice: "", rating: "" });
                    setSearchQuery("");
                  }}
                  className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
