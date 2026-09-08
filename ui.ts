/**
 * UI Module
 * Handles display, button events, theme toggle, mode switching, and history panel
 * Uses central state management
 */

import { stateManager, CalculatorState } from './state.js';
import {
  calculateRestorationCost,
  calculateBuildingAge,
  calculateZoneArea,
  formatCurrency,
  formatNumber,
} from './utilities.js';
import { TypewriterAudio } from './audio.js';

export class CalculatorUI {
  private typewriterAudio: TypewriterAudio;

  // DOM Elements
  private mainDisplay: HTMLElement;
  private historyDisplay: HTMLElement;
  private muteToggle: HTMLElement;
  private themeToggle: HTMLElement;
  private modeToggle: HTMLElement;
  private scientificPanel: HTMLElement;
  private historyList: HTMLElement;
  private clearHistoryBtn: HTMLElement;

  constructor() {
    this.typewriterAudio = new TypewriterAudio();

    // Get DOM elements
    this.mainDisplay = document.getElementById('main-display')!;
    this.historyDisplay = document.getElementById('history-display')!;
    this.muteToggle = document.getElementById('mute-toggle')!;
    this.themeToggle = document.getElementById('theme-toggle')!;
    this.modeToggle = document.getElementById('mode-toggle')!;
    this.scientificPanel = document.getElementById('scientific-panel')!;
    this.historyList = document.getElementById('history-list')!;
    this.clearHistoryBtn = document.getElementById('clear-history')!;

    this.bindEvents();
    stateManager.subscribe((state) => this.updateUI(state));
    this.updateUI(stateManager.state);
  }

  /**
   * Update UI based on state
   */
  private updateUI(state: CalculatorState): void {
    // Update display
    this.mainDisplay.textContent = state.currentInput;

    // Update history display
    const history = stateManager.getHistory();
    if (history.length > 0) {
      const lastCalc = history[0];
      this.historyDisplay.textContent = lastCalc.expression + ' =';
    } else {
      this.historyDisplay.textContent = '';
    }

    // Update mute button
    const muteIcon = this.muteToggle.querySelector('.mute-icon');
    if (muteIcon) {
      muteIcon.textContent = state.isMuted ? '🔇' : '🔊';
    }

    // Update theme
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    const themeIcon = this.themeToggle.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = state.isDarkMode ? '☀️' : '🌙';
    }

    // Update mode
    this.scientificPanel.classList.toggle('hidden', state.mode !== 'scientific');
    const modeLabel = this.modeToggle.querySelector('.mode-label');
    if (modeLabel) {
      modeLabel.textContent = state.mode === 'scientific' ? 'Basic' : 'Scientific';
    }
  }

  /**
   * Bind all event listeners
   */
  private bindEvents(): void {
    // Calculator buttons
    document.querySelectorAll('.calc-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => this.handleButtonClick(e));
    });

    // Mute toggle
    this.muteToggle.addEventListener('click', () => this.toggleMute());

    // Theme toggle
    this.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Mode toggle
    this.modeToggle.addEventListener('click', () => this.toggleMode());

    // History
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

    // Preservation tools
    document.getElementById('calc-restoration')?.addEventListener('click', () => this.calcRestorationCost());
    document.getElementById('calc-age')?.addEventListener('click', () => this.calcBuildingAge());
    document.getElementById('calc-zone')?.addEventListener('click', () => this.calcZoneArea());

    // Zone shape change
    document.getElementById('zone-shape')?.addEventListener('change', (e) => this.updateZoneInputs(e));

    // Keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Play sound if not muted and valid
   */
  private playSound(): void {
    if (!stateManager.getMuted() && !stateManager.isError()) {
      this.typewriterAudio.play();
    }
  }

  /**
   * Handle calculator button clicks
   */
  private handleButtonClick(e: Event): void {
    const btn = e.target as HTMLElement;

    const action = btn.getAttribute('data-action');
    const value = btn.getAttribute('data-value');

    if (value !== null) {
      this.handleInput(value);
    } else if (action) {
      this.handleAction(action);
    }
  }

  /**
   * Handle digit/decimal input
   */
  private handleInput(value: string): void {
    this.playSound();

    if (value === 'decimal') {
      stateManager.inputDecimal();
    } else {
      stateManager.inputDigit(value);
    }
  }

  /**
   * Handle action buttons
   */
  private handleAction(action: string): void {
    if (stateManager.isError() && action !== 'clear' && action !== 'clear-all') {
      return;
    }

    this.playSound();

    switch (action) {
      case 'clear-all': // AC - reset all
        stateManager.clearAll();
        this.updateHistoryPanel();
        break;
      case 'clear': // C - clear input only
        stateManager.clearInput();
        break;
      case 'backspace':
        stateManager.backspace();
        break;
      case 'negate':
        stateManager.negate();
        break;
      case 'percent':
        stateManager.percent();
        break;
      case 'add':
        stateManager.setOperation('+');
        break;
      case 'subtract':
        stateManager.setOperation('-');
        break;
      case 'multiply':
        stateManager.setOperation('*');
        break;
      case 'divide':
        stateManager.setOperation('/');
        break;
      case 'power':
        stateManager.setOperation('^');
        break;
      case 'equals':
        stateManager.equals();
        this.updateHistoryPanel();
        break;
      case 'sin':
      case 'cos':
      case 'tan':
      case 'log':
      case 'sqrt':
        stateManager.applyScientificFunction(action);
        this.updateHistoryPanel();
        break;
    }
  }

  /**
   * Handle keyboard input - all modes
   */
  private handleKeyboard(e: KeyboardEvent): void {
    const key = e.key;

    // Numbers
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      this.handleInput(key);
      return;
    }
    // Decimal
    if (key === '.') {
      e.preventDefault();
      this.handleInput('decimal');
      return;
    }
    // Operators
    if (key === '+') {
      e.preventDefault();
      this.handleAction('add');
      return;
    }
    if (key === '-') {
      e.preventDefault();
      this.handleAction('subtract');
      return;
    }
    if (key === '*') {
      e.preventDefault();
      this.handleAction('multiply');
      return;
    }
    if (key === '/') {
      e.preventDefault();
      this.handleAction('divide');
      return;
    }
    // Power (^)
    if (key === '^') {
      e.preventDefault();
      this.handleAction('power');
      return;
    }
    // Enter/Equals
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      this.handleAction('equals');
      return;
    }
    // Escape/Backspace
    if (key === 'Escape') {
      e.preventDefault();
      this.handleAction('clear-all'); // AC
      return;
    }
    if (key === 'Backspace') {
      e.preventDefault();
      this.handleAction('backspace');
      return;
    }
    // Percent
    if (key === '%') {
      e.preventDefault();
      this.handleAction('percent');
      return;
    }
  }

  /**
   * Update history panel
   */
  updateHistoryPanel(): void {
    const history = stateManager.getHistory();

    if (history.length === 0) {
      this.historyList.innerHTML = '<p class="empty-history">No calculations yet</p>';
      return;
    }

    this.historyList.innerHTML = history
      .map(
        (calc) => `
        <div class="history-item" data-result="${calc.result}">
          <span class="history-expression">${calc.expression}</span>
          <span class="history-result">= ${formatNumber(calc.result)}</span>
        </div>
      `
      )
      .join('');

    // Add click handlers to history items
    this.historyList.querySelectorAll('.history-item').forEach((item) => {
      item.addEventListener('click', () => {
        const result = item.getAttribute('data-result');
        if (result) {
          stateManager.setDisplayValue(result);
          this.playSound();
        }
      });
    });
  }

  /**
   * Clear calculation history
   */
  private clearHistory(): void {
    stateManager.clearAll();
    this.updateHistoryPanel();
    this.playSound();
  }

  /**
   * Toggle mute
   */
  private toggleMute(): void {
    stateManager.toggleMute();
    this.playSound();
  }

  /**
   * Toggle dark/light theme
   */
  private toggleTheme(): void {
    stateManager.toggleTheme();
    this.playSound();
  }

  /**
   * Toggle scientific mode
   */
  private toggleMode(): void {
    stateManager.toggleMode();
    this.playSound();
  }

  // Preservation Tools

  /**
   * Calculate restoration cost
   */
  private calcRestorationCost(): void {
    const areaInput = document.getElementById('restoration-area') as HTMLInputElement;
    const costInput = document.getElementById('restoration-cost-per-m2') as HTMLInputElement;
    const resultDiv = document.getElementById('restoration-result')!;

    const area = parseFloat(areaInput.value);
    const costPerM2 = parseFloat(costInput.value);

    const result = calculateRestorationCost(area, costPerM2);

    if (result) {
      resultDiv.textContent = `Total Cost: ${formatCurrency(result.totalCost)}`;
      resultDiv.className = 'tool-result success';
    } else {
      resultDiv.textContent = 'Please enter valid positive numbers';
      resultDiv.className = 'tool-result error';
    }

    this.playSound();
  }

  /**
   * Calculate building age
   */
  private calcBuildingAge(): void {
    const yearInput = document.getElementById('construction-year') as HTMLInputElement;
    const resultDiv = document.getElementById('age-result')!;

    const constructionYear = parseInt(yearInput.value, 10);
    const result = calculateBuildingAge(constructionYear);

    if (result) {
      resultDiv.textContent = `Building is ${result.age} years old (built in ${result.constructionYear})`;
      resultDiv.className = 'tool-result success';
    } else {
      resultDiv.textContent = 'Please enter a valid construction year';
      resultDiv.className = 'tool-result error';
    }

    this.playSound();
  }

  /**
   * Update zone inputs based on shape
   */
  private updateZoneInputs(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const inputsDiv = document.getElementById('zone-inputs')!;
    const shape = select.value;

    let inputsHTML = '';

    switch (shape) {
      case 'rectangle':
        inputsHTML = `
          <input type="number" id="zone-length" placeholder="Length (m)" />
          <input type="number" id="zone-width" placeholder="Width (m)" />
        `;
        break;
      case 'triangle':
        inputsHTML = `
          <input type="number" id="zone-base" placeholder="Base (m)" />
          <input type="number" id="zone-height" placeholder="Height (m)" />
        `;
        break;
      case 'circle':
        inputsHTML = `
          <input type="number" id="zone-radius" placeholder="Radius (m)" />
        `;
        break;
    }

    inputsDiv.innerHTML = inputsHTML;

    // Rebind calc-zone button
    document.getElementById('calc-zone')?.addEventListener('click', () => this.calcZoneArea());

    this.playSound();
  }

  /**
   * Calculate conservation zone area
   */
  private calcZoneArea(): void {
    const shapeSelect = document.getElementById('zone-shape') as HTMLSelectElement;
    const resultDiv = document.getElementById('zone-result')!;
    const shape = shapeSelect.value;

    let dimensions: Record<string, number> = {};

    switch (shape) {
      case 'rectangle':
        dimensions = {
          length: parseFloat((document.getElementById('zone-length') as HTMLInputElement)?.value || '0'),
          width: parseFloat((document.getElementById('zone-width') as HTMLInputElement)?.value || '0'),
        };
        break;
      case 'triangle':
        dimensions = {
          base: parseFloat((document.getElementById('zone-base') as HTMLInputElement)?.value || '0'),
          height: parseFloat((document.getElementById('zone-height') as HTMLInputElement)?.value || '0'),
        };
        break;
      case 'circle':
        dimensions = {
          radius: parseFloat((document.getElementById('zone-radius') as HTMLInputElement)?.value || '0'),
        };
        break;
    }

    const result = calculateZoneArea(shape, dimensions);

    if (result) {
      resultDiv.textContent = `Area: ${formatNumber(result.area)} ${result.unit}`;
      resultDiv.className = 'tool-result success';
    } else {
      resultDiv.textContent = 'Please enter valid dimensions';
      resultDiv.className = 'tool-result error';
    }

    this.playSound();
  }
}