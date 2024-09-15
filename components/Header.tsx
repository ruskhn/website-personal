import Link from "next/link"
import * as React from "react"

const Header = () => {
  return (
    <header className="absolute w-full bg-transparent p-4 font-sans">
      <div className="mx-auto flex max-w-6xl items-center justify-between ">
        {/* Logo Section */}
        <div className="flex items-center">
          <a href="/" className="flex items-center text-xl font-bold text-slate-300">
            <img src="/images/rk-500.png" alt="Stack Logo" className="mr-2 h-8 w-8" />
          </a>
        </div>

        {/* Navigation Links */}
        <nav className="space-x-6 md:flex">
          {[
            {
              to: "/",
              displayName: "Home",
            },
            {
              to: "Resume",
              displayName: "Resume",
            },
            {
              to: "Portfolio",
              displayName: "Portfolio",
            },
          ].map((item) => (
            <Link
              key={item.displayName}
              href={`/${item.to}`}
              className="text-sm font-medium text-slate-300 transition duration-150 ease-in-out hover:text-white"
            >
              {item.displayName}
            </Link>
          ))}
        </nav>

        {/* GitHub and Buttons Section */}
        <div className="flex h-8 items-center space-x-1">
          <a
            href="https://github.com/ruskhn"
            className="flex items-center rounded-md px-2 py-1 text-slate-300 hover:bg-gray-700"
          >
            <GitHubIcon />
          </a>

          <a
            href="https://github.com/ruskhn"
            className="flex items-center rounded-md px-2 py-1 text-slate-300 hover:bg-gray-700"
          >
            <svg
              fill="#fff"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              height="1em"
              width="1em"
              viewBox="3 3 43 43"
            >
              <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}

const GitHubIcon = () => (
  <svg
    fill="#fff"
    stroke="#fff"
    strokeWidth="0"
    viewBox="0 0 496 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"></path>
  </svg>
)

export default Header
