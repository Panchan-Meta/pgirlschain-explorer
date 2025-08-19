/**
 * PGIRLS token metadata shared across the app.
 * Exporting a single `TOKEN` object keeps imports simple and avoids
 * TypeScript treating this file as a script without modules.
 */
export const TOKEN = {
  DECIMALS: 10,
  SYMBOL: "PGIRLS",
} as const;

export type Token = typeof TOKEN;

