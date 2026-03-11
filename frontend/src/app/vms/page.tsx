"use client";

import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import {
  fetchVMConsole,
  fetchVMetrics,
  fetchVMs,
  type VMInstance,
} from "@/lib/api";

export default function VMsPage() {
  const [vms, setVMs] = useState<VMInstance[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<
    { timestamp: string; cpu_usage: number; memory_usage: number }[]
  >([]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchVMs();
        setVMs(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void (async () => {
      try {
        const [consoleData, metricsData] = await Promise.all([
          fetchVMConsole(selectedId),
          fetchVMetrics(selectedId),
        ]);
        setConsoleLines(consoleData.map((c) => c.content));
        setMetrics(metricsData);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedId]);

  return (
    <Shell>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold mb-2">My virtual machines</h1>
        <div className="grid gap-4 lg:grid-cols-[1.1fr,1.4fr]">
          <div className="card p-4 space-y-2 text-sm">
            {vms.length === 0 && (
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                No VMs yet. Complete checkout to deploy your first instance.
              </p>
            )}
            {vms.map((vm) => (
              <button
                key={vm.id}
                onClick={() => setSelectedId(vm.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 mb-1 ${
                  selectedId === vm.id
                    ? "border-brand-500 bg-slate-900"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{vm.name}</span>
                  <span
                    className={`text-[11px] ${
                      vm.status === "running"
                        ? "text-emerald-400"
                        : vm.status === "error"
                        ? "text-red-400"
                        : "text-slate-300"
                    }`}
                  >
                    {vm.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {vm.cpu_cores} vCPU · {vm.memory_gb} GB RAM · {vm.storage_gb} GB ·{" "}
                  {vm.os}
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-4">
              <div className="card p-3 text-xs">
              <div className="flex justify-between mb-2">
                  <span className="text-slate-800 dark:text-slate-300 font-medium">
                    Console
                  </span>
              </div>
              <pre className="bg-black/60 rounded-lg p-3 max-h-64 overflow-auto text-[11px] text-slate-100">
                {consoleLines.length === 0
                  ? "Connect to a VM to view console output."
                  : consoleLines.join("\n")}
              </pre>
            </div>
            <div className="card p-3 text-xs">
              <div className="flex justify-between mb-2">
                <span className="text-slate-800 dark:text-slate-300 font-medium">
                  Metrics (simulated)
                </span>
              </div>
              <div className="flex gap-6 text-[11px] text-slate-300">
                <MetricList title="CPU %" values={metrics.map((m) => m.cpu_usage)} />
                <MetricList
                  title="Memory %"
                  values={metrics.map((m) => m.memory_usage)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function MetricList({ title, values }: { title: string; values: number[] }) {
  if (values.length === 0) {
    return (
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-slate-500">No metrics yet.</div>
      </div>
    );
  }
  const last = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (
    <div>
      <div className="font-medium mb-1">{title}</div>
      <div>Latest: {last.toFixed(1)}%</div>
      <div>
        Range: {min.toFixed(1)}%–{max.toFixed(1)}%
      </div>
    </div>
  );
}

