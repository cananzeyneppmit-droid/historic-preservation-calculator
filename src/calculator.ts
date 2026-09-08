/**
 * Calculator Logic Module
 * Handles all mathematical operations without using eval()
 */

export type Operation = '+' | '-' | '*' | '/' | '^';

export interface CalculationHistory {
  expression: string;
  result: number;
  timestamp: Date;
}

export class Calculator {
  private currentValue: string = '0';
  private previousValue: number | null = null;
  private operation: Operation | null = null;
  private waitingForOperand: boolean = false;
  private history: CalculationHistory[] = [];
  private readonly maxHistoryLength = 10;

  // Scientific functions
  private static readonly SCI_FUNCTIONS: Record<string, (x: number) => number> = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    log: Math.log10,
    sqrt: Math.sqrt,
  };

  /**
   * Input a digit or decimal point
   */
  inputDigit(digit: string): void {
    if (this.waitingForOperand) {
      this.currentValue = digit;
      this.waitingForOperand = false;
    } else {
      this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
    }
  }

  /**
   * Input decimal point
   */
  inputDecimal(): void {
    if (this.waitingForOperand) {
      this.currentValue = '0.';
      this.waitingForOperand = false;
      return;
    }
    if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.currentValue = '0';
    this.previousValue = null;
    this.operation = null;
    this.waitingForOperand = false;
  }

  /**
   * Backspace - remove last digit
   */
  backspace(): void {
    if (this.waitingForOperand) return;

    if (this.currentValue.length > 1) {
      this.currentValue = this.currentValue.slice(0, -1);
    } else {
      this.currentValue = '0';
    }
  }

  /**
   * Toggle positive/negative
   */
  negate(): void {
    const value = parseFloat(this.currentValue);
    this.currentValue = String(-value);
  }

  /**
   * Percentage
   */
  percent(): void {
    const value = parseFloat(this.currentValue);
    this.currentValue = String(value / 100);
  }

  /**
   * Set operation (+, -, *, /)
   */
  setOperation(nextOperation: Operation): void {
    const inputValue = parseFloat(this.currentValue);

    if (this.previousValue === null) {
      this.previousValue = inputValue;
    } else if (this.operation && !this.waitingForOperand) {
      const result = this.performOperation(this.previousValue, inputValue, this.operation);

      if (this.isValidResult(result)) {
        this.previousValue = result;
        this.currentValue = String(result);
      } else {
        this.currentValue = 'Error';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = true;
        return;
      }
    }

    this.operation = nextOperation;
    this.waitingForOperand = true;
  }

  /**
   * Perform the selected operation
   */
  private performOperation(a: number, b: number, op: Operation): number {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  }

  /**
   * Check if result is valid
   */
  private isValidResult(result: number): boolean {
    return !isNaN(result) && isFinite(result);
  }

  /**
   * Execute equals operation
   */
  equals(): string {
    if (this.operation === null || this.previousValue === null) {
      return this.currentValue;
    }

    const inputValue = parseFloat(this.currentValue);
    const result = this.performOperation(this.previousValue, inputValue, this.operation);

    if (!this.isValidResult(result)) {
      if (this.operation === '/' && inputValue === 0) {
        this.addToHistory(`${this.previousValue} ÷ 0`, NaN);
        this.currentValue = 'Error';
      } else {
        this.currentValue = 'Error';
      }
      this.previousValue = null;
      this.operation = null;
      this.waitingForOperand = true;
      return this.currentValue;
    }

    // Build expression for history
    const opSymbol = this.getOperationSymbol(this.operation);
    const expression = `${this.previousValue} ${opSymbol} ${inputValue}`;

    this.addToHistory(expression, result);

    this.currentValue = String(result);
    this.previousValue = null;
    this.operation = null;
    this.waitingForOperand = true;

    return this.currentValue;
  }

  /**
   * Get symbol for operation
   */
  private getOperationSymbol(op: Operation): string {
    const symbols: Record<Operation, string> = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷',
      '^': '^',
    };
    return symbols[op];
  }

  /**
   * Scientific functions
   */
  applyScientificFunction(funcName: string): string {
    const value = parseFloat(this.currentValue);
    let result: number;

    if (Calculator.SCI_FUNCTIONS[funcName]) {
      result = Calculator.SCI_FUNCTIONS[funcName](value);
    } else if (funcName === 'power') {
      // Power requires a second operand - handled differently
      this.setOperation('^');
      return this.currentValue;
    } else {
      return 'Error';
    }

    if (!this.isValidResult(result)) {
      this.currentValue = 'Error';
      return 'Error';
    }

    const expression = `${funcName}(${value})`;
    this.addToHistory(expression, result);

    this.currentValue = String(result);
    this.waitingForOperand = true;

    return this.currentValue;
  }

  /**
   * Add calculation to history
   */
  private addToHistory(expression: string, result: number): void {
    this.history.unshift({
      expression,
      result,
      timestamp: new Date(),
    });

    // Keep only last 10 calculations
    if (this.history.length > this.maxHistoryLength) {
      this.history.pop();
    }
  }

  /**
   * Get calculation history
   */
  getHistory(): CalculationHistory[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Get current display value
   */
  getDisplayValue(): string {
    return this.currentValue;
  }

  /**
   * Set display value (for history recall)
   */
  setDisplayValue(value: string): void {
    this.currentValue = value;
    this.waitingForOperand = false;
  }

  /**
   * Check if calculator is in error state
   */
  isError(): boolean {
    return this.currentValue === 'Error';
  }
}
