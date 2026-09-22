export default function Card({ title, image, fallback, badge, children }) {
  return (
    <article className="group clip-corner bg-bg-elevated/90 border border-border transition-[border-color,transform] duration-300 hover:border-accent/50 hover:-translate-y-1">
      {image && (
        <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-accent">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover [filter:grayscale(.55)_contrast(1.1)_brightness(.7)_sepia(.2)] transition-[filter,transform] duration-400 group-hover:[filter:grayscale(.1)_contrast(1.15)_brightness(.85)] group-hover:scale-105"
            onError={(e) => { if (fallback && !e.currentTarget.src.endsWith(fallback)) e.currentTarget.src = fallback; }}
          />
          {badge && <div className="absolute top-2 left-2 bg-bg/80">{badge}</div>}
        </div>
      )}
      <div className="flex flex-col items-start gap-2 p-4">
        {title && <h3 className="m-0 text-text">{title}</h3>}
        {children}
      </div>
    </article>
  );
}
