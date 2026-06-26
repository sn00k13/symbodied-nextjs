"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, CreditCard, Building2, Zap, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Config ─────────────────────────────────────────────────────────────────

type CurrencyDef = {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  quickAmounts: number[];
};

const CURRENCIES: CurrencyDef[] = [
  { code: "NGN", symbol: "₦",    name: "Nigerian Naira",   flag: "🇳🇬", quickAmounts: [500, 1000, 2500, 5000, 10000, 25000] },
  { code: "USD", symbol: "$",    name: "US Dollar",         flag: "🇺🇸", quickAmounts: [5, 10, 25, 50, 100, 250] },
  { code: "EUR", symbol: "€",    name: "Euro",              flag: "🇪🇺", quickAmounts: [5, 10, 25, 50, 100, 250] },
  { code: "GBP", symbol: "£",    name: "British Pound",     flag: "🇬🇧", quickAmounts: [5, 10, 25, 50, 100] },
  { code: "CAD", symbol: "CA$",  name: "Canadian Dollar",   flag: "🇨🇦", quickAmounts: [5, 10, 25, 50, 100] },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi",     flag: "🇬🇭", quickAmounts: [50, 100, 250, 500, 1000] },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling",   flag: "🇰🇪", quickAmounts: [500, 1000, 2500, 5000] },
];

type PaymentMethodDef = {
  id: string;
  name: string;
  description: string;
  sub: string;
  currencies: string[];
  Icon: LucideIcon;
  iconBg: string;
};

const PAYMENT_METHODS: PaymentMethodDef[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Debit & credit cards",
    sub: "Visa, Mastercard, Amex",
    currencies: ["USD", "EUR", "GBP", "CAD"],
    Icon: CreditCard,
    iconBg: "bg-[#635BFF]",
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    description: "Cards & mobile money",
    sub: "Pan-African coverage",
    currencies: ["NGN", "USD", "EUR", "GBP", "GHS", "KES"],
    Icon: Zap,
    iconBg: "bg-[#F5A623]",
  },
  {
    id: "paystack",
    name: "Paystack",
    description: "Cards & instant transfer",
    sub: "NGN & GHS",
    currencies: ["NGN", "GHS"],
    Icon: ShieldCheck,
    iconBg: "bg-[#00C3F7]",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank deposit",
    sub: "All currencies accepted",
    currencies: ["NGN", "USD", "EUR", "GBP", "CAD", "GHS", "KES"],
    Icon: Building2,
    iconBg: "bg-ink-600",
  },
];

// ── Component ───────────────────────────────────────────────────────────────

interface DonateModalProps {
  projectId: string;
  projectName: string;
  isAuthenticated: boolean;
  onClose: () => void;
}

type Step = "amount" | "method";

export function DonateModal({ projectId, projectName, isAuthenticated, onClose }: DonateModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [currency, setCurrency] = useState<CurrencyDef>(CURRENCIES[0]);
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compatibleMethods = PAYMENT_METHODS.filter((m) => m.currencies.includes(currency.code));

  function fmt(n: number) {
    return `${currency.symbol}${n.toLocaleString()}`;
  }

  function handleAmountNext() {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!amount || Number(amount) <= 0) { setError("Enter a valid amount."); return; }
    setError(null);
    setSelectedMethod(null);
    setStep("method");
  }

  function handleContinue() {
    if (!selectedMethod) { setError("Please choose a payment method."); return; }
    const params = new URLSearchParams({
      method: selectedMethod,
      amount: String(amount),
      currency: currency.code,
    });
    router.push(`/projects/${projectId}/pay?${params}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-2">
            {step === "method" && (
              <button
                onClick={() => { setStep("amount"); setError(null); }}
                className="text-ink-400 hover:text-ink transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="font-display font-bold text-xl text-ink leading-tight">
                {step === "amount" ? "Donate to Project" : "Payment Method"}
              </h3>
              <p className="text-xs text-ink-500 font-sans mt-0.5 line-clamp-1">{projectName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink transition-colors ml-4 flex-shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 px-6 mt-3">
          <div className="h-1 flex-1 rounded-full bg-brand" />
          <div className={cn("h-1 flex-1 rounded-full transition-colors", step === "method" ? "bg-brand" : "bg-ink-200")} />
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* ── Step 1: Amount & Currency ───────────────────── */}
          {step === "amount" && (
            <>
              {/* Currency selector */}
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wide font-sans mb-2">Currency</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c); setAmount(""); }}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-sans border transition-colors",
                      currency.code === c.code
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-ink-600 border-ink-200 hover:border-brand hover:text-brand"
                    )}
                  >
                    <span className="text-sm leading-none">{c.flag}</span>
                    <span>{c.code}</span>
                  </button>
                ))}
              </div>

              {/* Quick amounts */}
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wide font-sans mb-2">Amount</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {currency.quickAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={cn(
                      "py-2 rounded-lg text-sm font-semibold font-sans border transition-colors",
                      amount === a
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-ink-600 border-ink-200 hover:border-brand hover:text-brand"
                    )}
                  >
                    {fmt(a)}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="relative mb-5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500 font-sans font-semibold select-none pointer-events-none">
                  {currency.symbol}
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>

              {error && <p className="text-sm text-error font-sans mb-3">{error}</p>}

              <Button variant="gold" fullWidth onClick={handleAmountNext}>
                {amount ? `Donate ${fmt(Number(amount))}` : "Select Amount to Continue"}
              </Button>
            </>
          )}

          {/* ── Step 2: Payment Method ──────────────────────── */}
          {step === "method" && (
            <>
              {/* Amount summary pill */}
              <div className="flex items-center justify-between bg-brand-light rounded-xl px-4 py-3 mb-5">
                <span className="text-sm font-sans text-ink-600">Donating</span>
                <div className="text-right">
                  <span className="font-display font-bold text-2xl text-brand">{fmt(Number(amount))}</span>
                  <span className="text-xs text-ink-500 font-sans ml-1">{currency.code}</span>
                </div>
              </div>

              {/* Payment method cards */}
              <div className="flex flex-col gap-2 mb-5">
                {compatibleMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMethod(m.id); setError(null); }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                      selectedMethod === m.id
                        ? "border-brand bg-brand-light ring-1 ring-brand"
                        : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-100"
                    )}
                  >
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", m.iconBg)}>
                      <m.Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-ink font-sans">{m.name}</div>
                      <div className="text-xs text-ink-500 font-sans">{m.description} · {m.sub}</div>
                    </div>
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 flex-shrink-0 transition-all",
                      selectedMethod === m.id ? "border-brand bg-brand" : "border-ink-300"
                    )} />
                  </button>
                ))}
              </div>

              {error && <p className="text-sm text-error font-sans mb-3">{error}</p>}

              <Button variant="gold" fullWidth onClick={handleContinue}>
                Continue to Payment
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
