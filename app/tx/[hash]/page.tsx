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

export default async function TxPage(props: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await props.params;
  const hash0x = hash as `0x${string}`;
  const client = createPublicClient({
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545"),
  });
  try {
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash: hash0x }),
      client.getTransactionReceipt({ hash: hash0x }),
    ]);

    let value = tx.value;
    let transferFrom: `0x${string}` = tx.from;
    let transferTo: `0x${string}` | null = tx.to;
    let decimals: number = TOKEN.DECIMALS;

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
          try {
            decimals = (await client.readContract({
              address: log.address as `0x${string}`,
              abi: [decimalsFn],
              functionName: "decimals",
            })) as number;
          } catch {
            // fallback to configured decimals
          }
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
          <div>From: {transferFrom}</div>
          <div>To: {transferTo}</div>
          <div>
            Value: {formatUnits(value, decimals)} {TOKEN.SYMBOL}
          </div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}

