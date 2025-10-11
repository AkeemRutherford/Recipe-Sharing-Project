export const decimalToFraction = (decimal: number): string => {
  if (decimal === 0) return '0';

  const whole = Math.floor(decimal);
  const remainder = decimal - whole;

  if (remainder === 0) return whole.toString();

  const fractionMap: { [key: string]: string } = {
    '0.125': '⅛',
    '0.25': '¼',
    '0.333': '⅓',
    '0.375': '⅜',
    '0.5': '½',
    '0.625': '⅝',
    '0.666': '⅔',
    '0.75': '¾',
    '0.875': '⅞',
  };

  const roundedRemainder = remainder.toFixed(3);

  if (fractionMap[roundedRemainder]) {
    return whole > 0 ? `${whole} ${fractionMap[roundedRemainder]}` : fractionMap[roundedRemainder];
  }

  const tolerance = 0.01;
  for (const [decStr, frac] of Object.entries(fractionMap)) {
    if (Math.abs(parseFloat(decStr) - remainder) < tolerance) {
      return whole > 0 ? `${whole} ${frac}` : frac;
    }
  }

  return decimal.toFixed(2);
};

export const formatIngredientAmount = (amount: string | number, useFractions: boolean): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) return amount.toString();

  if (useFractions) {
    return decimalToFraction(num);
  }

  return num % 1 === 0 ? num.toString() : num.toFixed(2);
};
