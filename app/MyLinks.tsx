import Image from "next/image"
import { DEFAULT_ICON_SIZE } from "components/global-const"
import { EmailIcon, LinkedinIcon } from "./images/icons"

const links = [
  {
    linkTo: "/",
    text: "LinkedIn",
    Icon: LinkedinIcon,
    width: DEFAULT_ICON_SIZE.width,
    height: DEFAULT_ICON_SIZE.height,
    alt: "Follow us on Twitter",
  },
  {
    linkTo: "/",
    text: "Email",
    Icon: EmailIcon,
    width: DEFAULT_ICON_SIZE.width,
    height: DEFAULT_ICON_SIZE.height,
    alt: "Text me on email",
  },
]

const MyLinks = () => {
  return (
    <div className="flex items-center gap-3">
      {links.map(({ Icon, height, width, text, alt }) => (
        <div key={alt} className="flex cursor-pointer items-center rounded-def bg-white px-5 py-2">
          <Image width={width} height={height} priority src={Icon} alt={alt} />
          <span className="ml-[10px] text-black">{text}</span>
        </div>
      ))}
    </div>
  )
}

export default MyLinks
