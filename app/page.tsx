"use client";

import { useEffect, useState } from "react";
import {
  createPublicClient,
  formatEther,
  http,
  type Transaction,
} from "viem";

type Block = { number: number; hash: string };

type SearchResult =
  | { type: "tx"; data: Transaction }
  | {
      type: "address";
      data: { address: string; balance: bigint; isContract: boolean };
    };

const client = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ""),
});

export default function Home() {
  const [height, setHeight] = useState<number | null>(null);
  const [latest, setLatest] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch(
          (process.env.NEXT_PUBLIC_EXPLORER_API || "") + "/summary"
        );
        const data = await res.json();
        setHeight(data.latestHeight);
        setLatest(data.latestBlocks as Block[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setResult(null);
    setError(null);
    setSearching(true);
    try {
      if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
        const tx = await client.getTransaction({ hash: q as `0x${string}` });
        setResult({ type: "tx", data: tx });
      } else if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
        const addr = q as `0x${string}`;
        const [balance, code] = await Promise.all([
          client.getBalance({ address: addr }),
          client.getCode({ address: addr }),
        ]);
        setResult({
          type: "address",
          data: { address: addr, balance, isContract: code !== "0x" },
        });
      } else {
        setError("Invalid search input");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching data");
    } finally {
      setSearching(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold mb-6">PGirlsChain Explorer</h1>

      <form onSubmit={handleSearch} className="mb-8 flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Txn Hash / Address / Contract"
          className="flex-1 rounded-l border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-r bg-blue-600 px-4 py-2 text-white"
        >
          Search
        </button>
      </form>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {searching && <p className="mb-4">Searching…</p>}

      {result?.type === "tx" && (
        <div className="mb-6 rounded border p-4">
          <h2 className="mb-2 font-semibold">Transaction</h2>
          <div className="font-mono break-all">Hash: {result.data.hash}</div>
          <div>From: {result.data.from}</div>
          <div>To: {result.data.to}</div>
          <div>Value: {formatEther(result.data.value)} PGC</div>
        </div>
      )}

      {result?.type === "address" && (
        <div className="mb-6 rounded border p-4">
          <h2 className="mb-2 font-semibold">
            {result.data.isContract ? "Contract" : "Address"}
          </h2>
          <div className="font-mono break-all">{result.data.address}</div>
          <div>
            Balance: {formatEther(result.data.balance)} PGC
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl p-4 shadow">
              <div className="text-sm opacity-70">Latest Height</div>
              <div className="text-2xl font-semibold">{height ?? "-"}</div>
            </div>
            <div className="rounded-2xl p-4 shadow">
              <div className="text-sm opacity-70">Tx/s</div>
              <div className="text-2xl font-semibold">—</div>
            </div>
            <div className="rounded-2xl p-4 shadow">
              <div className="text-sm opacity-70">Peers</div>
              <div className="text-2xl font-semibold">—</div>
            </div>
          </div>

          <h2 className="mb-2 text-xl font-semibold">Latest Blocks</h2>
          <div className="grid gap-3">
            {latest.map((b) => (
              <div key={b.hash} className="rounded-xl border p-4">
                <div className="text-sm opacity-70">#{b.number}</div>
                <div className="truncate font-mono">{b.hash}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

