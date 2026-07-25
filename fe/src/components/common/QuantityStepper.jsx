function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="qty-stepper" role="group" aria-label="Quantity">
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
        disabled={value <= min}
      >
        −
      </button>
      <span className="qty-value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;
