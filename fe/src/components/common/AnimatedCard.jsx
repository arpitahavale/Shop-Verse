/** Glass card with floating orbs + shimmer — login, register, empty states */
function AnimatedCard({ children, className = '' }) {
  return (
    <div className={`animated-card animate-fade-up ${className}`.trim()}>
      <div className="animated-card-bg" aria-hidden>
        <div className="animated-card-mesh" />
        <div className="animated-card-orb animated-card-orb-a" />
        <div className="animated-card-orb animated-card-orb-b" />
        <div className="animated-card-orb animated-card-orb-c" />
        <div className="animated-card-shimmer" />
      </div>
      <div className="animated-card-content">{children}</div>
    </div>
  );
}

export default AnimatedCard;
