"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLead } from "@/components/LeadModal";
import { diseases, site } from "@/content/site";
import type { Locale } from "@/i18n/routing";

export function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { openLead } = useLead();
  const left = diseases.slice(0, 4);
  const right = diseases.slice(4, 8);

  const links = [
    { href: "/about", label: t("nav.about") },
    { href: "/contacts", label: t("nav.buy") },
    { href: "/about-tlns", label: t("nav.method") },
    { href: "/reviews", label: t("nav.reviews") },
    { href: "/useful", label: t("nav.useful") },
    { href: "/rent", label: t("nav.rent") },
    { href: "/institutions", label: t("nav.places") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/news", label: t("nav.news") },
  ];

  return (
    <footer className="np-footer">
      <div className="np-footer__grid">
        <nav aria-label="Footer">
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="np-footer__diseases">
          <div>
            {left.map((d) => (
              <Link key={d.slug} href={d.href}>
                {d[locale].title}
              </Link>
            ))}
          </div>
          <div>
            {right.map((d) => (
              <Link key={d.slug} href={d.href}>
                {d[locale].title}
              </Link>
            ))}
          </div>
        </div>
        <div className="np-footer__contacts">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          {site.phones.map((phone) => (
            <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`}>
              {phone}
            </a>
          ))}
          <div className="np-footer__social">
            <a href={site.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/yt.svg" alt="" />
            </a>
            <a href={site.social.vk} target="_blank" rel="noreferrer" aria-label="VK">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/vk.svg" alt="" />
            </a>
            <a href={site.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/tg.svg" alt="" />
            </a>
          </div>
          <Link href="/terms">{t("footer.terms")}</Link>
          <Link href="/privacy">{t("footer.privacy")}</Link>
          <Link href="/requisites">{t("footer.requisites")}</Link>
        </div>
        <div className="np-footer__cta">
          <button type="button" onClick={openLead}>
            {t("cta.ask")}
          </button>
          <a href={site.social.telegram} target="_blank" rel="noreferrer">
            {t("cta.tg")}
          </a>
          <a href={site.social.max} target="_blank" rel="noreferrer">
            {t("cta.max")}
          </a>
        </div>
      </div>
      <div className="np-footer__bar">
        <strong>НейроПорт</strong>
        <span>{t("footer.company")}</span>
      </div>
    </footer>
  );
}