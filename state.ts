/**
 * Central State Management
 * Single source of truth for calculator state
 */

import { Calculator, Operation } from './calculator.js';

export type CalculatorMode = 'basic' | 'scientific';

export interface CalculatorState {
  // Display values
  currentInput: string;
  previousInput: number | null;
  operation: Operation | null;
  result: string;

  // Mode
  mode: CalculatorMode;

  // Sound
  isMuted: boolean;

  // Theme
  isDarkMode: boolean;
}

type StateListener = (state: CalculatorState) => void;

class StateManager {
  private calculator: Calculator;
  private listeners: Set<StateListener> = new Set();

  // UI State
  private _state: CalculatorState = {
    currentInput: '0',
    previousInput: null,
    operation: null,
    result: '',
    mode: 'basic',
    isMuted: false,
    isDarkMode: false,
  };

  constructor() {
    this.calculator = new Calculator();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const savedMute = localStorage.getItem('calc_muted');
      if (savedMute !== null) {
        this._state.isMuted = savedMute === 'true';
      }

      const savedMode = localStorage.getItem('calc_mode');
      if (savedMode === 'basic' || savedMode === 'scientific') {
        this._state.mode = savedMode;
      }

      const savedTheme = localStorage.getItem('calc_darkMode');
      if (savedTheme !== null) {
        this._state.isDarkMode = savedTheme === 'true';
      }
    } catch {
      // localStorage not available
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('calc_muted', String(this._state.isMuted));
      localStorage.setItem('calc_mode', this._state.mode);
      localStorage.setItem('calc_darkMode', String(this._state.isDarkMode));
    } catch {
      // localStorage not available
    }
  }

  get state(): CalculatorState {
    return { ...this._state };
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.state;
    this.listeners.forEach(listener => listener(state));
  }

  // Input handlers
  inputDigit(digit: string): void {
    if (this.calculator.isError()) {
      this.calculator.clear();
    }
    this.calculator.inputDigit(digit);
    this.updateFromCalculator();
  }

  inputDecimal(): void {
    if (this.calculator.isError()) {
      this.calculator.clear();
    }
    this.calculator.inputDecimal();
    this.updateFromCalculator();
  }

  // C = clear input only
  clearInput(): void {
    this.calculator.clear();
    this.updateFromCalculator();
  }

  // AC = reset all (clear history)
  clearAll(): void {
    this.calculator.clear();
    this.calculator.clearHistory();
    this.updateFromCalculator();
  }

  backspace(): void {
    this.calculator.backspace();
    this.updateFromCalculator();
  }

  negate(): void {
    this.calculator.negate();
    this.updateFromCalculator();
  }

  percent(): void {
    this.calculator.percent();
    this.updateFromCalculator();
  }

  setOperation(op: Operation): void {
    this.calculator.setOperation(op);
    this.updateFromCalculator();
  }

  equals(): string {
    const result = this.calculator.equals();
    this.updateFromCalculator();
    return result;
  }

  applyScientificFunction(func: string): string {
    const result = this.calculator.applyScientificFunction(func);
    this.updateFromCalculator();
    return result;
  }

  getHistory() {
    return this.calculator.getHistory();
  }

  isError(): boolean {
    return this.calculator.isError();
  }

  setDisplayValue(value: string): void {
    this.calculator.setDisplayValue(value);
    this.updateFromCalculator();
  }

  // Mode
  getMode(): CalculatorMode {
    return this._state.mode;
  }

  toggleMode(): void {
    this._state.mode = this._state.mode === 'basic' ? 'scientific' : 'basic';
    this.saveToStorage();
    this.notify();
  }

  // Sound
  getMuted(): boolean {
    return this._state.isMuted;
  }

  toggleMute(): void {
    this._state.isMuted = !this._state.isMuted;
    this.saveToStorage();
    this.notify();
  }

  // Theme
  getDarkMode(): boolean {
    return this._state.isDarkMode;
  }

  toggleTheme(): void {
    this._state.isDarkMode = !this._state.isDarkMode;
    this.saveToStorage();
    this.notify();
  }

  private updateFromCalculator(): void {
    this._state.currentInput = this.calculator.getDisplayValue();
    this._state.result = this._state.currentInput;
    this.notify();
  }
}

// Singleton instance
export const stateManager = new StateManager();