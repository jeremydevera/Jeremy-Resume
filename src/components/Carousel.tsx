import { useEffect, useState } from "react";

type Slide = { url: string; alt: string };

export function Carousel({ images }: { images: Slide[] }) {
  const [i, setI] = useState(0);
  const n = images.length;

  useEffect(() => {
    setI(0);
  }, [images]);

  useEffect(() => {
    if (n <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setI((p) => (p - 1 + n) % n);
      if (e.key === "ArrowRight") setI((p) => (p + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  if (n === 0) return null;
  const go = (d: number) => setI((p) => (p + d + n) % n);

  return (
    <div className="carousel">
      <div className="carousel-stage">
        <img src={images[i].url} alt={images[i].alt} />
        {n > 1 && (
          <>
            <button className="carousel-nav prev" onClick={() => go(-1)} aria-label="Previous image">
              ‹
            </button>
            <button className="carousel-nav next" onClick={() => go(1)} aria-label="Next image">
              ›
            </button>
            <div className="carousel-count">
              {i + 1} / {n}
            </div>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="carousel-thumbs">
          {images.map((im, idx) => (
            <button
              key={idx}
              className={`carousel-thumb${idx === i ? " active" : ""}`}
              onClick={() => setI(idx)}
              aria-label={`Go to image ${idx + 1}`}
            >
              <img src={im.url} alt={im.alt} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
