import { useState } from 'react'
import type { Concept } from '../../types/report'

export default function ConceptCard({ concept }: { concept: Concept }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{ height: 160, perspective: '1000px', cursor: 'pointer' }}
      title="Click to flip"
    >
      <div style={{
        position: 'relative', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 360ms cubic-bezier(0.2, 0, 0, 1)',
        transform: flipped ? 'rotateY(180deg)' : 'none',
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: 'var(--bg-raised)', border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)', padding: 16,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>
            {concept.term}
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
              letterSpacing: '.14em', textTransform: 'uppercase',
              color: 'var(--ochre-500)',
              background: 'rgba(184,146,74,.1)',
              border: '1px solid rgba(184,146,74,.25)',
              borderRadius: 'var(--r-pill)',
              padding: '2px 7px',
            }}>
              {concept.course_topic}
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 11, fontStyle: 'italic', color: 'var(--fg-muted)' }}>
              flip
            </span>
          </div>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'var(--bg-raised)',
          borderTop: '2px solid var(--ochre-500)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)', padding: 16,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, lineHeight: 1.55, color: 'var(--fg-2)' }}>
            {concept.definition}
          </p>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--ochre-500)', alignSelf: 'flex-start',
            background: 'rgba(184,146,74,.1)', border: '1px solid rgba(184,146,74,.25)',
            borderRadius: 'var(--r-pill)', padding: '2px 7px',
          }}>
            {concept.course_topic}
          </span>
        </div>
      </div>
    </div>
  )
}
