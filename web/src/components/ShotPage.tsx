import { PageShot } from "@/components/PageShot";
import { getPageBands } from "@/lib/pageBands";
import { PageHero } from "@/components/PageHero";

export function ShotPage({
  name,
  fallbackTitle,
  fallbackBody,
}: {
  name: string;
  fallbackTitle: string;
  fallbackBody?: string;
}) {
  const bands = getPageBands(name);
  if (bands.length > 0) {
    return <PageShot bands={bands} />;
  }

  return (
    <>
      <PageHero title={fallbackTitle} />
      {fallbackBody ? (
        <section className="py-12 sm:py-16">
          <div className="container-np max-w-3xl rounded-[24px] border border-[var(--line)] bg-white p-7 leading-relaxed">
            <p>{fallbackBody}</p>
          </div>
        </section>
      ) : null}
    </>
  );
}
