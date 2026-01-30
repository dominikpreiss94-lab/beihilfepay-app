import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, mediaType } = body;

    console.log('📥 Received analyze request');

    // Claude Vision API Call (server-side - kein CORS!)
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: image
              }
            },
            {
              type: 'text',
              text: `Du bist ein Experte für deutsche Arzt- und Zahnarzt-Rechnungen.

Analysiere das Bild dieser Rechnung und extrahiere folgende Informationen:

1. Leistungserbringer (z.B. "Dr. med. Schmidt" oder "Zahnarztpraxis Müller")
2. Gesamtbetrag in Euro (nur die Zahl, z.B. 111.58)
3. Rechnungsdatum im Format YYYY-MM-DD
4. Art der Behandlung (wähle aus: arztbesuch, zahnarzt, medikamente, krankenhaus, physiotherapie, sonstiges)

Antworte NUR mit einem JSON-Objekt in diesem exakten Format (ohne zusätzlichen Text):
{
  "leistungserbringer": "Name",
  "betrag": "123.45",
  "datum": "2025-01-15",
  "art": "zahnarzt"
}

Falls du Informationen nicht finden kannst, lasse das Feld leer ("").`
            }
          ]
        }]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('❌ Claude API Error:', claudeResponse.status, errorText);
      return NextResponse.json(
        { error: 'Claude API Error', status: claudeResponse.status, details: errorText },
        { status: claudeResponse.status }
      );
    }

    const data = await claudeResponse.json();
    console.log('✅ Claude responded successfully');
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Server Error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}