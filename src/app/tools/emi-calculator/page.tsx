"use client";

import { useState, useMemo } from "react";
import { IndianRupee, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [tenureType, setTenureType] = useState<"years" | "months">("years");

  const result = useMemo(() => {
    const months = tenureType === "years" ? tenure * 12 : tenure;
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) {
      const emi = principal / months;
      return { emi, totalPayment: principal, totalInterest: 0, months };
    }
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    return { emi, totalPayment, totalInterest, months };
  }, [principal, rate, tenure, tenureType]);

  const formatINR = (num: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">EMI Calculator</h1>
            <p className="text-[var(--muted-foreground)]">Calculate monthly EMI for loans</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-6">
          <div>
            <label className="flex justify-between text-sm font-medium mb-2">
              <span>Loan Amount</span>
              <span className="text-[var(--primary)]">{formatINR(principal)}</span>
            </label>
            <input type="range" min={50000} max={50000000} step={50000} value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>₹50K</span><span>₹5Cr</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium mb-2">
              <span>Interest Rate (% per annum)</span>
              <span className="text-[var(--primary)]">{rate}%</span>
            </label>
            <input type="range" min={1} max={25} step={0.1} value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>1%</span><span>25%</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium mb-2">
              <span>Loan Tenure</span>
              <span className="text-[var(--primary)]">{tenure} {tenureType}</span>
            </label>
            <input type="range" min={1} max={tenureType === "years" ? 30 : 360} value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setTenureType("years"); setTenure(Math.min(tenure, 30)); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${tenureType === "years" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>Years</button>
              <button onClick={() => { setTenureType("months"); setTenure(Math.min(tenure * 12, 360)); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${tenureType === "months" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>Months</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <p className="text-sm opacity-80">Monthly EMI</p>
            <p className="text-3xl font-bold mt-1">{formatINR(result.emi)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <p className="text-xs text-[var(--muted-foreground)]">Principal</p>
              <p className="text-lg font-bold">{formatINR(principal)}</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <p className="text-xs text-[var(--muted-foreground)]">Total Interest</p>
              <p className="text-lg font-bold text-red-500">{formatINR(result.totalInterest)}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs text-[var(--muted-foreground)]">Total Payment (Principal + Interest)</p>
            <p className="text-xl font-bold">{formatINR(result.totalPayment)}</p>
          </div>
          {/* Visual ratio bar */}
          <div className="rounded-full h-4 overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: `${(principal / result.totalPayment) * 100}%` }} />
            <div className="bg-red-400 h-full flex-1" />
          </div>
          <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>Principal ({Math.round((principal / result.totalPayment) * 100)}%)</span>
            <span>Interest ({Math.round((result.totalInterest / result.totalPayment) * 100)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
