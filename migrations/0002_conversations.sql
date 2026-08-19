create table if not exists conversations (
  id          text primary key,
  user_id     text not null,
  title       text not null,
  manner_json text not null,
  voice_id    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists conversations_user_id_idx on conversations (user_id, updated_at desc);

create table if not exists messages (
  id               text primary key,
  conversation_id  text not null references conversations(id) on delete cascade,
  user_id          text not null,
  role             text not null,
  content          text not null,
  created_at       timestamptz not null default now()
);
create index if not exists messages_conversation_idx on messages (conversation_id, created_at);

create table if not exists marcus_prefs (
  user_id     text primary key,
  voice_id    text not null default 'lux',
  register    text not null default 'counsel',
  austerity   integer not null default 58,
  brevity     integer not null default 62,
  auto_speak  boolean not null default false
);
