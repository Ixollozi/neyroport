import { getLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { institutions } from "@/content/site";
import type { Locale } from "@/i18n/routing";

export async function InstitutionsPageContent() {
  const t = await getTranslations("nav");
  const locale = (await getLocale()) as Locale;

  return (
    <>
      <PageHero title={t("places")} />
      <section className="bg-white py-12 sm:py-16">
        <div className="container-np">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {institutions.map((item) => (
              <article
                key={item.slug}
                className="rounded-[22px] bg-[#f4f3f0] p-6"
              >
                <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--accent)]">
                  {item.city[locale]}
                </p>
                <h2 className="text-base font-medium leading-snug">
                  {item.name[locale]}
                </h2>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}