import Link from "next/link"

const SIDEBAR_ROUTES = [
  { name: "Home", route: "/" },
  { name: "Projects", route: "Projects" },
  { name: "About", route: "About" },
  { name: "Blog", route: "Blog" },
  { name: "Contact", route: "Contact" },
]

export const Sidebar: React.FC = () => {
  return (
    <aside className="bg-transparent p-4 text-white">
      {/* Sidebar content here */}
      <nav>
        <ul>
          {SIDEBAR_ROUTES.map((route) => (
            <li key={route.name}>
              <Link href={`/${route.route}`}>{route.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
