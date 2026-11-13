// Base URL of the backend API. On a phone, "localhost" is the phone itself, so
// set EXPO_PUBLIC_API_URL to your computer's network address (for example
// http://192.168.1.20:3000) in .env.local.
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// GET a protected API route as the signed-in user.
export async function apiGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message ?? `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}
