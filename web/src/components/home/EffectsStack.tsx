"use client";

import { useEffect, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Full-viewport sticky stack.
 *
 * 1. A card pins at top:0 and fills the screen.
 * 2. It stays alone for --fx-hold — the next card is still below the fold.
 * 3. Only then the next full-screen card slides up and covers the previous.
 * 4. Scroll up is the same motion in reverse.
 *
 * Image and text share one CSS grid cell (no position:absolute on the photo).
 */

type CardDef = {
  key: string;
  titleKey: "neuroTitle" | "whyTitle" | "title";
  bodyKey: "neuroBody" | "whyBody" | "body";
  media: string;
  video?: string;
  cta?: boolean;
};

const CARDS: CardDef[] = [
  {
    key: "neuro",
    titleKey: "neuroTitle",
    bodyKey: "neuroBody",
    media: "/media/sections/fx-cards/card-1.png",
  },
  {
    key: "why",
    titleKey: "whyTitle",
    bodyKey: "whyBody",
    media: "/media/sections/fx-cards/card-2.png",
  },
  {
    key: "effects",
    titleKey: "title",
    bodyKey: "body",
    media: "/media/sections/fx-cards/card-3.jpg",
    video: "/media/brain.mp4",
    cta: true,
  },
];

export function EffectsStack() {
  const t = useTranslations("effects");

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLVideoElement>(".np-fx-card video");
    const play = (v: HTMLVideoElement) => {
      v.muted = true;
      v.play().catch(() => {});
    };
    const stops: Array<() => void> = [];
    nodes.forEach((v) => {
      const onReady = () => play(v);
      play(v);
      v.addEventListener("loadeddata", onReady);
      stops.push(() => v.removeEventListener("loadeddata", onReady));
    });
    return () => {
      stops.forEach((stop) => stop());
    };
  }, []);

  return (
    <section className="np-fx-stack" aria-label={t("title")}>
      {CARDS.map((card, i) => (
        <div
          key={card.key}
          className={
            i === CARDS.length - 1 ? "np-fx-slot np-fx-slot--last" : "np-fx-slot"
          }
          style={{ zIndex: i + 1 } as CSSProperties}
        >
          <article className="np-fx-card">
            <div className="np-fx-card__frame">
              {card.video ? (
                <video
                  className="np-fx-card__media"
                  src={card.video}
                  poster={card.media}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="np-fx-card__media"
                  src={card.media}
                  alt=""
                  draggable={false}
                  decoding="async"
                />
              )}
              <div className="np-fx-card__copy">
                <h2 className="np-fx-card__title">{t(card.titleKey)}</h2>
                <p className="np-fx-card__body">{t(card.bodyKey)}</p>
                {card.cta ? (
                  <Link href="/about-tlns" className="np-fx-card__cta">
                    {t("readMore")}
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        </div>
      ))}
    </section>
  );
}
