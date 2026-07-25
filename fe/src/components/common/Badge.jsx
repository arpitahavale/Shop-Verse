function Badge({ children, tone = 'brand' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default Badge;
