import { Badge as ShadcnBadge, type BadgeProps as ShadcnBadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeColor = "gray" | "blue" | "amber" | "red" | "green" | "purple";

interface BadgeProps extends Omit<ShadcnBadgeProps, "variant"> {
  color?: BadgeColor;
}

const colorStyles: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-700 border-transparent dark:bg-gray-800 dark:text-gray-300",
  blue: "bg-blue-50 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-300",
  amber: "bg-amber-50 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-300",
  red: "bg-red-50 text-red-700 border-transparent dark:bg-red-950 dark:text-red-300",
  green: "bg-green-50 text-green-700 border-transparent dark:bg-green-950 dark:text-green-300",
  purple: "bg-purple-50 text-purple-700 border-transparent dark:bg-purple-950 dark:text-purple-300",
};

function Badge({ color = "gray", className, ...props }: BadgeProps) {
  return (
    <ShadcnBadge
      variant="outline"
      className={cn(colorStyles[color], className)}
      {...props}
    />
  );
}

export { Badge, type BadgeColor, type BadgeProps };
