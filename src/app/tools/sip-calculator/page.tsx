"use client";

import { useState, useMemo } from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const months = years * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = monthlyInvestment * months;
    const wealth = futureValue - totalInvested;
    return { futureValue, totalInvested, wealth };
  }, [monthlyInvestment, expectedReturn, years]);

  const formatINR = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">SIP Calculator</h1>
            <p className="text-[var(--muted-foreground)]">Calculate returns on Systematic Investment Plans</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-6">
          <div>
            <label className="flex justify-between text-sm font-medium mb-2">
              <span>Monthly Investment</span>
              <span className="text-[var(--primary)]">{formatINR(monthlyInvestment)}</span>
            </label>
            <input type="range" min={500} max={100000} step={500} value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>₹500</span><span>₹1,00,000</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium mb-2">
              <span>Expected Return (% p.a.)</span>
              <span className="text-[var(--primary)]">{expectedReturn}%</span>
            </label>
            <input type="range" min={1} max={30} step={0.5} value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>1%</span><span>30%</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium mb-2">
              <span>Time Period</span>
              <span className="text-[var(--primary)]">{years} years</span>
            </label>
            <input type="range" min={1} max={40} value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>1 yr</span><span>40 yrs</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <p className="text-sm opacity-80">Total Value</p>
            <p className="text-3xl font-bold mt-1">{formatINR(result.futureValue)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <p className="text-xs text-[var(--muted-foreground)]">Invested Amount</p>
              <p className="text-lg font-bold">{formatINR(result.totalInvested)}</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <p className="text-xs text-[var(--muted-foreground)]">Wealth Gained</p>
              <p className="text-lg font-bold text-green-500">{formatINR(result.wealth)}</p>
            </div>
          </div>
          {/* Visual bar */}
          <div className="rounded-full h-4 overflow-hidden flex">
            <div className="bg-blue-500 h-full" style={{ width: `${(result.totalInvested / result.futureValue) * 100}%` }} />
            <div className="bg-green-400 h-full flex-1" />
          </div>
          <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>Invested ({Math.round((result.totalInvested / result.futureValue) * 100)}%)</span>
            <span>Returns ({Math.round((result.wealth / result.futureValue) * 100)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
