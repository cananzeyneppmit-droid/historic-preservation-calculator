/**
 * Historic Preservation Utilities
 * Tools for restoration cost, building age, and conservation zone calculations
 */

export interface RestorationCostResult {
  area: number;
  costPerM2: number;
  totalCost: number;
}

export interface BuildingAgeResult {
  constructionYear: number;
  currentYear: number;
  age: number;
}

export interface ZoneAreaResult {
  shape: string;
  area: number;
  unit: string;
}

/**
 * Calculate restoration cost based on area and cost per square meter
 */
export function calculateRestorationCost(
  area: number,
  costPerM2: number
): RestorationCostResult | null {
  if (!isValidNumber(area) || !isValidNumber(costPerM2)) {
    return null;
  }

  if (area <= 0 || costPerM2 <= 0) {
    return null;
  }

  const totalCost = area * costPerM2;

  return {
    area,
    costPerM2,
    totalCost,
  };
}

/**
 * Calculate building age from construction year
 */
export function calculateBuildingAge(constructionYear: number): BuildingAgeResult | null {
  if (!isValidNumber(constructionYear)) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  if (constructionYear <= 0 || constructionYear > currentYear) {
    return null;
  }

  const age = currentYear - constructionYear;

  return {
    constructionYear,
    currentYear,
    age,
  };
}

/**
 * Calculate conservation zone area based on shape
 */
export function calculateZoneArea(
  shape: string,
  dimensions: Record<string, number>
): ZoneAreaResult | null {
  let area: number;

  switch (shape.toLowerCase()) {
    case 'rectangle':
      if (!isValidNumber(dimensions.length) || !isValidNumber(dimensions.width)) {
        return null;
      }
      if (dimensions.length <= 0 || dimensions.width <= 0) {
        return null;
      }
      area = dimensions.length * dimensions.width;
      break;

    case 'triangle':
      if (!isValidNumber(dimensions.base) || !isValidNumber(dimensions.height)) {
        return null;
      }
      if (dimensions.base <= 0 || dimensions.height <= 0) {
        return null;
      }
      area = 0.5 * dimensions.base * dimensions.height;
      break;

    case 'circle':
      if (!isValidNumber(dimensions.radius)) {
        return null;
      }
      if (dimensions.radius <= 0) {
        return null;
      }
      area = Math.PI * Math.pow(dimensions.radius, 2);
      break;

    case 'polygon':
      // For polygon, accept vertices as array of [x, y] coordinates
      if (dimensions.vertices && Array.isArray(dimensions.vertices)) {
        const polygonArea = calculatePolygonArea(dimensions.vertices);
        if (polygonArea === null) {
          return null;
        }
        area = polygonArea;
      } else {
        return null;
      }
      break;

    default:
      return null;
  }

  return {
    shape,
    area: Math.round(area * 100) / 100, // Round to 2 decimal places
    unit: 'm²',
  };
}

/**
 * Calculate polygon area using the Shoelace formula
 * vertices: array of [x, y] coordinate pairs
 */
export function calculatePolygonArea(vertices: number[][]): number | null {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    return null;
  }

  let area = 0;
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [xi, yi] = vertices[i];
    const [xj, yj] = vertices[j];

    if (!isValidNumber(xi) || !isValidNumber(yi) || !isValidNumber(xj) || !isValidNumber(yj)) {
      return null;
    }

    area += xi * yj;
    area -= xj * yi;
  }

  area = Math.abs(area) / 2;

  if (!isValidNumber(area)) {
    return null;
  }

  return area;
}

/**
 * Validate that a value is a valid finite number
 */
export function isValidNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number with appropriate precision
 */
export function formatNumber(value: number, maxDecimals: number = 4): string {
  const rounded = Math.round(value * Math.pow(10, maxDecimals)) / Math.pow(10, maxDecimals);
  return String(rounded);
}
