import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/google/callback'
);

export const getAuthUrl = () => {
  const scopes = ['https://www.googleapis.com/auth/"calendar"'];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

export const getOAuthClient = () => oauth2Client;
