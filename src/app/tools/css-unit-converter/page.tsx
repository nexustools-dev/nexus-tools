import type { Metadata } from "next";
import { CssUnitConverter } from "./CssUnitConverter";

export const metadata: Metadata = {
  title: "CSS Unit Converter — px, rem, em, vh, vw Conversion",
  description:
    "Free CSS unit converter. Convert between px, rem, em, %, vh, and vw. Customize base font size and viewport dimensions. 100% browser-based.",
  keywords: [
    "css unit converter",
    "px to rem",
    "rem to px",
    "em to px",
    "css converter",
    "pixel to rem converter",
    "responsive css units",
    "vw to px",
  ],
};

export default function CssUnitConverterPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">CSS Unit Converter</h1>
      <p className="text-zinc-400 mb-8">
        Convert between CSS units: px, rem, em, %, vh, and vw. Set your base
        font size and viewport dimensions.
      </p>
      <CssUnitConverter />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>CSS Units Explained</h2>
        <p>
          CSS offers many units for sizing elements. Choosing the right unit
          matters for responsive design, accessibility, and maintainability.
        </p>
        <h2>Absolute vs Relative Units</h2>
        <p>
          Pixels (px) are absolute &mdash; they always represent the same size.
          Relative units like rem, em, %, vh, and vw change based on context:
          the root font size, parent element, or viewport dimensions.
        </p>
        <h2>When to Use rem</h2>
        <p>
          Use rem for font sizes and spacing that should scale with the
          user&apos;s browser settings. If a user sets their default font to 20px
          instead of 16px, rem-based layouts adapt automatically. 1rem = root
          font size (16px by default).
        </p>
        <h2>When to Use em</h2>
        <p>
          Use em for sizing relative to the parent element&apos;s font size.
          This is useful for components that should scale proportionally. Be
          careful with nesting &mdash; ems compound (1.2em inside 1.2em = 1.44x
          root).
        </p>
        <h2>Viewport Units</h2>
        <p>
          vh (viewport height) and vw (viewport width) are percentages of the
          browser window. 100vh = full viewport height. These are great for
          hero sections and full-screen layouts.
        </p>
      </section>
    </div>
  );
}
