import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const controlClasses =
  "w-full rounded-xl border-2 border-zumi-slate-200 bg-white px-4 py-2.5 text-sm text-zumi-ink " +
  "placeholder:text-zumi-slate-500 focus:border-zumi-violet-500 focus:outline-none " +
  "focus:ring-4 focus:ring-zumi-violet-100";

export function FieldLabel({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-zumi-ink">
        {children}
      </label>
      {hint ? <span className="text-xs text-zumi-slate-500">{hint}</span> : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlClasses, className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(controlClasses, className)} {...props} />;
  },
);

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-zumi-coral-600">{children}</p>;
}
