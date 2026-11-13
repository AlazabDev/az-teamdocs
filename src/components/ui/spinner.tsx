import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, ...props }, ref) => (
    <Loader2
      ref={ref}
      className={cn("h-4 w-4 animate-spin", className)}
      {...props}
    />
  ),
);
Spinner.displayName = "Spinner";

export { Spinner };
