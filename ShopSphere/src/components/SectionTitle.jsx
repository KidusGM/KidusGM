function SectionTitle({ eyebrow, title, description, children }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>

      {children}
    </div>
  );
}

export default SectionTitle;