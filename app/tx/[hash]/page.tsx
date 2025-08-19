import { notFound } from "next/navigation";
import { createPublicClient, formatEther, http } from "viem";
import Search from "@/components/search";

const client = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ""),
});

export default async function TxPage({ params }: { params: { hash: string } }) {
  try {
    const tx = await client.getTransaction({
      hash: params.hash as `0x${string}`,
    });
    return (
      <main className="mx-auto max-w-5xl p-6">
        <Search />
        <h1 className="mb-4 text-2xl font-semibold">Transaction Details</h1>
        <div className="rounded border p-4">
          <div className="mb-2 break-all font-mono">Hash: {tx.hash}</div>
          <div>From: {tx.from}</div>
          <div>To: {tx.to}</div>
          <div>Value: {formatEther(tx.value)} PGC</div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
