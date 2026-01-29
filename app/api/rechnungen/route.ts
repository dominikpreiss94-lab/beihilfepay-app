import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Für MVP: Temporär alle Rechnungen laden (ohne Auth)
    // TODO: Später mit Auth.user filtern
    const { data, error } = await supabase
      .from('rechnungen')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Temporär: Hardcoded user_id für MVP
    // TODO: Später mit auth.user().id ersetzen
    const rechnungData = {
      ...body,
      user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
    };

    const { data, error } = await supabase
      .from('rechnungen')
      .insert([rechnungData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}