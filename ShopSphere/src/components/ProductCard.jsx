import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const saved = isInWishlist(product.id);

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.thumbnail}
          alt={product.title}
        />

        <button
          className={`wishlist-button ${saved ? "saved" : ""}`}
          onClick={() => toggleWishlist(product)}
        >
          {saved ? "♥" : "♡"}
        </button>

        {product.discountPercentage > 10 && (
          <span className="discount-badge">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
      </div>

      <div className="product-card-content">
        <span className="product-category">
          {product.category}
        </span>

        <Link
          to={`/products/${product.id}`}
          className="product-name"
        >
          {product.title}
        </Link>

        <div className="rating">
          ★ {product.rating.toFixed(1)}
        </div>

        <div className="product-bottom">
          <strong>${product.price.toFixed(2)}</strong>

          <button
            className="add-button"
            onClick={() => addToCart(product)}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;