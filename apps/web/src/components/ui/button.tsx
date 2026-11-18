import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "rounded-lg border border-transparent bg-clip-padding",
    "text-sm font-medium whitespace-nowrap",
    "transition-all duration-200 outline-none select-none",
    "focus-visible:border-[var(--accent-color)]",
    "focus-visible:ring-3 focus-visible:ring-[var(--accent-color)]/30",
    "active:not-aria-[haspopup]:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-[var(--danger-color,#dc2626)]",
    "aria-invalid:ring-3 aria-invalid:ring-[var(--danger-color,#dc2626)]/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--accent-color)]",
          "text-[var(--text-primary)]",
          "hover:brightness-95",
          "active:brightness-90",
        ].join(" "),

        outline: [
          "border-[var(--border-color)]",
          "bg-[var(--card-bg)]",
          "text-[var(--text-primary)]",
          "hover:border-[var(--accent-color)]",
          "hover:bg-[var(--accent-color)]/5",
          "aria-expanded:border-[var(--accent-color)]",
          "aria-expanded:bg-[var(--accent-color)]/10",
        ].join(" "),

        secondary: [
          "border-[var(--border-color)]",
          "bg-[var(--border-color)]/10",
          "text-[var(--text-primary)]",
          "hover:bg-[var(--border-color)]/60",
          "aria-expanded:bg-[var(--accent-color)]/10",
        ].join(" "),

        ghost: [
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--accent-color)]/10",
          "hover:text-[var(--text-primary)]",
          "aria-expanded:bg-[var(--accent-color)]/10",
          "aria-expanded:text-[var(--text-primary)]",
        ].join(" "),

        greenlight: [
          "bg-[color-mix(in_oklch,var(--success-color,#16a34a),transparent_90%)]",
          "text-[var(--success-color,#16a34a)]",
          "hover:bg-[color-mix(in_oklch,var(--success-color,#16a34a),transparent_80%)]",
          "focus-visible:border-[var(--success-color,#16a34a)]",
          "focus-visible:ring-[var(--success-color,#16a34a)]/20",
        ].join(" "),


        destructive: [
          "bg-[color-mix(in_oklch,var(--danger-color,#dc2626),transparent_90%)]",
          "text-[var(--danger-color,#dc2626)]",
          "hover:bg-[color-mix(in_oklch,var(--danger-color,#dc2626),transparent_80%)]",
          "focus-visible:border-[var(--danger-color,#dc2626)]",
          "focus-visible:ring-[var(--danger-color,#dc2626)]/20",
        ].join(" "),

        link: [
          "text-[var(--accent-color)]",
          "underline-offset-4",
          "hover:underline",
          "hover:brightness-90",
        ].join(" "),
      },

      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",

        xs:
          "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",

        lg:
          "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",

        icon: "size-8",

        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",

        "icon-lg": "size-9",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };