"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { diseases, site } from "@/content/site";
import type { Locale } from "@/i18n/routing";

export function SiteMenu({ onClose }: { onClose: () => void }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const otherLocale = locale === "uz" ? "ru" : "uz";

  const mainLinks = [
    { href: "/about", label: t("about") },
    { href: "/about-tlns", label: t("method") },
    { href: "/reviews", label: t("reviews") },
    { href: "/useful", label: t("useful") },
    { href: "/rent", label: t("rent") },
    { href: "/institutions", label: t("places") },
    { href: "/faq", label: t("faq") },
    { href: "/news", label: t("news") },
  ] as const;

  const half = Math.ceil(diseases.length / 2);
  const diseaseCols = [diseases.slice(0, half), diseases.slice(half)];

  return (
    <div className="np-menu" role="dialog" aria-modal="true" aria-label={tc("menu")}>
      <button type="button" className="np-menu__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <div className="np-menu__inner">
        <div className="np-menu__device">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/product.png" alt="" className="np-menu__device-img" />
        </div>

        <nav className="np-menu__nav" aria-label="Menu">
          {mainLinks.map((item) => (
            <Link key={item.href} href={item.href} className="np-menu__link" onClick={onClose}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="np-menu__side">
          <a href={`mailto:${site.email}`} className="np-menu__email">
            {site.email}
          </a>
          {site.phones.map((phone) => (
            <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="np-menu__phone">
              {phone}
            </a>
          ))}
          <div className="np-menu__socials">
            <a href={site.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/yt.svg" alt="" width={20} height={20} />
            </a>
            <a href={site.social.vk} target="_blank" rel="noreferrer" aria-label="VK">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/vk.svg" alt="" width={20} height={20} />
            </a>
            <a href={site.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/tg.svg" alt="" width={20} height={20} />
            </a>
          </div>
        </div>

        <div className="np-menu__diseases">
          {diseaseCols.map((col, ci) => (
            <div key={ci} className="np-menu__disease-col">
              {col.map((d) => (
                <Link
                  key={d.slug}
                  href={d.href}
                  className="np-menu__disease-link"
                  onClick={onClose}
                >
                  {d[locale].title}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="np-menu__topbar">
          <Link href="/" className="np-menu__logo" onClick={onClose} aria-label="NeyroPort">
            <Image src="/media/logo.svg" alt="" width={118} height={26} />
          </Link>
          <Link
            href={pathname || "/"}
            locale={otherLocale}
            className="np-menu__lang"
            onClick={onClose}
          >
            {otherLocale}
          </Link>
        </div>
      </div>
    </div>
  );
}