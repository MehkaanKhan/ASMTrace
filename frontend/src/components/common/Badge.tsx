interface BadgeProps {
  children: React.ReactNode
  color?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'zinc'
  size?: 'sm' | 'md'
}

const colorMap = {
  green: 'bg-green-900/60 text-green-300 border border-green-700',
  amber: 'bg-amber-900/60 text-amber-300 border border-amber-700',
  red: 'bg-red-900/60 text-red-300 border border-red-700',
  blue: 'bg-blue-900/60 text-blue-300 border border-blue-700',
  purple: 'bg-purple-900/60 text-purple-300 border border-purple-700',
  zinc: 'bg-zinc-800 text-zinc-300 border border-zinc-600',
}

export default function Badge({ children, color = 'zinc', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span className={`inline-flex items-center rounded font-mono font-medium ${sizeClass} ${colorMap[color]}`}>
      {children}
    </span>
  )
}
