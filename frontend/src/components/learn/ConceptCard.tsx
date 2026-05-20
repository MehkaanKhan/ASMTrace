import { useState } from 'react'
import type { Concept } from '../../types/report'
import CourseTopicBadge from './CourseTopicBadge'

interface ConceptCardProps {
  concept: Concept
}

export default function ConceptCard({ concept }: ConceptCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      onClick={() => setFlipped((f) => !f)}
      className="h-44 cursor-pointer"
      style={{ perspective: '1000px' }}
      title="Click to flip"
    >
      <div
        style={{
          transition: 'transform 0.4s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'none',
          position: 'relative',
          height: '100%',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 flex flex-col justify-between rounded-lg border border-zinc-700 bg-zinc-900 p-4"
        >
          <p className="font-mono text-base font-bold text-zinc-100">{concept.term}</p>
          <div className="flex items-end justify-between">
            <CourseTopicBadge topic={concept.course_topic} />
            <span className="text-xs text-zinc-600">click to reveal</span>
          </div>
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 flex flex-col justify-between rounded-lg border border-indigo-700 bg-indigo-950/60 p-4"
        >
          <p className="text-sm leading-relaxed text-zinc-200">{concept.definition}</p>
          <CourseTopicBadge topic={concept.course_topic} />
        </div>
      </div>
    </div>
  )
}
