import Timeline from "@mui/lab/Timeline"
import TimelineItem from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"

export const MyTimeline = () => {
  return (
    <div className="pt-10">
      <h1 className="text-3xl">My Timeline </h1>
      <Timeline position="alternate">
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant="outlined" color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <h1>October 2019 - Joined Portectron</h1>
            <p>Software Engineer</p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant="outlined" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <h1>Joined Twisted-Rope - May 2020</h1>
            <p>Software Engineer</p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant="outlined" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <h1>May 2022 - Joined Stackline</h1>
            <p>Software Engineer</p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant="outlined" color="secondary" />
          </TimelineSeparator>
          <TimelineContent>
            <h1>September 2024</h1>
            <p>You are here!</p>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  )
}
