import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, upsertRow } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(auth.row?.interests || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await upsertRow(auth.sb, auth.userId, { interests: body });
  return NextResponse.json({ success: true });
}
