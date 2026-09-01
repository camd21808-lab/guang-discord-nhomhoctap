import { useCallback, useEffect, useRef, useState } from "react";
import type { BotReply, Channel, Message, Toast, TypingInfo } from "./types";
import { AMBIENT_POOL, BOT_ID, ME_ID, USERS, nextId, seedChannels, userById } from "./data";
import { getBotAction } from "./bot";
import { ChannelSidebar, MemberList, ServerRail } from "./components/Sidebars";
import { ChatArea } from "./components/Chat";
import { Icon } from "./components/ui";

let toastSeq = 0;

export default function App() {
  const [channels, setChannels] = useState<Channel[]>(() => seedChannels());
  const [activeId, setActiveId] = useState("c_general");
  const [typing, setTyping] = useState<TypingInfo[]>([]);
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toast = useCallback((text: string) => {
    const id = ++toastSeq;
    setToasts((t) => [...t.slice(-2), { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  /* ---------- channel helpers ---------- */

  const appendMessage = useCallback((channelId: string, msg: Message, incUnread = false) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? { ...c, messages: [...c.messages, msg], unread: incUnread ? c.unread + 1 : c.unread }
          : c,
      ),
    );
  }, []);

  const selectChannel = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const connectVoice = (id: string) => {
    setVoiceId(id);
    setSidebarOpen(false);
    const name = channels.find((c) => c.id === id)?.name ?? id;
    toast(`Đã kết nối kênh thoại "${name}" 🎧`);
  };

  /* ---------- reactions / edit / delete ---------- */

  const toggleReaction = (msgId: string, emoji: string) => {
    const cid = activeIdRef.current;
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== cid) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId) return m;
            const ex = m.reactions.find((r) => r.emoji === emoji);
            let reactions;
            if (!ex) reactions = [...m.reactions, { emoji, count: 1, me: true }];
            else if (ex.me)
              reactions =
                ex.count <= 1
                  ? m.reactions.filter((r) => r.emoji !== emoji)
                  : m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, me: false } : r));
            else reactions = m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, me: true } : r));
            return { ...m, reactions };
          }),
        };
      }),
    );
  };

  const botReact = (channelId: string, msgId: string, emoji: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId) return m;
            const ex = m.reactions.find((r) => r.emoji === emoji);
            return {
              ...m,
              reactions: ex
                ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
                : [...m.reactions, { emoji, count: 1, me: false }],
            };
          }),
        };
      }),
    );
  };

  const editMessage = (msgId: string, text: string) => {
    const cid = activeIdRef.current;
    setChannels((prev) =>
      prev.map((c) =>
        c.id === cid
          ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, content: text, edited: true } : m)) }
          : c,
      ),
    );
  };

  const deleteMessage = (msgId: string) => {
    const cid = activeIdRef.current;
    setChannels((prev) =>
      prev.map((c) => (c.id === cid ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) } : c)),
    );
    toast("Đã xóa tin nhắn 🗑️");
  };

  /* ---------- send + bot brain ---------- */

  const send = (text: string) => {
    const cid = activeIdRef.current;
    const msg: Message = { id: nextId(), userId: ME_ID, content: text, ts: Date.now(), reactions: [] };
    appendMessage(cid, msg);

    const action = getBotAction(text, userById(ME_ID).name);
    if (!action) return;

    if (action.kind === "react") {
      const emoji = action.emoji;
      timers.current.push(window.setTimeout(() => botReact(cid, msg.id, emoji), 1200 + Math.random() * 800));
      return;
    }

    const replies: BotReply[] = action.replies;
    const doClear = Boolean((action as { clear?: boolean }).clear);

    setTyping((t) => [...t.filter((x) => !(x.userId === BOT_ID && x.channelId === cid)), { userId: BOT_ID, channelId: cid }]);

    if (doClear) {
      timers.current.push(
        window.setTimeout(
          () =>
            setChannels((prev) => prev.map((c) => (c.id === cid ? { ...c, messages: [] } : c))),
          500,
        ),
      );
    }

    let delay = 900 + Math.random() * 700;
    replies.forEach((r, i) => {
      timers.current.push(
        window.setTimeout(() => {
          appendMessage(cid, {
            id: nextId(),
            userId: BOT_ID,
            content: r.content ?? "",
            ts: Date.now(),
            reactions: [],
            embed: r.embed,
          });
          if (i === replies.length - 1)
            setTyping((t) => t.filter((x) => !(x.userId === BOT_ID && x.channelId === cid)));
        }, delay),
      );
      delay += 800 + Math.min(1200, (r.content?.length ?? 60) * 6);
    });
  };

  /* ---------- ambient server life ---------- */

  useEffect(() => {
    const authors = ["u_mod1", "u_m1", "u_m2", "u_admin"];
    const chans = ["c_general", "c_dev", "c_meme"];
    let alive = true;
    let t1 = 0;
    let t2 = 0;
    let idx = 0;

    const loop = () => {
      t1 = window.setTimeout(() => {
        if (!alive) return;
        const uid = authors[Math.floor(Math.random() * authors.length)];
        const cid = chans[Math.floor(Math.random() * chans.length)];
        const text = AMBIENT_POOL[idx % AMBIENT_POOL.length];
        idx++;
        if (cid === activeIdRef.current)
          setTyping((v) => [...v.filter((x) => x.userId !== uid), { userId: uid, channelId: cid }]);
        t2 = window.setTimeout(() => {
          if (!alive) return;
          setTyping((v) => v.filter((x) => x.userId !== uid));
          appendMessage(
            cid,
            { id: nextId(), userId: uid, content: text, ts: Date.now(), reactions: [] },
            cid !== activeIdRef.current,
          );
          loop();
        }, 1700 + Math.random() * 900);
      }, 21000 + Math.random() * 17000);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [appendMessage]);

  /* ---------- voice ---------- */

  const toggleMute = () => {
    if (deafened) {
      setDeafened(false);
      setMuted(false);
      toast("Đã bật lại âm thanh 🔊");
    } else {
      setMuted((m) => {
        toast(m ? "Đã bật mic 🎤" : "Đã tắt mic 🔇");
        return !m;
      });
    }
  };

  const toggleDeafen = () => {
    setDeafened((d) => {
      const nd = !d;
      if (nd) setMuted(true);
      toast(nd ? "Đã tắt tiếng (deafen) 🙉" : "Đã bật lại âm thanh 🔊");
      return nd;
    });
  };

  /* ---------- render ---------- */

  const active = channels.find((c) => c.id === activeId) ?? channels[0];

  const sidebar = (
    <ChannelSidebar
      channels={channels}
      activeId={activeId}
      onSelectChannel={selectChannel}
      voiceId={voiceId}
      onConnectVoice={connectVoice}
      onDisconnectVoice={() => {
        setVoiceId(null);
        toast("Đã rời kênh thoại 👋");
      }}
      muted={muted}
      deafened={deafened}
      onToggleMute={toggleMute}
      onToggleDeafen={toggleDeafen}
      onToast={toast}
    />
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-rail font-sans text-body antialiased">
      <ServerRail onToast={toast} />

      {/* desktop sidebar */}
      <div className="hidden h-full lg:block">{sidebar}</div>

      {/* mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-fade-in absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="anim-msg-in absolute left-0 top-0 h-full shadow-2xl">{sidebar}</div>
        </div>
      )}

      <ChatArea
        channel={active}
        typing={typing}
        membersOpen={membersOpen}
        onToggleMembers={() => setMembersOpen((v) => !v)}
        onSend={send}
        onReact={toggleReaction}
        onEdit={editMessage}
        onDelete={deleteMessage}
        onToast={toast}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {membersOpen && <MemberList users={USERS} voiceId={voiceId} />}

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-toast-in flex items-center gap-2.5 rounded-lg border border-divider bg-rail px-4 py-2.5 text-sm font-semibold text-ink shadow-2xl"
          >
            <span className="text-blurple">
              <Icon name="chat" size={16} />
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
