import { Metadata } from "next"
import MyLinks from "./MyLinks"
import SquareGrid from "components/SquareGrid/SquareGrid"
import { MyTimeline } from "components/MyTimeline/MyTimeline"

export const metadata: Metadata = {
  title: "Next.js Enterprise Boilerplate",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://next-enterprise.vercel.app/",
    images: [
      {
        width: 1200,
        height: 630,
        url: "https://raw.githubusercontent.com/Blazity/next-enterprise/main/.github/assets/project-logo.png",
      },
    ],
  },
}

export default function Web() {
  return <Main />
}

const Main: React.FC = () => {
  return (
    <main className="border-1 max-w-screen-sm border-white p-4 text-white">
      <h5 className="mb-3 text-6xl">{`Hi I'm Rus`}</h5>
      <p className="mb-10 text-5xl text-green-100">Front End Engineer</p>
      {/* Links */}
      <MyLinks />

      {/* 4 blocks */}
      <SquareGrid />

      <MyTimeline />
    </main>
  )
}
