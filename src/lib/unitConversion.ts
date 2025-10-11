export type MeasurementSystem = 'imperial' | 'metric';

interface ConversionResult {
  amount: string;
  unit: string;
  originalAmount?: string;
  originalUnit?: string;
}

const volumeConversions: Record<string, { metric: number; imperial: number }> = {
  'tsp': { metric: 5, imperial: 1 },
  'teaspoon': { metric: 5, imperial: 1 },
  'teaspoons': { metric: 5, imperial: 1 },
  'tbsp': { metric: 15, imperial: 1 },
  'tablespoon': { metric: 15, imperial: 1 },
  'tablespoons': { metric: 15, imperial: 1 },
  'cup': { metric: 240, imperial: 1 },
  'cups': { metric: 240, imperial: 1 },
  'pint': { metric: 475, imperial: 1 },
  'pints': { metric: 475, imperial: 1 },
  'quart': { metric: 950, imperial: 1 },
  'quarts': { metric: 950, imperial: 1 },
  'gallon': { metric: 3800, imperial: 1 },
  'gallons': { metric: 3800, imperial: 1 },
  'ml': { metric: 1, imperial: 0.00422675 },
  'milliliter': { metric: 1, imperial: 0.00422675 },
  'milliliters': { metric: 1, imperial: 0.00422675 },
  'l': { metric: 1000, imperial: 4.22675 },
  'liter': { metric: 1000, imperial: 4.22675 },
  'liters': { metric: 1000, imperial: 4.22675 },
};

const weightConversions: Record<string, { metric: number; imperial: number }> = {
  'oz': { metric: 28, imperial: 1 },
  'ounce': { metric: 28, imperial: 1 },
  'ounces': { metric: 28, imperial: 1 },
  'lb': { metric: 454, imperial: 1 },
  'lbs': { metric: 454, imperial: 1 },
  'pound': { metric: 454, imperial: 1 },
  'pounds': { metric: 454, imperial: 1 },
  'g': { metric: 1, imperial: 0.035274 },
  'gram': { metric: 1, imperial: 0.035274 },
  'grams': { metric: 1, imperial: 0.035274 },
  'kg': { metric: 1000, imperial: 2.20462 },
  'kilogram': { metric: 1000, imperial: 2.20462 },
  'kilograms': { metric: 1000, imperial: 2.20462 },
};

const nonConvertibleUnits = [
  'whole', 'piece', 'pieces', 'clove', 'cloves', 'egg', 'eggs',
  'pinch', 'dash', 'to taste', 'taste', 'head', 'heads',
  'bunch', 'bunches', 'can', 'cans', 'package', 'packages',
  'slice', 'slices', 'sprig', 'sprigs', 'leaf', 'leaves',
];

function parseAmount(amountStr: string): number | null {
  const fractionMatch = amountStr.match(/(\d+)\/(\d+)/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  }

  const mixedMatch = amountStr.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }

  const decimal = parseFloat(amountStr);
  return isNaN(decimal) ? null : decimal;
}

function formatAmount(value: number, toSystem: MeasurementSystem): string {
  value = Math.round(value * 100) / 100;

  if (toSystem === 'imperial') {
    if (value === 0.25) return '1/4';
    if (value === 0.33 || value === 0.333) return '1/3';
    if (value === 0.5) return '1/2';
    if (value === 0.67 || value === 0.667) return '2/3';
    if (value === 0.75) return '3/4';

    const whole = Math.floor(value);
    const fraction = value - whole;

    if (fraction > 0) {
      if (Math.abs(fraction - 0.25) < 0.01) return whole > 0 ? `${whole} 1/4` : '1/4';
      if (Math.abs(fraction - 0.33) < 0.02) return whole > 0 ? `${whole} 1/3` : '1/3';
      if (Math.abs(fraction - 0.5) < 0.01) return whole > 0 ? `${whole} 1/2` : '1/2';
      if (Math.abs(fraction - 0.67) < 0.02) return whole > 0 ? `${whole} 2/3` : '2/3';
      if (Math.abs(fraction - 0.75) < 0.01) return whole > 0 ? `${whole} 3/4` : '3/4';
    }
  }

  if (value < 1) {
    return value.toFixed(2).replace(/\.?0+$/, '');
  }

  if (value % 1 === 0) {
    return value.toString();
  }

  return value.toFixed(1).replace(/\.0$/, '');
}

function roundToNearestFive(value: number): number {
  return Math.round(value / 5) * 5;
}

function convertVolumeUnit(amount: number, fromUnit: string, toSystem: MeasurementSystem): ConversionResult | null {
  const normalizedUnit = fromUnit.toLowerCase().trim();
  const conversion = volumeConversions[normalizedUnit];

  if (!conversion) return null;

  if (toSystem === 'metric') {
    let ml = amount * conversion.metric;

    if (ml >= 1000) {
      const liters = ml / 1000;
      return {
        amount: formatAmount(liters, 'metric'),
        unit: liters === 1 ? 'L' : 'L',
        originalAmount: amount.toString(),
        originalUnit: fromUnit,
      };
    }

    ml = roundToNearestFive(ml);
    return {
      amount: formatAmount(ml, 'metric'),
      unit: 'ml',
      originalAmount: amount.toString(),
      originalUnit: fromUnit,
    };
  } else {
    const cups = (amount * conversion.metric) / 240;

    if (cups >= 4) {
      const quarts = cups / 4;
      if (quarts >= 4) {
        const gallons = quarts / 4;
        return {
          amount: formatAmount(gallons, 'imperial'),
          unit: gallons === 1 ? 'gallon' : 'gallons',
          originalAmount: amount.toString(),
          originalUnit: fromUnit,
        };
      }
      return {
        amount: formatAmount(quarts, 'imperial'),
        unit: quarts === 1 ? 'quart' : 'quarts',
        originalAmount: amount.toString(),
        originalUnit: fromUnit,
      };
    }

    if (cups >= 1) {
      return {
        amount: formatAmount(cups, 'imperial'),
        unit: cups === 1 ? 'cup' : 'cups',
        originalAmount: amount.toString(),
        originalUnit: fromUnit,
      };
    }

    if (cups >= 0.0625) {
      const tbsp = cups * 16;
      return {
        amount: formatAmount(tbsp, 'imperial'),
        unit: tbsp === 1 ? 'tbsp' : 'tbsp',
        originalAmount: amount.toString(),
        originalUnit: fromUnit,
      };
    }

    const tsp = cups * 48;
    return {
      amount: formatAmount(tsp, 'imperial'),
      unit: tsp === 1 ? 'tsp' : 'tsp',
      originalAmount: amount.toString(),
      originalUnit: fromUnit,
    };
  }
}

function convertWeightUnit(amount: number, fromUnit: string, toSystem: MeasurementSystem): ConversionResult | null {
  const normalizedUnit = fromUnit.toLowerCase().trim();
  const conversion = weightConversions[normalizedUnit];

  if (!conversion) return null;

  if (toSystem === 'metric') {
    let grams = amount * conversion.metric;

    if (grams >= 1000) {
      const kg = grams / 1000;
      return {
        amount: formatAmount(kg, 'metric'),
        unit: 'kg',
        originalAmount: amount.toString(),
        originalUnit: fromUnit,
      };
    }

    grams = roundToNearestFive(grams);
    return {
      amount: formatAmount(grams, 'metric'),
      unit: 'g',
      originalAmount: amount.toString(),
      originalUnit: fromUnit,
    };
  } else {
    const oz = (amount * conversion.metric) / 28;

    if (oz >= 16) {
      const lbs = oz / 16;
      return {
        amount: formatAmount(lbs, 'imperial'),
        unit: lbs === 1 ? 'lb' : 'lbs',
        originalAmount: amount.toString(),
        originalUnit: fromUnit,
      };
    }

    return {
      amount: formatAmount(oz, 'imperial'),
      unit: oz === 1 ? 'oz' : 'oz',
      originalAmount: amount.toString(),
      originalUnit: fromUnit,
    };
  }
}

export function convertIngredient(
  amountStr: string,
  unit: string,
  toSystem: MeasurementSystem
): ConversionResult | null {
  const normalizedUnit = unit.toLowerCase().trim();

  if (nonConvertibleUnits.includes(normalizedUnit) || !unit) {
    return null;
  }

  const amount = parseAmount(amountStr);
  if (amount === null) {
    return null;
  }

  const volumeResult = convertVolumeUnit(amount, unit, toSystem);
  if (volumeResult) return volumeResult;

  const weightResult = convertWeightUnit(amount, unit, toSystem);
  if (weightResult) return weightResult;

  return null;
}

export function detectCurrentSystem(ingredients: any[]): MeasurementSystem {
  const imperialUnits = ['cup', 'cups', 'tsp', 'tbsp', 'oz', 'lb', 'lbs', 'pint', 'quart', 'gallon'];
  const metricUnits = ['ml', 'l', 'g', 'kg'];

  let imperialCount = 0;
  let metricCount = 0;

  ingredients.forEach((ing) => {
    const unit = ing.unit?.toLowerCase().trim() || '';
    if (imperialUnits.some(u => unit.includes(u))) {
      imperialCount++;
    } else if (metricUnits.some(u => unit.includes(u))) {
      metricCount++;
    }
  });

  return imperialCount >= metricCount ? 'imperial' : 'metric';
}
