import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, upsertRow } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(auth.row?.memories || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { packet } = await req.json();
  const existing: string[] = auth.row?.memories || [];
  if (!existing.includes(packet)) {
    await upsertRow(auth.sb, auth.userId, { memories: [packet, ...existing].slice(0, 100) });
  }
  return NextResponse.json({ success: true });
}
