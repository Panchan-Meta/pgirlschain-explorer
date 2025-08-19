// app/tx/[hash]/page.tsx
import { notFound } from "next/navigation";
import {
  createPublicClient,
  decodeEventLog,
  formatUnits,
  http,
  parseAbiItem,
} from "viem";
import Search from "@/components/search";
import { TOKEN } from "@/lib/constants";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);
const decimalsFn = parseAbiItem("function decimals() view returns (uint8)");

export default async function TxPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const txHash = hash as `0x${string}`;

  const client = createPublicClient({
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545"),
  });

  try {
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash: txHash }),
      client.getTransactionReceipt({ hash: txHash }),
    ]);

    // 既定: ネイティブ送金の情報
    let value: bigint = tx.value;
    let transferFrom: `0x${string}` = tx.from as `0x${string}`;
    let transferTo: `0x${string}` | null = (tx.to as `0x${string}`) ?? null;
    let decimals: number = TOKEN.DECIMALS; // ← 既定は 8

    // ERC-20 Transfer ログがあれば、値と小数桁を上書き
    for (const log of receipt.logs) {
      try {
        const parsed = decodeEventLog({
          abi: [transferEvent],
          data: log.data,
          topics: log.topics,
        });

        if (parsed.eventName === "Transfer") {
          value = parsed.args.value as bigint;
          transferFrom = parsed.args.from as `0x${string}`;
          transferTo = parsed.args.to as `0x${string}`;

          // decimals を読み取り、異常値はフォールバック（0/NaN/極端に大きい等）
          try {
            const d = (await client.readContract({
              address: log.address as `0x${string}`,
              abi: [decimalsFn],
              functionName: "decimals",
            })) as number;

            const dNum = Number(d);
            if (Number.isFinite(dNum) && dNum > 0 && dNum <= 36) {
              decimals = dNum;
            } // それ以外は TOKEN.DECIMALS=8 を維持
          } catch {
            // 読み取り失敗時は既定(8)のまま
          }

          break;
        }
      } catch {
        // not a Transfer log — ignore
      }
    }

    return (
      <main className="mx-auto max-w-5xl p-6">
        <Search />
        <h1 className="mb-4 text-2xl font-semibold">Transaction Details</h1>
        <div className="rounded border p-4">
          <div className="mb-2 break-all font-mono">Hash: {tx.hash}</div>
          <div>From: {transferFrom ?? "-"}</div>
          <div>To: {transferTo ?? "-"}</div>
          <div>Value: {formatUnits(value, decimals)} {TOKEN.SYMBOL}</div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
