"use client"

import { HomeHero } from "./HomeHero"
import { ImpactTopology } from "./ImpactTopology"
import { CareerPath } from "./CareerPath"
import { MagneticOrb } from "./MagneticOrb"

export function HomeExperience() {
  return (
    <div className="relative w-full">
      <MagneticOrb />
      <HomeHero />
      <ImpactTopology />
      <CareerPath />
    </div>
  )
}
