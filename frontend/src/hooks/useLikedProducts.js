import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "likedProducts";
const STORAGE_EVENT = "liked-products-updated";

const readLikes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to read liked products", error);
    return [];
  }
};

const persistLikes = (likes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
  window.dispatchEvent(new Event(STORAGE_EVENT));
};

export const useLikedProducts = () => {
  const [likedProducts, setLikedProducts] = useState(() => readLikes());

  useEffect(() => {
    const handleStorageChange = () => {
      setLikedProducts(readLikes());
    };

    window.addEventListener(STORAGE_EVENT, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleLike = useCallback((productId) => {
    let next;
    setLikedProducts((prev) => {
      next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      persistLikes(next);
      return next;
    });
  }, []);

  const isLiked = useCallback((productId) => likedProducts.includes(productId), [likedProducts]);

  return {
    likedProducts,
    toggleLike,
    isLiked,
  };
};
