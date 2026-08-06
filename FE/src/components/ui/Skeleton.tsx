/**
 * 와이어프레임의 회색 플레이스홀더에 대응하는 로딩/미구현 자리표시자.
 * 실제 데이터 연결 시 각 카드 컴포넌트로 교체합니다.
 */

const base: React.CSSProperties = {
  background: "var(--color-skeleton)",
  borderRadius: "var(--radius-md)",
};

export function SkeletonCard({
  width,
  height = 120,
}: {
  width?: number;
  height?: number;
}) {
  return <div style={{ ...base, width: width ?? "100%", height }} />;
}

export function SkeletonRow({
  columns = 2,
  count = 4,
  height = 120,
}: {
  columns?: number;
  count?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "var(--space-3)",
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  );
}
