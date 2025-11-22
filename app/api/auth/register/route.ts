// Legacy route no longer needed when using client-side Supabase signup.
// Keeping a minimal handler that just rejects direct POSTs so frontend
// never accidentally depends on this.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Direct /api/auth/register is disabled. Use client-side Supabase signUp instead.",
    },
    { status: 400 }
  );
}
