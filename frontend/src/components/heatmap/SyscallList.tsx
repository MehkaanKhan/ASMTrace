import type { SyscallEvent } from '../../types/trace'

interface SyscallListProps {
  syscalls: SyscallEvent[]
}

export default function SyscallList({ syscalls }: SyscallListProps) {
  return (
    <div className="overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-zinc-500">
            <th className="px-3 py-2">Step</th>
            <th className="px-3 py-2">Syscall</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Return</th>
          </tr>
        </thead>
        <tbody>
          {syscalls.map((sc, i) => (
            <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/40">
              <td className="px-3 py-1.5 text-zinc-600">{sc.index}</td>
              <td className="px-3 py-1.5 font-bold text-red-400">{sc.name}</td>
              <td className="px-3 py-1.5 text-zinc-400">{sc.category}</td>
              <td className="px-3 py-1.5 text-zinc-500">{sc.returnValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
