// import { Sidebar } from "components/Navigation/Sidebar"
import Image from "next/image"
import "styles/tailwind.css"
import InProgress from "./images/inProgress.webp"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Main content */}
      <body>
        <div className="flex min-h-screen grid-cols-[minmax(0,1fr)_3fr] justify-center overflow-hidden bg-[#0d0b0d]">
          {/* Sidebar */}
          {/* <Sidebar /> */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "15%",
              padding: 60,
            }}
          >
            <Image width={1200} height={1200} priority src={InProgress} alt="In progress" />
          </div>
          {/* Main content */}
          {/* {children} */}
        </div>
      </body>
    </html>
  )
}
