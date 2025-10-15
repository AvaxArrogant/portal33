"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import SearchableDropdown from "@/components/SearchableDropdown";
import dynamic from "next/dynamic";
import React from "react";

const DatePicker = dynamic(() => import("@/components/DatePicker"), { ssr: false });

export default function CreatePolicyPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [motExpiry, setMotExpiry] = useState("");
  const [taxStatus, setTaxStatus] = useState("");
  const [premium, setPremium] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customerId, setCustomerId] = useState<{ value: string; label: string } | null>(null);
  const [coverageLevel, setCoverageLevel] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setStartDate(formattedDate);
  }, []);

  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      date.setFullYear(date.getFullYear() + 1);
      date.setDate(date.getDate() - 1);
      setEndDate(date.toISOString().split("T")[0]);
    }
  }, [startDate]);

  const handleCalculatePremium = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/policies/calculate-premium", {
        method: "POST",
        body: JSON.stringify({ policyType: "auto" }), // Hardcode policy type
      });
      const data = await res.json();
      setPremium(data.premium);
    } catch (err) {
      setError("Failed to calculate premium.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!customerId) {
      setError("Please select a customer before creating a policy.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("premium_gbp", String(premium));
    if (customerId) {
      formData.set("customer_id", customerId.value);
    }
    if (coverageLevel) {
      formData.set("coverage_level", coverageLevel.value);
    }

    try {
      const res = await fetch("/api/admin/create-policy", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create policy.");
      }

      const newPolicy = await res.json();
      setSuccess("Policy created successfully!");
      router.push(`/policies/${newPolicy.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Create Auto Insurance Policy</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{success}</div>}

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Customer Details</h2>
          <SearchableDropdown
            name="customer_id"
            endpoint="/api/admin/customers?status=active"
            placeholder="Select a customer..."
            className="field"
            value={customerId}
            onChange={setCustomerId}
          />
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Policy Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchableDropdown
              name="coverage_level"
              endpoint="/api/admin/coverage-levels"
              placeholder="Select a coverage level..."
              className="field"
              value={coverageLevel}
              onChange={setCoverageLevel}
            />
            <label className="block">
              <div className="hint mb-1">Start Date</div>
              <DatePicker
                name="start_date"
                value={startDate}
                onChange={setStartDate}
                className="field"
              />
            </label>
            <label className="block">
              <div className="hint mb-1">End Date</div>
              <DatePicker
                name="end_date"
                value={endDate}
                onChange={setEndDate}
                className="field"
              />
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Vehicle Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="hint mb-1">Make</div>
              <input name="make" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Model</div>
              <input name="model" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Year</div>
              <input name="year" type="number" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">VIN</div>
              <input name="vin" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Color</div>
              <input name="color" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Vehicle Registration</div>
              <input name="registration" className="field" required />
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Vehicle Specifications</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <div className="hint mb-1">Top Speed (MPH)</div>
              <input name="top_speed" type="number" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Power (BHP)</div>
              <input name="power" type="number" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Gearbox</div>
              <input name="gearbox" className="field" required />
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Engine & Fuel</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <label className="block">
              <div className="hint mb-1">Engine Capacity (CC)</div>
              <input name="engine_cc" type="number" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Cylinders</div>
              <input name="cylinders" type="number" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Fuel Type</div>
              <input name="fuel_type" className="field" required />
            </label>
            <label className="block">
              <div className="hint mb-1">Consumption</div>
              <input name="consumption" className="field" required />
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">MOT & Tax</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="hint mb-1">MOT Expiry</div>
              <DatePicker
                name="mot_expiry"
                value={motExpiry}
                onChange={setMotExpiry}
                className="field"
              />
            </label>
            <label className="block">
              <div className="hint mb-1">Tax Valid Until</div>
              <DatePicker
                name="tax_valid_until"
                value={taxStatus}
                onChange={setTaxStatus}
                className="field"
              />
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Cover Details</h2>
          <label className="block">
            <div className="hint mb-1">Covers (comma separated)</div>
            <input name="covers" className="field" defaultValue="Comprehensive Cover,Personal Accident Cover,Third Party Cover,Fire & Theft Protection" />
          </label>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Add-ons</h2>
          <label className="block">
            <div className="hint mb-1">Add-ons (comma separated)</div>
            <input name="addons" className="field" defaultValue="Motor Legal Protection,Breakdown Cover" />
          </label>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Coverage & Premiums</h2>
          <div className="flex items-center gap-4">
            <button type="button" onClick={handleCalculatePremium} className="btn btn-outline">
              {isLoading ? "Calculating..." : "Calculate Premium"}
            </button>
            <input
              type="number"
              name="premium_gbp"
              className="field"
              value={premium}
              onChange={(e) => setPremium(Number(e.target.value))}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-gold" disabled={isLoading}>
          {isLoading ? "Creating Policy..." : "Create Policy"}
        </button>
      </form>
    </Container>
  );
}
