import { getMdFile } from "lib/mdReader"

const ResumeReader = async () => {
  const resume = await getMdFile()

  return (
    <div>
      {resume.map((item, idx) => (
        <article key={idx} dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
      ))}
    </div>
  )
}

export default ResumeReader
