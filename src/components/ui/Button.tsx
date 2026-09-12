import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "coral";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-zumi-violet-600 text-white hover:bg-zumi-violet-700 shadow-lg shadow-zumi-violet-600/20",
  secondary:
    "bg-white text-zumi-violet-700 border-2 border-zumi-violet-100 hover:border-zumi-violet-300",
  ghost: "bg-transparent text-zumi-ink hover:bg-zumi-violet-50",
  coral: "bg-zumi-coral-500 text-white hover:bg-zumi-coral-600 shadow-lg shadow-zumi-coral-500/25",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zumi-violet-300",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
