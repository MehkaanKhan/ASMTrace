import Markdown from 'react-markdown'

interface NarrativeBlockProps {
  narrative: string
}

export default function NarrativeBlock({ narrative }: NarrativeBlockProps) {
  return (
    <div
      className="prose prose-invert prose-sm max-w-none rounded-xl p-5 leading-relaxed"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
    >
      <Markdown>{narrative}</Markdown>
    </div>
  )
}
