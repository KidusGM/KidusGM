import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);

        const response = await fetch(
          `https://dummyjson.com/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Product not found.");
        }

        const data = await response.json();

        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-page">
        Finding product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-page">
        <h2>Product unavailable.</h2>

        <p>
          We couldn't find product #{id}.
        </p>

        <Link
          to="/products"
          className="primary-button"
        >
          Return to collection
        </Link>
      </div>
    );
  }

  const saved = isInWishlist(product.id);

  return (
    <div className="details-page">

      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Go back
      </button>

      <div className="details-layout">

        <div className="details-image">
          <img
            src={product.images?.[0] || product.thumbnail}
            alt={product.title}
          />
        </div>

        <div className="details-content">

          <span className="eyebrow">
            {product.category}
          </span>

          <h1>{product.title}</h1>

          <div className="detail-rating">
            ★ {product.rating.toFixed(1)}
          </div>

          <p className="details-description">
            {product.description}
          </p>

          <div className="details-price">
            ${product.price.toFixed(2)}
          </div>

          <p>
            Stock available:{" "}
            <strong>{product.stock}</strong>
          </p>

          <div className="detail-actions">

            <button
              className="primary-button"
              onClick={() => addToCart(product)}
            >
              Add to cart
            </button>

            <button
              className={`wishlist-large ${
                saved ? "saved" : ""
              }`}
              onClick={() =>
                toggleWishlist(product)
              }
            >
              {saved
                ? "♥ Saved"
                : "♡ Save for later"}
            </button>

          </div>

          <div className="product-info-box">
            <div>
              <span>Brand</span>
              <strong>{product.brand || "ShopSphere"}</strong>
            </div>

            <div>
              <span>SKU</span>
              <strong>{product.sku || `SS-${id}`}</strong>
            </div>

            <div>
              <span>Warranty</span>
              <strong>12 months</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ProductDetails;