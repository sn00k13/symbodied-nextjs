"use client";

import { useState } from "react";
import { CreditCard, Building2, Zap, ShieldCheck, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { initializePayment } from "@/app/actions/payments";

// ── Bank details (update with real account numbers) ─────────────────────────
type BankField = { label: string; value: string };

const BANK_DETAILS: Record<string, BankField[]> = {
  NGN: [
    { label: "Bank",           value: "Guaranty Trust Bank (GTB)" },
    { label: "Account Name",   value: "Symbodied Africa Ltd" },
    { label: "Account Number", value: "0000000000" }, // TODO: replace
    { label: "Sort Code",      value: "058" },
  ],
  USD: [
    { label: "Bank",           value: "Grey Finance" },
    { label: "Account Name",   value: "Symbodied Africa Ltd" },
    { label: "Account Number", value: "XXXXXXXXXX" }, // TODO: replace
    { label: "Routing Number", value: "XXXXXXXXXX" },
    { label: "SWIFT / BIC",    value: "XXXXXXXX" },
  ],
  EUR: [
    { label: "Bank",           value: "Wise (EUR)" },
    { label: "Account Name",   value: "Symbodied Africa Ltd" },
    { label: "IBAN",           value: "GBXX XXXX XXXX XXXX XXXX XX" }, // TODO: replace
    { label: "BIC / SWIFT",    value: "TRWIBEB3XXX" },
  ],
  GBP: [
    { label: "Bank",           value: "Wise (GBP)" },
    { label: "Account Name",   value: "Symbodied Africa Ltd" },
    { label: "Account Number", value: "XXXXXXXX" }, // TODO: replace
    { label: "Sort Code",      value: "XX-XX-XX" },
  ],
  CAD: [
    { label: "Bank",           value: "Wise (CAD)" },
    { label: "Account Name",   value: "Symbodied Africa Ltd" },
    { label: "Account Number", value: "XXXXXXXXXX" }, // TODO: replace
    { label: "Institution",    value: "621" },
    { label: "Transit",        value: "XXXXX" },
  ],
};

const DEFAULT_BANK: BankField[] = [
  { label: "Email",   value: "finance@symbodied.org" },
  { label: "Subject", value: "Bank Transfer Donation" },
  { label: "Note",    value: "We will reply with account details for your currency." },
];

// ── Constants ────────────────────────────────────────────────────────────────

const METHOD_ICONS = { stripe: CreditCard, flutterwave: Zap, paystack: ShieldCheck, bank_transfer: Building2 } as const;
const METHOD_COLORS = {
  stripe: "bg-[#635BFF]", flutterwave: "bg-[#F5A623]", paystack: "bg-[#00C3F7]", bank_transfer: "bg-ink-600",
} as const;
const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦", USD: "$", EUR: "€", GBP: "£", CAD: "CA$", GHS: "GH₵", KES: "KSh",
};

// ── Component ────────────────────────────────────────────────────────────────

interface PayClientProps {
  projectId: string;
  projectName: string;
  method: string;
  amount: number;
  currency: string;
}

export function PayClient({ projectId, projectName, method, amount, currency }: PayClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [bankMode, setBankMode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const Icon = METHOD_ICONS[method as keyof typeof METHOD_ICONS] ?? CreditCard;
  const iconBg = METHOD_COLORS[method as keyof typeof METHOD_COLORS] ?? "bg-ink-600";
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const displayAmount = `${symbol}${Number(amount).toLocaleString()} ${currency}`;
  const methodLabel = method.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const bankFields = BANK_DETAILS[currency] ?? DEFAULT_BANK;

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const result = await initializePayment({ projectId, amount, currency, method });
      if ("error" in result) {
        setError(result.error);
      } else if ("url" in result) {
        window.location.href = result.url;
      } else if ("bankTransfer" in result) {
        setDonationId(result.donationId);
        setBankMode(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Bank transfer details ──────────────────────────────────────────────────
  if (bankMode) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 bg-success-bg border border-success-green/20 rounded-xl px-4 py-3">
          <CheckCircle2 size={18} className="text-success-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink font-sans">Donation recorded — {donationId?.slice(0, 8)}…</p>
            <p className="text-xs text-ink-600 font-sans mt-0.5">
              Complete the bank transfer below using your reference number as the narration.
              Your donation will be activated within 1–2 business days after confirmation.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-ink-500 uppercase tracking-wide font-sans mb-2">
            Bank Details · {currency}
          </p>
          <div className="bg-ink-100 rounded-xl divide-y divide-ink-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-ink-500 font-sans">Amount</span>
              <span className="font-display font-bold text-brand">{displayAmount}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-ink-500 font-sans">Reference / Narration</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink font-sans">{donationId?.slice(0, 12)}</span>
                <button onClick={() => copy(donationId ?? "", "ref")} className="text-ink-400 hover:text-brand transition-colors" aria-label="Copy reference">
                  {copied === "ref" ? <CheckCircle2 size={13} className="text-success-green" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            {bankFields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-ink-500 font-sans">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink font-sans">{value}</span>
                  <button onClick={() => copy(value, label)} className="text-ink-400 hover:text-brand transition-colors" aria-label={`Copy ${label}`}>
                    {copied === label ? <CheckCircle2 size={13} className="text-success-green" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Payment trigger ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="flex items-center gap-4 bg-ink-100 rounded-xl p-4">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-500 font-sans">Paying via</p>
          <p className="font-semibold text-sm text-ink font-sans">{methodLabel}</p>
          <p className="text-xs text-ink-400 font-sans line-clamp-1">{projectName}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-ink-500 font-sans">Amount</p>
          <p className="font-display font-bold text-xl text-brand">{symbol}{Number(amount).toLocaleString()}</p>
          <p className="text-xs text-ink-400 font-sans">{currency}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-bg rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error font-sans">{error}</p>
        </div>
      )}

      <Button variant="gold" fullWidth loading={loading} onClick={handlePay} leadingIcon={<Icon size={16} />}>
        {loading ? "Redirecting…" : `Pay ${displayAmount}`}
      </Button>

      <p className="text-xs text-ink-400 font-sans text-center">
        {method === "bank_transfer"
          ? "We will show you our bank details after recording your donation."
          : `You will be redirected to ${methodLabel}'s secure checkout. No card data touches our servers.`}
      </p>
    </div>
  );
}
