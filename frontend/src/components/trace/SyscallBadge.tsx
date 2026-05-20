interface SyscallBadgeProps {
  name: string
}

export default function SyscallBadge({ name }: SyscallBadgeProps) {
  return (
    <span className="ml-2 inline-flex items-center rounded border border-red-700 bg-red-900/40 px-1.5 py-0.5 font-mono text-xs text-red-300">
      syscall: {name}
    </span>
  )
}
