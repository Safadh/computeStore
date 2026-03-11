"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { fetchVMs, getToken, onAuthChanged, type VMInstance } from "@/lib/api";

export default function DashboardPage() {
  const [vms, setVMs] = useState<VMInstance[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const load = async () => {
      const authed = !!getToken();
      setIsAuthenticated(authed);
      if (!authed) {
        setVMs([]);
        return;
      }
      try {
        const vmsData = await fetchVMs();
        setVMs(vmsData);
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
        <section className="text-center space-y-3">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-xs md:text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold">
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

        {/* Quick stats only when user is logged in */}
        {isAuthenticated && (
          <section className="flex justify-center">
            <div className="card p-5 space-y-4 max-w-md w-full">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Your VM activity
              </h2>
              <dl className="space-y-2 text-sm">
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
                Configure new VMs in seconds, then monitor them from the My VMs page.
              </p>
            </div>
          </section>
        )}
      </div>
    </Shell>
  );
}

