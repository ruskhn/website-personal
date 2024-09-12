import { Metadata } from "next"
import SquareGrid from "components/SquareGrid/SquareGrid"
import { MyTimeline } from "components/MyTimeline/MyTimeline"

export const metadata: Metadata = {
  title: "Rus Walten Home Page",
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
  return <Main />
}

const Main: React.FC = () => {
  return (
    <section className="border-1 mx-auto max-w-5xl max-w-screen-lg border-white p-4 text-white">
      <h5 className="mb-3 text-6xl">{`Hi I'm Rus`}</h5>
      <p className="mb-10 text-5xl text-green-100">Full Stack Engineer</p>

      {/* 4 blocks */}
      <SquareGrid />

      <MyTimeline />
    </section>
  )
}
