/* داده‌ها، ثابت‌ها و توابع کمکی مشترک بازی «گردونه عملیات ریاضی» */

export type Operation = {
  key: string;
  symbol: string;
  name: string;
  color: string;
  dark: string;
  light: string;
};

/** ترتیب سکتورها در جهت عقربه‌های ساعت از بالای گردونه */
export const OPERATIONS: Operation[] = [
  { key: "add", symbol: "+", name: "جمع", color: "#10b981", dark: "#047857", light: "#d1fae5" },
  { key: "mul", symbol: "×", name: "ضرب", color: "#f59e0b", dark: "#b45309", light: "#fef3c7" },
  { key: "div", symbol: "÷", name: "تقسیم", color: "#8b5cf6", dark: "#6d28d9", light: "#ede9fe" },
  { key: "sub", symbol: "−", name: "تفریق", color: "#f43f5e", dark: "#be123c", light: "#ffe4e6" },
];

export const DEFAULT_NAMES = ["تیم الف", "تیم ب", "تیم ج", "تیم د"];
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 8;
export const CONFETTI_COLORS = ["#fbbf24", "#10b981", "#8b5cf6", "#f43f5e"];

/** رنگ اختصاصی هر تیم (به ترتیب شماره تیم) */
export const TEAM_COLORS = [
  { light: "#fef3c7", dark: "#b45309" },
  { light: "#d1fae5", dark: "#047857" },
  { light: "#ede9fe", dark: "#6d28d9" },
  { light: "#ffe4e6", dark: "#be123c" },
  { light: "#ccfbf1", dark: "#0f766e" },
  { light: "#ffedd5", dark: "#c2410c" },
  { light: "#ecfccb", dark: "#4d7c0f" },
  { light: "#fae8ff", dark: "#a21caf" },
];

export const STORAGE_KEY = "math-ops-wheel-v1";
export const SPIN_MS = 4500;

export type Player = { id: number; name: string; score: number };
export type HistoryItem = { id: number; round: number; playerName: string; opIndex: number };
export type SpinResult = { playerIdx: number; opIndex: number; round: number };

let idCounter = 1;
export const newId = () => idCounter++;
/** پس از بازیابی از حافظه، شمارندهٔ شناسه را جلو ببر تا تداخل پیش نیاید */
export const syncIdCounter = (maxId: number) => {
  if (maxId >= idCounter) idCounter = maxId + 1;
};

/* ---------------- helpers ---------------- */

export function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

export const faNum = (n: number) => n.toLocaleString("fa-IR");

/** نام پیش‌فرض تیم i ام */
export const defaultNameOf = (i: number) =>
  DEFAULT_NAMES[i] ?? `تیم ${faNum(i + 1)}`;
