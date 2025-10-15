
"use client";
import { useEffect } from "react";
import { gbp, prettyDate } from "@/lib/format";
import { formatProfileField, formatProfileDate } from "@/lib/profile-utils";

export default function ProfileSheet({ open, onClose, user, latestPolicy }: { open: boolean; onClose: () => void; user: any; latestPolicy: any }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute bottom-0 h-auto w-full bg-gold-50 p-6 shadow-lg transition-transform duration-300 ease-in-out transform translate-y-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Profile</h2>
              <button onClick={onClose} className="text-2xl">
                ✖
              </button>
            </div>
            <p className="hint mt-1">View your personal details and policy summary</p>
        <h3 className="mt-6 mb-3 font-semibold text-lg">Personal Details</h3>
        <div className="space-y-3 text-ink-800">
          <div><div className="hint">Full Name</div><div className="font-semibold">{formatProfileField(user?.name)}</div></div>
          <div><div className="hint">Email</div><div className="font-semibold">{formatProfileField(user?.email)}</div></div>
          <div><div className="hint">Address</div><div className="font-semibold">{formatProfileField(user?.user_metadata?.address || user?.address || latestPolicy?.driver?.address)}</div></div>
          <div><div className="hint">Date of Birth</div><div className="font-semibold">{formatProfileDate(user?.user_metadata?.dob || user?.dob || latestPolicy?.driver?.dob)}</div></div>
          <div><div className="hint">Vehicle Registration</div><div className="font-semibold">{formatProfileField(latestPolicy?.vehicle?.registration)}</div></div>
          <div><div className="hint">Registered Keeper</div><div className="font-semibold">{formatProfileField(user?.name)}</div></div>
        </div>
            <div className="mt-8 card p-4 bg-gradient-to-b from-gold-400 to-gold-600 text-ink-900">
              <div className="font-semibold mb-2">Invoice Summary</div>
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Premium Paid</span>
                <span>{gbp(latestPolicy?.premium_gbp ?? 0)}</span>
              </div>
              <div className="mt-4 text-sm">
                <div className="opacity-90">Latest Policy</div>
                <div className="font-bold">{latestPolicy?.vehicle?.makeModel}</div>
                <div className="opacity-90">Vehicle Registration: {latestPolicy?.vehicle?.registration}</div>
                <div className="opacity-90">
                  Policy Period: {prettyDate(latestPolicy?.start_date)} – {prettyDate(latestPolicy?.end_date)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}