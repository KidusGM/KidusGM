import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("shopsphere-wishlist");

    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "shopsphere-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  function toggleWishlist(product) {
    setWishlist((current) => {
      const exists = current.some((item) => item.id === product.id);

      if (exists) {
        return current.filter((item) => item.id !== product.id);
      }

      return [...current, product];
    });
  }

  function isInWishlist(id) {
    return wishlist.some((item) => item.id === id);
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}