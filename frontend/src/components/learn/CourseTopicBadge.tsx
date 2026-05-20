export default function CourseTopicBadge({ topic }: { topic: string }) {
  return (
    <span className="inline-flex items-center rounded border border-indigo-700 bg-indigo-900/40 px-1.5 py-0.5 text-xs text-indigo-300">
      {topic}
    </span>
  )
}
