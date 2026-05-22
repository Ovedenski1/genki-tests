import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-purple-50 text-purple-700 ring-purple-200",
  muted: "bg-slate-100 text-slate-600 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${variants[variant]} ${className}`} {...props} />;
}