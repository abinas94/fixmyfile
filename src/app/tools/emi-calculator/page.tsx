"use client";

import { useState, useMemo } from "react";
import { IndianRupee, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [tenureType, setTenureType] = useState<"years" | "months">("years");
  const [maxEmi, setMaxEmi] = useState(25000);
  const [affordRate, setAffordRate] = useState(8.5);
  const [affordTenure, setAffordTenure] = useState(20);

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

  // Reverse EMI: given EMI, rate, tenure → calculate max principal
  const affordableAmount = useMemo(() => {
    const months = affordTenure * 12;
    const monthlyRate = affordRate / 12 / 100;
    if (monthlyRate === 0) return maxEmi * months;
    return Math.round(maxEmi * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
  }, [maxEmi, affordRate, affordTenure]);

  const affordableAmountForSplit = (emi: number, r: number, yrs: number) => {
    const months = yrs * 12;
    const monthlyRate = r / 12 / 100;
    if (monthlyRate === 0) return emi * months;
    return Math.round(emi * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
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

      {/* Reverse EMI Calculator - Loan Affordability Advisor */}
      <div className="mt-8 max-w-4xl mx-auto px-4">
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-xl font-bold mb-1 text-center">Loan Affordability Advisor</h2>
          <p className="text-sm text-[var(--muted-foreground)] text-center mb-6">How much loan can you afford based on your monthly budget?</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1">Max EMI you can pay (₹/month)</label>
              <input type="number" min={1000} value={maxEmi} onChange={(e) => setMaxEmi(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Interest Rate (%)</label>
              <input type="number" min={1} max={25} step={0.1} value={affordRate} onChange={(e) => setAffordRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Tenure (years)</label>
              <input type="number" min={1} max={30} value={affordTenure} onChange={(e) => setAffordTenure(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
            </div>
          </div>

          {/* Result */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 text-center mb-6">
            <p className="text-sm text-green-700 dark:text-green-400">Maximum loan you can afford</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatINR(affordableAmount)}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">at {affordRate}% for {affordTenure} years with ₹{maxEmi.toLocaleString("en-IN")}/month EMI</p>
          </div>

          {/* Suggestion: split across loan types */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-center">Suggested loan split (if you have multiple needs)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Home Loan (70% of budget)</p>
                <p className="text-sm font-bold">{formatINR(affordableAmountForSplit(maxEmi * 0.7, 8.5, 20))}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">EMI: ₹{Math.round(maxEmi * 0.7).toLocaleString("en-IN")}/mo @ 8.5% for 20 yrs</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Car Loan (30% of budget)</p>
                <p className="text-sm font-bold">{formatINR(affordableAmountForSplit(maxEmi * 0.3, 9.5, 5))}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">EMI: ₹{Math.round(maxEmi * 0.3).toLocaleString("en-IN")}/mo @ 9.5% for 5 yrs</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Personal Loan (50% of budget)</p>
                <p className="text-sm font-bold">{formatINR(affordableAmountForSplit(maxEmi * 0.5, 12, 3))}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">EMI: ₹{Math.round(maxEmi * 0.5).toLocaleString("en-IN")}/mo @ 12% for 3 yrs</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Education Loan (80% of budget)</p>
                <p className="text-sm font-bold">{formatINR(affordableAmountForSplit(maxEmi * 0.8, 7.5, 7))}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">EMI: ₹{Math.round(maxEmi * 0.8).toLocaleString("en-IN")}/mo @ 7.5% for 7 yrs</p>
              </div>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] text-center mt-3">Tip: Total EMIs should not exceed 40-50% of your monthly income for financial safety.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
