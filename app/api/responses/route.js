import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { draftOptions } from '../../../lib/draftOptions';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Database environment variables are not configured.');
  return createClient(url, key, { auth: { persistSession: false } });
}

function isAdmin(request) {
  const supplied = request.headers.get('x-admin-password') || '';
  return Boolean(process.env.COMMISSIONER_PASSWORD) && supplied === process.env.COMMISSIONER_PASSWORD;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const normalizedName = name.toLowerCase().replace(/\s+/g, ' ');
    const availability = body.availability || {};
    const mode = body.mode;
    const comments = String(body.comments || '').trim().slice(0, 2000);

    if (!name || name.length > 100) return NextResponse.json({ error: 'Please enter a valid name.' }, { status: 400 });
    if (!['in-person', 'remote'].includes(mode)) return NextResponse.json({ error: 'Please select how you plan to participate.' }, { status: 400 });

    const allowed = new Set(['great', 'work', 'cant']);
    for (const option of draftOptions) {
      if (!allowed.has(availability[option.id])) return NextResponse.json({ error: 'Every draft time must be answered.' }, { status: 400 });
    }
    const workable = Object.values(availability).filter((value) => value === 'great' || value === 'work').length;
    if (workable < 2) return NextResponse.json({ error: 'Please choose at least two workable draft times.' }, { status: 400 });

    const supabase = getSupabase();
    const { error } = await supabase.from('draft_responses').upsert({
      normalized_name: normalizedName,
      name,
      availability,
      participation_mode: mode,
      comments,
      updated_at: new Date().toISOString()
    }, { onConflict: 'normalized_name' });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Unable to save the response.' }, { status: 500 });
  }
}

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('draft_responses').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ responses: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load responses.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing response ID.' }, { status: 400 });
    const supabase = getSupabase();
    const { error } = await supabase.from('draft_responses').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to delete response.' }, { status: 500 });
  }
}
