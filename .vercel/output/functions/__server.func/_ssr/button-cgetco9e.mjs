import { o as require_jsx_runtime, r as Slot } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-cgetco9e.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,box-shadow,color,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/40 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.97]", {
	variants: {
		variant: {
			solid: "bg-accent text-bg hover:bg-accent/90",
			ghost: "bg-transparent text-fg/80 hover:bg-fg/10 hover:text-fg",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-fg/5"
		},
		size: {
			sm: "h-9 rounded-full px-3.5 text-sm",
			md: "h-11 rounded-full px-4 text-sm",
			lg: "h-12 rounded-full px-5 text-base",
			icon: "size-11 rounded-full",
			"icon-sm": "size-9 rounded-full"
		}
	},
	defaultVariants: {
		variant: "solid",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { cn as n, uid as r, Button as t };
