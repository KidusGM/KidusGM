import { useState } from "react";

function About() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      message: "",
    });
  }

  return (
    <div className="about-page">

      <section className="about-hero">
        <span className="eyebrow">
          ABOUT SHOPSPHERE
        </span>

        <h1>
          Shopping should feel like discovery,
          not paperwork.
        </h1>

        <p>
          ShopSphere is a React-powered shopping experience
          created around one simple idea: make browsing
          interesting products feel simple and human.
        </p>
      </section>

      <section className="about-grid">

        <div>
          <span className="eyebrow">
            WHY IT EXISTS
          </span>

          <h2>
            Less scrolling.
            Better finding.
          </h2>
        </div>

        <div>
          <p>
            ShopSphere combines product discovery, filtering,
            dynamic routes, persistent shopping state and
            reusable React components into one application.
          </p>

          <p>
            Products are loaded dynamically from an external
            API, while cart and wishlist information remains
            available through local storage.
          </p>
        </div>

      </section>

      <section className="contact-section">

        <div>
          <span className="eyebrow">
            SAY HELLO
          </span>

          <h2>
            Have an idea?
          </h2>

          <p>
            This demo form demonstrates controlled React inputs
            and form submission.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your email"
            required
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your message"
            rows="5"
            required
          />

          <button
            className="primary-button"
            type="submit"
          >
            Send message
          </button>

          {submitted && (
            <p className="success-message">
              Message received. Thanks for stopping by.
            </p>
          )}

        </form>

      </section>

    </div>
  );
}

export default About;