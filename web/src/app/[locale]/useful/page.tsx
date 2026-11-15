import { setRequestLocale } from "next-intl/server";
import { OriginPage } from "@/components/OriginPage";
import { loadOrigin } from "@/content/origin/load";

export default async function UsefulPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OriginPage data={loadOrigin("training")} />;
}
