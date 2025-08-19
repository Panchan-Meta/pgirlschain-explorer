"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, http } from "viem";

const client = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ""),
});

export default function Search() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      router.push(`/tx/${q}`);
    } else if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      try {
        const code = await client.getCode({ address: q as `0x${string}` });
        router.push(code !== "0x" ? `/contract/${q}` : `/address/${q}`);
      } catch {
        router.push(`/address/${q}`);
      }
    } else {
      setError("Invalid search input");
    }
  }

  return (
    <>
      <form onSubmit={handleSearch} className="mb-8 flex">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError(null);
          }}
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
    </>
  );
}

