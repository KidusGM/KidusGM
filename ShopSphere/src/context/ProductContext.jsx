import { createContext, useContext, useEffect, useState } from "react";

const ProductContext = createContext();

const API_URL = "https://dummyjson.com/products?limit=100";
const STORAGE_KEY = "shopsphere-custom-products";

export function ProductProvider({ children }) {
  const [apiProducts, setApiProducts] = useState([]);
  const [customProducts, setCustomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load products from API
  useEffect(() => {
    async function getProducts() {
      try {
        setLoading(true);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        setApiProducts(data.products);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    getProducts();
  }, []);

  // Load your products from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEY);

    if (savedProducts) {
      try {
        setCustomProducts(JSON.parse(savedProducts));
      } catch {
        setCustomProducts([]);
      }
    }
  }, []);

  // Save your products whenever they change
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(customProducts)
    );
  }, [customProducts]);

  // API products + your products
  const products = [...apiProducts, ...customProducts];

  // Add your own product
  function addProduct(productData) {
    const newProduct = {
      id: `custom-${Date.now()}`,
      title: productData.title,
      description: productData.description,
      category: productData.category,
      price: Number(productData.price),
      rating: Number(productData.rating) || 5,
      stock: Number(productData.stock),
      brand: productData.brand,
      thumbnail: productData.image,
      images: [productData.image],
      discountPercentage: 0,
      isCustom: true,
    };

    setCustomProducts((currentProducts) => [
      ...currentProducts,
      newProduct,
    ]);

    return newProduct;
  }

  // Find one product
  function getProductById(id) {
    return products.find(
      (product) => String(product.id) === String(id)
    );
  }

  // Delete one of your products
  function deleteCustomProduct(id) {
    setCustomProducts((currentProducts) =>
      currentProducts.filter(
        (product) => String(product.id) !== String(id)
      )
    );
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        customProducts,
        loading,
        error,
        addProduct,
        getProductById,
        deleteCustomProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}