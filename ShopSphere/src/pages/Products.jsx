import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";

const API_URL = "https://dummyjson.com/products?limit=100";

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const selectedCategory =
    searchParams.get("category") || "all";

  const [sort, setSort] = useState("featured");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }

        const data = await response.json();

        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(products.map((product) => product.category)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, search, selectedCategory, sort]);

  function handleSearch(event) {
    event.preventDefault();

    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (selectedCategory !== "all") {
      params.category = selectedCategory;
    }

    setSearchParams(params);
  }

  function changeCategory(category) {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (category !== "all") {
      params.category = category;
    }

    setSearchParams(params);
  }

  if (loading) {
    return (
      <div className="loading-page">
        Loading ShopSphere...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Something went wrong.</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="products-page">

      <SectionTitle
        eyebrow="THE COLLECTION"
        title="Discover your next find"
        description={`${filteredProducts.length} products currently matching your view.`}
      />

      <form
        className="search-bar"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search products..."
        />

        <button type="submit">
          Search
        </button>
      </form>

      <div className="filter-area">

        <div className="category-filter">
          <button
            className={
              selectedCategory === "all"
                ? "active"
                : ""
            }
            onClick={() => changeCategory("all")}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeCategory(category)
              }
            >
              {category}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="featured">
            Featured
          </option>

          <option value="price-low">
            Price: Low → High
          </option>

          <option value="price-high">
            Price: High → Low
          </option>

          <option value="rating">
            Highest Rated
          </option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-results">
          <h2>No products found.</h2>
          <p>
            Try another search term or category.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default Products;