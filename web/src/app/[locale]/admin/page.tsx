"use client";

import { useState } from "react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  message?: string;
  createdAt: string;
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const res = await fetch("/api/leads", {
      headers: { "x-admin-token": token },
    });
    if (!res.ok) {
      setError("Unauthorized or empty");
      setLeads([]);
      return;
    }
    const data = await res.json();
    setLeads(data.leads || []);
  }

  return (
    <div className="container-np py-12">
      <h1 className="section-title">Admin · Leads</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
        Лёгкая админка заявок. Токен задаётся в <code>ADMIN_TOKEN</code>. Позже
        сюда же подключается полноценная CMS (контент/новости).
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          className="min-w-[240px] flex-1 rounded-xl border border-[var(--line)] px-3 py-2"
          placeholder="ADMIN_TOKEN"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button type="button" className="btn-accent" onClick={load}>
          Load
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <div className="mt-8 space-y-3">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="rounded-[18px] border border-[var(--line)] bg-white p-4 text-sm"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <strong>
                {lead.name} · {lead.phone}
              </strong>
              <span className="text-[var(--muted)]">
                {new Date(lead.createdAt).toLocaleString()}
              </span>
            </div>
            {lead.message ? (
              <p className="mt-2 text-[var(--muted)]">{lead.message}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
