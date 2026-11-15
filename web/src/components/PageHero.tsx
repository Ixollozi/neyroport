export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface)] py-12 sm:py-16">
      <div className="container-np max-w-3xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="section-title">{title}</h1>
        {subtitle ? (
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
