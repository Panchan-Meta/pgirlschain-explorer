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

type Props = { params: { hash: `0x${string}` } };

export default async function TxPage({ params }: Props) {
  const hash = params.hash;

  const client = createPublicClient({
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545"),
  });

  try {
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash }),
      client.getTransactionReceipt({ hash }),
    ]);

    // 既定はネイティブ送金の from/to/value
    let value: bigint = tx.value;
    let transferFrom: `0x${string}` | undefined = tx.from as `0x${string}`;
    let transferTo: `0x${string}` | null | undefined = tx.to as
      | `0x${string}`
      | null
      | undefined;

    // ERC-20 Transfer イベントがあれば、そちらの値で上書き
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
          break;
        }
      } catch {
        // 解析できないログは無視
      }
    }

    const formattedValue = formatUnits(value, TOKEN.DECIMALS);

    return (
      <main className="mx-auto max-w-5xl p-6">
        <Search />
        <h1 className="mb-4 text-2xl font-semibold">Transaction Details</h1>
        <div className="rounded border p-4">
          <div className="mb-2 break-all font-mono">Hash: {tx.hash}</div>
          <div>From: {transferFrom ?? "-"}</div>
          <div>To: {transferTo ?? "-"}</div>
          <div>Value: {formattedValue} {TOKEN.SYMBOL}</div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
