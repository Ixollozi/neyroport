"use client";

import { useTranslations } from "next-intl";
import { useLead } from "@/components/LeadModal";
import { site } from "@/content/site";

export function AskCta() {
  const t = useTranslations();
  const { openLead } = useLead();

  return (
    <aside className="ask-panel">
      <h2 className="text-xl font-medium">{t("cta.ask")}</h2>
      <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
        {site.phones[0]}
        <br />
        {site.email}
      </p>
      <button type="button" className="btn-accent mt-6 w-full" onClick={openLead}>
        {t("nav.ask")}
      </button>
      <a
        className="btn-ghost mt-3 w-full"
        style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
        href={site.social.telegram}
        target="_blank"
        rel="noreferrer"
      >
        {t("cta.tg")}
      </a>
    </aside>
  );
}
