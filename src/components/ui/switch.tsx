import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
};

export function Switch({ checked, onCheckedChange, ariaLabel }: Props) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
      className={cn(
        "relative h-7 w-11 shrink-0 rounded-full transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/40",
        checked ? "bg-fg" : "bg-elevated",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 translate-x-1 rounded-full bg-muted transition-transform duration-150",
          "data-[state=checked]:translate-x-5 data-[state=checked]:bg-bg",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
