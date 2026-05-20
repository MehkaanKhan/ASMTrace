import { Download } from 'lucide-react'

export default function ExportButton() {
  return (
    <button className="btn btn-ghost btn-sm no-print" onClick={() => window.print()}>
      <Download size={13} strokeWidth={1.5} />
      Export PDF
    </button>
  )
}
