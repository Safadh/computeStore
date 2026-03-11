"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import {
  fetchOffers,
  fetchVMs,
  getToken,
  onAuthChanged,
  type VMInstance,
  type VMOffer,
} from "@/lib/api";

export default function DashboardPage() {
  const [vms, setVMs] = useState<VMInstance[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [offers, setOffers] = useState<VMOffer[]>([]);

  useEffect(() => {
    const load = async () => {
      const authed = !!getToken();
      setIsAuthenticated(authed);
      try {
        const offersData = await fetchOffers();
        setOffers(offersData);
        if (authed) {
          const vmsData = await fetchVMs();
          setVMs(vmsData);
        } else {
          setVMs([]);
        }
      } catch {
        // ignore for landing
      }
    };

    void load();
    return onAuthChanged(() => {
      void load();
    });
  }, []);

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-10 mt-4 md:mt-8">
        {/* Centered brand and hero */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-6 py-2 text-sm md:text-base font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-lg md:text-xl font-extrabold tracking-tight">
              compute<span className="text-brand-500">Store</span>
            </span>
            <span className="mx-2 text-slate-400">•</span>
            <span>Cloud VM marketplace</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            <span className="block text-slate-900 dark:text-slate-100">
              Spin up test VMs
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-emerald-600 dark:from-brand-400 dark:to-emerald-400">
              in seconds
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
            A focused platform to configure and launch virtual machines following Huawei
            Cloud principles: security, high performance, and fast provisioning.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href={isAuthenticated ? "/configure" : "/auth/login?next=/configure"}
              className="btn-primary px-5 py-2 text-sm"
            >
              Configure your VM
            </Link>
          </div>
        </section>

        {/* Why choose computeStore / Huawei Cloud‑style features */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card p-4 text-sm space-y-1">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              Security by design
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Inspired by Huawei Cloud security stack: isolated tenants, hardened images,
              and a clear path to IAM, VPCs, and security groups once real cloud APIs are
              wired in.
            </p>
          </div>
          <div className="card p-4 text-sm space-y-1">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              Fast, repeatable deployment
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              A single Configure VM flow that will map to Terraform + Huawei Cloud
              flavors, so you can spin up identical environments for dev and test in
              seconds.
            </p>
          </div>
          <div className="card p-4 text-sm space-y-1">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              Monitoring‑ready
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              VM detail pages are structured to plug into Prometheus and Grafana, giving
              a clear place for CPU, memory, and log panels as soon as real metrics are
              connected.
            </p>
          </div>
        </section>

        {/* VM list / activity */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {isAuthenticated ? "Your virtual machines" : "Virtual machines"}
          </h2>
          <div className="card p-4 text-sm space-y-2">
            {vms.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isAuthenticated
                  ? "You don’t have any VMs yet. Configure your first instance to see it here."
                  : "Sign in and configure a VM to see your instances listed here."}
              </p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {vms.map((vm) => (
                  <li key={vm.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium">
                        {vm.name}{" "}
                        <span className="text-[10px] text-slate-500">
                          ({vm.cpu_cores} vCPU · {vm.memory_gb} GB · {vm.storage_gb} GB)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {vm.os}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        vm.status === "running"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
                          : vm.status === "error"
                          ? "bg-red-500/10 text-red-400 border border-red-500/40"
                          : "bg-slate-500/10 text-slate-300 border border-slate-500/40"
                      }`}
                    >
                      {vm.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Pre-configured VM templates (visible for everyone) */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Pre-configured VM templates
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-2xl">
            Quickly start from curated instance shapes. You can buy these presets or use
            them as inspiration for your own custom configuration.
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {offers.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No templates are defined yet. Seed the <code>vm_offers</code> table in
                Postgres to display marketplace options here.
              </p>
            ) : (
              offers.slice(0, 6).map((offer) => (
                <div key={offer.id} className="card p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold truncate">{offer.name}</div>
                    <span className="text-brand-500 font-mono text-[11px]">
                      ${offer.base_price_per_hour.toFixed(4)}/h
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2 min-h-[2.5rem]">
                    {offer.description}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-600 dark:text-slate-400">
                    <span className="rounded-full border border-slate-300 dark:border-slate-700 px-2 py-0.5">
                      {offer.cpu_cores} vCPU
                    </span>
                    <span className="rounded-full border border-slate-300 dark:border-slate-700 px-2 py-0.5">
                      {offer.memory_gb} GB RAM
                    </span>
                    <span className="rounded-full border border-slate-300 dark:border-slate-700 px-2 py-0.5">
                      {offer.storage_gb} GB
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    OS options: {Object.keys(offer.os_options).join(", ") || "various"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}

