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

    return (
      <main className="mx-auto max-w-5xl p-6">
        <Search />
        <h1 className="mb-4 text-2xl font-semibold">Transaction Details</h1>
        <div className="rounded border p-4">
          <div className="mb-2 break-all font-mono">Hash: {tx.hash}</div>

        </div>
      </main>
    );
  } catch {
    notFound();
  }
}

