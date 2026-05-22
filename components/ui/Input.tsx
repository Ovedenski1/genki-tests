import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-xl border border-blue-200 bg-white px-5 py-4 text-[#173763] outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 ${className}`}
      {...props}
    />
  );
});