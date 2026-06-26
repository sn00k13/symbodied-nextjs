"use client";

import { useEffect, useTransition, useState } from "react";
import { Save, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const NIGERIAN_BANKS = [
  "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
  "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Guaranty Trust Bank (GTB)",
  "Heritage Bank", "Keystone Bank", "Polaris Bank", "Providus Bank",
  "Stanbic IBTC Bank", "Standard Chartered Bank", "Sterling Bank", "SunTrust Bank",
  "Union Bank of Nigeria", "United Bank for Africa (UBA)", "Unity Bank",
  "Wema Bank", "Zenith Bank", "Kuda Bank", "Opay", "PalmPay", "Moniepoint",
];

const field = "w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const label = "text-sm font-semibold text-ink font-sans";

export default function StudioSettingsPage() {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<{
    bank_name: string; account_name: string; account_number: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("vendor_bank_accounts")
        .select("bank_name, account_name, account_number")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setExisting(data as typeof existing));
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); return; }

      const payload = {
        user_id: user.id,
        bank_name: (fd.get("bank_name") as string).trim(),
        account_name: (fd.get("account_name") as string).trim(),
        account_number: (fd.get("account_number") as string).trim(),
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("vendor_bank_accounts")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertError) { setError(upsertError.message); return; }
      setExisting({ bank_name: payload.bank_name, account_name: payload.account_name, account_number: payload.account_number });
      setSaved(true);
    });
  };

  return (
    <div className="p-7 max-w-xl flex flex-col gap-6">
      <h2 className="font-sans font-bold text-xl text-ink">Payout Settings</h2>

      <div className="bg-brand-light border border-brand/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-brand mt-0.5 shrink-0" />
        <p className="text-sm text-ink-600 font-sans leading-relaxed">
          Your bank details are used to process payouts after escrow release. They are stored securely and never shared publicly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-5">
        <h3 className="font-sans font-semibold text-base text-ink flex items-center gap-2">
          <Building2 size={16} /> Bank Account
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className={label}>Bank Name</label>
          <div className="relative">
            <select name="bank_name" defaultValue={existing?.bank_name ?? ""} required
              className={`${field} appearance-none pr-9`}>
              <option value="" disabled>Select your bank</option>
              {NIGERIAN_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">▾</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>Account Name</label>
          <input name="account_name" required placeholder="As it appears on your bank statement"
            defaultValue={existing?.account_name ?? ""}
            className={field} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>Account Number</label>
          <input name="account_number" required placeholder="10-digit NUBAN account number"
            defaultValue={existing?.account_number ?? ""}
            pattern="\d{10}" maxLength={10}
            className={field} />
        </div>

        {error && <p className="text-sm text-error font-sans">{error}</p>}
        {saved && <p className="text-sm text-success-green font-sans font-semibold">Bank details saved successfully.</p>}

        <Button type="submit" variant="primary" loading={pending} leadingIcon={<Save size={14} />}>
          Save Bank Details
        </Button>
      </form>
    </div>
  );
}
