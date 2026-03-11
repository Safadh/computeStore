"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Shell } from "@/components/Shell";
import { addCartItem, fetchOffers, getToken, type VMOffer } from "@/lib/api";

export default function MarketplacePage() {
  const [offers, setOffers] = useState<VMOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchOffers();
        setOffers(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Shell>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold mb-2">VM marketplace</h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Choose a starter template or configure your own virtual machine. Pricing is
          hourly and will later map to Huawei Cloud via Terraform.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="text-sm text-slate-700 dark:text-slate-300">Loading offers...</p>
          )}
          {!loading &&
            offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          {!loading && offers.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No offers yet. Seed the `vm_offers` table in Postgres to see presets.
            </p>
          )}
        </div>
      </div>
    </Shell>
  );
}

function OfferCard({ offer }: { offer: VMOffer }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    if (!getToken()) {
      router.push("/auth/login?next=/marketplace");
      return;
    }
    setAdding(true);
    try {
      await addCartItem({
        offer_id: offer.id,
        cpu_cores: offer.cpu_cores,
        memory_gb: offer.memory_gb,
        storage_gb: offer.storage_gb,
        os: Object.keys(offer.os_options)[0] ?? "linux",
      });
    } catch (e) {
      console.error(e);
      setError("You need to be signed in to add to cart.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="card p-4 space-y-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-lg border border-slate-700 bg-slate-950/60 grid place-items-center">
            <VMIcon name={offer.name} />
          </div>
          <h2 className="font-semibold truncate">{offer.name}</h2>
        </div>
        <span className="text-brand-400 font-mono text-xs">
          ${offer.base_price_per_hour.toFixed(4)}/h
        </span>
      </div>
      <p className="text-slate-700 dark:text-slate-300 text-xs min-h-[3rem]">
        {offer.description}
      </p>
      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
        <Badge>{offer.cpu_cores} vCPU</Badge>
        <Badge>{offer.memory_gb} GB RAM</Badge>
        <Badge>{offer.storage_gb} GB SSD</Badge>
      </div>
      <button onClick={handleAdd} className="btn-primary w-full mt-2" disabled={adding}>
        {adding ? "Adding..." : "Add to cart"}
      </button>
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5">
      {children}
    </span>
  );
}

function VMIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  // Heuristic mapping by name keywords (you can refine to match your offer catalog)
  if (n.includes("gpu") || n.includes("ai") || n.includes("ml")) return <IconGpu />;
  if (n.includes("database") || n.includes("db") || n.includes("postgres") || n.includes("sql"))
    return <IconDatabase />;
  if (n.includes("memory") || n.includes("ram")) return <IconMemory />;
  if (n.includes("storage") || n.includes("disk") || n.includes("ssd")) return <IconStorage />;
  if (n.includes("web") || n.includes("api") || n.includes("app")) return <IconGlobe />;
  return <IconServer />;
}

function IconServer() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-200">
      <path
        d="M5 7c0-1.1 3.1-2 7-2s7 .9 7 2-3.1 2-7 2-7-.9-7-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 7v10c0 1.1 3.1 2 7 2s7-.9 7-2V7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 11h.01M8 15h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGpu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-300">
      <path
        d="M7 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7V7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 10h4v4h-4v-4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19 10h1M19 12h1M19 14h1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-brand-300">
      <path
        d="M6 6c0-1.1 2.7-2 6-2s6 .9 6 2-2.7 2-6 2-6-.9-6-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 6v6c0 1.1 2.7 2 6 2s6-.9 6-2V6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 12v6c0 1.1 2.7 2 6 2s6-.9 6-2v-6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconMemory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-fuchsia-300">
      <path
        d="M7 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 10h6M9 14h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5M12 7V5M15 7V5M9 19v-2M12 19v-2M15 19v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconStorage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-amber-300">
      <path
        d="M6 8h12a2 2 0 0 1 2 2v2H4v-2a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 12h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 10h.01M8 14h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-cyan-300">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.6 9h16.8M3.6 15h16.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 3c2.8 2.3 4.2 5.3 4.2 9s-1.4 6.7-4.2 9c-2.8-2.3-4.2-5.3-4.2-9s1.4-6.7 4.2-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

