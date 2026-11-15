import { NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(40),
  message: z.string().max(2000).optional().default(""),
  consent: z.literal(true),
});

const dataFile = path.join(process.cwd(), "data", "leads.json");

async function readLeads() {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as unknown[];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const leads = await readLeads();
    const entry = {
      id: crypto.randomUUID(),
      ...parsed,
      createdAt: new Date().toISOString(),
    };
    leads.unshift(entry);
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(leads, null, 2), "utf8");
    return NextResponse.json({ ok: true, id: entry.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "invalid" },
      { status: 400 },
    );
  }
}

export async function GET(req: Request) {
  const auth = req.headers.get("x-admin-token");
  if (!auth || auth !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const leads = await readLeads();
  return NextResponse.json({ ok: true, leads });
}
