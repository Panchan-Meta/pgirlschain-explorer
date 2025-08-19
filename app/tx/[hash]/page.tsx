import { notFound } from "next/navigation";
import {
  createPublicClient,
  decodeEventLog,
  formatUnits,
  http,
  parseAbiItem,
} from "viem";
import Search from "@/components/search";
import { DECIMALS, SYMBOL } from "@/lib/constants";

const client = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ""),
});

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);


export default async function TxPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const hash = (await params).hash as `0x${string}`;
  try {
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash }),
      client.getTransactionReceipt({ hash }),
    ]);

    let value = tx.value;
    for (const log of receipt.logs) {
      try {
        const parsed = decodeEventLog({
          abi: [transferEvent],
          data: log.data,
          topics: log.topics,
        });
        if (parsed.eventName === "Transfer") {
          value = parsed.args.value as bigint;
          break;
        }
      } catch {
        // not an ERC20 Transfer log
      }
    }
    return (
      <main className="mx-auto max-w-5xl p-6">
        <Search />
        <h1 className="mb-4 text-2xl font-semibold">Transaction Details</h1>
        <div className="rounded border p-4">
          <div className="mb-2 break-all font-mono">Hash: {tx.hash}</div>
          <div>From: {tx.from}</div>
          <div>To: {tx.to}</div>
          <div>Value: {formatUnits(value, DECIMALS)} {SYMBOL}</div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
