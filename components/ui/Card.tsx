import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[1.5rem] border border-slate-200/70 bg-white/88 shadow-xl shadow-slate-300/35 backdrop-blur-sm ${className}`}
      {...props}
    />
  );
}