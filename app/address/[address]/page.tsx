import { notFound } from "next/navigation";
import { createPublicClient, formatEther, http } from "viem";
import Search from "@/components/search";

const client = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ""),
});

export default async function AddressPage({
  params,
}: {
  params: { address: string };
}) {
  const address = params.address as `0x${string}`;
  try {
    const [balance, code] = await Promise.all([
      client.getBalance({ address }),
      client.getCode({ address }),
    ]);
    const isContract = code !== "0x";
    return (
      <main className="mx-auto max-w-5xl p-6">
        <Search />
        <h1 className="mb-4 text-2xl font-semibold">
          {isContract ? "Contract" : "Address"} Details
        </h1>
        <div className="rounded border p-4">
          <div className="mb-2 break-all font-mono">{address}</div>
          <div>Balance: {formatEther(balance)} PGC</div>
          <div>Type: {isContract ? "Contract" : "Externally Owned Account"}</div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
