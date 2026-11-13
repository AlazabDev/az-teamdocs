import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, type ButtonProps } from "@/components/ui/button";

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full items-stretch rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
      className,
    )}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "block-end" }
>(({ className, align, ...props }, ref) => (
  <div
    ref={ref}
    data-align={align}
    className={cn("flex items-center gap-1 px-2 text-muted-foreground", className)}
    {...props}
  />
));
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
InputGroupText.displayName = "InputGroupText";

const InputGroupButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ghost", size = "sm", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("shrink-0", className)}
      {...props}
    />
  ),
);
InputGroupButton.displayName = "InputGroupButton";

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      "flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <Textarea
    ref={ref}
    className={cn(
      "min-h-[60px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
      className,
    )}
    {...props}
  />
));
InputGroupTextarea.displayName = "InputGroupTextarea";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
};
