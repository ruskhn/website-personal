import "styles/tailwind.css"
import Header from "components/Header"

const BackgroundEffects: React.FC = () => {
  return (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 flex aspect-square w-[800px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        aria-hidden="true"
      >
        <div className="translate-z-0 absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-[120px]"></div>
        <div className="translate-z-0 absolute h-64 w-64 rounded-full bg-purple-400 opacity-70 blur-[80px]"></div>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 -z-10 -mt-16 -translate-x-1/2 opacity-90 blur-2xl md:block"
        aria-hidden="true"
      >
        <img
          alt="Page Illustration"
          loading="lazy"
          width="1440"
          height="427"
          decoding="async"
          data-nimg="1"
          className="max-w-none"
          style={{ color: "transparent" }}
          src="/images/page-illustration-tri.svg"
        />
      </div>
    </>
  )
}

const PageHeader: React.FC<any> = ({ title }) => {
  return (
    <div className="pb-4 md:pb-8">
      <h2 className="h2 bg-gradient-to-r from-slate-100/80 via-slate-200 to-slate-100/80 bg-clip-text pb-4 text-transparent">
        {title}
      </h2>
    </div>
  )
}
const PageContent: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="pb-12 pt-32 md:pb-20 md:pt-40">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg text-slate-300">{/* Content can be dynamic here */}</p>
          <p className="text-lg text-slate-300">
            <time dateTime="2024-08-24">Aug 24, 2024</time>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // bg-slate-900
  return (
    <html lang="en">
      {/* Main content */}
      <body className="font-inter bg-slate-900 tracking-tight text-slate-100 antialiased">
        <Header />
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          <main className="grow">
            <section className="relative">
              <BackgroundEffects />
              <div style={{ marginBottom: 64 }} />
              <div className="border-1 mx-auto max-w-5xl max-w-screen-lg border-white p-4 text-white">{children}</div>
            </section>
          </main>
        </div>
      </body>
    </html>
  )
}
