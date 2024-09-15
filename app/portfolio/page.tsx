import { Divider } from "@mui/material"
import Image from "next/image"

const PROJECTS = [
  {
    title: "MapTask",
    url: "maptask.ruslan.guru",
    description:
      "MapTask is a versatile task management platform designed to cater to the unique needs of various industries by integrating geolocation with task coordination. Whether you are in retail, construction, oil and energy, transportation, or even government services, MapTask empowers your business to manage tasks more effectively, securely, and transparently.",
    src: "/images/portfolio/p2.png",
  },
]

const Portfolio = () => {
  return (
    <div>
      {PROJECTS.map(({ title, description, url, src }, idx) => (
        <div key={title} className="flex h-screen w-full flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-center">
            <a target="_blank" href={`https://${url}`} rel="noopener noreferrer">
              <h1 className="font-sans text-4xl hover:text-white">{title} </h1>
            </a>
          </div>

          {/* Map or Content Area */}
          <Image
            src={src}
            alt="Your image description"
            width={1900} // You can adjust the width and height as needed
            height={916}
            className="mt-4 h-auto w-full"
          />

          {/* Description Section */}
          <div className="mt-4 text-left text-sm">{description}</div>
        </div>
      ))}
    </div>
  )
}
export default Portfolio
