"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHero } from "@/components/PageHero";
import { faqItems } from "@/content/site";
import type { Locale } from "@/i18n/routing";

export function FaqPageContent({ hideHero = false }: { hideHero?: boolean }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState<number | null>(0);

  return (
  <>
    {hideHero ? null : <PageHero title={t("faq")} />}
    <section className="bg-[#ececea] py-12 sm:py-16">
      <div className="container-np max-w-3xl space-y-3">
        {faqItems.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q.ru}
              className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-white"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{item.q[locale]}</span>
                <span className="text-xl text-[var(--muted)]" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <div className="border-t border-[var(--line)] px-6 py-5 text-sm leading-relaxed text-[var(--foreground)]/85">
                  {item.a[locale]}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  </>
  );
}