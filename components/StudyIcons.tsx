export function OpenBookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 12c8 0 15 2 24 8v34c-9-6-16-8-24-8V12Z" />
      <path d="M56 12c-8 0-15 2-24 8v34c9-6 16-8 24-8V12Z" />
      <path d="M32 20v34" />
    </svg>
  );
}

export function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 46 44 16l8 8-30 30-11 3 3-11Z" />
      <path d="m38 22 8 8" />
    </svg>
  );
}

export function CoffeeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 18h26l-3 34H21L18 18Z" />
      <path d="M16 18h30" />
      <path d="M22 10h18" />
      <path d="M24 10v8" />
      <path d="M38 10v8" />
    </svg>
  );
}

export function KanjiIcon({ className = "" }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      字
    </span>
  );
}