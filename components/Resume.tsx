import { getMdFile } from "lib/mdReader"

const ResumeReader = async () => {
  const resume = await getMdFile()

  return (
    <div>
      {resume.map((item) => (
        <article dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
      ))}
    </div>
  )
}

export default ResumeReader
