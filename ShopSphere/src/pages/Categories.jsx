import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          "https://dummyjson.com/products?limit=100"
        );

        const data = await response.json();

        const uniqueCategories = [
          ...new Set(
            data.products.map(
              (product) => product.category
            )
          ),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        Organizing categories...
      </div>
    );
  }

  return (
    <div className="categories-page">

      <div className="category-intro">
        <span className="eyebrow">
          SHOP BY INTEREST
        </span>

        <h1>
          Pick a world.
          <br />
          We'll handle the rabbit hole.
        </h1>
      </div>

      <div className="category-grid large">

        {categories.map((category, index) => (
          <Link
            key={category}
            to={`/products?category=${encodeURIComponent(
              category
            )}`}
            className="category-tile"
          >
            <small>
              0{index + 1}
            </small>

            <h2>{category}</h2>

            <span>
              Explore →
            </span>
          </Link>
        ))}

      </div>

    </div>
  );
}

export default Categories;