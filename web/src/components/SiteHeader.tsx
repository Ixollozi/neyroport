"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useLead } from "@/components/LeadModal";
import { SiteMenu } from "@/components/SiteMenu";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { openLead } = useLead();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/" || pathname === "";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links = [
    { href: "/about", label: t("about") },
    { href: "/about-tlns", label: t("method") },
    { href: "/diseases", label: t("diseases") },
    { href: "/useful", label: t("useful") },
    { href: "/reviews", label: t("reviews") },
    { href: "/faq", label: t("faq") },
  ] as const;

  return (
    <>
      <header className={`np-header${isHome ? " np-header--home" : " np-header--solid"}`}>
        <div className="np-header__inner">
          <Link href="/" className="np-header__logo" aria-label="NeyroPort">
            <Image
              src="/media/logo.svg"
              alt="NeyroPort"
              width={118}
              height={26}
              priority
            />
          </Link>

          <nav className="np-header__nav" aria-label="Main">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="np-header__link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="np-header__actions">
            <Link href="/contacts" className="np-header__pill">
              {t("buy")}
            </Link>
            <button type="button" className="np-header__pill" onClick={openLead}>
              {t("ask")}
            </button>
            <button
              type="button"
              className="np-header__burger"
              aria-label="Menu"
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? <SiteMenu onClose={() => setMenuOpen(false)} /> : null}
    </>
  );
}