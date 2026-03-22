# CSC318 Prototype - S1 Browse

High-fidelity mobile-first prototype of the S1 Browse screen for a UofT campus food truck time-feasibility app.

## Run locally

1. Install Node.js 18+.
2. Install dependencies:
   - `npm install`
3. Start development server:
   - `npm run dev`
4. Open the local Vite URL shown in terminal.

## What is implemented

- React + Vite project setup
- One polished screen only: `S1 Browse`
- iPhone-like centered mobile shell (`393px` app viewport)
- Search bar + interactive sort dropdown
- Stylized map block with selectable color-coded pins
- Vertical, scrollable truck list (6 mock trucks)
- Visible wait-time first information hierarchy
- Sticky bottom CTA that updates with selected truck

## Structure

- `src/data/trucks.js`: editable mock dataset
- `src/components/*`: reusable UI components
- `src/App.jsx`: S1 screen composition and interaction logic
- `src/styles.css`: visual design system and screen styling