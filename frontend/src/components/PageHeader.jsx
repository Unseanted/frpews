import { cn } from "@/lib/utils";

export default function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            {EyebrowIcon && <EyebrowIcon className="size-3.5" />}
            {eyebrow}
          </div>
        )}
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
