"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const HERO_VIDEO = "/media/hero.mp4";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;
    const onReady = () => {
      if (cancelled) return;
      if (v.videoWidth > 0 || v.readyState >= 2) setUseVideo(true);
    };
    const onError = () => {
      if (!cancelled) setUseVideo(false);
    };

    v.addEventListener("loadeddata", onReady);
    v.addEventListener("canplay", onReady);
    v.addEventListener("playing", onReady);
    v.addEventListener("error", onError);

    // Force load + play (muted + playsInline → autoplay allowed)
    v.load();
    const tryPlay = () => {
      v.play().then(onReady).catch(() => {
        // Retry once after a short delay (dev server / cold cache)
        window.setTimeout(() => {
          if (!cancelled) v.play().then(onReady).catch(() => {});
        }, 400);
      });
    };
    tryPlay();

    const timeout = window.setTimeout(() => {
      if (!cancelled && (v.readyState < 2 || v.videoWidth === 0)) {
        setUseVideo(false);
      }
    }, 8000);

    return () => {
      cancelled = true;
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("playing", onReady);
      v.removeEventListener("error", onError);
      window.clearTimeout(timeout);
    };
  }, []);

  const title =
    locale === "ru" ? (
      <>
        Полнота жизни
        <br />
        для вас и близких
      </>
    ) : (
      <>
        Siz va yaqinlaringiz
        <br />
        uchun toʻliq hayot
      </>
    );

  const lockStill = !useVideo && locale === "ru";
  const showCopy = useVideo || locale !== "ru";

  return (
    <section className={`np-hero${lockStill ? " np-hero--locked" : ""}`} id="hero">
      <div className="np-hero__media" aria-hidden>
        <video
          ref={videoRef}
          className={`np-hero__video${useVideo ? " is-on" : ""}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src={HERO_VIDEO}
        />
        <div className={`np-hero__still${useVideo ? " is-off" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lockStill ? "/media/hero-body.png" : "/media/hero-video-frame.png"}
            alt=""
            className={lockStill ? "np-hero__body" : "np-hero__frame"}
          />
        </div>
      </div>

      <div
        className={`np-hero__content${showCopy ? "" : " np-hero__content--hidden"}`}
      >
        <h1 className="np-hero__title">{title}</h1>
        <p className="np-hero__subtitle">{t("subtitle")}</p>
        <a href="#next" className="np-hero__scroll" aria-label="Scroll">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
            <path
              d="M1 1L5 5L9 1"
              stroke="#212429"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
