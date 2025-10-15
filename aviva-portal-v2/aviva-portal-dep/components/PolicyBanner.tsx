
import Badge from "./Badge";
import { gbp } from "@/lib/format";
export default function PolicyBanner({ policy }:{ policy:any }){
  return (
    <div className="rounded-2xl p-5 bg-gold-grad text-ink-900 shadow-soft relative">
      <div className="absolute right-4 top-4"><Badge tone="gold">{policy.status.toUpperCase()}</Badge></div>
      <div className="text-xl sm:text-2xl font-extrabold leading-tight">{policy.vehicle.makeModel}</div>
      <div className="opacity-90">{policy.vehicle.year} • {policy.vehicle.color}</div>
      <div className="grid grid-cols-2 gap-6 mt-4">
        <div><div className="opacity-90">Premium</div><div className="text-xl font-bold">{gbp(policy.premiumGBP)}</div></div>
        <div><div className="opacity-90">Days Remaining</div><div className="text-xl font-bold">{policy.status === "expired" ? "Expired" : "Active"}</div></div>
      </div>
    </div>
  );
}