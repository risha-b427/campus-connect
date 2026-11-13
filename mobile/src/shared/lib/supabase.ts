import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase settings. Copy .env.example to .env.local and fill in the values.",
  );
}

// On web, Expo also renders each page on the server ("output": "static" in
// app.json). There is no `window` there, so AsyncStorage can't be used and
// there's no login to keep. The browser and phones use the saved login as usual.
const isServer = typeof window === "undefined";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    ...(isServer ? {} : { storage: AsyncStorage }),
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});
