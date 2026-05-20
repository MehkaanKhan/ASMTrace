interface CodeBlockProps {
  children: React.ReactNode
  className?: string
}

export default function CodeBlock({ children, className = '' }: CodeBlockProps) {
  return (
    <code className={`rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-sm text-zinc-200 ${className}`}>
      {children}
    </code>
  )
}
