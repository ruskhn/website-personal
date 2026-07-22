"use client"

import { HomeHero } from "./HomeHero"
import { ImpactTopology } from "./ImpactTopology"
import { CareerPath } from "./CareerPath"

export function HomeExperience() {
  return (
    <div className="relative w-full">
      <HomeHero />
      <ImpactTopology />
      <CareerPath />
    </div>
  )
}
