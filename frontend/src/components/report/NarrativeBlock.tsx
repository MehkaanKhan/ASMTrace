import Markdown from 'react-markdown'

export default function NarrativeBlock({ narrative }: { narrative: string }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 15,
        lineHeight: 1.65,
        color: 'var(--fg-2)',
        background: 'var(--bg-raised)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-md)',
        padding: '16px 20px',
      }}
      className="prose-custom"
    >
      <style>{`
        .prose-custom p { margin: 0 0 0.75em; }
        .prose-custom p:last-child { margin-bottom: 0; }
        .prose-custom strong { font-weight: 600; color: var(--fg); }
        .prose-custom code {
          font-family: var(--font-mono); font-size: .9em;
          background: var(--bg-sunken); border: 1px solid var(--hairline);
          border-radius: 2px; padding: 1px 5px;
        }
      `}</style>
      <Markdown>{narrative}</Markdown>
    </div>
  )
}
