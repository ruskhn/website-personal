import "styles/tailwind.css"
import { Montserrat } from "@next/font/google"
import Image from "next/image"
import Header from "components/Header"

const BackgroundEffects: React.FC = () => {
  return (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 flex aspect-square w-[800px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        aria-hidden="true"
      >
        <div className="translate-z-0 absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-[120px]"></div>
        <div className="translate-z-0 absolute size-64 rounded-full bg-purple-400 opacity-70 blur-[80px]"></div>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 -z-10 -mt-16 -translate-x-1/2 opacity-90 blur-2xl md:block"
        aria-hidden="true"
      >
        <Image
          alt="Page Illustration"
          loading="lazy"
          width={1440}
          height={427}
          className="max-w-none"
          style={{ color: "transparent" }}
          src="/images/page-illustration-tri.svg"
        />
      </div>
    </>
  )
}

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500"], // Specify the weights you want to use
  variable: "--font-montserrat", // Optional: use a custom variable if needed
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // bg-slate-900
  return (
    <html lang="en">
      {/* Main content */}
      <body className={`${montserrat.variable} bg-slate-900 font-sans tracking-tight text-slate-300 antialiased`}>
        <Header />
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          <main className="grow">
            <section className="relative">
              <BackgroundEffects />
              <div className="pt-16">{children}</div>
            </section>
          </main>
        </div>
      </body>
    </html>
  )
}
