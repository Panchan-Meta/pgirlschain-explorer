import { notFound } from "next/navigation";
import { createPublicClient, formatUnits, http } from "viem";
import Search from "@/components/search";

const client = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ""),
});

const DECIMALS = 8;
const SYMBOL = "PGIRLS";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const address = (await params).address as `0x${string}`;
  try {
    const [balance, code] = await Promise.all([
      client.getBalance({ address }),
      client.getCode({ address }),
    ]);
    if (code === "0x") {
      notFound();
    }
    return (
      <main className="mx-auto max-w-5xl p-6">
        <Search />
        <h1 className="mb-4 text-2xl font-semibold">Contract Details</h1>
        <div className="rounded border p-4">
          <div className="mb-2 break-all font-mono">{address}</div>
          <div>Balance: {formatUnits(balance, DECIMALS)} {SYMBOL}</div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
