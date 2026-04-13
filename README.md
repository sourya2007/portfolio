# The Monostroke Portfolio

A modern React + Vite portfolio website with animated interactions, smooth scrolling, and a custom visual identity.

## Overview

This project is a personal/brand portfolio built with:

- React 19 + TypeScript
- Vite for fast local development and builds
- Tailwind CSS 4 for styling
- GSAP and Motion for animations
- Lenis for smooth scrolling

## Features

- Cinematic intro flow and custom cursor
- Smooth section transitions
- Animated typography and rotating text effects
- Responsive navigation and layout
- Component-based architecture for easier iteration

## Project Structure

```text
portfolio/
   src/
      components/
         AboutUs.tsx
         CustomCursor.tsx
         IntroSequence.tsx
         Navbar.tsx
         Projects.tsx
         RotatingText.tsx
         SmoothScroll.tsx
         ThemeToggle.tsx
      App.tsx
      index.css
      main.tsx
   public/
   index.html
   package.json
   tsconfig.json
   vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Default dev server:

- URL: `http://localhost:3000`
- Host: `0.0.0.0`

## Available Scripts

- `npm run dev` - Start the Vite dev server
- `npm run build` - Create a production build in `dist/`
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run TypeScript type checks (`tsc --noEmit`)
- `npm run clean` - Remove the `dist/` directory

## Environment Variables

Create a `.env.local` file in the project root if you need environment-based values:

```env
GEMINI_API_KEY=your_api_key_here
DISABLE_HMR=false
```

Notes:

- `GEMINI_API_KEY` is exposed to client code via Vite config define mapping.
- `DISABLE_HMR=true` disables hot module reload behavior.

## Build for Production

```bash
npm run build
npm run preview
```

The optimized output is generated in `dist/`.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- GSAP
- Motion
- Lenis

## License

This project is for portfolio/personal use. Add a specific license here if you plan to open-source it.
