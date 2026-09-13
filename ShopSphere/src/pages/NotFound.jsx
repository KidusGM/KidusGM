import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found">

      <span className="not-found-number">
        404
      </span>

      <h1>
        This corner of ShopSphere doesn't exist.
      </h1>

      <p>
        The page you're looking for may have moved,
        disappeared, or never existed.
      </p>

      <Link
        to="/"
        className="primary-button"
      >
        Return home
      </Link>

    </div>
  );
}

export default NotFound;