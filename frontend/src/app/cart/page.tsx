"use client";

import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import {
  checkout,
  fetchCart,
  removeCartItem,
  type CartItem,
} from "@/lib/api";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpMonth, setCardExpMonth] = useState("12");
  const [cardExpYear, setCardExpYear] = useState("2030");
  const [cardCvc, setCardCvc] = useState("123");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCart();
      setItems(data.items);
      setTotal(data.total_hourly_price);
    } catch (e) {
      console.error(e);
      setError("Unable to load cart. Sign in first.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleRemove(id: number) {
    await removeCartItem(id);
    void load();
  }

  async function handleCheckout() {
    if (!cardNumber || !cardExpMonth || !cardExpYear || !cardCvc) {
      setError("Please fill in all card fields.");
      return;
    }

    setPaying(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await checkout({
        card_number: cardNumber,
        card_exp_month: Number(cardExpMonth),
        card_exp_year: Number(cardExpYear),
        card_cvc: cardCvc,
      });
      setSuccessMessage(
        `Order #${res.order_id} created. Hourly total $${res.total_hourly_price.toFixed(
          4,
        )}.`,
      );
      void load();
    } catch (e) {
      console.error(e);
      setError("Payment failed. Check that you are signed in.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <Shell>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold mb-2">Cart</h1>
        {loading && (
          <p className="text-sm text-slate-700 dark:text-slate-300">Loading...</p>
        )}
        {!loading && error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="card p-4 space-y-3 text-sm">
              {items.length === 0 && (
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Your cart is empty. Add a VM from the marketplace.
                </p>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">
                      {item.cpu_cores} vCPU · {item.memory_gb} GB RAM · {item.storage_gb}{" "}
                      GB · {item.os}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ${item.hourly_price.toFixed(4)}/h · qty {item.quantity}
                    </div>
                  </div>
                  <button
                    className="text-xs text-red-400 hover:text-red-300"
                    onClick={() => void handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="card p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Total hourly price</span>
                <span className="font-mono">
                  ${Number.isFinite(total) ? total.toFixed(4) : "0.0000"}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-slate-400 mb-1">
                      Card number 
                    </label>
                    <input
                      className="input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <label className="block text-slate-400 mb-1">Exp. month</label>
                    <input
                      className="input"
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                      placeholder="12"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-slate-400 mb-1">Exp. year</label>
                    <input
                      className="input"
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                      placeholder="2030"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-slate-400 mb-1">CVC</label>
                    <input
                      className="input"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  This is a demo checkout. No real payment is processed.
                </p>
              </div>
              <button
                className="btn-primary w-full mt-2"
                onClick={() => void handleCheckout()}
                disabled={items.length === 0 || paying}
              >
                {paying ? "Processing..." : "Pay with card & deploy"}
              </button>
              {successMessage && (
                <p className="text-xs text-emerald-400">{successMessage}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

