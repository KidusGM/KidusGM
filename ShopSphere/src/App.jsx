import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


import Home from "./pages/Home";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;