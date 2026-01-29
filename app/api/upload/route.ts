import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const rechnungData = JSON.parse(formData.get('data') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Temporär: Hardcoded user_id für MVP
    const userId = '00000000-0000-0000-0000-000000000000';
    
    // Dateiname generieren
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Datei zu Supabase Storage hochladen
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rechnungen')
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Public URL generieren
    const { data: urlData } = supabase.storage
      .from('rechnungen')
      .getPublicUrl(fileName);

    // Rechnung in DB speichern
    const { data: rechnungDbData, error: dbError } = await supabase
      .from('rechnungen')
      .insert([{
        ...rechnungData,
        user_id: userId,
        file_url: urlData.publicUrl,
      }])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      rechnung: rechnungDbData,
      fileUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}