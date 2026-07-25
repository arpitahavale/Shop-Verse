const VARIANT_CLASS = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger',
  accent: 'btn btn-accent',
};

function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
