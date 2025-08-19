/** PGIRLS token metadata shared across the app. */
export const TOKEN = {
  DECIMALS: 10,
  SYMBOL: "PGIRLS",
} as const;

export type Token = typeof TOKEN;

