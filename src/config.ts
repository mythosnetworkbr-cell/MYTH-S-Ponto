export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const API_URL = process.env.EXPO_PUBLIC_MYTHOS_API_URL ?? '';

export const isConfigured = Boolean(GOOGLE_ANDROID_CLIENT_ID && API_URL);
