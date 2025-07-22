import { NextResponse } from 'next/server';
import { getOAuthClient } from '../auth';



export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save tokens in cookies or secure store — here for demo, localStorage on frontend
  const tokenJson = JSON.stringify(tokens);
  const response = NextResponse.redirect('http://localhost:3000/');
  response.cookies.set('google_tokens', tokenJson, { httpOnly: false });

  return response;
}
