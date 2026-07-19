import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    // Default to light — never auto-follow the OS into dark.
    return stored === "dark" ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export function ThemeSwitch({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      className={`theme-switch ${theme}`}
      onClick={toggle}
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Toggle dark mode"
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
    >
      <span className="track">
        <span className="knob">{theme === "dark" ? <IconMoon /> : <IconSun />}</span>
      </span>
      {showLabel && <span className="theme-label">{theme}</span>}
    </button>
  );
}
