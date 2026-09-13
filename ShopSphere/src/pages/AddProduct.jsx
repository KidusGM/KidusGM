import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: 10,
    brand: "",
    rating: 5,
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.title ||
      !form.price ||
      !form.category ||
      !form.description ||
      !form.image
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const newProduct = addProduct(form);

    setMessage("Product added successfully!");

    setTimeout(() => {
      navigate(`/products/${newProduct.id}`);
    }, 500);
  }

  return (
    <main className="add-product-page">
      <section className="add-product-header">
        <span className="eyebrow">PRODUCT STUDIO</span>

        <h1>Add Your Product</h1>

        <p>
          Create your own product and add it to the ShopSphere
          marketplace.
        </p>
      </section>

      <section className="product-form-layout">

        {/* FORM */}
        <form
          className="product-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Product Name</label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Ethiopian Leather Bag"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="1500"
              />
            </div>

            <div className="form-group">
              <label>Stock</label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>

            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Fashion"
            />
          </div>

          <div className="form-group">
            <label>Brand</label>

            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Your Brand"
            />
          </div>

          <div className="form-group">
            <label>Product Image URL</label>

            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Rating</label>

            <input
              type="number"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
            />
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            Add Product
          </button>

          {message && (
            <p className="form-message">
              {message}
            </p>
          )}
        </form>

        {/* LIVE PREVIEW */}
        <div className="product-preview">
          <span className="eyebrow">LIVE PREVIEW</span>

          <div className="preview-card">
            {form.image ? (
              <img
                src={form.image}
                alt={form.title}
              />
            ) : (
              <div className="preview-placeholder">
                Product Image
              </div>
            )}

            <div className="preview-content">
              <span>
                {form.category || "Category"}
              </span>

              <h2>
                {form.title || "Your Product Name"}
              </h2>

              <p>
                {form.description ||
                  "Your product description will appear here."}
              </p>

              <strong>
                ETB {form.price || "0"}
              </strong>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}

export default AddProduct;