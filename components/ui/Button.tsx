import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "green" | "blue" | "yellow" | "danger" | "secondary";
};

export function Button({
  className = "",
  variant = "green",
  ...props
}: ButtonProps) {
  const styles = {
    green:
      "bg-gradient-to-br from-[#8fc88f] to-[#6fae73] text-white shadow-lg shadow-green-200/60 hover:brightness-105",
    blue:
      "bg-gradient-to-br from-[#8fb1e7] to-[#6e95d4] text-white shadow-lg shadow-blue-200/60 hover:brightness-105",
    yellow:
      "bg-gradient-to-br from-[#ffe8a8] to-[#ffd678] text-[#172f52] shadow-lg shadow-yellow-200/70 hover:brightness-105",
    danger:
      "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-200/70 hover:brightness-105",
    secondary:
      "border border-slate-200 bg-white text-[#173763] shadow-sm hover:bg-blue-50",
  };

  return (
    <button
      className={`rounded-xl px-6 py-3 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}