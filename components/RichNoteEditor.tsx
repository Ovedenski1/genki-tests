
"use client";

import { useEffect, useRef, useState } from "react";

const PREFIX = "__pokotoba_rich_note_v1__:";

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#e11d48" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Purple", value: "#9333ea" },
] as const;

export function CommentIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
    </svg>
  );
}

function escapeHTML(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function allowedColor(value: string | null | undefined) {
  if (!value) return null;

  const color = value.trim().toLowerCase();

  let hex = color;

  if (color.startsWith("rgb")) {
    const match = color.match(
      /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/
    );

    if (match) {
      hex =
        "#" +
        [match[1], match[2], match[3]]
          .map((part) =>
            Number(part).toString(16).padStart(2, "0")
          )
          .join("");
    }
  }

  if (/^#[0-9a-f]{3}$/.test(hex)) {
    hex =
      "#" +
      hex
        .slice(1)
        .split("")
        .map((character) => character + character)
        .join("");
  }

  const found = COLORS.find(
    (item) => item.value === hex
  );

  return found?.value || null;
}

function sanitizeNode(node: Node): string {
  if (node.nodeType === 3) {
    return escapeHTML(node.textContent || "");
  }

  if (node.nodeType !== 1) return "";

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (
    [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "svg",
      "img",
      "video",
      "audio",
      "form",
      "input",
      "button",
    ].includes(tag)
  ) {
    return "";
  }

  if (tag === "br") return "<br>";

  let content = Array.from(element.childNodes)
    .map(sanitizeNode)
    .join("");

  if (tag === "strong" || tag === "b") {
    return `<strong>${content}</strong>`;
  }

  if (tag === "em" || tag === "i") {
    return `<em>${content}</em>`;
  }

  if (tag === "u") {
    return `<u>${content}</u>`;
  }

  if (tag === "span" || tag === "font") {
    const style = element.style;

    const color = allowedColor(
      style.color || element.getAttribute("color")
    );

    if (
      style.textDecoration.includes("underline") ||
      style.textDecorationLine.includes("underline")
    ) {
      content = `<u>${content}</u>`;
    }

    if (
      style.fontStyle === "italic" ||
      style.fontStyle === "oblique"
    ) {
      content = `<em>${content}</em>`;
    }

    if (
      style.fontWeight === "bold" ||
      Number(style.fontWeight) >= 600
    ) {
      content = `<strong>${content}</strong>`;
    }

    if (color) {
      content = `<span style="color:${color}">${content}</span>`;
    }

    return content;
  }

  if (tag === "div" || tag === "p") {
    return `${content}<br>`;
  }

  return content;
}

function sanitizeHTML(value: string) {
  const document = new DOMParser().parseFromString(
    value,
    "text/html"
  );

  return Array.from(document.body.childNodes)
    .map(sanitizeNode)
    .join("")
    .replace(/(?:<br>){3,}/g, "<br><br>")
    .replace(/(?:<br>)+$/g, "");
}

function noteToHTML(value: string) {
  if (value.startsWith(PREFIX)) {
    return sanitizeHTML(value.slice(PREFIX.length));
  }

  return escapeHTML(value).replace(/\r?\n/g, "<br>");
}

export function RichNoteEditor({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [hasText, setHasText] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(
    null
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.innerHTML = noteToHTML(initialValue);
    setHasText(Boolean(editor.textContent?.trim()));
  }, []);

  function syncContent() {
    const editor = editorRef.current;
    if (!editor) return;

    const hasContent = Boolean(editor.innerText?.trim());

    setHasText(hasContent);

    if (!hasContent) {
      onChange("");
      return;
    }

    const cleanHTML = sanitizeHTML(editor.innerHTML);

    onChange(PREFIX + cleanHTML);
  }

  function applyFormat(
    command: "bold" | "italic" | "underline" | "foreColor",
    value?: string
  ) {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    document.execCommand(
      "styleWithCSS",
      false,
      "false"
    );

    document.execCommand(
      command,
      false,
      value
    );

    syncContent();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 bg-blue-50/60 p-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("bold")}
            title="Bold"
            aria-label="Bold"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-base font-black text-[#173763] shadow-sm transition hover:bg-blue-100"
          >
            B
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("italic")}
            title="Italic"
            aria-label="Italic"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-serif text-lg font-bold italic text-[#173763] shadow-sm transition hover:bg-blue-100"
          >
            I
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("underline")}
            title="Underline"
            aria-label="Underline"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-base font-black text-[#173763] underline shadow-sm transition hover:bg-blue-100"
          >
            U
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-blue-200" />

        <div className="flex items-center gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setActiveColor(color.value);
                applyFormat("foreColor", color.value);
              }}
              title={color.name}
              aria-label={`${color.name} text`}
              className={`h-7 w-7 rounded-full border-2 border-white shadow-sm transition hover:scale-110 ${
                activeColor === color.value
                  ? "ring-2 ring-[#173763] ring-offset-1"
                  : ""
              }`}
              style={{
                backgroundColor: color.value,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        {!hasText ? (
          <p className="pointer-events-none absolute left-4 top-3 text-sm font-medium text-slate-400">
            Write your comment here...
          </p>
        ) : null}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Formatted word comment"
          aria-multiline="true"
          onInput={syncContent}
          onPaste={(event) => {
            event.preventDefault();

            const text =
              event.clipboardData.getData("text/plain");

            document.execCommand(
              "insertText",
              false,
              text
            );

            syncContent();
          }}
          className="min-h-[115px] max-h-[260px] overflow-y-auto break-words whitespace-pre-wrap px-4 py-3 text-sm font-semibold leading-relaxed text-[#173763] outline-none"
        />
      </div>
    </div>
  );
}

export function RichNoteDisplay({
  value,
}: {
  value: string;
}) {
  const [rendered, setRendered] = useState<{
    source: string;
    html: string;
  } | null>(null);

  const isRich = value.startsWith(PREFIX);

  useEffect(() => {
    if (!isRich) {
      setRendered(null);
      return;
    }

    setRendered({
      source: value,
      html: noteToHTML(value),
    });
  }, [value, isRich]);

  if (!isRich) {
    return (
      <span className="whitespace-pre-wrap break-words">
        {value}
      </span>
    );
  }

  if (!rendered || rendered.source !== value) {
    return null;
  }

  return (
    <span
      className="whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{
        __html: rendered.html,
      }}
    />
  );
}
