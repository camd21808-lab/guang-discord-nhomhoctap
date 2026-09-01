export type UserStatus = "online" | "idle" | "dnd" | "offline";
export type RoleKey = "admin" | "mod" | "vip" | "member" | "bot";

export interface User {
  id: string;
  name: string; // handle, e.g. minh_khoi
  role: RoleKey;
  color: string; // avatar + role color
  status: UserStatus;
  isBot?: boolean;
  activity?: string;
}

export interface EmbedButton {
  label: string;
  style: "primary" | "ghost";
}

export interface Embed {
  color: string;
  title?: string;
  description?: string;
  footer?: string;
  bigAvatar?: string; // userId
  buttons?: EmbedButton[];
}

export interface Reaction {
  emoji: string;
  count: number;
  me: boolean;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  ts: number;
  reactions: Reaction[];
  embed?: Embed;
  edited?: boolean;
  pinned?: boolean;
  system?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  category: string;
  topic?: string;
  messages: Message[];
  unread: number;
}

export interface BotReply {
  content?: string;
  embed?: Embed;
}

export type BotAction =
  | { kind: "reply"; replies: BotReply[] }
  | { kind: "react"; emoji: string }
  | null;

export interface TypingInfo {
  userId: string;
  channelId: string;
}

export interface Toast {
  id: number;
  text: string;
}
