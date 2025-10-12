import React, { useState } from 'react';

interface Ingredient {
  amount: string;
  unit: string;
  ingredient: string;
}

interface IngredientBuilderProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

const COMMON_UNITS = [
  { value: '', label: '(none - e.g., eggs, cloves)', category: 'none' },
  { value: 'whole', label: 'whole', category: 'count' },
  { value: 'cup', label: 'cup(s)', category: 'volume' },
  { value: 'tbsp', label: 'tablespoon(s)', category: 'volume' },
  { value: 'tsp', label: 'teaspoon(s)', category: 'volume' },
  { value: 'ml', label: 'milliliter(s)', category: 'volume' },
  { value: 'l', label: 'liter(s)', category: 'volume' },
  { value: 'oz', label: 'ounce(s)', category: 'volume' },
  { value: 'lb', label: 'pound(s)', category: 'weight' },
  { value: 'g', label: 'gram(s)', category: 'weight' },
  { value: 'kg', label: 'kilogram(s)', category: 'weight' },
  { value: 'clove(s)', label: 'clove(s)', category: 'count' },
  { value: 'can', label: 'can(s)', category: 'count' },
  { value: 'pinch', label: 'pinch', category: 'count' },
  { value: 'to taste', label: 'to taste', category: 'count' },
];

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  cup: { tbsp: 16, tsp: 48, ml: 240, oz: 8 },
  tbsp: { cup: 1/16, tsp: 3, ml: 15 },
  tsp: { cup: 1/48, tbsp: 1/3, ml: 5 },
  ml: { cup: 1/240, tbsp: 1/15, tsp: 1/5, l: 1/1000 },
  l: { ml: 1000, cup: 4.227 },
  oz: { cup: 1/8, lb: 1/16, g: 28.35 },
  lb: { oz: 16, g: 453.592, kg: 0.453592 },
  g: { oz: 1/28.35, lb: 1/453.592, kg: 1/1000 },
  kg: { g: 1000, lb: 2.20462 },
};

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const ConvertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

function convertUnit(amount: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return amount;
  if (!UNIT_CONVERSIONS[fromUnit] || !UNIT_CONVERSIONS[fromUnit][toUnit]) {
    return null;
  }
  return amount * UNIT_CONVERSIONS[fromUnit][toUnit];
}

export default function IngredientBuilder({ ingredients, onChange }: IngredientBuilderProps) {
  const [showConverter, setShowConverter] = useState<number | null>(null);
  const [convertFrom, setConvertFrom] = useState('');
  const [convertTo, setConvertTo] = useState('');

  const addIngredient = () => {
    onChange([...ingredients, { amount: '', unit: '', ingredient: '' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const handleConvert = (index: number) => {
    const ingredient = ingredients[index];
    const amountNum = parseFloat(ingredient.amount);

    if (isNaN(amountNum) || !convertFrom || !convertTo) return;

    const converted = convertUnit(amountNum, convertFrom, convertTo);
    if (converted !== null) {
      updateIngredient(index, 'amount', converted.toFixed(2));
      updateIngredient(index, 'unit', convertTo);
      setShowConverter(null);
      setConvertFrom('');
      setConvertTo('');
    }
  };

  const getCommonFractions = (decimal: string): string => {
    const num = parseFloat(decimal);
    const fractions: Record<string, string> = {
      '0.25': '¼',
      '0.33': '⅓',
      '0.5': '½',
      '0.66': '⅔',
      '0.75': '¾',
    };
    const remainder = num % 1;
    const whole = Math.floor(num);
    const roundedRemainder = remainder.toFixed(2);

    if (fractions[roundedRemainder]) {
      return whole > 0 ? `${whole} ${fractions[roundedRemainder]}` : fractions[roundedRemainder];
    }
    return decimal;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">Ingredients *</label>
        <button
          type="button"
          onClick={addIngredient}
          className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition text-sm font-semibold"
        >
          <PlusIcon />
          <span>Add Ingredient</span>
        </button>
      </div>

      {ingredients.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No ingredients yet. Click "Add Ingredient" to start.</p>
        </div>
      )}

      {ingredients.map((ingredient, index) => (
        <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-amber-300 transition">
          <div className="grid grid-cols-12 gap-3 mb-2">
            <div className="col-span-2">
              <input
                type="text"
                value={ingredient.amount}
                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                placeholder="1.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
              {ingredient.amount && (
                <p className="text-xs text-gray-500 mt-1">{getCommonFractions(ingredient.amount)}</p>
              )}
            </div>

            <div className="col-span-3">
              <select
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                {COMMON_UNITS.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-6">
              <input
                type="text"
                value={ingredient.ingredient}
                onChange={(e) => updateIngredient(index, 'ingredient', e.target.value)}
                placeholder="e.g., all-purpose flour"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div className="col-span-1 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowConverter(showConverter === index ? null : index)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                title="Convert units"
              >
                <ConvertIcon />
              </button>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                title="Remove ingredient"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          {showConverter === index && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Unit Converter</p>
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">From</label>
                  <select
                    value={convertFrom}
                    onChange={(e) => setConvertFrom(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    {COMMON_UNITS.filter(u => u.category !== 'count').map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">To</label>
                  <select
                    value={convertTo}
                    onChange={(e) => setConvertTo(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    {COMMON_UNITS.filter(u => u.category !== 'count').map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleConvert(index)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition font-semibold"
                >
                  Convert
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
