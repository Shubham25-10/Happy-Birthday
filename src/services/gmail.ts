import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const connectGoogleGmail = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = () => cachedAccessToken;

export const disconnectGmail = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

function createEmailRaw(to: string, subject: string, htmlBody: string): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
  ];
  const email = emailLines.join('\r\n');
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const sendWishViaGmailApi = async (wish: string, recipientEmail: string = 'shubhamecom1999@gmail.com'): Promise<{ success: boolean; id?: string }> => {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Gmail is not connected. Please connect your Gmail first.');
  }

  const subject = `🎂 Birthday Wish: "${wish.slice(0, 35)}..." 💖`;
  const htmlBody = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #fff0f3; padding: 30px; border-radius: 20px; border: 2px solid #ffccd5; max-width: 520px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">🎁✨💌</span>
        <h2 style="color: #e63956; margin: 10px 0 6px; font-family: cursive, sans-serif;">A Special Birthday Wish for You!</h2>
        <p style="color: #594a4e; font-size: 14px; margin: 0;">Your cutie just released her secret wish into the stars on the website:</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 22px 18px; border-radius: 16px; border-left: 6px solid #ff5e7e; box-shadow: 0 4px 15px rgba(255, 94, 126, 0.15); margin: 20px 0;">
        <p style="margin: 0; font-size: 20px; color: #e63956; font-style: italic; line-height: 1.5; font-weight: 600;">
          &ldquo;${wish.replace(/</g, '&lt;').replace(/>/g, '&gt;')}&rdquo;
        </p>
      </div>

      <div style="background-color: rgba(255, 255, 255, 0.6); padding: 12px 16px; border-radius: 10px; font-size: 12px; color: #594a4e;">
        🕒 <strong>Time Received:</strong> ${new Date().toLocaleString()}<br/>
        💌 <strong>Recipient:</strong> ${recipientEmail}<br/>
        🐾 <strong>Dispatched by:</strong> Milk, Mocha, and Shubham's Birthday Website
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #e63956; font-size: 15px; font-weight: bold; margin: 0;">
          Time to make her wish come true, Shubham! 🐻❤️
        </p>
      </div>
    </div>
  `;

  const raw = createEmailRaw(recipientEmail, subject, htmlBody);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gmail API error (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return { success: true, id: data.id };
};
