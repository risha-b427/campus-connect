export type ResetLink =
  | { accessToken: string; refreshToken: string; problem: null }
  | { accessToken: null; refreshToken: null; problem: string };

// Reads the link from the password reset email. Supabase puts the login tokens
// after the # in the link, or an error message if the link is expired or used.
// Returns null while the app has no link yet.
export function readResetLink(url: string | null): ResetLink | null {
  if (!url) return null;

  const params = new URLSearchParams(url.split("#")[1] ?? "");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken, problem: null };
  }

  return {
    accessToken: null,
    refreshToken: null,
    problem:
      params.get("error_description") ??
      "This reset link is not valid. Please request a new one.",
  };
}
