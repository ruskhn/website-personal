import styles from "./SquareGrid.module.css"

const infoBlocks = [
  {
    title: "50+",
    subtitle: "",
    text: "Completed projects",
  },
  {
    title: "5+",
    subtitle: "",
    text: "Years of expertise",
  },
  {
    title: "$80M+",
    subtitle: "",
    text: "Revenue impact",
  },
  {
    title: "2",
    subtitle: "",
    text: "Teams built",
  },
]

const SquareGrid = () => {
  return (
    <div className={`${styles.glowingEffectContainer} grid grid-cols-1 gap-4 pt-10 md:grid-cols-2`}>
      {infoBlocks.map(({ title, subtitle, text }) => (
        <div
          key={title}
          style={{ zIndex: 1 }}
          className="min-h-[180px] content-center rounded-def bg-[#111111] px-4 py-5 text-center"
        >
          <h1 className="mb-4 text-3xl md:text-5xl">{title}</h1>
          <h2 className="mb-2 text-xl md:text-2xl">{subtitle}</h2>
          <p className="text-sm md:text-base">{text}</p>
        </div>
      ))}
    </div>
  )
}

export default SquareGrid
