import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";

const API_URL = "https://dummyjson.com/products?limit=100";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const featuredProducts = products
    .filter((product) => product.rating >= 4.7)
    .slice(0, 4);

  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].slice(0, 6);

  return (
    <div className="home-page">

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            THE EVERYDAY EDIT
          </span>

          <h1>
            Find something
            <span> unexpectedly good.</span>
          </h1>

          <p>
            Shop a constantly changing collection of
            electronics, fashion, beauty, accessories and
            everyday essentials.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="primary-button">
              Explore the collection
            </Link>

            <Link
              to="/categories"
              className="secondary-button"
            >
              Browse categories
            </Link>
          </div>
        </div>

        <div className="hero-art">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="hero-card">
            <span>01</span>
            <strong>Everything You Need</strong>
            <small>ShopSphere</small>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div>
          <strong>100+</strong>
          <span>Products</span>
        </div>

        <div>
          <strong>24/7</strong>
          <span>Discovery</span>
        </div>

        <div>
          <strong>4.5+</strong>
          <span>Average rating</span>
        </div>

        <div>
          <strong>∞</strong>
          <span>Possibilities</span>
        </div>
      </section>

      <section className="page-section">
        <SectionTitle
          eyebrow="TRENDING NOW"
          title="Products people are noticing"
          description="A few highly rated finds from today's collection."
        >
          <Link to="/products" className="text-link">
            See everything →
          </Link>
        </SectionTitle>

        {loading ? (
          <div className="loading">
            Loading the collection...
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      <section className="promo-section">
        <div>
          <span className="eyebrow">THE SHOPSPHERE RULE</span>

          <h2>
            Don't buy everything.
            <br />
            Find the right thing.
          </h2>

          <p>
            Search smarter, compare products and build your
            cart without getting lost in an endless catalog.
          </p>

          <Link
            to="/products"
            className="primary-button"
          >
            Start exploring
          </Link>
        </div>
      </section>

      <section className="page-section">
        <SectionTitle
          eyebrow="EXPLORE"
          title="Shop by world"
        />

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(
                category
              )}`}
              className="category-tile"
            >
              <span>↗</span>

              <h3>{category}</h3>

              <p>Explore collection</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;