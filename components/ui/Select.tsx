import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  style,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full min-w-0 appearance-none rounded-xl border border-blue-200 bg-white px-4 py-3 pr-12 font-bold text-[#173763] outline-none ring-blue-200 transition focus:border-blue-400 focus:ring-4 ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23173763' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem center",
        backgroundSize: "1rem",
        ...style,
      }}
      {...props}
    />
  );
}