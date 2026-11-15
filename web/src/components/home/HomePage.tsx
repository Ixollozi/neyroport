"use client";

import { Hero } from "@/components/home/Hero";
import { EffectsStack } from "@/components/home/EffectsStack";
import {
  BentoBlock,
  DevicesBlock,
  PlacesBlock,
  RehabBlock,
  RestoreBlock,
  ReviewsBlock,
  StatsBlock,
} from "@/components/home/HomeSections";

export function HomePage() {
  return (
    <div className="np-home">
      <Hero />
      <RehabBlock />
      <BentoBlock />
      <EffectsStack />
      <RestoreBlock />
      <DevicesBlock />
      <ReviewsBlock />
      <StatsBlock />
      <PlacesBlock />
    </div>
  );
}
