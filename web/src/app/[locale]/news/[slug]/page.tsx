import { notFound } from "next/navigation";
import { setRequestLocale, getLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { newsSeed } from "@/content/site";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return ["uz", "ru"].flatMap((locale) =>
    newsSeed.map((post) => ({ locale, slug: post.slug })),
  );
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: loc, slug } = await params;
  setRequestLocale(loc);
  const post = newsSeed.find((p) => p.slug === slug);
  if (!post) notFound();
  const locale = (await getLocale()) as Locale;

  return (
    <>
      <PageHero eyebrow={post.date} title={post.title[locale]} />
      <section className="py-12 sm:py-16">
        <div className="container-np max-w-3xl rounded-[24px] border border-[var(--line)] bg-white p-7 leading-relaxed">
          <p>{post.excerpt[locale]}</p>
        </div>
      </section>
    </>
  );
}
