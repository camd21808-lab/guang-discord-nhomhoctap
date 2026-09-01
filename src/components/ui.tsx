import type { ReactNode } from "react";
import type { User, UserStatus } from "../types";

/* ================= ICONS ================= */

const P: Record<string, ReactNode> = {
  hash: (
    <>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </>
  ),
  chevronDown: <polyline points="6 9 12 15 18 9" />,
  chevronRight: <polyline points="9 6 15 12 9 18" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  pin: (
    <>
      <path d="M12 17v5" />
      <path d="M9 3h6l1 7 2.5 2.5h-13L8 10z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.5c2.9.2 5 2.4 5 5.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 13l3-8h12l3 8v6H3z" />
      <path d="M3 13h5l2 3h4l2-3h5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.1 1-1.1 1.9" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" />
      <rect x="5" y="12" width="14" height="9" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <path d="M12 8s-4.5.5-5.5-2C5.7 3.9 8 3 9.5 4 11 5 12 8 12 8zm0 0s4.5.5 5.5-2c.8-2.1-1.5-3-3-2-1.5 1-2.5 4-2.5 4z" />
    </>
  ),
  gif: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <text x="12" y="14.6" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="currentColor" stroke="none" fontFamily="inherit">
        GIF
      </text>
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9.2" x2="9.01" y2="9.2" />
      <line x1="15" y1="9.2" x2="15.01" y2="9.2" />
    </>
  ),
  smilePlus: (
    <>
      <path d="M20.2 13.5A8.5 8.5 0 1 1 13 4.3" />
      <path d="M8.5 14.5s1.4 1.8 3.5 1.8 3.5-1.8 3.5-1.8" />
      <line x1="9.3" y1="9.5" x2="9.31" y2="9.5" />
      <line x1="14.7" y1="9.5" x2="14.71" y2="9.5" />
      <line x1="18.5" y1="3.5" x2="18.5" y2="9.5" />
      <line x1="15.5" y1="6.5" x2="21.5" y2="6.5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </>
  ),
  micOff: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="14" width="4" height="7" rx="2" />
      <rect x="17" y="14" width="4" height="7" rx="2" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.2 2.2M16.6 16.6l2.2 2.2M18.8 5.2l-2.2 2.2M7.4 16.6l-2.2 2.2" />
    </>
  ),
  pencil: <path d="M17 3l4 4L8 20l-5 1 1-5z" />,
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <line x1="10" y1="11" x2="10" y2="16" />
      <line x1="14" y1="11" x2="14" y2="16" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  send: (
    <>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  check: <polyline points="4 12.5 9.5 18 20 6.5" />,
  x: (
    <>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8" />
    </>
  ),
  chat: <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3-.4-4.3-1.1L3 20l1.1-5.2A8.5 8.5 0 1 1 21 11.5z" />,
  shield: <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" />,
  signal: (
    <>
      <line x1="5" y1="20" x2="5" y2="15" />
      <line x1="10" y1="20" x2="10" y2="11" />
      <line x1="15" y1="20" x2="15" y2="7" />
      <line x1="20" y1="20" x2="20" y2="3" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </>
  ),
};

export type IconName = keyof typeof P;

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {P[name]}
    </svg>
  );
}

/* ================= AVATAR ================= */

const STATUS_COLOR: Record<UserStatus, string> = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#80848e",
};

function RobotFace({ size }: { size: number }) {
  return (
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="2" x2="12" y2="5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="2.4" r="1.3" fill="#fff" />
      <rect x="4" y="6" width="16" height="12" rx="4" fill="#fff" opacity="0.95" />
      <circle cx="9" cy="11.5" r="1.9" fill="#5865f2" />
      <circle cx="15" cy="11.5" r="1.9" fill="#5865f2" />
      <path d="M9 15.2c1 .9 5 .9 6 0" stroke="#5865f2" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <rect x="1.5" y="10" width="2" height="4" rx="1" fill="#fff" />
      <rect x="20.5" y="10" width="2" height="4" rx="1" fill="#fff" />
    </svg>
  );
}

export function Avatar({
  user,
  size = 40,
  showStatus = false,
  ring = "#2b2d31",
}: {
  user: User;
  size?: number;
  showStatus?: boolean;
  ring?: string;
}) {
  const initials = user.name
    .split(/[_\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
  const dot = Math.max(8, Math.round(size * 0.3));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full font-display font-bold text-white select-none"
        style={{
          background: `radial-gradient(120% 120% at 25% 20%, ${user.color} 0%, ${user.color} 55%, rgba(0,0,0,0.35) 160%)`,
          backgroundColor: user.color,
          fontSize: size * 0.36,
          opacity: user.status === "offline" ? 0.55 : 1,
        }}
      >
        {user.isBot ? <RobotFace size={size} /> : initials}
      </div>
      {showStatus && (
        <span
          className="absolute rounded-full"
          style={{
            width: dot,
            height: dot,
            right: -1,
            bottom: -1,
            background: STATUS_COLOR[user.status],
            border: `3px solid ${ring}`,
          }}
        >
          {user.status === "dnd" && (
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ width: dot * 0.45, height: 2, background: ring }}
            />
          )}
          {user.status === "idle" && (
            <span
              className="absolute rounded-full"
              style={{
                width: dot * 0.55,
                height: dot * 0.55,
                left: -dot * 0.08,
                top: -dot * 0.08,
                background: ring,
              }}
            />
          )}
        </span>
      )}
    </div>
  );
}

/* ================= SMALL BITS ================= */

export function BotBadge() {
  return (
    <span className="inline-flex translate-y-[-1px] items-center gap-0.5 rounded-[4px] bg-blurple px-[5px] py-[1px] text-[10px] font-bold tracking-wide text-white">
      <Icon name="check" size={10} strokeWidth={3} />
      BOT
    </span>
  );
}

export function SpeakingBars({ color = "#23a55a", delay = 0 }: { color?: string; delay?: number }) {
  return (
    <span className="flex h-3.5 items-end gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="speak-bar w-[3px] rounded-full"
          style={{
            height: "100%",
            background: color,
            animationDelay: `${delay + i * 0.18}s`,
            animationDuration: `${0.8 + i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

export function TypingDots() {
  return (
    <span className="inline-flex items-end gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-muted" />
      ))}
    </span>
  );
}
