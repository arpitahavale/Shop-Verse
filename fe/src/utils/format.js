export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

export const formatDate = (isoDate) => {
  const safe =
    typeof isoDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)
      ? `${isoDate}T12:00:00`
      : isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(safe));
};

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;
