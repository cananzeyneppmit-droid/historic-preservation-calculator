[README.md](https://github.com/user-attachments/files/31964671/README.md)
# Student Information

- Name: Canan Zeynep Mit
- Theme: Historic Preservation

# Starter Prompt
Generate a CLI prompt for creating a browser-based TypeScript calculator that runs on localhost. Theme: Historic Preservation. Include basic mode (+, -, *, /) and scientific mode (trig, log, power, sqrt + restoration cost estimation, building age calculation, conservation zone area). Dark/light mode toggle, last 10 calculation history, error handling. Must serve on a local port and open in browser. Aged parchment paper texture background with subtle grain animation. Old typewriter key click sound on each button press.

# CLI Prompt 

See prompt.txt file for the full CLI prompt used in this project.

# Historic Preservation Calculator

A browser-based TypeScript calculator built with Vite, featuring a historic preservation theme with aged parchment aesthetics and typewriter-style interactions.

## Features

### Basic Calculator
- Addition, subtraction, multiplication, division
- Percentage, negate, backspace functions
- Full keyboard support

### Scientific Mode
- Trigonometric functions: sin, cos, tan
- Logarithm: log (base 10)
- Square root: √
- Power: x^y

### Historic Preservation Tools
- **Restoration Cost**: Calculate restoration cost based on area and cost per m²
- **Building Age**: Calculate building age from construction year
- **Conservation Zone Area**: Calculate area for rectangles, triangles, and circles

### UI/UX
- Aged parchment paper texture background
- Subtle grain animation (CSS-based)
- Elegant serif typography (Playfair Display)
- Typewriter-style buttons (Courier Prime)
- Dark/Light mode toggle
- Basic/Scientific mode toggle
- Click history (last 10 calculations) - click to reuse results
- Typewriter key click sound on each button press

### Error Handling
- Division by zero protection
- Invalid input handling
- NaN/Infinity detection
- User-friendly error messages

## Architecture

```
src/
├── main.ts           # Entry point
├── calculator.ts     # Calculator logic (no eval())
├── ui.ts             # UI handling, events, theme
├── utilities.ts      # Preservation tool calculations
├── styles.css        # Parchment theme, animations
└── assets/
    └── typewriter-click.wav  # Sound effect
```

## Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Start development server (opens browser automatically)
npm run dev

# Server runs at: http://localhost:5173
```

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173, auto-open) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 0-9 | Input digits |
| . | Decimal point |
| + - * / | Operators |
| Enter or = | Equals |
| Escape or C | Clear |
| Backspace | Delete last digit |
| % | Percentage |

## Technical Notes

- **No eval()**: All calculations use safe mathematical operations
- **TypeScript**: Strict mode with full type safety
- **Vite**: Fast HMR development, optimized builds
- **CSS Animations**: Grain effect uses SVG noise with step animation
- **Audio**: Web Audio API compatible WAV format

## Screenshots

![light mode](./screenshot1.jpeg)
![dark mode](./screenshot2.jpeg) 
![calculation](./screenshot3.jpeg)
