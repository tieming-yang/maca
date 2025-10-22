"use client";

import cn from "@/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "danger" | "icon" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};
export const topGlowBorder =
  "shadow-[inset_0_1px_2px_#ffffff70,0_2px_4px_rgba(0,0,0,0.19),0_4px_8px_rgba(0,0,0,0.08)]";

const baseClass = `${topGlowBorder} inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 backdrop-blur-2xl`;

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-black/10 text-white enabled:hover:bg-zinc-900 enabled:focus-visible:outline enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-zinc-300",
  danger:
    "border border-rose-500/60 text-rose-300 enabled:hover:bg-rose-500/10 enabled:focus-visible:outline enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-rose-400",
  icon: "bg-black/10 text-white enabled:hover:bg-zinc-900 px-2 enabled:focus-visible:outline enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-zinc-300 size-13",
  outline:
    "bg-transparent text-white enabled:hover:bg-zinc-400 enabled:focus-visible:outline enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-zinc-300",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, type, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(baseClass, variantClassMap[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
