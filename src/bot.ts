import { JOKES, QUOTES, userById } from "./data";
import type { BotAction, BotReply } from "./types";

export interface CommandMeta {
  name: string;
  usage: string;
  desc: string;
}

export const COMMANDS: CommandMeta[] = [
  { name: "help", usage: "/help", desc: "Xem tất cả lệnh của QuickBot" },
  { name: "ping", usage: "/ping", desc: "Kiểm tra độ trễ của bot" },
  { name: "roll", usage: "/roll [số mặt xúc xắc]", desc: "Đổ xúc xắc (mặc định 1–100)" },
  { name: "coin", usage: "/coin", desc: "Tung đồng xu sấp / ngửa" },
  { name: "time", usage: "/time", desc: "Xem ngày giờ hiện tại" },
  { name: "joke", usage: "/joke", desc: "Nghe bot kể chuyện cười" },
  { name: "quote", usage: "/quote", desc: "Nhận một câu trích dẫn ngẫu nhiên" },
  { name: "8ball", usage: "/8ball <câu hỏi>", desc: "Hỏi quả cầu tiên tri" },
  { name: "avatar", usage: "/avatar", desc: "Xem avatar của bạn" },
  { name: "clear", usage: "/clear", desc: "Xóa lịch sử kênh hiện tại" },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** bỏ dấu + lowercase để matching tiếng Việt không dấu */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const EIGHT_BALL = [
  "Có, chắc chắn rồi ✅",
  "Khả năng rất cao đấy 👀",
  "Vũ trụ bảo là có 🌌",
  "Hơi khó nói… hỏi lại sau nhé 🤔",
  "50/50 — tung /coin đi 🪙",
  "Không khả quan lắm ❌",
  "Điềm báo nói KHÔNG 🚫",
];

const FALLBACKS = [
  "Mình nghe đây! 👂",
  "Nghe thú vị đó, kể thêm đi 😄",
  "Hửm? Nói rõ hơn cho mình với 🤖",
  "Ghi nhận! Bạn có muốn thử `/8ball` để hỏi nhanh không?",
  "Mình là bot nhưng thấy câu này đáng yêu ghê 💙",
];

const nowVN = () =>
  new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
const dateVN = () =>
  new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function handleCommand(raw: string): BotAction {
  const [cmd, ...rest] = raw.slice(1).trim().split(/\s+/);
  const arg = rest.join(" ");
  const c = norm(cmd);

  switch (c) {
    case "help":
      return {
        kind: "reply",
        replies: [
          {
            embed: {
              color: "#5865f2",
              title: "🤖 QuickBot — Danh sách lệnh",
              description: COMMANDS.map((x) => `**${x.usage}** — ${x.desc}`).join("\n"),
              footer: "Mẹo: nhắn @QuickBot để trò chuyện tự do!",
            },
          },
        ],
      };
    case "ping":
      return {
        kind: "reply",
        replies: [{ content: `🏓 Pong! Độ trễ **${12 + Math.floor(Math.random() * 40)}ms** — bot vẫn khỏe re!` }],
      };
    case "roll": {
      const n = Math.max(2, parseInt(arg, 10) || 100);
      const v = 1 + Math.floor(Math.random() * n);
      return {
        kind: "reply",
        replies: [{ embed: { color: "#23a55a", title: `🎲 Đổ xúc xắc 1–${n}`, description: `Kết quả: **${v}**\n${v === n ? "💥 TRÚNG NÓC! Đỉnh của chóp!" : v === 1 ? "💀 Ơ… số nhọ nhất hệ mặt trời." : v > n / 2 ? "Khá khẩm đấy, may mắn đang mỉm cười 😏" : "Tàm tạm, gỡ lại ván sau nhé 😅"}` } }],
      };
    }
    case "coin": {
      const heads = Math.random() < 0.5;
      return {
        kind: "reply",
        replies: [{ embed: { color: "#f0b232", title: "🪙 Tung đồng xu", description: `Đồng xu xoay tít… và đáp xuống mặt **${heads ? "NGỬA 😄" : "SẤP 🙃"}**` } }],
      };
    }
    case "time":
      return {
        kind: "reply",
        replies: [{ content: `🕐 Bây giờ là **${nowVN()}** — ${dateVN()}` }],
      };
    case "joke":
      return { kind: "reply", replies: [{ content: pick(JOKES) }] };
    case "quote": {
      const q = pick(QUOTES);
      return {
        kind: "reply",
        replies: [{ embed: { color: "#eb459e", title: "💬 Trích dẫn hôm nay", description: `“${q.text}”`, footer: `— ${q.by}` } }],
      };
    }
    case "8ball":
      return {
        kind: "reply",
        replies: [
          {
            embed: {
              color: "#9b59b6",
              title: "🎱 Quả cầu tiên tri",
              description: arg
                ? `> ${arg}\n\n**${pick(EIGHT_BALL)}**`
                : "Bạn phải hỏi một câu chứ! Ví dụ: `/8ball nay có nên code tiếp không?`",
            },
          },
        ],
      };
    case "avatar": {
      return {
        kind: "reply",
        replies: [
          {
            embed: {
              color: "#3ba7c4",
              title: "🖼️ Avatar của bạn",
              description: "Nhìn ổn áp đấy, đổi hình nền chút là perfect 😎",
              footer: "QuickBot • avatar được render bằng SVG",
              bigAvatar: "u_me",
              buttons: [
                { label: "Tải về", style: "primary" },
                { label: "Đổi avatar", style: "ghost" },
              ],
            },
          },
        ],
      };
    }
    case "clear":
      return { kind: "reply", replies: [{ content: "🧹 Đã dọn sạch kênh này! (gõ tin nhắn mới để bắt đầu lại nhé)" }], clear: true } as BotAction & { clear: true };
    default:
      return {
        kind: "reply",
        replies: [
          {
            embed: {
              color: "#f23f43",
              title: "❌ Lệnh không tồn tại",
              description: `\`${raw}\` không phải là lệnh hợp lệ.\nGõ \`/help\` để xem danh sách lệnh nhé!`,
            },
          },
        ],
      };
  }
}

function handleMention(text: string, authorName: string): BotReply[] | null {
  const t = norm(text);
  if (/\b(chao|hello|hi|hey|alo)\b/.test(t))
    return [{ content: `Chào **${authorName}**! 👋 Hôm nay của bạn thế nào?` }];
  if (/(help|giup|lam duoc gi|lenh|biet lam)/.test(t))
    return [
      { content: `Mình là **QuickBot** 🤖 — trợ lý của server!` },
      {
        embed: {
          color: "#5865f2",
          title: "✨ Mình làm được những gì?",
          description:
            "• Kể chuyện cười, tung xu, đổ xúc xắc\n• Trả lời yes/no bằng `/8ball`\n• Báo giờ, tặng quote, xem avatar\n• Trò chuyện khi bạn nhắn **@QuickBot**",
          footer: "Gõ /help để xem đầy đủ lệnh",
        },
      },
    ];
  if (/(may gio|thoi gian|hom nay ngay|date)/.test(t))
    return [{ content: `🕐 Bây giờ là **${nowVN()}** — ${dateVN()}` }];
  if (/(ten gi|ban la ai|who are you|gioi thieu)/.test(t))
    return [
      { content: "Mình là **QuickBot** 🤖, sinh ra từ đống JavaScript và tình yêu với server này. Sở thích: trả lời tin nhắn và kể joke hơi mặn 🧂" },
    ];
  if (/(cam on|thank|tks|thanks)/.test(t))
    return [{ content: "Không có gì! 😊 Cần gì cứ réo mình nhé." }];
  if (/(yeu|thich ban|dang yeu)/.test(t))
    return [{ content: "Aww 🥹 Cảm động ghê! Mình cũng quý bạn lắm 💙 (dù tim mình bằng silicon)" }];
  if (/(buon|met|chan|stress)/.test(t))
    return [
      { content: "Ôm bạn một cái 🫂 Nghỉ chút, uống ngụm nước, rồi mình cùng chiến tiếp nhé!" },
      { content: "À mà, `/joke` không? Tiếng cười chữa lành đó 😄" },
    ];
  if (/(meme|joke|hai|cuoi)/.test(t)) return [{ content: pick(JOKES) }];
  if (/(nhac|lofi|playlist|bai hat)/.test(t))
    return [{ content: "Ghé **Phòng Nhạc** kênh voice nhé 🎧 Lofi 24/7 không bao giờ tắt!" }];
  if (/(game|rank|valorant|lien minh|lien quan)/.test(t))
    return [{ content: "Tối nay **tuan_anh** đang tuyển team leo rank đó 🎮 Nhảy vào #trò-chuyện hú một tiếng là có slot liền!" }];
  if (t.includes("?"))
    return [{ embed: { color: "#9b59b6", title: "🎱 QuickBot trả lời", description: `**${pick(EIGHT_BALL)}**` } }];
  return [{ content: pick(FALLBACKS) }];
}

function handleKeywords(text: string): BotAction {
  const t = norm(text);
  if (/(hay qua|dinh|xin|tuyet voi|chất|chat that)/.test(t)) return { kind: "react", emoji: "🔥" };
  if (/(haha|hihi|lol|buon cuoi)/.test(t) && Math.random() < 0.6)
    return { kind: "react", emoji: "😂" };
  if (Math.random() > 0.75) return null; // không phải lúc nào cũng xen vào
  if (/(chao moi nguoi|hello moi nguoi|hi anh em)/.test(t))
    return { kind: "reply", replies: [{ content: `Chào bạn! 👋 ${userById("u_bot").name} luôn ở đây nếu cần nhé.` }] };
  if (/(bug|loi|error|code)/.test(t))
    return { kind: "reply", replies: [{ content: "Nghe mùi bug thoang thoảng 👀 Thử `console.log` thần chưởng xem sao 😆" }] };
  if (/(cam on|thank)/.test(t))
    return { kind: "react", emoji: "❤️" };
  return null;
}

/** Điểm vào chính: nhận tin nhắn của user, trả về hành động của bot */
export function getBotAction(text: string, authorName: string): BotAction {
  const trimmed = text.trim();
  if (trimmed.startsWith("/")) return handleCommand(trimmed);
  const t = norm(trimmed);
  if (t.includes("quickbot") || t.includes("@bot")) {
    const replies = handleMention(trimmed, authorName);
    if (replies) return { kind: "reply", replies };
  }
  return handleKeywords(trimmed);
}
