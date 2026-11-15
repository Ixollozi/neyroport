import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import fs from "fs";
import path from "path";
import { OriginPage } from "@/components/OriginPage";
import { loadOrigin } from "@/content/origin/load";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const file = path.join(process.cwd(), "src/content/origin", `${slug}.json`);
  if (!fs.existsSync(file)) notFound();
  return <OriginPage data={loadOrigin(slug)} bare />;
}
