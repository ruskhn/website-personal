import { Metadata } from "next"
import { HomeExperience } from "components/home/HomeExperience"

export const metadata: Metadata = {
  title: "Rus — Full Stack Engineer",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "",
    images: [
      {
        width: 1200,
        height: 630,
        url: "",
      },
    ],
  },
}

export default function Web() {
  return <HomeExperience />
}
