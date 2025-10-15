
import Section from "./Section";
import { prettyDate } from "@/lib/format";
export function Period({ policy }:{ policy:any }){
  return (<Section title="Policy Period">
    <div><div className="text-sm text-ink-500">Start Date</div><div className="font-semibold">{prettyDate(policy.startDate)}</div></div>
    <div><div className="text-sm text-ink-500">End Date</div><div className="font-semibold">{prettyDate(policy.endDate)}</div></div>
  </Section>);
}
export function VehicleSpecs({ policy }:{ policy:any }){
  return (<Section title="Vehicle Specifications">
    <div><div className="text-sm text-ink-500">Top Speed</div><div className="font-semibold">{policy.specs.topSpeedMph} MPH</div></div>
    <div><div className="text-sm text-ink-500">Power</div><div className="font-semibold">{policy.specs.powerBhp} BHP</div></div>
    <div className="col-span-2"><div className="text-sm text-ink-500">Gearbox</div><div className="font-semibold">{policy.specs.gearbox}</div></div>
  </Section>);
}
export function EngineFuel({ policy }:{ policy:any }){
  return (<Section title="Engine & Fuel">
    <div><div className="text-sm text-ink-500">Engine Capacity</div><div className="font-semibold">{policy.engine.capacityCc} CC</div></div>
    <div><div className="text-sm text-ink-500">Cylinders</div><div className="font-semibold">{policy.engine.cylinders}</div></div>
    <div><div className="text-sm text-ink-500">Fuel Type</div><div className="font-semibold">{policy.engine.fuelType}</div></div>
    <div><div className="text-sm text-ink-500">Consumption</div><div className="font-semibold">{policy.engine.consumption}</div></div>
  </Section>);
}
export function MotTax({ policy }:{ policy:any }){
  return (<Section title="MOT & Tax">
    <div><div className="text-sm text-ink-500">MOT Expiry</div><div className="font-semibold">{prettyDate(policy.mot.expiry)}</div></div>
    <div><div className="text-sm text-ink-500">Tax Status</div><div className="font-semibold">Valid until {prettyDate(policy.mot.taxValidUntil)}</div></div>
  </Section>);
}
export function CoverDetails({ policy }:{ policy:any }){
  return (<Section title="Cover Details">
    <div className="col-span-4">
      <ul className="space-y-2">{policy.covers.map((c:string)=>(<li key={c} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" /> <span>{c}</span></li>))}</ul>
    </div>
  </Section>);
}
export function AddOns({ policy }:{ policy:any }){
  return (<Section title="Add-ons">
    <div className="col-span-4">
      <ul className="space-y-2">{policy.addons.map((a:string)=>(<li key={a} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> <span>{a}</span></li>))}</ul>
    </div>
  </Section>);
}