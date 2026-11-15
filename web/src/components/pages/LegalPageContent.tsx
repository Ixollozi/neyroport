import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";

export async function LegalPageContent({
  kind,
}: {
  kind: "privacy" | "terms";
}) {
  const tFooter = await getTranslations("footer");
  const tLegal = await getTranslations("legal");
  const title =
    kind === "privacy" ? tFooter("privacy") : tFooter("terms");
  const intro =
    kind === "privacy" ? tLegal("privacyIntro") : tLegal("termsIntro");

  return (
    <>
      <PageHero title={title} />
      <section className="bg-[#ececea] py-12 sm:pb-20">
        <article className="container-np max-w-3xl rounded-[24px] border border-[var(--line)] bg-white p-7 text-sm leading-relaxed text-[var(--foreground)]/90">
          <p>{intro}</p>
          <p className="mt-6 text-[var(--muted)]">
            {kind === "privacy"
              ? tLegal("privacyPlaceholder")
              : tLegal("termsPlaceholder")}
          </p>
        </article>
      </section>
    </>
  );
}