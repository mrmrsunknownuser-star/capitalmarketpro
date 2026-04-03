'use client'

export function SkeletonLine({ width = '100%', height = 14, style = {} }: { width?: string | number; height?: number; style?: any }) {
  return (
    <div style={{ width, height, background: '#161b22', borderRadius: 6, animation: 'skeleton 1.5s ease infinite', ...style }}>
      <style>{`@keyframes skeleton{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
      <SkeletonLine height={20} width="60%" style={{ marginBottom: 12 }} />
      <SkeletonLine height={36} width="80%" style={{ marginBottom: 8 }} />
      <SkeletonLine height={14} width="40%" />
    </div>
  )
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < rows - 1 ? '1px solid #161b22' : 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#161b22', flexShrink: 0, animation: 'skeleton 1.5s ease infinite' }} />
          <div style={{ flex: 1 }}>
            <SkeletonLine height={13} width="60%" style={{ marginBottom: 8 }} />
            <SkeletonLine height={11} width="40%" />
          </div>
          <SkeletonLine height={13} width={60} />
        </div>
      ))}
    </div>
  )
}