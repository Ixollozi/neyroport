import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { OriginPage } from "@/components/OriginPage";
import { loadOrigin } from "@/content/origin/load";

const fileBySlug: Record<string, string> = {
  insult: "insult",
  "vestibulyarnie-narusheniya": "vestibular",
  vestibulyarnie_narusheniya: "vestibular",
  dtsp: "dtsp",
  "dtsp-u-detej-vzroslyih": "dtsp",
  "demieliniziruyushchie-zabolevaniya": "demyel",
  "degenerativnye-zabolevaniya": "degen",
  "rechevye-rasstroystva": "speech",
  zaderzka_razvitia: "speech",
  sdvg: "sdvg",
  insomniya: "insomniya",
};

export function generateStaticParams() {
  const locales = ["uz", "ru"];
  return locales.flatMap((locale) =>
    Object.keys(fileBySlug).map((disease) => ({ locale, disease })),
  );
}

export default async function DiseasePage({
  params,
}: {
  params: Promise<{ locale: string; disease: string }>;
}) {
  const { locale, disease } = await params;
  setRequestLocale(locale);
  const file = fileBySlug[disease];
  if (!file) notFound();
  return <OriginPage data={loadOrigin(file)} />;
}
