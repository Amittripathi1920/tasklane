import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import { Check, ChevronDown, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const posterButtonStyle = {
  background:
    "radial-gradient(circle at 28% 22%, rgba(255,226,214,0.5), transparent 22%), radial-gradient(circle at 72% 18%, rgba(255,132,74,0.48), transparent 30%), radial-gradient(circle at 20% 72%, rgba(255,154,121,0.34), transparent 28%), linear-gradient(135deg, #ffc6af 0%, #f7783d 42%, #b63d09 100%)",
  boxShadow: "0 18px 40px rgba(185, 86, 34, 0.2)",
};

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-[13px] font-semibold transition duration-200 hover:translate-x-[1px] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-x-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-slate-950 hover:bg-glow",
        poster: "group relative overflow-hidden border border-[#f3c6b5] text-white hover:-translate-y-0.5 hover:brightness-[1.02]",
        secondary: "bg-white/6 text-white hover:bg-white/12",
        outline: "border border-white/10 bg-transparent text-white hover:bg-white/6",
        ghost: "text-slate-200 hover:bg-white/6",
        danger: "bg-rose-500/20 text-rose-100 hover:bg-rose-500/30",
      },
      size: {
        default: "h-10 px-3.5 py-2",
        sm: "h-8 px-3 py-1.5 text-[11px]",
        lg: "h-11 px-4.5 py-2.5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({ className, variant, size, ...props }) {
  if (variant === "poster") {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} style={posterButtonStyle} {...props}>
        <span
          className="poster-button-base pointer-events-none absolute inset-[-12%]"
          style={{
            background:
              "radial-gradient(circle at 28% 22%, rgba(255,226,214,0.5), transparent 22%), radial-gradient(circle at 72% 18%, rgba(255,132,74,0.48), transparent 30%), radial-gradient(circle at 20% 72%, rgba(255,154,121,0.34), transparent 28%), linear-gradient(135deg, #ffc6af 0%, #f7783d 42%, #b63d09 100%)",
            backgroundSize: "120% 120%, 130% 130%, 125% 125%, 160% 160%",
          }}
        />
        <span
          className="poster-button-wave pointer-events-none absolute inset-[-18%] opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 32% 66%, rgba(255, 129, 72, 0.98) 0%, rgba(236, 94, 39, 0.9) 24%, rgba(180, 57, 7, 0.36) 48%, rgba(0,0,0,0) 68%)",
            filter: "blur(20px)",
          }}
        />
        <span
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.28) 0.7px, transparent 0.7px), radial-gradient(rgba(120,32,0,0.18) 0.8px, transparent 0.8px)",
            backgroundSize: "12px 12px, 18px 18px",
            backgroundPosition: "0 0, 6px 6px",
          }}
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_30%,transparent_72%,rgba(255,255,255,0.06))]" />
        <span className="relative z-10 flex items-center justify-center gap-2">{props.children}</span>
      </button>
    );
  }

  return <button className={cn("ui-button", buttonVariants({ variant, size, className }))} {...props} />;
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "ui-card",
        "rounded-[22px] border border-[#e8e8ec] bg-white transition-[transform,border-color,box-shadow] duration-200 hover:border-[#dfe2ea] hover:shadow-[0_8px_22px_rgba(15,23,42,0.04)]",
        "hover:translate-x-[1px]",
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "ui-input",
        "h-10 w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[13px] text-white outline-none transition placeholder:text-slate-400 focus:border-accent/50 focus:bg-white/8",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "ui-textarea",
        "min-h-[112px] w-full rounded-3xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[13px] text-white outline-none transition placeholder:text-slate-400 focus:border-accent/50 focus:bg-white/8",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "ui-badge",
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label.Root className="text-[13px] font-semibold text-[#23242a]">{label}</Label.Root>
        {hint ? <span className="text-xs text-[#8f9098]">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function DialogShell({ open, onOpenChange, title, description, children, wide = false, headerActions = null }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md" />
        <Dialog.Content
          className={cn(
            "ui-dialog-shell",
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[26px] border border-[#e8e8ec] bg-white p-4 focus:outline-none",
            wide && "h-[92vh] max-w-[min(1500px,96vw)]",
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-[#23242a]">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-[13px] text-[#7b7c85]">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {headerActions}
              <Dialog.Close asChild>
                <button className="rounded-full border border-[#e5e5e9] p-2 text-[#7b7c85] transition hover:bg-[#fafafa]">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function TabsShell({ value, onValueChange, tabs, children }) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className="space-y-3">
      <Tabs.List className="ui-tabs-list inline-flex rounded-full border border-[#e7e7ea] bg-[#f5f5f7] p-1">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="ui-tabs-trigger rounded-full px-3.5 py-1.5 text-[13px] text-[#70717a] transition hover:translate-x-[1px] data-[state=active]:bg-white data-[state=active]:text-[#23242a]"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}

export function SelectField({ value, onValueChange, options, placeholder }) {
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="ui-select-trigger flex h-10 min-w-0 w-full items-center justify-between rounded-2xl border border-[#e5e5e9] bg-[#fafafa] px-3.5 text-[13px] text-[#23242a] outline-none">
        <Select.Value className="truncate" placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-[#8f9098]" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="ui-select-content z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-[#e8e8ec] bg-white"
        >
          <Select.Viewport className="p-1">
            {normalized.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="ui-select-item relative flex cursor-pointer items-center rounded-xl px-8 py-1.5 text-[13px] text-[#23242a] outline-none transition hover:translate-x-[1px] hover:bg-[#f5f5f7] focus:bg-[#f5f5f7]"
              >
                <Select.ItemIndicator className="absolute left-3">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function ScrollPanel({ className, children }) {
  return (
    <ScrollArea.Root className={cn("overflow-hidden", className)}>
      <ScrollArea.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" className="w-2.5 p-[2px]">
        <ScrollArea.Thumb className="rounded-full bg-white/10" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}

export function CheckboxRow({ checked, onCheckedChange, label }) {
  return (
    <label className="ui-checkbox-row flex items-center gap-2.5 rounded-2xl border border-[#ececf0] bg-[#fafafa] px-3 py-1.5 text-[13px] text-[#23242a] transition hover:translate-x-[1px] hover:border-[#dde1ea] hover:bg-white">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="flex h-5 w-5 items-center justify-center rounded-md border border-[#d7d7dc] bg-white"
      >
        <Checkbox.Indicator>
          <Check className="h-4 w-4 text-[#2160ff]" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <span>{label}</span>
    </label>
  );
}
