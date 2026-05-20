export default function SyscallBadge({ name }: { name: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
      color: 'var(--oxblood-300)',
      background: 'rgba(115,32,32,.25)',
      border: '1px solid var(--oxblood-700)',
      borderRadius: 'var(--r-pill)',
      padding: '1px 7px',
      marginLeft: 10,
    }}>
      {name}
    </span>
  )
}
