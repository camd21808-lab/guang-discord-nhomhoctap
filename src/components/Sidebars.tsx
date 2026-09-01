import { useState } from "react";
import type { Channel, User } from "../types";
import { ROLE_LABEL, userById, ME_ID, BOT_ID } from "../data";
import { Avatar, BotBadge, Icon, SpeakingBars, type IconName } from "./ui";

/* ================= SERVER RAIL ================= */

const FAKE_SERVERS = [
  { id: "s1", label: "G", color: "#23a55a", name: "Gaming VN" },
  { id: "s2", label: "L", color: "#eb459e", name: "Lofi Chill" },
  { id: "s3", label: "D", color: "#f0b232", name: "Dev Vietnam" },
];

export function ServerRail({ onToast }: { onToast: (t: string) => void }) {
  return (
    <nav className="relative z-40 flex h-full w-[72px] shrink-0 flex-col items-center gap-2 overflow-y-auto bg-rail py-3 dc-scroll-thin dc-scroll">
      {/* Home */}
      <button
        onClick={() => onToast("Trang chủ DM — bản demo dừng ở máy chủ này thôi 😉")}
        className="group relative flex h-12 w-12 items-center justify-center text-muted transition hover:text-ink"
      >
        <span className="absolute -left-3 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all duration-200 group-hover:h-5" />
        <span className="server-icon flex h-12 w-12 items-center justify-center bg-panel transition group-hover:bg-blurple group-hover:text-white">
          <Icon name="chat" size={26} strokeWidth={1.6} />
        </span>
      </button>
      <div className="h-0.5 w-8 rounded-full bg-divider" />

      {/* Active server */}
      <div className="group relative">
        <span className="absolute -left-3 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all duration-200" />
        <span className="server-icon active flex h-12 w-12 cursor-pointer items-center justify-center bg-blurple font-display text-lg font-bold text-white shadow-[0_4px_16px_rgba(88,101,242,0.4)]">
          QC
        </span>
      </div>

      {FAKE_SERVERS.map((s) => (
        <button
          key={s.id}
          onClick={() => onToast(`Máy chủ "${s.name}" chưa có trong bản demo 🙏`)}
          className="group relative flex h-12 w-12 items-center justify-center"
        >
          <span className="absolute -left-3 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all duration-200 group-hover:h-5" />
          <span
            className="server-icon flex h-12 w-12 items-center justify-center font-display text-lg font-bold text-white transition group-hover:scale-105"
            style={{ background: s.color }}
          >
            {s.label}
          </span>
          <span className="pointer-events-none absolute left-full z-50 ml-4 hidden whitespace-nowrap rounded-md bg-rail px-3 py-1.5 text-sm font-semibold text-ink shadow-xl group-hover:block">
            {s.name}
          </span>
        </button>
      ))}

      <div className="h-0.5 w-8 rounded-full bg-divider" />

      <button
        onClick={() => onToast("Tạo máy chủ mới — tính năng demo ✨")}
        className="group relative flex h-12 w-12 items-center justify-center"
      >
        <span className="server-icon flex h-12 w-12 items-center justify-center bg-panel text-green transition group-hover:bg-green group-hover:text-white">
          <Icon name="plus" size={22} />
        </span>
        <span className="pointer-events-none absolute left-full z-50 ml-4 hidden whitespace-nowrap rounded-md bg-rail px-3 py-1.5 text-sm font-semibold text-ink shadow-xl group-hover:block">
          Thêm máy chủ
        </span>
      </button>

      <button
        onClick={() => onToast("Khám phá máy chủ công cộng — demo 🧭")}
        className="group relative flex h-12 w-12 items-center justify-center"
      >
        <span className="server-icon flex h-12 w-12 items-center justify-center bg-panel text-green transition group-hover:bg-green group-hover:text-white">
          <Icon name="compass" size={22} />
        </span>
        <span className="pointer-events-none absolute left-full z-50 ml-4 hidden whitespace-nowrap rounded-md bg-rail px-3 py-1.5 text-sm font-semibold text-ink shadow-xl group-hover:block">
          Khám phá máy chủ
        </span>
      </button>
    </nav>
  );
}

/* ================= CHANNEL SIDEBAR ================= */

interface SidebarProps {
  channels: Channel[];
  activeId: string;
  onSelectChannel: (id: string) => void;
  voiceId: string | null;
  onConnectVoice: (id: string) => void;
  onDisconnectVoice: () => void;
  muted: boolean;
  deafened: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onToast: (t: string) => void;
}

export function ChannelSidebar(p: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = [...new Set(p.channels.map((c) => c.category))];
  const me = userById(ME_ID);
  const voiceCh = p.voiceId ? p.channels.find((c) => c.id === p.voiceId) : null;

  const toggleCat = (cat: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const menuItem = (icon: IconName, label: string, danger = false) => (
    <button
      onClick={() => {
        setMenuOpen(false);
        p.onToast(
          icon === "userPlus"
            ? "Đã sao chép liên kết mời: quickchat.gg/moi-ban 📋"
            : `"${label}" — tính năng demo thôi nha 😉`,
        );
      }}
      className={`flex w-full items-center justify-between rounded px-2.5 py-[7px] text-left text-sm font-medium transition ${
        danger ? "text-red hover:bg-red hover:text-white" : "text-body hover:bg-blurple hover:text-white"
      }`}
    >
      {label}
      <Icon name={icon} size={16} />
    </button>
  );

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-panel">
      {/* Server header */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-12 w-full items-center justify-between border-b border-rail/60 px-4 transition hover:bg-hoverch ${menuOpen ? "bg-hoverch" : ""}`}
        >
          <span className="font-display text-[15px] font-bold tracking-wide text-ink">QuickChat HQ</span>
          <Icon
            name="chevronDown"
            size={16}
            className={`text-muted transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="anim-pop-in absolute left-2 right-2 top-[52px] z-50 rounded-lg bg-rail p-1.5 shadow-2xl">
              {menuItem("userPlus", "Mời bạn bè")}
              {menuItem("pencil", "Tạo kênh")}
              {menuItem("gear", "Cài đặt máy chủ")}
              {menuItem("shield", "Quyền riêng tư")}
              <div className="mx-2 my-1 h-px bg-divider" />
              {menuItem("x", "Rời khỏi máy chủ", true)}
            </div>
          </>
        )}
      </div>

      {/* Channel list */}
      <div className="dc-scroll flex-1 space-y-4 overflow-y-auto px-2 pt-4">
        {categories.map((cat) => {
          const isCollapsed = collapsed.has(cat);
          const chans = p.channels.filter((c) => c.category === cat);
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCat(cat)}
                className="group mb-0.5 flex w-full items-center gap-0.5 px-1 text-[11px] font-bold uppercase tracking-wider text-muted transition hover:text-body"
              >
                <Icon
                  name="chevronDown"
                  size={10}
                  strokeWidth={2.5}
                  className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                />
                {cat}
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {chans.map((ch) => {
                    const active = ch.id === p.activeId;
                    const isVoiceHere = ch.id === p.voiceId;
                    return (
                      <div key={ch.id}>
                        <button
                          onClick={() => (ch.type === "text" ? p.onSelectChannel(ch.id) : p.onConnectVoice(ch.id))}
                          className={`group flex w-full items-center gap-1.5 rounded px-2 py-[7px] text-left transition ${
                            active
                              ? "bg-hover2 text-ink"
                              : ch.unread > 0
                                ? "text-ink hover:bg-hoverch"
                                : "text-muted hover:bg-hoverch hover:text-body"
                          }`}
                        >
                          <Icon
                            name={ch.type === "voice" ? "volume" : "hash"}
                            size={18}
                            strokeWidth={2}
                            className={active || isVoiceHere ? "text-body" : "text-dim"}
                          />
                          <span className={`flex-1 truncate text-[15px] font-semibold ${ch.unread > 0 && !active ? "font-bold" : ""}`}>
                            {ch.name}
                          </span>
                          {ch.unread > 0 && !active && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[11px] font-bold text-white">
                              {ch.unread}
                            </span>
                          )}
                        </button>
                        {ch.type === "voice" && isVoiceHere && (
                          <div className="anim-fade-in ml-6 space-y-1 py-1">
                            {["u_mod1", "u_m1", ME_ID].map((uid, i) => {
                              const u = userById(uid);
                              return (
                                <div key={uid} className="flex items-center gap-2 rounded px-2 py-1 text-sm font-medium text-body">
                                  <Avatar user={u} size={22} />
                                  <span className="flex-1 truncate text-[13px]">{u.name}</span>
                                  <SpeakingBars delay={i * 0.3} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* boost card */}
        <div className="mx-1 mb-2 rounded-lg border border-blurple/25 bg-blurple/10 p-3">
          <p className="font-display text-[13px] font-bold text-mention">⚡ Nâng cấp server</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">Boost để mở khóa emoji riêng, âm thanh chất lượng cao và nhiều hơn nữa.</p>
          <button
            onClick={() => p.onToast("Cảm ơn bạn đã muốn boost! 💜 (demo)")}
            className="mt-2 w-full rounded bg-blurple py-1.5 text-xs font-bold text-white transition hover:bg-blurple2 active:scale-[0.98]"
          >
            Boost server
          </button>
        </div>
      </div>

      {/* Voice connected panel */}
      {voiceCh && (
        <div className="anim-msg-in border-t border-rail/60 bg-panel2 px-2 py-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="voice-live rounded-full bg-green p-1 text-white">
                <Icon name="signal" size={12} strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[13px] font-bold text-green">Đã kết nối thoại</p>
                <p className="text-[11px] text-muted">
                  {voiceCh.name} / QuickChat HQ
                </p>
              </div>
            </div>
            <button
              onClick={p.onDisconnectVoice}
              className="rounded p-1.5 text-muted transition hover:bg-hoverch hover:text-red"
              title="Ngắt kết nối"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="flex h-[52px] items-center gap-2 bg-panel2 px-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 transition hover:bg-hoverch">
          <Avatar user={me} size={32} showStatus ring="#232428" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-bold text-ink">{me.name}</p>
            <p className="truncate text-[11px] text-muted">
              {p.deafened ? "🔇 Đang tắt tiếng" : p.muted ? "🎤 Đang tắt mic" : "🟢 Trực tuyến"}
            </p>
          </div>
        </div>
        <button
          onClick={p.onToggleMute}
          className={`rounded p-1.5 transition hover:bg-hoverch ${p.muted || p.deafened ? "text-red" : "text-muted hover:text-body"}`}
          title={p.muted ? "Bật mic" : "Tắt mic"}
        >
          <Icon name={p.muted || p.deafened ? "micOff" : "mic"} size={18} />
        </button>
        <button
          onClick={p.onToggleDeafen}
          className={`rounded p-1.5 transition hover:bg-hoverch ${p.deafened ? "text-red" : "text-muted hover:text-body"}`}
          title={p.deafened ? "Bật tiếng" : "Tắt tiếng"}
        >
          <Icon name="headphones" size={18} />
        </button>
        <button
          onClick={() => p.onToast("Cài đặt người dùng — demo ⚙️")}
          className="rounded p-1.5 text-muted transition hover:bg-hoverch hover:text-body"
          title="Cài đặt"
        >
          <Icon name="gear" size={18} />
        </button>
      </div>
    </aside>
  );
}

/* ================= MEMBER LIST ================= */

const ROLE_ORDER: Array<User["role"]> = ["admin", "bot", "mod", "vip", "member"];

export function MemberList({ users, voiceId }: { users: User[]; voiceId: string | null }) {
  const online = users.filter((u) => u.status !== "offline");
  const offline = users.filter((u) => u.status === "offline");
  const voiceUsers = voiceId ? [userById("u_mod1"), userById("u_m1"), userById(ME_ID)] : [];

  const Row = ({ u, dim = false }: { u: User; dim?: boolean }) => (
    <button
      className={`group flex w-full items-center gap-3 rounded px-2 py-1.5 text-left transition hover:bg-hoverch ${dim ? "opacity-40 hover:opacity-70" : ""}`}
    >
      <Avatar user={u} size={32} showStatus ring="#2b2d31" />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold" style={{ color: u.role === "member" ? "#dbdee1" : u.color }}>
          {u.name}
          {u.isBot && <BotBadge />}
          {u.role === "admin" && (
            <span className="text-yellow" title="Chủ server">
              <Icon name="shield" size={12} strokeWidth={2.2} />
            </span>
          )}
        </p>
        {u.activity && !dim && <p className="truncate text-[11px] text-muted">{u.activity}</p>}
      </div>
      {voiceId && voiceUsers.some((v) => v.id === u.id) && <SpeakingBars delay={u.id.length * 0.13} color="#949ba4" />}
    </button>
  );

  const sections: Array<{ title: string; list: User[]; dim?: boolean }> = [];
  for (const role of ROLE_ORDER) {
    const list = online.filter((u) => u.role === role);
    if (list.length) sections.push({ title: `${ROLE_LABEL[role]} — ${list.length}`, list });
  }
  if (offline.length) sections.push({ title: `Ngoại tuyến — ${offline.length}`, list: offline, dim: true });

  return (
    <aside className="dc-scroll hidden h-full w-60 shrink-0 flex-col gap-5 overflow-y-auto bg-panel px-2 py-5 lg:flex">
      {sections.map((s) => (
        <div key={s.title}>
          <h3 className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-muted">{s.title}</h3>
          <div className="space-y-0.5">
            {s.list.map((u) => (
              <Row key={u.id} u={u} dim={s.dim} />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-auto px-2 pb-1 text-center text-[11px] text-dim">
        <span className="text-green">●</span> {online.length} trực tuyến · {users.length} thành viên
      </div>
    </aside>
  );
}
