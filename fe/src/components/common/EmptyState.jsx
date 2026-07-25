import Button from './Button';

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state animate-fade-up">
      <div className="empty-state-orb" aria-hidden />
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
