import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as signOut, t as authClient } from "./client-sGid3STf.mjs";
import { a as VOICE_SAMPLE, i as VOICES, n as GREETING, r as SUGGESTIONS, t as DEFAULT_MANNER } from "./prompt-DbjQ97_N.mjs";
import { t as authMiddleware } from "./middleware-Cmdy2VgD.mjs";
import { n as cn, r as uid, t as Button } from "./button-CVuMJdwT.mjs";
import { a as SlidersHorizontal, c as Mic, i as Square, l as LoaderCircle, o as Send, r as Trash2, s as Plus, t as Volume2, u as History } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bg6xQWnF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function AuthChip() {
	const { user, isPending } = useCurrentUserState();
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready || isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-20 shrink-0 animate-pulse rounded-md bg-parchment/10" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "outline",
		size: "sm",
		className: "font-display tracking-wide",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			children: "Sign in"
		})
	});
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-9 items-center gap-2",
		children: [user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: user.profileImageUrl,
			alt: "",
			className: "size-8 rounded-full object-cover outline-solid outline-1 -outline-offset-1 outline-gold/25"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-8 place-items-center rounded-full bg-gold/20 font-display text-xs text-gold",
			children: label.charAt(0).toUpperCase()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => void signOut(),
			className: "hidden font-serif text-xs text-muted underline-offset-4 hover:text-parchment hover:underline sm:inline",
			children: "Sign out"
		})]
	});
}
function Composer({ value, onChange, onSend, onMicToggle, recording, busy, disabled }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "0px";
		el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
	}, [value]);
	function handleSubmit(e) {
		e.preventDefault();
		if (!busy && !disabled) onSend();
	}
	function onKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (!busy && !disabled) onSend();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "flex items-end gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: recording ? "gold" : "outline",
				size: "icon",
				onClick: onMicToggle,
				disabled: busy,
				"aria-label": recording ? "Stop recording" : "Speak to Marcus",
				"aria-pressed": recording,
				className: cn(recording && "speak-ring"),
				children: recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "sr-only",
				htmlFor: "counsel",
				children: "Speak to Marcus"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "counsel",
				ref,
				rows: 1,
				value,
				onChange: (e) => onChange(e.target.value),
				onKeyDown,
				disabled: busy || recording,
				placeholder: recording ? "Listening…" : "Speak, then — what disturbs the mind?",
				className: cn("max-h-40 min-h-11 flex-1 resize-none rounded-lg bg-surface/90 px-4 py-2.5", "font-serif text-sm leading-relaxed text-parchment placeholder:text-muted/80", "shadow-[var(--shadow-border)] outline-none", "focus:shadow-[var(--shadow-border-hover)]", "disabled:opacity-60")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "icon",
				disabled: busy || recording || !value.trim() || disabled,
				"aria-label": "Send",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
			})
		]
	});
}
function Portrait({ speaking, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden", compact ? "size-11 rounded-full" : "aspect-[2/3] w-full rounded-lg"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/marcus.jpg",
				alt: "Marcus Aurelius",
				className: cn("size-full object-cover outline-solid outline-1 -outline-offset-1 outline-gold/20", compact ? "face-crop" : "portrait-crop")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("flicker pointer-events-none absolute inset-0 candle-glow", speaking && "opacity-80") }),
			speaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "speak-ring pointer-events-none absolute inset-0 rounded-[inherit]" }) : null
		]
	});
}
function IdentityBlock() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xs tracking-widest text-gold uppercase",
				children: "The Chamber"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-2xl leading-tight text-parchment",
				children: "Marcus Aurelius"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-serif text-sm text-muted",
				children: "Emperor · philosopher · 161–180"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-serif text-sm leading-relaxed text-parchment/75",
				children: "He knows his own age, his own notes, and the Stoic art of judgment. He does not know yours. He will reason anyway."
			})
		]
	});
}
function Thread({ messages, streaming, speakingId, onSpeak, onStopSpeak, onSuggest }) {
	const empty = messages.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-6",
		children: empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantBubble, {
			text: GREETING,
			speaking: speakingId === "greeting",
			streaming: false,
			onSpeak: () => onSpeak("greeting", GREETING),
			onStopSpeak
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
			children: SUGGESTIONS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSuggest(s.text),
				className: cn("enter rounded-lg bg-surface/80 px-4 py-2.5 text-left shadow-[var(--shadow-border)]", "transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)]", "active:scale-[0.96]"),
				style: { animationDelay: `${120 + i * 80}ms` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-display text-sm text-gold",
					children: s.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block font-serif text-xs leading-relaxed text-muted line-clamp-2",
					children: s.text
				})]
			}, s.label))
		})] }) : messages.map((m) => m.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserBubble, { text: m.content }, m.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantBubble, {
			text: m.content,
			speaking: speakingId === m.id,
			streaming: streaming && m === messages[messages.length - 1],
			onSpeak: () => onSpeak(m.id, m.content),
			onStopSpeak
		}, m.id))
	});
}
function UserBubble({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-end",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-lg rounded-lg bg-gold/10 px-4 py-3 font-serif text-sm leading-relaxed text-parchment",
			children: text
		})
	});
}
function AssistantBubble({ text, speaking, streaming, onSpeak, onStopSpeak }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/marcus.jpg",
			alt: "",
			className: "mt-1 size-8 shrink-0 rounded-full object-cover face-crop outline outline-1 -outline-offset-1 outline-gold/25"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xs tracking-widest text-gold uppercase",
					children: "Marcus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-serif text-base leading-relaxed text-parchment whitespace-pre-wrap",
					children: [
						text,
						streaming && !text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "He considers…"
						}) : null,
						streaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-gold/80" }) : null
					]
				}),
				!streaming && text ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					className: "mt-1 h-8 px-2 text-muted hover:text-gold",
					onClick: speaking ? onStopSpeak : onSpeak,
					"aria-label": speaking ? "Stop speaking" : "Speak this reply",
					children: [speaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-serif text-xs",
						children: speaking ? "Silence" : "Hear him"
					})]
				}) : streaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-2 inline-flex items-center gap-1.5 font-serif text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), "Writing"]
				}) : null
			]
		})]
	});
}
function Slider({ value, onChange, min = 0, max = 100, step = 1, ariaLabel, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex h-8 w-full touch-none items-center select-none", className),
		value: [value],
		min,
		max,
		step,
		onValueChange: (v) => onChange(v[0] ?? value),
		"aria-label": ariaLabel,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-gold/20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-gold" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-parchment shadow-[0_0_0_4px_rgb(18_14_10_/_0.5)] transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" })]
	});
}
function Switch({ checked, onCheckedChange, ariaLabel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		checked,
		onCheckedChange,
		"aria-label": ariaLabel,
		className: cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60", checked ? "bg-gold" : "bg-parchment/15"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("block size-5 translate-x-1 rounded-full bg-parchment transition-transform duration-150", "data-[state=checked]:translate-x-6 data-[state=checked]:bg-ink") })
	});
}
var usePrefs = create()(persist((set) => ({
	voiceId: "lux",
	manner: DEFAULT_MANNER,
	autoSpeak: false,
	setVoice: (voiceId) => set({ voiceId }),
	setRegister: (register) => set((s) => ({ manner: {
		...s.manner,
		register
	} })),
	setAusterity: (austerity) => set((s) => ({ manner: {
		...s.manner,
		austerity
	} })),
	setBrevity: (brevity) => set((s) => ({ manner: {
		...s.manner,
		brevity
	} })),
	setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
	hydrate: (p) => set({
		voiceId: p.voiceId,
		manner: p.manner,
		autoSpeak: p.autoSpeak
	})
}), { name: "aurelius.prefs" }));
var REGISTERS = [
	{
		id: "journal",
		label: "Journal",
		hint: "Notes to himself"
	},
	{
		id: "counsel",
		label: "Counsel",
		hint: "A man to a man"
	},
	{
		id: "emperor",
		label: "Emperor",
		hint: "Duty, then philosophy"
	}
];
function VoiceManner({ onPreviewVoice, previewingId }) {
	const voiceId = usePrefs((s) => s.voiceId);
	const manner = usePrefs((s) => s.manner);
	const autoSpeak = usePrefs((s) => s.autoSpeak);
	const setVoice = usePrefs((s) => s.setVoice);
	const setRegister = usePrefs((s) => s.setRegister);
	const setAusterity = usePrefs((s) => s.setAusterity);
	const setBrevity = usePrefs((s) => s.setBrevity);
	const setAutoSpeak = usePrefs((s) => s.setAutoSpeak);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-7",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xs tracking-[0.22em] text-gold uppercase",
				children: "Manner"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-serif text-sm text-muted",
				children: "How he thinks on the page."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-3 gap-1 rounded-lg bg-ink/50 p-1",
				children: REGISTERS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setRegister(r.id),
					className: cn("rounded-md px-2 py-2 text-center transition-colors duration-150", manner.register === r.id ? "bg-gold/15 text-gold" : "text-muted hover:text-parchment"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-xs tracking-wide",
						children: r.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-[10px] leading-tight text-muted",
						children: r.hint
					})]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between font-serif text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gentle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Austere" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					value: manner.austerity,
					onChange: setAusterity,
					ariaLabel: "Austerity of counsel"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between font-serif text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Discourse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aphorism" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					value: manner.brevity,
					onChange: setBrevity,
					ariaLabel: "Brevity of speech"
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xs tracking-[0.22em] text-gold uppercase",
				children: "Voice"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-serif text-sm text-muted",
				children: "The instrument, not the man."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-serif text-xs text-muted",
					children: "Speak replies"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: autoSpeak,
					onCheckedChange: setAutoSpeak,
					ariaLabel: "Speak his replies aloud"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 flex flex-col gap-1",
			children: VOICES.map((v) => {
				const active = v.id === voiceId;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-150", active ? "bg-gold/12" : "hover:bg-parchment/5"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setVoice(v.id),
						className: "min-w-0 flex-1 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("block font-display text-sm", active ? "text-gold" : "text-parchment"),
							children: v.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-serif text-xs text-muted",
							children: v.quality
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon-sm",
						className: "shrink-0 text-gold",
						"aria-label": `Preview ${v.name}`,
						onClick: () => onPreviewVoice(v.id),
						disabled: previewingId === v.id,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					})]
				}) }, v.id);
			})
		})] })]
	});
}
var current = null;
var objectUrl = null;
function stopAudio() {
	if (current) {
		current.pause();
		current.onended = null;
		current.onerror = null;
		current.src = "";
		current = null;
	}
	if (objectUrl) {
		URL.revokeObjectURL(objectUrl);
		objectUrl = null;
	}
}
function playBlob(blob) {
	stopAudio();
	const url = URL.createObjectURL(blob);
	objectUrl = url;
	const audio = new Audio(url);
	current = audio;
	return new Promise((resolve, reject) => {
		audio.onended = () => {
			stopAudio();
			resolve();
		};
		audio.onerror = () => {
			stopAudio();
			reject(/* @__PURE__ */ new Error("The voice faltered."));
		};
		audio.play().catch((err) => {
			stopAudio();
			reject(err instanceof Error ? err : /* @__PURE__ */ new Error("Could not play."));
		});
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listConversations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4491ed1b4c0e31ef2f398d18264c655bb44d6b891317fa709efbb7d711635c2c"));
var loadConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("b27af3f5f83ec095af949b948fac0d9d1ee77d15ff97cb82dc69334897e9546c"));
var saveTurn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("3e1d6eecad1dcfbea0d68e63dc0d9a9df70da0d3bec3ef028c78c4bdbaac6bb3"));
var deleteConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("4b03b531c626af2eb60fd5777c55b491a1d623e331feed035549c01ddf7a0969"));
var loadPrefs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("71b156f6da860b9728d671ddc29faf93df1672ca5789133afc189ef581486ec2"));
var savePrefs = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("87ff6560fa236a2a0f2351c1f43149316818013afb05238e720634995e46a6cb"));
async function streamCounsel(opts) {
	const res = await fetch("/api/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			messages: opts.messages.map((m) => ({
				role: m.role,
				content: m.content
			})),
			manner: opts.manner
		}),
		signal: opts.signal
	});
	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.error ?? "The counsel could not be reached.");
	}
	if (!res.body) throw new Error("The counsel returned no voice.");
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let full = "";
	let buf = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buf += decoder.decode(value, { stream: true });
		const lines = buf.split("\n");
		buf = lines.pop() ?? "";
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed.startsWith("data:")) continue;
			const payload = trimmed.slice(5).trim();
			if (!payload || payload === "[DONE]") continue;
			try {
				const json = JSON.parse(payload);
				if (json.error) throw new Error(json.error);
				if (json.delta) {
					full += json.delta;
					opts.onDelta(json.delta);
				}
			} catch (err) {
				if (err instanceof SyntaxError) continue;
				throw err;
			}
		}
	}
	return full;
}
async function speakText(text, voiceId, signal) {
	const res = await fetch("/api/speak", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			text,
			voice_id: voiceId
		}),
		signal
	});
	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.error ?? "The voice could not be formed.");
	}
	return res.blob();
}
async function transcribeAudio(blob) {
	const file = new File([blob], "speech.webm", { type: blob.type || "audio/webm" });
	const form = new FormData();
	form.append("file", file);
	const res = await fetch("/api/transcribe", {
		method: "POST",
		body: form
	});
	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.error ?? "I could not hear that.");
	}
	return ((await res.json()).text ?? "").trim();
}
function Chamber() {
	const user = useCurrentUser();
	const manner = usePrefs((s) => s.manner);
	const voiceId = usePrefs((s) => s.voiceId);
	const autoSpeak = usePrefs((s) => s.autoSpeak);
	const hydrate = usePrefs((s) => s.hydrate);
	const [conversationId, setConversationId] = (0, import_react.useState)(() => uid());
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [streaming, setStreaming] = (0, import_react.useState)(false);
	const [speakingId, setSpeakingId] = (0, import_react.useState)(null);
	const [previewingId, setPreviewingId] = (0, import_react.useState)(null);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const [history, setHistory] = (0, import_react.useState)([]);
	const abortRef = (0, import_react.useRef)(null);
	const recRef = (0, import_react.useRef)(null);
	const chunksRef = (0, import_react.useRef)([]);
	const streamRef = (0, import_react.useRef)(null);
	const scrollerRef = (0, import_react.useRef)(null);
	const prefsLoaded = (0, import_react.useRef)(false);
	const scrollToEnd = (0, import_react.useCallback)(() => {
		const el = scrollerRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, []);
	(0, import_react.useEffect)(() => {
		scrollToEnd();
	}, [
		messages,
		streaming,
		scrollToEnd
	]);
	(0, import_react.useEffect)(() => {
		if (!user || prefsLoaded.current) return;
		prefsLoaded.current = true;
		loadPrefs().then((p) => {
			if (p) hydrate(p);
		}).catch(() => {});
		listConversations().then(setHistory).catch(() => setHistory([]));
	}, [user, hydrate]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const t = window.setTimeout(() => {
			savePrefs({ data: {
				voiceId,
				manner,
				autoSpeak
			} }).catch(() => {});
		}, 900);
		return () => window.clearTimeout(t);
	}, [
		user,
		voiceId,
		manner,
		autoSpeak
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			abortRef.current?.abort();
			stopAudio();
			recRef.current?.stop();
			streamRef.current?.getTracks().forEach((t) => t.stop());
		};
	}, []);
	const speak = (0, import_react.useCallback)(async (id, text, voice = voiceId) => {
		if (!text.trim()) return;
		stopAudio();
		setSpeakingId(id);
		try {
			await playBlob(await speakText(text, voice));
		} catch (err) {
			const msg = err instanceof Error ? err.message : "The voice faltered.";
			if (!/abort/i.test(msg)) toast.error(msg);
		} finally {
			setSpeakingId((cur) => cur === id ? null : cur);
		}
	}, [voiceId]);
	const stopSpeak = (0, import_react.useCallback)(() => {
		stopAudio();
		setSpeakingId(null);
		setPreviewingId(null);
	}, []);
	const previewVoice = (0, import_react.useCallback)(async (id) => {
		stopAudio();
		setPreviewingId(id);
		setSpeakingId("preview");
		try {
			await playBlob(await speakText(VOICE_SAMPLE, id));
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "The voice faltered.");
		} finally {
			setPreviewingId(null);
			setSpeakingId((cur) => cur === "preview" ? null : cur);
		}
	}, []);
	const send = (0, import_react.useCallback)(async (text) => {
		const content = text.replace(/\s+/g, " ").trim();
		if (!content || streaming) return;
		stopSpeak();
		setDraft("");
		const userMsg = {
			id: uid(),
			role: "user",
			content
		};
		const assistantMsg = {
			id: uid(),
			role: "assistant",
			content: ""
		};
		const prior = messages;
		setMessages([
			...prior,
			userMsg,
			assistantMsg
		]);
		setStreaming(true);
		const ac = new AbortController();
		abortRef.current = ac;
		try {
			const finalText = (await streamCounsel({
				messages: [...prior, userMsg],
				manner,
				signal: ac.signal,
				onDelta: (delta) => {
					setMessages((cur) => cur.map((m) => m.id === assistantMsg.id ? {
						...m,
						content: m.content + delta
					} : m));
				}
			})).trim();
			setMessages((cur) => cur.map((m) => m.id === assistantMsg.id ? {
				...m,
				content: finalText || m.content
			} : m));
			if (user) saveTurn({ data: {
				conversationId,
				titleSource: userMsg.content,
				manner,
				voiceId,
				userMessage: userMsg,
				assistantMessage: {
					...assistantMsg,
					content: finalText
				}
			} }).then(() => listConversations().then(setHistory).catch(() => {})).catch(() => {});
			if (autoSpeak && finalText) speak(assistantMsg.id, finalText);
		} catch (err) {
			if (err.name === "AbortError") return;
			const msg = err instanceof Error ? err.message : "Marcus could not be reached.";
			toast.error(msg);
			setMessages((cur) => cur.map((m) => m.id === assistantMsg.id && !m.content ? {
				...m,
				content: "I am silent a moment. Try again when the line is clear."
			} : m));
		} finally {
			setStreaming(false);
			abortRef.current = null;
		}
	}, [
		streaming,
		messages,
		manner,
		user,
		conversationId,
		voiceId,
		autoSpeak,
		speak,
		stopSpeak
	]);
	function newConversation() {
		abortRef.current?.abort();
		stopSpeak();
		setConversationId(uid());
		setMessages([]);
		setDraft("");
		setStreaming(false);
		setHistoryOpen(false);
	}
	async function openConversation(id) {
		try {
			const loaded = await loadConversation({ data: id });
			if (!loaded) return;
			abortRef.current?.abort();
			stopSpeak();
			setConversationId(loaded.id);
			setMessages(loaded.messages);
			hydrate({
				voiceId: loaded.voiceId,
				manner: loaded.manner,
				autoSpeak
			});
			setHistoryOpen(false);
		} catch {
			toast.error("That conversation could not be opened.");
		}
	}
	async function removeConversation(id) {
		try {
			await deleteConversation({ data: id });
			setHistory((h) => h.filter((c) => c.id !== id));
			if (id === conversationId) newConversation();
		} catch {
			toast.error("Could not put that paper away.");
		}
	}
	async function toggleMic() {
		if (recording) {
			recRef.current?.stop();
			return;
		}
		if (!navigator.mediaDevices?.getUserMedia) {
			toast.error("This chamber cannot hear you here.");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			const rec = new MediaRecorder(stream);
			chunksRef.current = [];
			rec.ondataavailable = (e) => {
				if (e.data.size) chunksRef.current.push(e.data);
			};
			rec.onstop = () => {
				setRecording(false);
				stream.getTracks().forEach((t) => t.stop());
				streamRef.current = null;
				recRef.current = null;
				const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
				chunksRef.current = [];
				if (blob.size < 400) return;
				transcribeAudio(blob).then((text) => {
					if (text) setDraft((d) => d ? `${d} ${text}` : text);
					else toast.message("I heard nothing I could write.");
				}).catch((err) => {
					toast.error(err instanceof Error ? err.message : "I could not hear that.");
				});
			};
			recRef.current = rec;
			rec.start();
			setRecording(true);
		} catch {
			toast.error("The microphone was refused.");
		}
	}
	const speaking = speakingId !== null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh bg-ink text-parchment",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 bg-cover bg-center opacity-35",
				style: { backgroundImage: "url(/chamber.jpg)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chamber-veil pointer-events-none absolute inset-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grain absolute inset-0 opacity-40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-dvh max-w-6xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden w-80 shrink-0 flex-col border-r border-gold/15 lg:flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, { speaking }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityBlock, {})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1 overflow-y-auto px-5 pb-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceManner, {
							onPreviewVoice: (id) => void previewVoice(id),
							previewingId
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "flex items-center gap-3 px-4 py-3 lg:px-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "lg:hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
										speaking,
										compact: true
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 lg:hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xs tracking-widest text-gold uppercase",
										children: "Aurelius"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-serif text-sm text-parchment",
										children: "Marcus Aurelius"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden flex-1 lg:block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xs tracking-widest text-gold uppercase",
										children: "A conversation"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon-sm",
									"aria-label": "New conversation",
									onClick: newConversation,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
								}),
								user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon-sm",
									"aria-label": "Past conversations",
									onClick: () => setHistoryOpen(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" })
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon-sm",
									className: "lg:hidden",
									"aria-label": "Voice and manner",
									onClick: () => setSettingsOpen(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthChip, {})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: scrollerRef,
							className: "min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-8 lg:px-10 lg:py-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto max-w-2xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thread, {
									messages,
									streaming,
									speakingId,
									onSpeak: (id, text) => void speak(id, text),
									onStopSpeak: stopSpeak,
									onSuggest: (text) => void send(text)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-gold/10 bg-ink/70 px-4 py-3 backdrop-blur-sm lg:px-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto max-w-2xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, {
									value: draft,
									onChange: setDraft,
									onSend: () => void send(draft),
									onMicToggle: () => void toggleMic(),
									recording,
									busy: streaming
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-center font-serif text-xs text-muted",
									children: "He answers from the second century. Sign in to keep the papers."
								})]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Portal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, { className: "fixed inset-0 z-40 bg-ink/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
					className: "fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col rounded-t-2xl bg-surface",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 h-1 w-12 rounded-full bg-gold/30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
							className: "px-5 pt-4 font-display text-sm tracking-[0.2em] text-gold uppercase",
							children: "Voice & manner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-y-auto px-5 pt-4 pb-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceManner, {
								onPreviewVoice: (id) => void previewVoice(id),
								previewingId
							})
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
				open: historyOpen,
				onOpenChange: setHistoryOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Portal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, { className: "fixed inset-0 z-40 bg-ink/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
					className: "fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-2xl bg-surface lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:w-96 lg:rounded-none lg:rounded-l-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 h-1 w-12 rounded-full bg-gold/30 lg:hidden" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
							className: "px-5 pt-4 font-display text-sm tracking-[0.2em] text-gold uppercase",
							children: "Papers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "overflow-y-auto px-3 py-3",
							children: history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "px-2 py-6 text-center font-serif text-sm text-muted",
								children: "No conversations kept yet."
							}) : history.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void openConversation(c.id),
									className: "min-w-0 flex-1 rounded-md px-3 py-2.5 text-left hover:bg-parchment/5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-serif text-sm text-parchment",
										children: c.title
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon-sm",
									"aria-label": "Delete conversation",
									onClick: () => void removeConversation(c.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-muted" })
								})]
							}, c.id))
						})
					]
				})] })
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chamber, {});
}
//#endregion
export { Home as component };
