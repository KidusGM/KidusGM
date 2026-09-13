import { Link } from "react-router-dom";

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">◎</div>

      <h2>{title}</h2>

      <p>{message}</p>

      <Link to="/products" className="primary-button">
        Browse products
      </Link>
    </div>
  );
}

export default EmptyState;