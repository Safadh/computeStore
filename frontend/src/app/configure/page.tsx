"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Shell } from "@/components/Shell";
import { addCartItem, getToken } from "@/lib/api";

const OS_OPTIONS = [
  "Ubuntu 24.04 LTS",
  "Ubuntu 22.04 LTS",
  "Debian 12",
  "Debian 11",
  "Rocky Linux 9",
  "CentOS Stream 9",
  "AlmaLinux 9",
  "Fedora 41",
  "openSUSE Leap 15.6",
  "Windows Server 2022",
  "Windows Server 2019",
];

function estimateHourly(cpu: number, ramGb: number, storageGb: number) {
  // Must match backend default formula in app/routers/cart.py when offer_id is not set.
  return Math.round((0.01 * cpu + 0.005 * ramGb + 0.0005 * storageGb) * 10000) / 10000;
}

export default function ConfigureVMPage() {
  const router = useRouter();
  const [os, setOs] = useState(OS_OPTIONS[0]);
  const [cpu, setCpu] = useState(2);
  const [ram, setRam] = useState(4);
  const [storage, setStorage] = useState(50);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login?next=/configure");
    }
  }, [router]);

  const hourly = useMemo(() => estimateHourly(cpu, ram, storage), [cpu, ram, storage]);
  const monthly = useMemo(() => Math.round(hourly * 730 * 100) / 100, [hourly]);

  async function handleAddToCart() {
    setError(null);
    if (!getToken()) {
      router.push("/auth/login?next=/configure");
      return;
    }
    setAdding(true);
    try {
      await addCartItem({
        cpu_cores: cpu,
        memory_gb: ram,
        storage_gb: storage,
        os,
        quantity: 1,
      });
      router.push("/cart");
    } catch (e) {
      console.error(e);
      setError("Unable to add to cart. Please sign in again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-semibold">Configure Your VM</h1>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Customize resources to match your testing needs.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.8fr,1fr] items-start">
          <div className="space-y-4">
            <div className="card p-4">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                Operating system
              </div>
              <select
                className="input"
                value={os}
                onChange={(e) => setOs(e.target.value)}
              >
                {OS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <SliderCard
              label="CPU"
              valueLabel={`${cpu} cores`}
              min={1}
              max={64}
              value={cpu}
              onChange={setCpu}
              leftLabel="1 core"
              rightLabel="64 cores"
            />

            <SliderCard
              label="RAM"
              valueLabel={`${ram} GB`}
              min={1}
              max={512}
              value={ram}
              onChange={setRam}
              leftLabel="1 GB"
              rightLabel="512 GB"
            />

            <SliderCard
              label="Storage"
              valueLabel={`${storage} GB`}
              min={10}
              max={10240}
              step={10}
              value={storage}
              onChange={setStorage}
              leftLabel="10 GB"
              rightLabel="10 TB"
            />
          </div>

          <div className="card p-4 space-y-4 sticky top-6">
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                Summary
              </div>
              <div className="space-y-2 text-sm">
                <Row k="OS" v={os} />
                <Row k="CPU" v={`${cpu} cores`} />
                <Row k="RAM" v={`${ram} GB`} />
                <Row k="Storage" v={`${storage} GB`} />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-baseline justify-between">
                <div className="text-xs text-slate-400">Total / month</div>
                <div className="text-lg font-semibold text-emerald-300">${monthly}</div>
              </div>
              <div className="text-[11px] text-slate-500">
                Est. ${hourly.toFixed(4)}/hour · billed at checkout.
              </div>
            </div>

            <button
              className="btn-primary w-full"
              disabled={adding}
              onClick={() => void handleAddToCart()}
            >
              {adding ? "Adding..." : "Add to cart"}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function SliderCard(props: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">{props.label}</div>
        <div className="text-xs font-medium text-slate-100">{props.valueLabel}</div>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="w-full accent-brand-500"
      />
      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>{props.leftLabel}</span>
        <span>{props.rightLabel}</span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-400">{k}</span>
      <span className="text-slate-100 text-right">{v}</span>
    </div>
  );
}

