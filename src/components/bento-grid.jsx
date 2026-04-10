import { cn } from "../lib/utils";

export function BentoGrid({ className, children }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-6 xl:grid-cols-12", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({ className, title, description, icon, children, bare = false }) {
  return (
    <div
      className={cn(
        bare
          ? "min-w-0 self-stretch [&>*]:h-full"
          : "group relative overflow-hidden rounded-[28px] border border-[#e8e8ec] bg-white p-5 transition-[border-color,box-shadow,transform] duration-200 hover:border-[#dfe2ea] hover:shadow-[0_12px_34px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      {!bare && (title || description || icon) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? <p className="text-sm font-semibold text-[#23242a]">{title}</p> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-[#7b7c85]">{description}</p> : null}
          </div>
          {icon ? <div className="shrink-0 text-[#8f9098]">{icon}</div> : null}
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
