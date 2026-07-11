"use client";

import { useState, type FormEvent } from "react";
import { createCommuteRequest, type CreateCommuteRequestResponse } from "@/lib/api";

export function CommuteRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [flexibilityMinutes, setFlexibilityMinutes] = useState(15);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<CreateCommuteRequestResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await createCommuteRequest({
        name,
        email,
        originAddress,
        destAddress,
        departureTime,
        flexibilityMinutes,
      });
      setResult(response);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success" && result) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900">
        <h2 className="text-lg font-semibold">Commute request submitted</h2>
        <p className="mt-2 text-sm">
          Matched origin to <span className="font-medium">{result.commuteRequest.origin_address}</span>{" "}
          and destination to{" "}
          <span className="font-medium">{result.commuteRequest.dest_address}</span>.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email (@deanza.edu or @fhda.edu)
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@deanza.edu"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="originAddress" className="block text-sm font-medium text-gray-700">
          Origin address
        </label>
        <input
          id="originAddress"
          type="text"
          required
          value={originAddress}
          onChange={(e) => setOriginAddress(e.target.value)}
          placeholder="Your home address"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="destAddress" className="block text-sm font-medium text-gray-700">
          Destination address
        </label>
        <input
          id="destAddress"
          type="text"
          required
          value={destAddress}
          onChange={(e) => setDestAddress(e.target.value)}
          placeholder="De Anza College, Cupertino, CA"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700">
          Departure time
        </label>
        <input
          id="departureTime"
          type="datetime-local"
          required
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="flexibilityMinutes" className="block text-sm font-medium text-gray-700">
          Flexibility window (minutes)
        </label>
        <input
          id="flexibilityMinutes"
          type="number"
          min={0}
          step={5}
          required
          value={flexibilityMinutes}
          onChange={(e) => setFlexibilityMinutes(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {status === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Submit commute request"}
      </button>
    </form>
  );
}
