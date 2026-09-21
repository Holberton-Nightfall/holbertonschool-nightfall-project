import './Card.css';

export default function Card({ title, image, badge, children }) {
  return (
    <article className="card">
      {image && (
        <div className="card__media">
          <img src={image} alt="" loading="lazy" />
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
