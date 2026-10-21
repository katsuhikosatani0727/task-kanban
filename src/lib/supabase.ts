import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabaseの環境変数(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)が設定されていません。.env.localを確認してください。"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseKey! },
    });
    return response.ok;
  } catch {
    return false;
  }
}
