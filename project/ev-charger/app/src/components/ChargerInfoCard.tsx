import type { Charger } from '../types/charger';
import '../styles/ChargerInfoCard.css';

interface ChargerInfoCardProps {
  charger: Charger;
}

export default function ChargerInfoCard({ charger }: ChargerInfoCardProps) {
  return (
    <div className="charger-info-card">
      <div className="charger-info-left">
        <div className="charger-info-type">
          {charger.type}
          {charger.output && <span className="charger-info-output">{charger.output}</span>}
        </div>
        <div className="charger-info-detail">
          충전 {charger.chgerId}번 기
        </div>
      </div>
      <div
        className="charger-info-status"
        style={{
          backgroundColor: `${charger.statColor}18`,
          color: charger.statColor,
        }}
      >
        {charger.statLabel}
      </div>
    </div>
  );
}
