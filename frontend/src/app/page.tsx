"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { fetchOffers, fetchVMs, type VMInstance, type VMOffer } from "@/lib/api";

export default function DashboardPage() {
  const [offers, setOffers] = useState<VMOffer[]>([]);
  const [vms, setVMs] = useState<VMInstance[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const [offersData, vmsData] = await Promise.allSettled([
          fetchOffers(),
          fetchVMs(),
        ]);
        if (offersData.status === "fulfilled") setOffers(offersData.value);
        if (vmsData.status === "fulfilled") setVMs(vmsData.value);
      } catch {
        // ignore for landing
      }
    })();
  }, []);

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="mt-4 md:mt-8 grid gap-8 lg:grid-cols-[1.8fr,1.2fr] items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 mb-4">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Testing infrastructure, on demand
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-3">
              <span className="block text-slate-900 dark:text-slate-100">
                Spin up test VMs
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-emerald-600 dark:from-brand-400 dark:to-emerald-400">
                in seconds
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-6 max-w-xl">
              Configure and deploy virtual machines on a modern cloud marketplace.
              Choose your OS, tune CPU &amp; RAM, and monitor everything from a single
              dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/marketplace" className="btn-primary px-5 py-2 text-sm">
                Explore VM marketplace
              </Link>
            </div>
          </div>
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Quick stats
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">
                  Available offers
                </dt>
                <dd>{offers.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">
                  Running VMs
                </dt>
                <dd>{vms.filter((v) => v.status === "running").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">
                  Total VMs
                </dt>
                <dd>{vms.length}</dd>
              </div>
            </dl>
            <p className="text-[11px] text-slate-500">
              Sign in to deploy and manage your own virtual machines. Guests can browse
              marketplace offers but must create an account before launching.
            </p>
          </div>
        </section>
      </div>
    </Shell>
  );
}

