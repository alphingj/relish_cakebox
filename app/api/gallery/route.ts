import { NextResponse } from "next/server";
import { sql, ensureTables, checkPin } from "@/lib/db";
import type { Cake } from "@/lib/cakes";

export async function GET(req: Request) {
  // `?all=1` is the admin view: it also returns hidden cakes, so unchecking
  // "Visible" does not make a cake impossible to edit again.
  const all = new URL(req.url).searchParams.get("all") === "1";
  if (all && !(await checkPin(req))) {
    return NextResponse.json({ cakes: [], error: "Invalid PIN" }, { status: 401 });
  }
  const q = sql();
  if (!q) return NextResponse.json({ cakes: [], source: "none" });
  await ensureTables();
  const rows = all
    ? (await q`SELECT * FROM gallery_cakes ORDER BY name`) as unknown as Cake[]
    : (await q`SELECT * FROM gallery_cakes WHERE visible=true ORDER BY name`) as unknown as Cake[];
  return NextResponse.json({ cakes: rows ?? [], source: "db" });
}

export async function PUT(req: Request) {
  if (!(await checkPin(req))) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const cakes = Array.isArray(body.cakes) ? (body.cakes as Cake[]) : null;
  if (!cakes) return NextResponse.json({ ok: false, error: "No cakes in request" }, { status: 400 });
  if (cakes.some((c) => !c.name?.trim() || !(c.price > 0))) return NextResponse.json({ ok: false, error: "Every cake needs a name and a starting price above 0." }, { status: 400 });
  const q = sql();
  if (!q) return NextResponse.json({ ok: false, error: "DATABASE_URL not set - saved locally only" });
  await ensureTables();
  for (const c of cakes) {
    await q`INSERT INTO gallery_cakes (id,name,occasion,price,image,description,sizes,visible,updated_at) VALUES (${c.id},${c.name},${c.occasion},${c.price},${c.image},${c.description},${c.sizes},${c.visible},now()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,occasion=EXCLUDED.occasion,price=EXCLUDED.price,image=EXCLUDED.image,description=EXCLUDED.description,sizes=EXCLUDED.sizes,visible=EXCLUDED.visible,updated_at=now()`;
  }
  // The payload is the complete list (admin loads it with ?all=1), so a cake the
  // owner deleted in the admin is removed here too.
  const keep = new Set(cakes.map((c) => c.id));
  const existing = (await q`SELECT id FROM gallery_cakes`) as unknown as { id: string }[];
  for (const row of existing ?? []) {
    if (!keep.has(row.id)) await q`DELETE FROM gallery_cakes WHERE id=${row.id}`;
  }
  return NextResponse.json({ ok: true });
}
