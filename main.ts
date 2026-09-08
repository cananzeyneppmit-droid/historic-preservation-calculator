/**
 * Historic Preservation Calculator
 * Main entry point
 */

import { CalculatorUI } from './ui.js';

// Initialize the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CalculatorUI();
  console.log('Historic Preservation Calculator initialized');
});
