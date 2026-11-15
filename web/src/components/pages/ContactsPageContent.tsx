import { getLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { AskCta } from "@/components/AskCta";
import { site } from "@/content/site";
import type { Locale } from "@/i18n/routing";

export async function ContactsPageContent() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("contacts");
  const locale = (await getLocale()) as Locale;

  return (
    <>
      <PageHero title={t("contacts")} subtitle={tc("subtitle")} />
      <section className="bg-[#ececea] py-12 sm:py-16">
        <div className="container-np grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[24px] border border-[var(--line)] bg-white p-7">
            <p className="text-sm text-[var(--muted)]">{site.address[locale]}</p>
            <ul className="space-y-3 text-base">
              {site.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-[var(--accent)]">
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-[var(--accent)]">
                  {site.email}
                </a>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={site.social.telegram} className="btn-ghost" target="_blank" rel="noreferrer">
                Telegram
              </a>
              <a href={site.social.youtube} className="btn-ghost" target="_blank" rel="noreferrer">
                YouTube
              </a>
            </div>
          </div>
          <AskCta />
        </div>
      </section>
    </>
  );
}