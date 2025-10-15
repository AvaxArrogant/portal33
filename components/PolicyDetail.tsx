"use client";
import { useState } from "react";
import Container from "@/components/Container";
import PolicyBanner from "@/components/PolicyBanner";
import { Period, VehicleSpecs, EngineFuel, MotTax, CoverDetails, AddOns } from "@/components/PolicySections";
import Link from "next/link";
import ProfileSheet from "@/components/ProfileSheet";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function PolicyDetail({ policy, me }: { policy: any; me: any }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-2">Policies</h1>
      <div className="text-ink-500 mb-4">{policy.number}</div>
      <PolicyBanner policy={{
        vehicle: policy.vehicle,
        premiumGBP: Number(policy.premium_gbp),
        status: policy.status,
        startDate: policy.start_date,
        endDate: policy.end_date
      }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <button className="card p-5 bg-gold-50" onClick={() => setProfileOpen(true)}>👤 Profile</button>
        <a href={`/api/policies/${policy.id}/download`} className="card p-5 bg-gold-50 text-center">⬇️ Download Policy</a>
        {(me?.role === "admin" || me?.role === "subadmin") && (
          <Link href={`/admin/policies/${policy.id}/edit`} className="card p-5 bg-gold-50 text-center flex items-center justify-center gap-2">
            <PencilIcon className="h-5 w-5" />
            <span>Edit Policy</span>
          </Link>
        )}
      </div>
      <div className="mt-5 space-y-5">
        <Period policy={{ startDate: policy.start_date, endDate: policy.end_date }} />
        <VehicleSpecs policy={{ specs: policy.specs }} />
        <EngineFuel policy={{ engine: policy.engine }} />
        <MotTax policy={{ mot: policy.mot }} />
        <CoverDetails policy={{ covers: policy.covers }} />
        <AddOns policy={{ addons: policy.addons }} />
      </div>
      <div className="mt-10"><Link href="/policies" className="underline">Back to list</Link></div>
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} user={me} latestPolicy={policy} />
    </Container>
  );
}