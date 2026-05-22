import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl border border-blue-200 bg-white px-4 py-3 font-bold text-[#173763] outline-none ring-blue-200 focus:border-blue-400 focus:ring-4 ${className}`}
      {...props}
    />
  );
}