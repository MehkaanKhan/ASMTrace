import type { Concept } from '../../types/report'
import ConceptCard from './ConceptCard'

interface ConceptGridProps {
  concepts: Concept[]
}

export default function ConceptGrid({ concepts }: ConceptGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {concepts.map((concept, i) => (
        <ConceptCard key={i} concept={concept} />
      ))}
    </div>
  )
}
