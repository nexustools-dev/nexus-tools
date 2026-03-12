import type { Metadata } from "next";
import { Base64Encoder } from "./Base64Encoder";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder — Encode and Decode Base64 Online",
  description:
    "Free online Base64 encoder and decoder. Convert text to Base64 and back. Supports UTF-8, file encoding, and URL-safe Base64. 100% browser-based.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 online",
    "encode base64",
    "decode base64",
    "text to base64",
    "base64 to text",
    "base64 converter",
  ],
};

export default function Base64EncoderPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Base64 Encoder &amp; Decoder</h1>
      <p className="text-zinc-400 mb-8">
        Encode text to Base64 or decode Base64 back to text. Supports UTF-8 and
        URL-safe variants.
      </p>
      <Base64Encoder />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>What is Base64?</h2>
        <p>
          Base64 is a binary-to-text encoding scheme that represents binary data
          as an ASCII string. It&apos;s commonly used to embed images in CSS/HTML,
          transmit data in URLs, encode email attachments, and store binary data
          in JSON or XML.
        </p>
        <h2>How Base64 Encoding Works</h2>
        <p>
          Base64 takes every 3 bytes (24 bits) of input and converts them into 4
          printable ASCII characters from a 64-character alphabet (A-Z, a-z, 0-9,
          +, /). If the input isn&apos;t divisible by 3, padding characters (=) are
          added.
        </p>
        <h2>URL-Safe Base64</h2>
        <p>
          Standard Base64 uses + and / which have special meaning in URLs.
          URL-safe Base64 replaces + with - and / with _, and optionally removes
          the = padding. Use this variant when embedding Base64 in URLs or
          filenames.
        </p>
        <h2>Common Use Cases</h2>
        <ul>
          <li>Embedding images as data URIs in HTML/CSS</li>
          <li>Encoding API keys and tokens for HTTP headers</li>
          <li>Storing binary data in JSON payloads</li>
          <li>Email attachments (MIME encoding)</li>
          <li>JWT (JSON Web Tokens) payload encoding</li>
        </ul>
      </section>
    </div>
  );
}
