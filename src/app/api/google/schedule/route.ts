import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens, summary, startTime, endTime } = body;

    if (!tokens) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials(tokens);

    const "calendar" = google."calendar"({ version: 'v3', auth });

    const event = {
      summary,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
    };

    const response = await "calendar".events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({ success: true, event: response.data });
  } catch (error) {
    console.error('❌ Failed to schedule meeting:', error);
    return NextResponse.json({ error: 'Failed to schedule meeting' }, { status: 500 });
  }
}
