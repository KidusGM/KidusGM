import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <nav>
        <Link to="/">K-Properties</Link>
        <Link to="/properties">Properties</Link>
        <Link to="/add-property">Add Property</Link>
        <Link to="/manage-properties">Manage Properties</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;