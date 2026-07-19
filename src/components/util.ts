// Deterministic gradient for cover placeholders (when no image uploaded yet).
const PALETTE = [
  ["#6366f1", "#8b5cf6"],
  ["#0ea5e9", "#22d3ee"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#059669"],
  ["#ec4899", "#f43f5e"],
  ["#8b5cf6", "#6366f1"],
];

export function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const [a, b] = PALETTE[h % PALETTE.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

// "https://www.foo.com/x" -> "foo.com"; falls back to the raw string.
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function initials(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}
