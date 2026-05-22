import type { HTMLAttributes } from "react";

export function PageShell({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12 2xl:max-w-[1600px] 2xl:py-16 ${className}`}
      {...props}
    />
  );
}