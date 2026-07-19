import { useEffect, useRef } from "react";

/**
 * Lightweight rich-text editor (no dependencies).
 * Emits an HTML string via onChange; render it with dangerouslySetInnerHTML.
 * Supports bold, italic, underline, bulleted + numbered lists, links, clear.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a description…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync an externally-set value into the DOM (e.g. when an entry loads for
  // editing). Guarded so typing — which flows out through onChange and back in
  // as an equal value — never resets the caret.
  useEffect(() => {
    const el = ref.current;
    if (el && value !== el.innerHTML) el.innerHTML = value || "";
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url) exec("createLink", url.trim());
  };

  const Btn = ({
    onDo,
    title,
    children,
  }: {
    onDo: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      className="rte-btn"
      title={title}
      // preventDefault keeps the text selection while the button is pressed
      onMouseDown={(e) => e.preventDefault()}
      onClick={onDo}
    >
      {children}
    </button>
  );

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <Btn onDo={() => exec("bold")} title="Bold (Ctrl+B)">
          <b>B</b>
        </Btn>
        <Btn onDo={() => exec("italic")} title="Italic (Ctrl+I)">
          <i>I</i>
        </Btn>
        <Btn onDo={() => exec("underline")} title="Underline (Ctrl+U)">
          <u>U</u>
        </Btn>
        <span className="rte-sep" />
        <Btn onDo={() => exec("formatBlock", "<h2>")} title="Heading">
          H2
        </Btn>
        <Btn onDo={() => exec("formatBlock", "<h3>")} title="Subheading">
          H3
        </Btn>
        <Btn onDo={() => exec("formatBlock", "<p>")} title="Paragraph">
          ¶
        </Btn>
        <span className="rte-sep" />
        <Btn onDo={() => exec("insertUnorderedList")} title="Bulleted list">
          • List
        </Btn>
        <Btn onDo={() => exec("insertOrderedList")} title="Numbered list">
          1. List
        </Btn>
        <span className="rte-sep" />
        <Btn onDo={addLink} title="Add link">
          Link
        </Btn>
        <Btn onDo={() => exec("unlink")} title="Remove link">
          Unlink
        </Btn>
        <Btn onDo={() => exec("removeFormat")} title="Clear formatting">
          Clear
        </Btn>
      </div>
      <div
        ref={ref}
        className="rte-body"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Description editor"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}
