import { NavLink, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { totalItems } = useCart();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-mark">S</span>

        <span>
          Shop<span>Sphere</span>
        </span>
      </Link>

      <nav>
        <NavLink to="/">Home</NavLink>

        <NavLink to="/products">Discover</NavLink>
        <NavLink to="/add-product"> Add Product</NavLink>

        <NavLink to="/categories">Categories</NavLink>

        <NavLink to="/about">About</NavLink>
      </nav>

      <div className="nav-actions">
        <button
          className="theme-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {darkMode ? "☀" : "☾"}
        </button>

        <Link to="/cart" className="cart-button">
          🛒
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
