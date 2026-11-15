"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLead } from "@/components/LeadModal";
import {
  clientReviews,
  diseases,
  doctorReviews,
  institutions,
} from "@/content/site";
import type { Locale } from "@/i18n/routing";

export function RehabBlock() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const rows = diseases.slice(0, 6);

  return (
    <section className="np-block" id="next" aria-label={t("diseasesSection.title")}>
      <div className="np-block__inner np-rehab">
        <div className="np-rehab__device">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/rehab-device.png" alt="" />
        </div>
        <div>
          <p className="np-kicker np-kicker--name">{t("diseasesSection.brand")}</p>
          <h2 className="np-h2">{t("diseasesSection.title")}</h2>
          <ul className="np-rehab__list">
            {rows.map((d) => (
              <li key={d.slug}>
                <Link href={d.href}>
                  <span>{d[locale].title}</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/diseases" className="np-pill np-pill--dark">
            {t("diseasesSection.all")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BentoBlock() {
  const t = useTranslations("product");

  return (
    <section className="np-block np-block--bento" aria-label={t("unique")}>
      <div className="np-block__inner">
        <p className="np-kicker np-kicker--center">{t("method")}</p>
        <h2 className="np-h2 np-h2--center">{t("unique")}</h2>
        <div className="np-bento">
          <div className="np-bento__col">
            <article className="np-card np-bento__train">
              <h3>{t("train")}</h3>
              <p className="np-muted np-bento__lines">
                {t("course")
                  .split("·")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => (
                    <span key={line}>{line}</span>
                  ))}
              </p>
              <p className="np-bento__badge">{t("courseBadge")}</p>
            </article>
            <article className="np-card np-bento__price">
              <h3>{t("priceLabel")}</h3>
              <p className="np-muted">{t("priceNote")}</p>
              <p className="np-bento__sum">{t("price")}</p>
            </article>
          </div>
          <div className="np-bento__col">
            <article className="np-card np-bento__ages">
              <h3>{t("ages")}</h3>
              <p className="np-muted">{t("agesText")}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="np-bento__plates" src="/media/plates.png" alt="" />
            </article>
            <article className="np-card np-bento__feel">
              <h3>{t("feelings")}</h3>
              <p className="np-muted">{t("feelingsText")}</p>
            </article>
          </div>
          <article className="np-card np-bento__cert">
            <h3>
              {t("cert")}
              <br />
              <a href="https://disk.yandex.ru/i/Q7I456zHzlPN4Q" target="_blank" rel="noreferrer">
                {t("certNo")} →
              </a>
            </h3>
            <p className="np-muted">{t("approved")}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/splash-cert.png" alt="" />
          </article>
        </div>
      </div>
    </section>
  );
}

export function RestoreBlock() {
  const t = useTranslations("restore");
  const items = t.raw("items") as string[];

  return (
    <section className="np-block np-block--white" aria-label={t("eyebrow")}>
      <div className="np-block__inner np-restore">
        <div>
          <p className="np-kicker">{t("eyebrow")}</p>
          <ul className="np-restore__list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="np-restore__photos" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/restore-a.jpg" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/restore-b.jpg" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/restore-icon.svg" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/restore-c.jpg" alt="" />
        </div>
      </div>
    </section>
  );
}

export function DevicesBlock() {
  const t = useTranslations("devices");
  const { openLead } = useLead();

  return (
    <section className="np-block" aria-label={t("plus")}>
      <div className="np-block__inner np-devices">
        <button type="button" className="np-device np-device--plus" onClick={openLead}>
          <p className="np-kicker">{t("plus")}</p>
          <h2 className="np-h2">{t("plusDesc")}</h2>
          <span className="np-device__more">{t("more")} →</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/device-plus.png" alt="" />
        </button>
        <button type="button" className="np-device np-device--base" onClick={openLead}>
          <p className="np-kicker">{t("base")}</p>
          <h2 className="np-h2">{t("baseDesc")}</h2>
          <span className="np-device__more">{t("more")} →</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/device-base.png" alt="" />
        </button>
      </div>
    </section>
  );
}

export function ReviewsBlock() {
  const t = useTranslations("reviews");
  const locale = useLocale() as Locale;
  const [tab, setTab] = useState<"doctors" | "clients">("doctors");
  const [start, setStart] = useState(0);
  const photos: Record<string, string> = {
    guzenko: "/media/avatar-1.png",
    novikov: "/media/avatar-2.png",
    serova: "/media/avatar-3.png",
    valiullina: "/media/avatar-4.jpg",
    natalya: "/media/avatar-client.png",
    anna: "/media/avatar-5.jpg",
    evgeniya: "/media/avatar-5.jpg",
  };
  const list = tab === "doctors" ? doctorReviews : clientReviews;
  const visible = [0, 1, 2].map((i) => list[(start + i) % list.length]);

  return (
    <section className="np-block" aria-label={t("title")}>
      <div className="np-block__inner">
        <div className="np-reviews-head">
          <div>
            <p className="np-kicker">{t("eyebrow")}</p>
            <h2 className="np-h2">{t("title")}</h2>
          </div>
          <div className="np-reviews-head__tabs">
            <button
              type="button"
              className={tab === "doctors" ? "is-on" : ""}
              onClick={() => {
                setTab("doctors");
                setStart(0);
              }}
            >
              {t("doctors")}
            </button>
            <button
              type="button"
              className={tab === "clients" ? "is-on" : ""}
              onClick={() => {
                setTab("clients");
                setStart(0);
              }}
            >
              {t("clients")}
            </button>
          </div>
          <div className="np-reviews-head__nav">
            <Link href="/reviews" className="np-pill np-pill--dark">
              {t("all")}
            </Link>
            <button type="button" aria-label="prev" onClick={() => setStart((s) => (s + list.length - 1) % list.length)}>
              ‹
            </button>
            <button type="button" aria-label="next" onClick={() => setStart((s) => (s + 1) % list.length)}>
              ›
            </button>
          </div>
        </div>
        <div className="np-review-grid">
          {visible.map((item) => (
            <article key={item.id} className="np-card np-review">
              <div className="np-review__who">
                {photos[item.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="np-review__avatar" src={photos[item.id]} alt="" />
                ) : null}
                <h3>{item.name[locale]}</h3>
              </div>
              <p className="np-review__mark" aria-hidden>
                “
              </p>
              <p>{item.text[locale]}</p>
              <p className="np-muted">{"role" in item ? item.role[locale] : item.topic[locale]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsBlock() {
  const t = useTranslations("stats");
  const rows = [
    { n: "78", file: "splash-78.png", num: "stat-num-78.svg", label: t("pos") },
    { n: "22", file: "splash-22.png", num: "stat-num-22.svg", label: t("weak") },
    { n: "0", file: "splash-0.png", num: "stat-num-0.svg", label: t("neg") },
  ];

  return (
    <section className="np-block np-block--white" aria-label={t("title")}>
      <div className="np-block__inner np-stats">
        <div>
          <h2 className="np-h2">{t("title")}</h2>
          <p className="np-muted">{t("subtitle")}</p>
        </div>
        <div className="np-stats__rows">
          {rows.map((row) => (
            <div key={row.n} className="np-stats__row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="np-stats__splash" src={`/media/${row.file}`} alt="" />
              <div className="np-stats__figwrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="np-stats__fig" src={`/media/${row.num}`} alt={`${row.n}%`} />
                <p className="np-stats__label">{row.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlacesBlock() {
  const t = useTranslations("places");
  const locale = useLocale() as Locale;
  const [start, setStart] = useState(0);
  const visible = [0, 1, 2].map((i) => institutions[(start + i) % institutions.length]);

  return (
    <section className="np-block" aria-label={t("title")}>
      <div className="np-block__inner">
        <div className="np-reviews-head">
          <div>
            <p className="np-kicker">{t("eyebrow")}</p>
            <h2 className="np-h2">{t("title")}</h2>
          </div>
          <div />
          <div className="np-reviews-head__nav">
            <Link href="/institutions" className="np-pill np-pill--dark">
              {t("all")}
            </Link>
            <button type="button" aria-label="prev" onClick={() => setStart((s) => (s + institutions.length - 1) % institutions.length)}>
              ‹
            </button>
            <button type="button" aria-label="next" onClick={() => setStart((s) => (s + 1) % institutions.length)}>
              ›
            </button>
          </div>
        </div>
        <div className="np-review-grid">
          {visible.map((item, i) => (
            <article key={item.slug} className="np-card np-place">
              <p className="np-kicker">{item.city[locale]}</p>
              <h3>{item.name[locale]}</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/media/place-${((start + i) % 5) + 1}.${(start + i) % 5 === 4 ? "jpg" : "png"}`}
                alt=""
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
