import type { Channel, Message, User } from "./types";

export const ME_ID = "u_me";
export const BOT_ID = "u_bot";

export const USERS: User[] = [
  { id: ME_ID, name: "minh_khoi", role: "member", color: "#3ba7c4", status: "online", activity: "Đang dùng QuickChat" },
  { id: BOT_ID, name: "QuickBot", role: "bot", color: "#5865f2", status: "online", isBot: true, activity: "Đang nghe /help" },
  { id: "u_admin", name: "tuan_anh", role: "admin", color: "#f23f43", status: "online", activity: "Đang chơi Valorant" },
  { id: "u_mod1", name: "thu_ha", role: "mod", color: "#f0b232", status: "online" },
  { id: "u_mod2", name: "linh_chi", role: "mod", color: "#eb459e", status: "dnd", activity: "Đừng làm phiền 🌙" },
  { id: "u_m1", name: "bao_long", role: "member", color: "#23a55a", status: "online" },
  { id: "u_m2", name: "khanh_duy", role: "member", color: "#9b59b6", status: "idle", activity: "AFK — đi pha cà phê ☕" },
  { id: "u_m3", name: "mai_phuong", role: "vip", color: "#57d9a3", status: "offline" },
  { id: "u_m4", name: "duc_manh", role: "member", color: "#e67e22", status: "offline" },
];

export const userById = (id: string): User =>
  USERS.find((u) => u.id === id) ?? USERS[0];

export const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị viên",
  mod: "Điều hành",
  vip: "VIP",
  member: "Thành viên",
  bot: "BOT",
};

export const EMOJIS = [
  "😀","😂","🤣","😅","😊","😍","🥳","😎","🤔","😭",
  "😤","🥹","👀","🫡","💀","🤖","❤️","🔥","✨","🎉",
  "👍","👎","🙌","💯","🚀","⚡","🌙","☕","🧠","🎮",
  "🎧","🍕","🪙","🎲","🏓","🐛","🇻🇳","😴","🤝","📌",
];

let seq = 0;
export const nextId = () => `m_${Date.now().toString(36)}_${seq++}`;

const minsAgo = (m: number) => Date.now() - m * 60_000;

const msg = (
  userId: string,
  content: string,
  minutesAgo: number,
  extra: Partial<Message> = {},
): Message => ({
  id: nextId(),
  userId,
  content,
  ts: minsAgo(minutesAgo),
  reactions: [],
  ...extra,
});

export const seedChannels = (): Channel[] => [
  {
    id: "c_announce",
    name: "thông-báo",
    type: "text",
    category: "Thông tin",
    topic: "Thông báo chính thức từ ban quản trị — đọc trước khi hỏi nhé!",
    unread: 0,
    messages: [
      msg(
        "u_admin",
        "@everyone Chào mừng mọi người đến với **QuickChat HQ** 🎉 Server mới nâng cấp, có cả bot xịn xò luôn!",
        320,
        {
          pinned: true,
          reactions: [
            { emoji: "🎉", count: 14, me: true },
            { emoji: "❤️", count: 6, me: false },
          ],
        },
      ),
      msg("u_bot", "", 318, {
        embed: {
          color: "#5865f2",
          title: "📜 Nội quy máy chủ",
          description:
            "1️⃣ Tôn trọng mọi thành viên\n2️⃣ Không spam, không flood\n3️⃣ Đăng meme đúng kênh #meme-vn\n4️⃣ Gõ /help để khám phá QuickBot",
          footer: "QuickBot • tự động ghim nội quy",
        },
      }),
      msg(
        "u_admin",
        "📅 **Sự kiện Code Đêm** — tối thứ 7, 20:00. Ai tham gia thả 🔥 nhé!",
        42,
        {
          pinned: true,
          reactions: [
            { emoji: "🔥", count: 9, me: false },
            { emoji: "👀", count: 4, me: false },
          ],
        },
      ),
    ],
  },
  {
    id: "c_general",
    name: "trò-chuyện",
    type: "text",
    category: "Kênh văn bản",
    topic: "Tám chuyện linh tinh — QuickBot trực 24/7 ở đây 🤖",
    unread: 0,
    messages: [
      msg("u_mod1", "Chào buổi sáng cả nhà ☀️ Nay trời đẹp ghê", 190, {
        reactions: [{ emoji: "☕", count: 3, me: false }],
      }),
      msg("u_m1", "Hôm nay deploy gì chưa mà group im ắng thế 😅", 184),
      msg("u_m2", "Đang vật nhau với con bug CSS chạy lung tung nè 💀", 181),
      msg("u_mod1", "Classic developer moment 😂", 179, {
        reactions: [{ emoji: "😂", count: 5, me: true }],
      }),
      msg("u_bot", "👋 Chào mừng **minh_khoi** quay lại #trò-chuyện! Gõ `/help` để xem mình làm được gì nhé.", 176),
      msg("u_m1", "@QuickBot kể một joke đi bot ơi", 173),
      msg(
        "u_bot",
        "Tại sao lập trình viên hay nhầm Halloween với Giáng sinh?\nVì **OCT 31 == DEC 25** 🎃🎄",
        172,
        {
          reactions: [
            { emoji: "🤣", count: 7, me: false },
            { emoji: "💯", count: 2, me: true },
          ],
        },
      ),
      msg("u_mod2", "Cuối tuần ai leo rank không 🎮 Thiếu 1 support xịn", 64, {
        reactions: [{ emoji: "👀", count: 3, me: false }],
      }),
      msg("u_mod1", "Tối nay bật lofi ở **Phòng Nhạc** nhé 🎧 21:00 hẹn gặp!", 26),
    ],
  },
  {
    id: "c_dev",
    name: "dev-hub",
    type: "text",
    category: "Kênh văn bản",
    topic: "Chia sẻ code, khoe project, hỏi bug — đừng ngại!",
    unread: 0,
    messages: [
      msg("u_m2", "Mọi người xem giúp mình cái này với, sao nó render 2 lần 🤯\n```\nuseEffect(() => {\n  fetchUser(id).then(setUser);\n}, []);\n```\nThiếu `id` trong deps đúng không?", 95),
      msg("u_m1", "Chuẩn rồi, thêm `id` vào dependency array là hết chạy 2 lần liền 👍", 92, {
        reactions: [{ emoji: "💯", count: 2, me: false }],
      }),
      msg("u_bot", "💡 **Mẹo nhỏ:** Bật StrictMode ở dev sẽ cố tình render 2 lần để lộ effect lỗi — không phải bug của bạn đâu!", 90),
      msg("u_m2", "À đúng rồi, cảm ơn bot 🫡", 88, {
        reactions: [{ emoji: "🫡", count: 4, me: false }],
      }),
    ],
  },
  {
    id: "c_meme",
    name: "meme-vn",
    type: "text",
    category: "Kênh văn bản",
    topic: "Meme càng mặn càng tốt 🧂 Cấm meme nhạt!",
    unread: 3,
    messages: [
      msg("u_m1", "Sếp: \"Code chạy trên máy tôi mà?\" — câu thoại huyền thoại nhất lịch sử IT 🖥️💀", 55, {
        reactions: [{ emoji: "💀", count: 8, me: false }],
      }),
      msg("u_m2", "wifi với tình yêu giống nhau: không nhìn thấy nhưng mất là không sống nổi 😂", 30),
      msg("u_mod1", "Deadline là động lực, cà phê là nhiên liệu ☕🔥", 12),
    ],
  },
  {
    id: "c_voice1",
    name: "Phòng Nhạc",
    type: "voice",
    category: "Kênh giọng nói",
    unread: 0,
    messages: [],
  },
  {
    id: "c_voice2",
    name: "Chill Zone",
    type: "voice",
    category: "Kênh giọng nói",
    unread: 0,
    messages: [],
  },
];

export const JOKES = [
  "Tại sao lập trình viên hay nhầm Halloween với Giáng sinh?\nVì **OCT 31 == DEC 25** 🎃🎄",
  "Con gì đập thì sống, không đập thì chết? …Là **con tim** đó 💀",
  "Wi-fi với tình yêu giống nhau ở điểm nào?\nKhông nhìn thấy, nhưng thiếu là không sống nổi 😂",
  "Sếp: \"Code chạy trên máy tôi mà?\" — top 1 câu thoại kinh điển mọi thời đại 🖥️",
  "Đừng đếm bug — hãy để bug đếm bạn 🐛😭",
];

export const QUOTES = [
  { text: "Đơn giản là đỉnh cao của sự tinh tế.", by: "Leonardo da Vinci" },
  { text: "Code cũng như thơ — ngắn mà thấm.", by: "Khuyết danh" },
  { text: "Nói là làm, code là chạy. Không chạy thì… sửa tiếp.", by: "Dân dev truyền miệng" },
  { text: "Trước khi viết code đẹp, hãy viết code chạy.", by: "QuickBot sưu tầm" },
];

export const AMBIENT_POOL = [
  "vừa pha xong ly cà phê, quay lại chiến tiếp ☕",
  "nay trời mát, code sướng tay ghê 🌤️",
  "ai nghe lofi không, mình vừa thả playlist mới vào Phòng Nhạc 🎧",
  "đang xem trận chung kết Valorant, gắt thật sự 🔥",
  "mới fix xong cái bug 3 ngày tuổi, cảm giác như vô địch thế giới 🏆",
  "nhắc mới nhớ, tối thứ 7 sự kiện Code Đêm đó nha 📅",
  "đói quá, đặt trà sữa không mọi người 🧋",
  "meme hôm nay mặn thật sự 🧂😂",
];
