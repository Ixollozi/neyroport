"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useTranslations } from "next-intl";

type LeadContextValue = {
  open: boolean;
  openLead: () => void;
  closeLead: () => void;
};

const LeadContext = createContext<LeadContextValue | null>(null);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openLead = useCallback(() => setOpen(true), []);
  const closeLead = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openLead, closeLead }),
    [open, openLead, closeLead],
  );

  return (
    <LeadContext.Provider value={value}>
      {children}
      <LeadModal />
    </LeadContext.Provider>
  );
}

export function useLead() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error("useLead must be used within LeadProvider");
  return ctx;
}

function LeadModal() {
  const t = useTranslations("lead");
  const tc = useTranslations("common");
  const { open, closeLead } = useLead();
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [pending, setPending] = useState(false);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="np-overlay fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      onClick={closeLead}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-medium tracking-tight">{t("title")}</h2>
          <button
            type="button"
            className="btn-ghost !px-3 !py-2 text-sm"
            onClick={closeLead}
          >
            {tc("close")}
          </button>
        </div>
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{t("name")}</span>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{t("phone")}</span>
            <input
              name="phone"
              required
              inputMode="tel"
              placeholder="+998"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{t("message")}</span>
            <textarea
              name="message"
              rows={4}
              className="w-full resize-y rounded-xl border border-[var(--line)] px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
            <input name="consent" type="checkbox" required className="mt-1" />
            <span>{t("consent")}</span>
          </label>
          <button className="btn-accent w-full" disabled={pending} type="submit">
            {pending ? "…" : t("submit")}
          </button>
          {status === "ok" && (
            <p className="text-sm text-emerald-700">{t("success")}</p>
          )}
          {status === "err" && (
            <p className="text-sm text-red-600">{t("error")}</p>
          )}
        </form>
      </div>
    </div>
  );
}
