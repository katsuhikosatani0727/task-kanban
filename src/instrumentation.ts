export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { checkSupabaseConnection } = await import("@/lib/supabase");
  const isConnected = await checkSupabaseConnection();

  if (!isConnected) {
    console.error("[Supabase] 接続に失敗しました");
  }
}
