/** PGIRLS token metadata shared across the app. */
export const TOKEN = {
  DECIMALS: 8,          // ← ここを 8 に
  SYMBOL: "PGIRLS",
} as const;

export type Token = typeof TOKEN;


