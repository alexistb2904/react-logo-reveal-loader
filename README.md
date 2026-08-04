# React Logo Reveal Loader

A lightweight, dependency-free React intro animation that turns a centered logo into a growing viewport and reveals the website behind it.

The animation is driven entirely by CSS. React is only used to lock scrolling during the intro and remove the loader once the animation has finished.

## Features

- Pure CSS animation
- No GSAP or Framer Motion
- Works with React and Next.js
- Custom logo, colors, and duration
- Responsive reveal animation
- Respects `prefers-reduced-motion`
- The page is rendered immediately behind the intro

## Installation

Copy these two files into your project:

```text
src/
├── LogoRevealLoader.jsx
└── LogoRevealLoader.css
```

Then import and wrap your application content:

```jsx
import LogoRevealLoader from "./LogoRevealLoader";

export default function App() {
  return (
    <LogoRevealLoader
      logoSrc="/logo.svg"
      panelColor="#476960"
      backgroundColor="#f4f2ed"
      duration={3200}
    >
      <main>
        <h1>Your website</h1>
      </main>
    </LogoRevealLoader>
  );
}
```

The logo should ideally be a transparent SVG. A white logo works especially well on a dark panel.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Website content displayed behind the loader |
| `logoSrc` | `string` | `/logo.svg` | Path to the logo image |
| `backgroundColor` | `string` | `#f4f2ed` | Full-screen intro background |
| `panelColor` | `string` | `#476960` | Logo panel color |
| `duration` | `number` | `3200` | Total animation duration in milliseconds |

## How it works

The animation follows four stages:

1. The logo card appears in the center.
2. The logo mark is progressively clipped.
3. The card contracts into a small square.
4. That square becomes a growing transparent viewport that reveals the site.

The reveal effect uses a transparent element surrounded by a very large `box-shadow`, which acts as the remaining intro background.

## Next.js

The component already includes the `"use client"` directive, so it can be used directly in a Next.js App Router project.

```jsx
import LogoRevealLoader from "@/components/LogoRevealLoader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LogoRevealLoader logoSrc="/logo.svg">
          {children}
        </LogoRevealLoader>
      </body>
    </html>
  );
}
```

## Accessibility

The loader:

- marks the root as busy while the intro is visible;
- hides decorative loader content from assistive technologies;
- shortens animations when the user enables reduced motion.

## License

MIT © Alexis Thierry-Bellefond
