import Image from "next/image"

const PROJECTS = [
  {
    title: "MapTask",
    url: "maptask.ruslan.guru",
    description:
      "This service enables users to pin tasks onto a map or any image, providing detailed context for each task and serving as an interactive dashboard. Users can track the progress of their tasks, manage their personal accounts, handle billing, and customize settings, making it a comprehensive tool for visual task management and organization.",
  },
]

const Portfolio = () => {
  return (
    <div>
      {PROJECTS.map(({ title, description, url }, idx) => (
        <div
          key={title}
          className="-[8px] flex w-full flex-col items-center rounded bg-[#1b0e1d] p-4 md:flex-row md:items-start"
        >
          {/* Image on the left */}
          <div className="w-full md:w-1/3">
            <a target="_blank" href={`https://${url}`} rel="noopener noreferrer">
              <Image
                src="/images/portfolio/p1.png"
                alt="Your image description"
                width={500} // You can adjust the width and height as needed
                height={500}
                className="h-auto w-full"
              />
            </a>
          </div>

          {/* Text and description on the right */}
          <div className="mt-4 w-full md:ml-4 md:mt-0 md:w-2/3">
            <h2 className="text-xl font-semibold">
              {title}
              <span className="float-right">#{idx + 1}</span>
            </h2>
            <p className="mt-2">{description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
export default Portfolio
