import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  asChild?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        role="group"
        data-orientation={orientation}
        className={cn(
          "inline-flex items-center",
          orientation === "horizontal"
            ? "[&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*+*]:-ml-px"
            : "flex-col [&>*]:rounded-none [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*+*]:-mt-px",
          className,
        )}
        {...props}
      />
    );
  },
);
ButtonGroup.displayName = "ButtonGroup";

const ButtonGroupText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center border border-input bg-background px-3 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});
ButtonGroupText.displayName = "ButtonGroupText";

export { ButtonGroup, ButtonGroupText };
