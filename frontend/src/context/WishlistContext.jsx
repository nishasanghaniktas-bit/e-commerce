import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { API_BASE } from "../utils/apiBase";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = user?.token;

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!token || user?.role === "admin") return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = (res.data.products || []).map((p) =>
        typeof p === "string" ? p : p._id
      );
      setWishlistIds(ids);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Clear wishlist when user logs out
  useEffect(() => {
    if (!user) setWishlistIds([]);
  }, [user]);

  const isInWishlist = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!token) return;
      const alreadyIn = wishlistIds.includes(productId);

      // Optimistic update
      setWishlistIds((prev) =>
        alreadyIn ? prev.filter((id) => id !== productId) : [...prev, productId]
      );

      try {
        if (alreadyIn) {
          await axios.delete(`${API_BASE}/api/wishlist/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await axios.post(
            `${API_BASE}/api/wishlist`,
            { productId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (err) {
        // Revert optimistic update on error
        setWishlistIds((prev) =>
          alreadyIn ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        console.error("Wishlist toggle error:", err);
      }
    },
    [token, wishlistIds]
  );

  const wishlistCount = wishlistIds.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        wishlistCount,
        loading,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
