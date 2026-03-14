import '../styles/StationSummaryCard.css';

interface StatusSummary {
  available: number;
  charging: number;
  unavailable: number;
  total: number;
}

interface StationSummaryCardProps {
  summary: StatusSummary;
}

export default function StationSummaryCard({
  summary,
}: StationSummaryCardProps) {
  const availableRatio = summary.total > 0 ? summary.available / summary.total : 0;
  const chargingRatio = summary.total > 0 ? summary.charging / summary.total : 0;

  return (
    <div className="summary-card">
      {/* 1. 충전소 요약 카드 */}
      <div className="summary-status-row">
        <div className="summary-status-item summary-status-available">
          <span className="summary-status-num">{summary.available}</span>
          <span className="summary-status-label">사용 가능</span>
        </div>
        <div className="summary-status-divider" />
        <div className="summary-status-item summary-status-charging">
          <span className="summary-status-num">{summary.charging}</span>
          <span className="summary-status-label">충전 중</span>
        </div>
        <div className="summary-status-divider" />
        <div className="summary-status-item summary-status-unavailable">
          <span className="summary-status-num">{summary.unavailable}</span>
          <span className="summary-status-label">사용 불가</span>
        </div>
      </div>

      {/* 2. 충전기 상태 게이지 */}
      <div className="summary-gauge-wrap">
        <div className="summary-gauge-bar">
          <div
            className="summary-gauge-fill summary-gauge-available"
            style={{ width: `${availableRatio * 100}%` }}
          />
          <div
            className="summary-gauge-fill summary-gauge-charging"
            style={{ width: `${chargingRatio * 100}%` }}
          />
        </div>
        <span className="summary-gauge-text">
          전체 {summary.total}대 중 {summary.available}대 사용 가능
        </span>
      </div>

    </div>
  );
}
