import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import EmptyState from "../components/EmptyState";

function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    totalPrice,
  } = useCart();

  if (cart.length === 0) {
    return (
      <EmptyState
        title="Your cart is still thinking."
        message="Add something interesting and it will appear here."
      />
    );
  }

  return (
    <div className="cart-page">

      <div className="cart-heading">
        <span className="eyebrow">YOUR BAG</span>

        <h1>
          Ready when you are.
        </h1>
      </div>

      <div className="cart-layout">

        <div className="cart-items">

          {cart.map((item) => (
            <div
              className="cart-item"
              key={item.id}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
              />

              <div className="cart-item-info">
                <span>{item.category}</span>

                <h3>{item.title}</h3>

                <strong>
                  ${item.price.toFixed(2)}
                </strong>
              </div>

              <div className="quantity-control">
                <button
                  onClick={() =>
                    decreaseQuantity(item.id)
                  }
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    increaseQuantity(item.id)
                  }
                >
                  +
                </button>
              </div>

              <button
                className="remove-button"
                onClick={() =>
                  removeFromCart(item.id)
                }
              >
                Remove
              </button>
            </div>
          ))}

        </div>

        <aside className="cart-summary">

          <span className="eyebrow">
            SUMMARY
          </span>

          <h2>
            ${totalPrice.toFixed(2)}
          </h2>

          <p>
            Taxes and delivery calculated at checkout.
          </p>

          <button
            className="checkout-button"
            onClick={() =>
              alert(
                "Demo checkout: your order has been prepared!"
              )
            }
          >
            Continue to checkout
          </button>

          <Link
            to="/products"
            className="continue-shopping"
          >
            ← Continue shopping
          </Link>

        </aside>

      </div>
    </div>
  );
}

export default Cart;