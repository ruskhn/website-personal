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
            <a
              className="group flex items-center gap-2"
              target="_blank"
              href={`https://${url}`}
              rel="noopener noreferrer"
            >
              <h1 className="font-sans text-4xl group-hover:text-white">{title}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M23.75 15L6.25 15M23.75 15L16.25 22.5M23.75 15L16.25 7.5"
                  stroke="#cbd5e1"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="group-hover:stroke-white"
                />
              </svg>
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
