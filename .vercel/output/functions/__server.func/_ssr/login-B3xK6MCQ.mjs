import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-sGid3STf.mjs";
import { t as GROK_PROVIDERS } from "./server-DqSmkp4J.mjs";
import { t as Button } from "./button-cgetco9e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B3xK6MCQ.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "relative grid min-h-dvh place-items-center bg-bg px-6 py-10 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/marcus.jpg",
					alt: "Marcus Aurelius",
					className: "mx-auto size-28 rounded-full object-cover face-crop ring-1 ring-line"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-xs font-medium tracking-widest text-muted uppercase",
					children: "Aurelius"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-4xl font-semibold tracking-tight text-fg",
					children: "Marcus Aurelius"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: "Keep your conversations with the emperor. Sign in, then return."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 flex flex-col gap-3",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "lg",
						className: "w-full",
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						children: ["Continue with ", p.label]
					}, p.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-8 inline-block text-sm text-muted underline-offset-4 hover:text-fg hover:underline",
					children: "Enter as a guest"
				})
			]
		})
	});
}
//#endregion
export { Login as component };
