import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Channel, Embed, Message, TypingInfo } from "../types";
import { EMOJIS, USERS, userById, ME_ID, ROLE_LABEL } from "../data";
import { COMMANDS, norm } from "../bot";
import { Avatar, BotBadge, Icon, TypingDots } from "./ui";

/* ================= RICH TEXT ================= */

const NAME_SET = new Set(USERS.map((u) => norm(u.name)));
const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|https?:\/\/[^\s]+|@[^\s.,!?]+|#[^\s.,!?()]+)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(INLINE_RE);
  return parts.map((part, i) => {
    if (!part) return null;
    const k = `${keyBase}-${i}`;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={k} className="rounded bg-rail px-1.5 py-0.5 font-mono text-[13px] text-[#f0b232]">{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={k} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
    if (part.startsWith("~~") && part.endsWith("~~"))
      return <s key={k}>{part.slice(2, -2)}</s>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={k}>{part.slice(1, -1)}</em>;
    if (part.startsWith("http"))
      return (
        <a key={k} href={part} target="_blank" rel="noreferrer" className="text-link hover:underline">
          {part}
        </a>
      );
    if (part.startsWith("@")) {
      const who = norm(part.slice(1));
      const everyone = who === "everyone";
      if (everyone || NAME_SET.has(who))
        return (
          <span
            key={k}
            className={`cursor-pointer rounded px-1 font-semibold transition ${
              everyone
                ? "bg-yellow/25 text-yellow hover:bg-yellow hover:text-rail"
                : "bg-blurple/30 text-mention hover:bg-blurple hover:text-white"
            }`}
          >
            {part}
          </span>
        );
    }
    if (part.startsWith("#") && /^#[^\s\d]/.test(part))
      return (
        <span key={k} className="cursor-pointer rounded bg-blurple/30 px-1 font-semibold text-mention transition hover:bg-blurple hover:text-white">
          {part}
        </span>
      );
    return <span key={k}>{part}</span>;
  });
}

export function RichText({ text }: { text: string }) {
  const blocks = text.split("```");
  return (
    <>
      {blocks.map((b, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="dc-scroll my-1 overflow-x-auto rounded-md border border-rail bg-panel2 p-3 font-mono text-[13px] leading-relaxed text-body">
            <code>{b.trim()}</code>
          </pre>
        ) : b ? (
          <span key={i} className="whitespace-pre-wrap break-words">{inline(b, `b${i}`)}</span>
        ) : null,
      )}
    </>
  );
}

/* ================= EMBED ================= */

export function EmbedCard({ embed, onButton }: { embed: Embed; onButton: (label: string) => void }) {
  const big = embed.bigAvatar ? userById(embed.bigAvatar) : null;
  return (
    <div className="anim-pop-in mt-1 max-w-md rounded-md bg-panel p-3 pr-4" style={{ borderLeft: `4px solid ${embed.color}` }}>
      {embed.title && <p className="font-display text-[15px] font-bold text-ink">{embed.title}</p>}
      {embed.description && (
        <div className="mt-1 text-[14px] leading-relaxed text-body">
          <RichText text={embed.description} />
        </div>
      )}
      {big && (
        <div className="mt-2 flex items-center gap-3">
          <Avatar user={big} size={72} />
          <span className="font-mono text-xs text-muted">@{big.name}#{big.id === ME_ID ? "0001" : "7749"}</span>
        </div>
      )}
      {embed.buttons && (
        <div className="mt-3 flex flex-wrap gap-2">
          {embed.buttons.map((b) => (
            <button
              key={b.label}
              onClick={() => onButton(b.label)}
              className={`rounded px-4 py-1.5 text-[13px] font-bold transition active:scale-95 ${
                b.style === "primary"
                  ? "bg-blurple text-white hover:bg-blurple2"
                  : "bg-hover2 text-body hover:bg-divider"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
      {embed.footer && <p className="mt-2 text-[11px] font-medium text-dim">{embed.footer}</p>}
    </div>
  );
}

/* ================= MESSAGE ROW ================= */

const QUICK_REACTS = ["👍", "🔥", "😂", "❤️"];
const GROUP_MS = 5 * 60_000;

interface RowProps {
  msg: Message;
  prev?: Message;
  isMe: boolean;
  onReact: (id: string, emoji: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToast: (t: string) => void;
  onReactPicker: (id: string) => void;
  onEmbedButton: (label: string) => void;
}

function MessageRow({ msg, prev, isMe, onReact, onEdit, onDelete, onToast, onReactPicker, onEmbedButton }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(msg.content);
  const user = userById(msg.userId);
  const grouped = !!prev && prev.userId === msg.userId && msg.ts - prev.ts < GROUP_MS && !msg.embed && !prev.embed;
  const time = new Date(msg.ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const nameColor = user.role === "member" ? "#f2f3f5" : user.role === "bot" ? "#c9cdfb" : user.color;

  const saveEdit = () => {
    if (draft.trim() && draft.trim() !== msg.content) onEdit(msg.id, draft.trim());
    setEditing(false);
  };

  return (
    <div
      className={`group relative flex gap-4 px-4 py-0.5 transition hover:bg-[#2e3035] ${grouped ? "" : "mt-[14px]"}`}
    >
      {grouped ? (
        <span className="w-10 shrink-0 select-none pt-1 text-right text-[10px] font-medium text-dim opacity-0 group-hover:opacity-100">
          {time}
        </span>
      ) : (
        <Avatar user={user} size={40} />
      )}
      <div className="min-w-0 flex-1">
        {!grouped && (
          <p className="flex flex-wrap items-baseline gap-x-2 leading-snug">
            <span className="cursor-pointer text-[15px] font-bold hover:underline" style={{ color: nameColor }}>
              {user.name}
            </span>
            {user.isBot && <BotBadge />}
            {user.role === "admin" && (
              <span className="rounded bg-yellow/20 px-1 py-px text-[10px] font-bold text-yellow">{ROLE_LABEL.admin}</span>
            )}
            {user.role === "mod" && (
              <span className="rounded bg-[#f0b232]/15 px-1 py-px text-[10px] font-bold text-[#f0b232]">{ROLE_LABEL.mod}</span>
            )}
            <span className="text-[11px] font-medium text-dim">Hôm nay lúc {time}</span>
          </p>
        )}
        {editing ? (
          <div>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); }
                if (e.key === "Escape") setEditing(false);
              }}
              rows={Math.min(4, draft.split("\n").length + 1)}
              className="dc-scroll w-full resize-none rounded-md bg-raised px-3 py-2 text-[15px] text-body outline-none ring-1 ring-blurple/50"
            />
            <p className="mt-1 text-[11px] text-dim">
              esc để <button className="text-link hover:underline" onClick={() => setEditing(false)}>hủy</button> · enter để{" "}
              <button className="text-link hover:underline" onClick={saveEdit}>lưu</button>
            </p>
          </div>
        ) : (
          msg.content && (
            <div className="text-[15px] leading-relaxed text-body">
              <RichText text={msg.content} />
              {msg.edited && <span className="ml-1 text-[10px] text-dim">(đã chỉnh sửa)</span>}
            </div>
          )
        )}
        {msg.embed && <EmbedCard embed={msg.embed} onButton={onEmbedButton} />}
        {msg.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {msg.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(msg.id, r.emoji)}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[13px] font-semibold transition active:scale-90 ${
                  r.me
                    ? "border-blurple bg-blurple/25 text-mention"
                    : "border-transparent bg-panel text-muted hover:border-divider"
                }`}
              >
                <span className="text-[15px]">{r.emoji}</span>
                {r.count}
              </button>
            ))}
            <button
              onClick={() => onReactPicker(msg.id)}
              className="flex items-center rounded-lg bg-panel px-2 text-muted opacity-0 transition hover:text-mention group-hover:opacity-100"
              title="Thêm cảm xúc"
            >
              <Icon name="smilePlus" size={16} />
            </button>
          </div>
        )}
      </div>

      {/* hover toolbar */}
      {!editing && (
        <div className="absolute -top-3.5 right-4 hidden items-center overflow-hidden rounded-lg border border-rail bg-panel shadow-lg group-hover:flex">
          {QUICK_REACTS.map((e) => (
            <button
              key={e}
              onClick={() => onReact(msg.id, e)}
              className="px-1.5 py-1.5 text-[15px] transition hover:bg-hover2 hover:scale-110"
              title={`Thả ${e}`}
            >
              {e}
            </button>
          ))}
          <button onClick={() => onReactPicker(msg.id)} className="p-1.5 text-muted transition hover:bg-hover2 hover:text-mention" title="Thêm cảm xúc">
            <Icon name="smilePlus" size={17} />
          </button>
          {isMe && (
            <>
              <button
                onClick={() => { setDraft(msg.content); setEditing(true); }}
                className="p-1.5 text-muted transition hover:bg-hover2 hover:text-yellow"
                title="Sửa tin nhắn"
              >
                <Icon name="pencil" size={16} />
              </button>
              <button onClick={() => onDelete(msg.id)} className="p-1.5 text-muted transition hover:bg-hover2 hover:text-red" title="Xóa">
                <Icon name="trash" size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(msg.content).catch(() => {});
              onToast("Đã sao chép nội dung tin nhắn 📋");
            }}
            className="p-1.5 text-muted transition hover:bg-hover2 hover:text-body"
            title="Sao chép"
          >
            <Icon name="dots" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= EMOJI PICKER ================= */

export function EmojiPicker({
  onPick,
  onClose,
  title = "Chọn emoji",
}: {
  onPick: (e: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const [q, setQ] = useState("");
  const list = q ? EMOJIS.filter((e) => e.includes(q)) : EMOJIS;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="anim-pop-in absolute bottom-full right-0 z-50 mb-2 w-[300px] rounded-xl border border-rail bg-panel p-3 shadow-2xl">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">{title}</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm emoji…"
          className="mb-2 w-full rounded bg-rail px-2.5 py-1.5 text-sm text-body outline-none placeholder:text-dim focus:ring-1 focus:ring-blurple"
        />
        <div className="dc-scroll grid max-h-44 grid-cols-8 gap-0.5 overflow-y-auto">
          {list.map((e) => (
            <button
              key={e}
              onClick={() => onPick(e)}
              className="rounded-md p-1 text-[22px] transition hover:scale-125 hover:bg-hover2"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ================= SLASH MENU ================= */

function SlashMenu({ query, active, onPick }: { query: string; active: number; onPick: (usage: string) => void }) {
  const items = COMMANDS.filter((c) => c.name.startsWith(query.toLowerCase()));
  if (!items.length) return null;
  return (
    <div className="anim-pop-in absolute bottom-full left-0 z-50 mb-2 w-[340px] overflow-hidden rounded-xl border border-rail bg-panel shadow-2xl">
      <p className="px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Lệnh của QuickBot</p>
      <div className="dc-scroll max-h-64 overflow-y-auto p-1.5">
        {items.map((c, i) => (
          <button
            key={c.name}
            onClick={() => onPick(c.usage + " ")}
            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition ${
              i === active ? "bg-hover2" : "hover:bg-hoverch"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blurple font-mono text-sm font-bold text-white">
              /
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[14px] font-bold text-ink">{c.usage}</span>
              <span className="block truncate text-[12px] text-muted">{c.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= CHAT AREA ================= */

export interface ChatAreaProps {
  channel: Channel;
  typing: TypingInfo[];
  membersOpen: boolean;
  onToggleMembers: () => void;
  onSend: (text: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onEdit: (msgId: string, text: string) => void;
  onDelete: (msgId: string) => void;
  onToast: (t: string) => void;
  onOpenSidebar: () => void;
}

export function ChatArea({
  channel, typing, membersOpen, onToggleMembers,
  onSend, onReact, onEdit, onDelete, onToast, onOpenSidebar,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [slashIdx, setSlashIdx] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reactTarget, setReactTarget] = useState<string | null>(null);
  const [pinsOpen, setPinsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const prevCount = useRef(0);

  const typingHere = typing.filter((t) => t.channelId === channel.id);
  const isSlash = input.startsWith("/") && !input.includes(" ");
  const slashItems = useMemo(
    () => (isSlash ? COMMANDS.filter((c) => c.name.startsWith(norm(input.slice(1)))) : []),
    [isSlash, input],
  );

  const shown = useMemo(() => {
    if (!query.trim()) return channel.messages;
    const nq = norm(query);
    return channel.messages.filter((m) => norm(m.content).includes(nq) || (m.embed?.description && norm(m.embed.description).includes(nq)));
  }, [channel.messages, query]);

  // reset khi đổi kênh
  useEffect(() => {
    setInput(""); setQuery(""); setPickerOpen(false); setReactTarget(null); setPinsOpen(false); setSlashIdx(0);
    prevCount.current = 0;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }, [channel.id]);

  // auto-scroll khi có tin mới
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (channel.messages.length > prevCount.current && nearBottom.current) {
      requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: prevCount.current ? "smooth" : "auto" }));
    }
    prevCount.current = channel.messages.length;
  }, [channel.messages.length, channel.id]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    onSend(t);
    setInput("");
    setSlashIdx(0);
    nearBottom.current = true;
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (slashItems.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSlashIdx((i) => (i + 1) % slashItems.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSlashIdx((i) => (i - 1 + slashItems.length) % slashItems.length); return; }
      if ((e.key === "Enter" || e.key === "Tab") && slashItems[slashIdx]) {
        e.preventDefault();
        setInput(slashItems[slashIdx].usage + " ");
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const typers = typingHere.map((t) => userById(t.userId).name);
  const pinned = channel.messages.filter((m) => m.pinned);

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-chat">
      {/* ambient layer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_45%_at_50%_-5%,rgba(88,101,242,0.09),transparent_70%)]" />

      {/* ===== header ===== */}
      <header className="relative z-20 flex h-12 shrink-0 items-center gap-2 border-b border-rail/70 px-3 shadow-sm">
        <button onClick={onOpenSidebar} className="rounded p-1 text-muted transition hover:text-ink lg:hidden" title="Mở kênh">
          <Icon name="menu" size={20} />
        </button>
        <Icon name="hash" size={22} className="shrink-0 text-dim" />
        <h1 className="font-display text-[15px] font-bold text-ink">{channel.name}</h1>
        {channel.topic && (
          <>
            <span className="mx-1 hidden h-5 w-px bg-divider sm:block" />
            <p className="hidden min-w-0 flex-1 truncate text-[13px] text-muted sm:block">{channel.topic}</p>
          </>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <div className="relative">
            <button
              onClick={() => setPinsOpen((v) => !v)}
              className={`rounded p-1.5 transition hover:text-ink ${pinsOpen ? "bg-hover2 text-ink" : "text-muted"}`}
              title="Tin nhắn đã ghim"
            >
              <Icon name="pin" size={19} />
            </button>
            {pinsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPinsOpen(false)} />
                <div className="anim-pop-in absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-rail bg-panel p-2 shadow-2xl">
                  <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">Tin đã ghim</p>
                  {pinned.length === 0 && <p className="px-2 pb-2 text-sm text-dim">Chưa có tin nào được ghim 📌</p>}
                  {pinned.map((m) => {
                    const u = userById(m.userId);
                    return (
                      <div key={m.id} className="flex gap-2.5 rounded-lg p-2 transition hover:bg-hoverch">
                        <Avatar user={u} size={28} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold" style={{ color: u.role === "member" ? "#f2f3f5" : u.color }}>{u.name}</p>
                          <p className="line-clamp-2 text-[13px] text-body">{m.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <button
            onClick={onToggleMembers}
            className={`hidden rounded p-1.5 transition hover:text-ink lg:block ${membersOpen ? "bg-hover2 text-ink" : "text-muted"}`}
            title="Danh sách thành viên"
          >
            <Icon name="users" size={19} />
          </button>
          <div className="ml-1 flex items-center gap-1.5 rounded bg-rail px-2 py-1 transition focus-within:ring-1 focus-within:ring-blurple">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm"
              className="w-16 bg-transparent text-[13px] text-body outline-none placeholder:text-dim transition-all focus:w-36 sm:w-24 sm:focus:w-44"
            />
            <Icon name="search" size={15} className="text-dim" />
          </div>
          <button onClick={() => onToast("Hộp thư đến trống — chưa có mention nào 📭")} className="rounded p-1.5 text-muted transition hover:text-ink" title="Hộp thư đến">
            <Icon name="inbox" size={19} />
          </button>
          <button onClick={() => onToast("Cần giúp? Gõ /help hoặc nhắn @QuickBot 🤖")} className="rounded p-1.5 text-muted transition hover:text-ink" title="Trợ giúp">
            <Icon name="help" size={19} />
          </button>
        </div>
      </header>

      {/* ===== messages ===== */}
      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          if (el) nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
        }}
        className="dc-scroll relative z-10 flex-1 overflow-y-auto pb-4"
      >
        {query.trim() && (
          <div className="anim-fade-in sticky top-2 z-20 mx-4 mb-2 flex items-center justify-between rounded-lg border border-blurple/40 bg-panel/95 px-3 py-2 shadow-lg backdrop-blur">
            <p className="text-[13px] text-body">
              <strong className="text-mention">{shown.length}</strong> kết quả cho “{query}”
            </p>
            <button onClick={() => setQuery("")} className="rounded p-1 text-muted transition hover:bg-hover2 hover:text-ink">
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        {query.trim() ? (
          shown.length ? (
            <div className="pt-2">
              {shown.map((m, i) => (
                <MessageRow
                  key={m.id} msg={m} prev={shown[i - 1]} isMe={m.userId === ME_ID}
                  onReact={onReact} onEdit={onEdit} onDelete={onDelete} onToast={onToast}
                  onReactPicker={setReactTarget} onEmbedButton={(l) => onToast(`Nút "${l}" — demo thôi nha ✨`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="text-5xl">🔍</span>
              <p className="font-display text-lg font-bold text-ink">Không tìm thấy tin nhắn nào</p>
              <p className="max-w-xs text-sm text-muted">Thử từ khóa khác, ví dụ “bug”, “lofi” hay “deploy”.</p>
            </div>
          )
        ) : (
          <>
            {/* welcome */}
            <div className="px-4 pb-4 pt-10" key={`w-${channel.id}`}>
              <div className="anim-pop-in flex h-[68px] w-[68px] items-center justify-center rounded-full bg-hover2">
                <Icon name="hash" size={40} strokeWidth={1.5} className="text-ink" />
              </div>
              <h2 className="anim-msg-in mt-3 font-display text-[28px] font-bold leading-tight text-ink">
                Chào mừng đến với #{channel.name}!
              </h2>
              <p className="anim-msg-in mt-1 text-[15px] text-muted" style={{ animationDelay: "60ms" }}>
                Đây là khởi đầu của kênh <span className="font-semibold text-mention">#{channel.name}</span>. {channel.topic}
              </p>
              <div className="mt-4 flex h-px items-center overflow-visible">
                <div className="h-px flex-1 bg-divider" />
                <span className="rounded-full border border-divider px-3 py-1 text-[11px] font-bold text-muted">Hôm nay</span>
                <div className="h-px flex-1 bg-divider" />
              </div>
            </div>

            {channel.messages.map((m, i) => (
              <MessageRow
                key={m.id} msg={m} prev={channel.messages[i - 1]} isMe={m.userId === ME_ID}
                onReact={onReact} onEdit={onEdit} onDelete={onDelete} onToast={onToast}
                onReactPicker={setReactTarget} onEmbedButton={(l) => onToast(`Nút "${l}" — demo thôi nha ✨`)}
              />
            ))}
            {channel.messages.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-dim">Kênh trống trơn — nhắn gì đó mở hàng đi! 🥇</p>
            )}
          </>
        )}
      </div>

      {/* ===== input ===== */}
      <div className="relative z-20 shrink-0 px-4 pb-5">
        {/* typing indicator */}
        <div className="flex h-6 items-center gap-2 px-1 text-[13px] text-body">
          {typingHere.length > 0 && (
            <span className="anim-fade-in flex items-center gap-2">
              <TypingDots />
              <span>
                {typers.map((n, i) => (
                  <span key={n}>
                    <strong className="font-bold text-ink">{n}</strong>
                    {i < typers.length - 1 ? ", " : ""}
                  </span>
                ))}{" "}
                đang nhập…
              </span>
            </span>
          )}
        </div>

        <div className="relative">
          {isSlash && slashItems.length > 0 && (
            <SlashMenu query={input.slice(1)} active={slashIdx} onPick={(u) => { setInput(u); }} />
          )}
          {pickerOpen && !reactTarget && (
            <EmojiPicker
              title="Emoji vui vẻ"
              onClose={() => setPickerOpen(false)}
              onPick={(e) => setInput((v) => v + e)}
            />
          )}
          {reactTarget && (
            <EmojiPicker
              title="Thả cảm xúc"
              onClose={() => setReactTarget(null)}
              onPick={(e) => { onReact(reactTarget, e); setReactTarget(null); }}
            />
          )}

          <div className="flex items-center gap-2 rounded-lg bg-raised px-3 transition focus-within:shadow-[0_0_0_1px_rgba(88,101,242,0.5)]">
            <button
              onClick={() => onToast("Đính kèm tệp — bản demo chưa hỗ trợ 📎")}
              className="group shrink-0 rounded-full bg-hover2 p-1 text-muted transition hover:text-green"
              title="Đính kèm"
            >
              <span className="block transition-transform duration-200 group-hover:rotate-90">
                <Icon name="plus" size={18} strokeWidth={2.2} />
              </span>
            </button>
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value); setSlashIdx(0); }}
              onKeyDown={onKey}
              placeholder={`Nhắn tới #${channel.name}`}
              className="min-w-0 flex-1 bg-transparent py-[11px] text-[15px] text-body outline-none placeholder:text-dim"
            />
            <button onClick={() => onToast("Tặng quà — dễ thương ghê 🎁 (demo)")} className="shrink-0 p-1 text-muted transition hover:scale-110 hover:text-yellow" title="Tặng quà">
              <Icon name="gift" size={20} />
            </button>
            <button onClick={() => onToast("Kho GIF đang bảo trì 🚧")} className="shrink-0 p-1 text-muted transition hover:scale-105 hover:text-mention" title="GIF">
              <Icon name="gif" size={20} />
            </button>
            <button
              onClick={() => { setPickerOpen((v) => !v); setReactTarget(null); }}
              className={`shrink-0 p-1 transition hover:scale-110 ${pickerOpen ? "text-yellow" : "text-muted hover:text-yellow"}`}
              title="Emoji"
            >
              <Icon name="smile" size={20} />
            </button>
            {input.trim() && (
              <button
                onClick={send}
                className="anim-pop-in shrink-0 p-1 text-blurple transition hover:scale-110 hover:text-mention active:scale-95"
                title="Gửi"
              >
                <Icon name="send" size={19} />
              </button>
            )}
          </div>
        </div>
        <p className="mt-1.5 hidden px-1 text-[11px] text-dim md:block">
          <strong className="text-muted">@QuickBot</strong> hoặc gõ <strong className="text-muted">/</strong> để gọi bot · Enter để gửi · Shift+Enter xuống dòng
        </p>
      </div>
    </main>
  );
}
