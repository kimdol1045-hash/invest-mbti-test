interface StatusBadgeProps {
  label: string;
  color: string;
  count?: number;
  total?: number;
}

export default function StatusBadge({ label, color, count, total }: StatusBadgeProps) {
  const hasCount = count !== undefined && total !== undefined;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      fontWeight: 600,
      color,
      lineHeight: 1,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }} />
      {hasCount ? `${label} ${count}대` : label}
      {hasCount && total !== undefined && (
        <span style={{ color: '#6B7684', fontWeight: 400 }}>/{total}대</span>
      )}
    </span>
  );
}
