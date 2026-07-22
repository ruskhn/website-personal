import { Metadata } from "next"
import { PortfolioExperience } from "components/portfolio/PortfolioExperience"

export const metadata: Metadata = {
  title: "Portfolio — Rus",
}

export default function Portfolio() {
  return <PortfolioExperience />
}
