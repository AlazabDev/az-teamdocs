interface PageHeadingProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeading({ title, subtitle, action }: PageHeadingProps) {
  return (
    <div className="mt-12 mb-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
