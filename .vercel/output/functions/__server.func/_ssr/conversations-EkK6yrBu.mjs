import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { f as sanitizeManner, l as getSql, t as DEFAULT_MANNER } from "./prompt-DbjQ97_N.mjs";
import { t as authMiddleware } from "./middleware-Cmdy2VgD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-EkK6yrBu.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function titleFrom(text) {
	const t = text.replace(/\s+/g, " ").trim();
	if (!t) return "Untitled counsel";
	return t.length > 48 ? `${t.slice(0, 45)}…` : t;
}
var listConversations_createServerFn_handler = createServerRpc({
	id: "4491ed1b4c0e31ef2f398d18264c655bb44d6b891317fa709efbb7d711635c2c",
	name: "listConversations",
	filename: "src/lib/conversations.ts"
}, (opts) => listConversations.__executeServer(opts));
var listConversations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listConversations_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, title, updated_at, manner_json, voice_id
      from conversations
      where user_id = ${context.userId}
      order by updated_at desc
      limit 40
    `).map((r) => ({
		id: r.id,
		title: r.title,
		updatedAt: r.updated_at
	}));
});
var loadConversation_createServerFn_handler = createServerRpc({
	id: "b27af3f5f83ec095af949b948fac0d9d1ee77d15ff97cb82dc69334897e9546c",
	name: "loadConversation",
	filename: "src/lib/conversations.ts"
}, (opts) => loadConversation.__executeServer(opts));
var loadConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(loadConversation_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	const row = (await sql`
      select id, title, updated_at, manner_json, voice_id
      from conversations
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `)[0];
	if (!row) return null;
	const msgs = await sql`
      select id, role, content from messages
      where conversation_id = ${id} and user_id = ${context.userId}
      order by created_at asc
    `;
	let manner = DEFAULT_MANNER;
	try {
		manner = sanitizeManner(JSON.parse(row.manner_json));
	} catch {
		manner = DEFAULT_MANNER;
	}
	return {
		id: row.id,
		title: row.title,
		voiceId: row.voice_id,
		manner,
		messages: msgs.filter((m) => m.role === "user" || m.role === "assistant").map((m) => ({
			id: m.id,
			role: m.role,
			content: m.content
		}))
	};
});
var saveTurn_createServerFn_handler = createServerRpc({
	id: "3e1d6eecad1dcfbea0d68e63dc0d9a9df70da0d3bec3ef028c78c4bdbaac6bb3",
	name: "saveTurn",
	filename: "src/lib/conversations.ts"
}, (opts) => saveTurn.__executeServer(opts));
var saveTurn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveTurn_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const mannerJson = JSON.stringify(sanitizeManner(data.manner));
	const voiceId = data.voiceId.slice(0, 40);
	const title = titleFrom(data.titleSource);
	if ((await sql`
      select id from conversations where id = ${data.conversationId} and user_id = ${context.userId} limit 1
    `)[0]) await sql`
        update conversations
        set updated_at = now(), manner_json = ${mannerJson}, voice_id = ${voiceId}
        where id = ${data.conversationId} and user_id = ${context.userId}
      `;
	else await sql`
        insert into conversations (id, user_id, title, manner_json, voice_id)
        values (${data.conversationId}, ${context.userId}, ${title}, ${mannerJson}, ${voiceId})
      `;
	await sql`
      insert into messages (id, conversation_id, user_id, role, content)
      values (${data.userMessage.id}, ${data.conversationId}, ${context.userId}, ${data.userMessage.role}, ${data.userMessage.content})
    `;
	await sql`
      insert into messages (id, conversation_id, user_id, role, content)
      values (${data.assistantMessage.id}, ${data.conversationId}, ${context.userId}, ${data.assistantMessage.role}, ${data.assistantMessage.content})
    `;
});
var deleteConversation_createServerFn_handler = createServerRpc({
	id: "4b03b531c626af2eb60fd5777c55b491a1d623e331feed035549c01ddf7a0969",
	name: "deleteConversation",
	filename: "src/lib/conversations.ts"
}, (opts) => deleteConversation.__executeServer(opts));
var deleteConversation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(deleteConversation_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	await sql`delete from messages where conversation_id = ${id} and user_id = ${context.userId}`;
	await sql`delete from conversations where id = ${id} and user_id = ${context.userId}`;
});
var loadPrefs_createServerFn_handler = createServerRpc({
	id: "71b156f6da860b9728d671ddc29faf93df1672ca5789133afc189ef581486ec2",
	name: "loadPrefs",
	filename: "src/lib/conversations.ts"
}, (opts) => loadPrefs.__executeServer(opts));
var loadPrefs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadPrefs_createServerFn_handler, async ({ context }) => {
	const r = (await (await getSql())`
      select voice_id, register, austerity, brevity, auto_speak
      from marcus_prefs where user_id = ${context.userId} limit 1
    `)[0];
	if (!r) return null;
	const register = r.register === "journal" || r.register === "emperor" ? r.register : "counsel";
	return {
		voiceId: r.voice_id || "lux",
		autoSpeak: Boolean(r.auto_speak),
		manner: sanitizeManner({
			register,
			austerity: r.austerity,
			brevity: r.brevity
		})
	};
});
var savePrefs_createServerFn_handler = createServerRpc({
	id: "87ff6560fa236a2a0f2351c1f43149316818013afb05238e720634995e46a6cb",
	name: "savePrefs",
	filename: "src/lib/conversations.ts"
}, (opts) => savePrefs.__executeServer(opts));
var savePrefs = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(savePrefs_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const manner = sanitizeManner(data.manner);
	const voiceId = data.voiceId.slice(0, 40);
	await sql`
      insert into marcus_prefs (user_id, voice_id, register, austerity, brevity, auto_speak)
      values (${context.userId}, ${voiceId}, ${manner.register}, ${manner.austerity}, ${manner.brevity}, ${data.autoSpeak})
      on conflict (user_id) do update set
        voice_id = excluded.voice_id,
        register = excluded.register,
        austerity = excluded.austerity,
        brevity = excluded.brevity,
        auto_speak = excluded.auto_speak
    `;
});
//#endregion
export { deleteConversation_createServerFn_handler, listConversations_createServerFn_handler, loadConversation_createServerFn_handler, loadPrefs_createServerFn_handler, savePrefs_createServerFn_handler, saveTurn_createServerFn_handler };
