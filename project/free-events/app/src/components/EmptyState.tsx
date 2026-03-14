import '../styles/EmptyState.css';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state-icon">{icon}</p>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{description}</p>
    </div>
  );
}

export default EmptyState;
