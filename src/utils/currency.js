const getSafeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatINR = (value, options = {}) => {
  const amount = getSafeNumber(value);
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};
