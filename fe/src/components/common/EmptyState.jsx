import Button from './Button';
import AnimatedCard from './AnimatedCard';

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <AnimatedCard className="empty-state">
      <div className="empty-state-icon" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </AnimatedCard>
  );
}

export default EmptyState;
