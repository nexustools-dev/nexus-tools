import type { Metadata } from "next";
import { ColorConverter } from "./ColorConverter";

export const metadata: Metadata = {
  title: "Color Converter — HEX, RGB, HSL Color Conversion Tool",
  description:
    "Free online color converter. Convert between HEX, RGB, and HSL color formats instantly. Live color preview, copy CSS values. 100% browser-based.",
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hex",
    "hsl to hex",
    "color picker",
    "css color converter",
    "hex to hsl",
    "color format converter",
  ],
};

export default function ColorConverterPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Color Converter</h1>
      <p className="text-zinc-400 mb-8">
        Convert colors between HEX, RGB, and HSL. Pick a color or enter values
        manually.
      </p>
      <ColorConverter />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>Color Formats Explained</h2>
        <p>
          Different color formats serve different purposes in web development.
          HEX is compact and widely used in CSS. RGB maps to how screens display
          color. HSL is intuitive for adjusting hue, saturation, and lightness.
        </p>
        <h2>HEX Colors</h2>
        <p>
          HEX colors use a 6-digit hexadecimal notation preceded by #. Each pair
          of digits represents red, green, and blue channels (0-255 each). For
          example, #FF0000 is pure red, #00FF00 is pure green, #0000FF is pure
          blue.
        </p>
        <h2>RGB Colors</h2>
        <p>
          RGB (Red, Green, Blue) specifies color as three values from 0 to 255.
          In CSS: rgb(255, 0, 0) for red. This format directly maps to how
          screens produce color by mixing red, green, and blue light.
        </p>
        <h2>HSL Colors</h2>
        <p>
          HSL (Hue, Saturation, Lightness) is the most human-friendly format.
          Hue is a degree on the color wheel (0-360), saturation is a percentage
          (0-100%), and lightness is a percentage (0-100%). In CSS: hsl(0, 100%,
          50%) for red.
        </p>
      </section>
    </div>
  );
}
