import type { Metadata } from "next";
import { JsonFormatter } from "./JsonFormatter";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator — Format, Validate, Minify JSON Online",
  description:
    "Free online JSON formatter, validator, and minifier. Syntax highlighting, error detection, tree view. 100% browser-based, no data sent to servers.",
  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "json minifier",
    "json editor online",
    "format json",
    "validate json",
    "json pretty print",
  ],
};

export default function JsonFormatterPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">JSON Formatter &amp; Validator</h1>
      <p className="text-zinc-400 mb-8">
        Paste your JSON to format, validate, and minify. Everything runs in your
        browser.
      </p>
      <JsonFormatter />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>What is JSON?</h2>
        <p>
          JSON (JavaScript Object Notation) is a lightweight data interchange
          format. It&apos;s easy for humans to read and write, and easy for machines
          to parse and generate.
        </p>
        <h2>How to Use This JSON Formatter</h2>
        <p>
          Paste your JSON in the input area on the left. The formatter will
          automatically validate it and show the formatted output on the right.
          If there are errors, you&apos;ll see the exact line and position of the
          problem.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Format/beautify JSON with configurable indentation (2 or 4 spaces, tabs)</li>
          <li>Validate JSON and show precise error location</li>
          <li>Minify JSON (remove all whitespace)</li>
          <li>Copy formatted output to clipboard</li>
          <li>100% client-side &mdash; your data never leaves your browser</li>
        </ul>
      </section>
    </div>
  );
}
