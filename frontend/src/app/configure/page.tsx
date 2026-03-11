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
  const [activeTab, setActiveTab] = useState<
    "instance" | "os" | "storage" | "network" | "region" | "details" | "review"
  >("instance");

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
      <div className="max-w-6xl mx-auto space-y-6 mt-2 md:mt-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-semibold">Build your custom VM</h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl">
            Design a virtual machine that matches your exact requirements. Choose CPU,
            memory, storage, and operating system, then review your pricing before
            deploying.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr] items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap border-b border-slate-200 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {[
                { id: "instance", label: "Instance" },
                { id: "os", label: "OS" },
                { id: "storage", label: "Storage" },
                { id: "network", label: "Network" },
                { id: "region", label: "Region" },
                { id: "details", label: "Details" },
                { id: "review", label: "Review" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id as typeof activeTab)
                  }
                  className={`px-3 py-2 border-b-2 ${
                    activeTab === tab.id
                      ? "border-brand-500 text-brand-600 dark:text-brand-500"
                      : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4 mt-2">
              {activeTab === "instance" && (
                <>
                  <div className="card p-4 space-y-3">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      Instance details
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 text-xs">
                        <label className="text-slate-600 dark:text-slate-400">
                          Instance name
                        </label>
                        <input
                          className="input"
                          value={"My custom VM"}
                          readOnly
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="text-slate-600 dark:text-slate-400">
                          Operating system
                        </label>
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
                    </div>
                  </div>

                  <SliderCard
                    label="CPU cores"
                    valueLabel={`${cpu} vCPU`}
                    min={1}
                    max={64}
                    value={cpu}
                    onChange={setCpu}
                    leftLabel="1 core"
                    rightLabel="64 cores"
                  />

                  <SliderCard
                    label="Memory"
                    valueLabel={`${ram} GB RAM`}
                    min={1}
                    max={512}
                    value={ram}
                    onChange={setRam}
                    leftLabel="1 GB"
                    rightLabel="512 GB"
                  />
                </>
              )}

              {activeTab === "os" && (
                <div className="card p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Choose your operating system
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Pick the image that best matches your stack. Linux options are ideal
                    for most workloads; Windows Server is available for .NET and desktop
                    apps.
                  </p>
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
              )}

              {activeTab === "storage" && (
                <SliderCard
                  label="Storage"
                  valueLabel={`${storage} GB SSD`}
                  min={10}
                  max={10240}
                  step={10}
                  value={storage}
                  onChange={setStorage}
                  leftLabel="10 GB"
                  rightLabel="10 TB"
                />
              )}

              {activeTab === "network" && (
                <div className="card p-4 text-xs space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Network (placeholder)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    In a future iteration this tab will let you choose VPCs, subnets, and
                    security groups that map to Huawei Cloud networking concepts.
                  </p>
                </div>
              )}

              {activeTab === "region" && (
                <div className="card p-4 text-xs space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Region (placeholder)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Here you will be able to select Huawei Cloud regions and availability
                    zones to deploy your VM closer to your users.
                  </p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="card p-4 text-xs space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Additional details (placeholder)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    This step can capture tags, project names, and other metadata for
                    cost allocation and organization.
                  </p>
                </div>
              )}

              {activeTab === "review" && (
                <div className="card p-4 text-xs space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Review configuration
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Double‑check your CPU, memory, storage, OS and region before adding
                    this VM to the cart. The summary panel on the right always reflects
                    your latest selections.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing summary */}
          <aside className="card p-4 space-y-4 sticky top-6 text-sm">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Pricing summary
              </h2>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Estimates are based on your current configuration and billed hourly.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <Row k="OS" v={os} />
              <Row k="CPU" v={`${cpu} vCPU`} />
              <Row k="RAM" v={`${ram} GB`} />
              <Row k="Storage" v={`${storage} GB`} />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1">
              <div className="flex items-baseline justify-between">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Total / month
                </div>
                <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  ${monthly}
                </div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-500">
                Est. ${hourly.toFixed(4)}/hour · based on ~730 hours/month.
              </div>
            </div>

            <button
              className="btn-primary w-full"
              disabled={adding}
              onClick={() => void handleAddToCart()}
            >
              {adding ? "Adding..." : "Add to cart"}
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </aside>
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
        <div className="text-xs text-slate-600 dark:text-slate-400">{props.label}</div>
        <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
          {props.valueLabel}
        </div>
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
      <div className="mt-2 flex justify-between text-[11px] text-slate-600 dark:text-slate-500">
        <span>{props.leftLabel}</span>
        <span>{props.rightLabel}</span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-600 dark:text-slate-400">{k}</span>
      <span className="text-slate-900 dark:text-slate-100 text-right">{v}</span>
    </div>
  );
}

