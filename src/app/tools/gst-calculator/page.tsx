"use client";

import { useState, useMemo } from "react";
import { Receipt, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GSTCalculator() {
  const [amount, setAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const result = useMemo(() => {
    if (mode === "exclusive") {
      const gstAmount = (amount * gstRate) / 100;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { baseAmount: amount, gstAmount, cgst, sgst, total: amount + gstAmount };
    } else {
      const baseAmount = (amount * 100) / (100 + gstRate);
      const gstAmount = amount - baseAmount;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { baseAmount, gstAmount, cgst, sgst, total: amount };
    }
  }, [amount, gstRate, mode]);

  const formatINR = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(num);

  const gstRates = [0, 5, 12, 18, 28];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">GST Calculator</h1>
            <p className="text-[var(--muted-foreground)]">Calculate GST (CGST + SGST/IGST) for India</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
          {/* Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">Calculation Type</label>
            <div className="flex gap-2">
              <button onClick={() => setMode("exclusive")}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium ${mode === "exclusive" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                GST Exclusive (Add GST)
              </button>
              <button onClick={() => setMode("inclusive")}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium ${mode === "inclusive" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                GST Inclusive (Remove GST)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {mode === "exclusive" ? "Amount (before GST)" : "Amount (including GST)"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">₹</span>
              <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
            </div>
          </div>

          {/* GST Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">GST Rate</label>
            <div className="flex gap-2 flex-wrap">
              {gstRates.map((r) => (
                <button key={r} onClick={() => setGstRate(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${gstRate === r ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                  {r}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs text-[var(--muted-foreground)]">Base Amount</p>
            <p className="text-xl font-bold">{formatINR(result.baseAmount)}</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs text-[var(--muted-foreground)]">CGST ({gstRate / 2}%)</p>
            <p className="text-lg font-bold text-orange-500">{formatINR(result.cgst)}</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs text-[var(--muted-foreground)]">SGST ({gstRate / 2}%)</p>
            <p className="text-lg font-bold text-orange-500">{formatINR(result.sgst)}</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs text-[var(--muted-foreground)]">Total GST ({gstRate}%)</p>
            <p className="text-lg font-bold text-red-500">{formatINR(result.gstAmount)}</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white">
            <p className="text-sm opacity-80">Total Amount</p>
            <p className="text-3xl font-bold">{formatINR(result.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
