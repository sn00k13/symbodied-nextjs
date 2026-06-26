"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        on ? "bg-brand" : "bg-ink-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const photoRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave}>
      <div className="p-6 grid lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Profile Information */}
          <div className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-5">
            <h3 className="font-sans font-bold text-base text-ink">Profile Information</h3>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {photo ? (
                  <img
                    src={photo}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover border-2 border-ink-200"
                  />
                ) : (
                  <Avatar name="Faith Smooth" size="xl" ring />
                )}
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="text-sm font-semibold text-brand font-sans hover:underline"
              >
                Change photo
              </button>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" name="firstName" defaultValue="Faith" placeholder="First name" />
              <Input label="Last name" name="lastName" defaultValue="Smooth" placeholder="Last name" />
            </div>

            {/* Email + Phone row */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" name="email" type="email" defaultValue="Faithsmooth@gmail.com" placeholder="Email" />
              <Input label="Phone" name="phone" type="tel" defaultValue="+2348012345678" placeholder="+234..." />
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-ink">Security</h3>
            <Input label="Current password" name="currentPassword" type="password" placeholder="••••••••" />
            <Input label="New password" name="newPassword" type="password" placeholder="Min. 8 characters" />
            <Input label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat new password" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Notifications */}
          <div className="bg-white rounded-xl border border-ink-200 p-5 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-ink">Notification</h3>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink font-sans">Email Notifications</p>
                <p className="text-xs text-ink-500 font-sans mt-0.5">Receive email notification about your activity</p>
              </div>
              <Toggle on={emailNotif} onChange={setEmailNotif} />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink font-sans">Push Notifications</p>
                <p className="text-xs text-ink-500 font-sans mt-0.5">Receive push notifications</p>
              </div>
              <Toggle on={pushNotif} onChange={setPushNotif} />
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-ink-200 p-5 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-ink">Notification</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink font-sans">Language</label>
              <div className="relative">
                <select
                  defaultValue="en"
                  className="w-full h-10 px-3 pr-8 rounded-lg border border-ink-200 bg-white font-sans text-sm text-ink appearance-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-xs">▾</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink font-sans">Time Zone</label>
              <div className="relative">
                <select
                  defaultValue="wat"
                  className="w-full h-10 px-3 pr-8 rounded-lg border border-ink-200 bg-white font-sans text-sm text-ink appearance-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="wat">West Africa Time (WAT)</option>
                  <option value="utc">UTC</option>
                  <option value="est">Eastern Time (EST)</option>
                  <option value="gmt">GMT</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-xs">▾</span>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-white rounded-xl border border-ink-200 p-5 flex flex-col gap-3">
            <h3 className="font-sans font-bold text-base text-ink">Delete Account</h3>
            <p className="text-xs text-ink-500 font-sans leading-relaxed">
              Once you delete your account, there is no going back. please be certain.
            </p>
            <Button type="button" variant="danger" size="sm">
              Delete Account
            </Button>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
