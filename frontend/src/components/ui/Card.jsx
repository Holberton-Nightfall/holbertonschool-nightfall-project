import './Card.css';

export default function Card({ title, image, fallback, badge, children }) {
  return (
    <article className="card">
      {image && (
        <div className="card__media">
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={(e) => { if (fallback && !e.currentTarget.src.endsWith(fallback)) e.currentTarget.src = fallback; }}
          />
          {badge && <div className="card__badge">{badge}</div>}
        </div>
      )}
      <div className="card__body">
        {title && <h3 className="card__title">{title}</h3>}
        {children}
      </div>
    </article>
  );
}
