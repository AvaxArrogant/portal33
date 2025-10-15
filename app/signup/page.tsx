"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to sign up.");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        <h2 className="text-xl font-bold">Personal Details</h2>
        <label className="block">
          <div className="hint mb-1">Email</div>
          <input name="email" type="email" required className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Password</div>
          <input name="password" type="password" required className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Name</div>
          <div className="grid grid-cols-2 gap-4">
            <input name="first_name" type="text" required className="field" placeholder="First name" />
            <input name="last_name" type="text" required className="field" placeholder="Last name" />
          </div>
          {/* keep `name` for compatibility with backend that reads it */}
          <input name="name" type="hidden" value="" />
        </label>
        <label className="block">
          <div className="hint mb-1">Address</div>
          <input name="address" type="text" className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Date of Birth</div>
          <input name="dob" type="date" className="field" />
        </label>
        <h2 className="text-xl font-bold mt-6">Vehicle Information</h2>
        <label className="block">
          <div className="hint mb-1">Make</div>
          <input name="make" className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Model</div>
          <input name="model" className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Year</div>
          <input name="year" type="number" className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">VIN</div>
          <input name="vin" className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Color</div>
          <input name="color" className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Vehicle Registration</div>
          <input name="registration" className="field" />
        </label>
        <button className="btn btn-gold">Sign Up</button>
        <div className="mt-4 text-center">
          <Link href="/login" className="underline">Already have an account? Login</Link>
        </div>
      </form>
    </Container>
  );
}