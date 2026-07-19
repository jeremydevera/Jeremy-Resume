import { useMemo } from "react";
import { marked } from "marked";

// Admin-authored content (single trusted author). Bodies written in the
// rich-text editor are already HTML (start with a tag) — render as-is;
// anything else is Markdown.
export function Markdown({ source }: { source: string }) {
  const html = useMemo(() => {
    const s = source.trimStart();
    if (s.startsWith("<")) return source;
    return marked.parse(source, { async: false }) as string;
  }, [source]);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
