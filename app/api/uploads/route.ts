export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const form = await req.formData();
    const files: File[] = [];
    for (const [, value] of form.entries()) {
      if (value instanceof File) files.push(value);
    }

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const bucket = "product-images";
    const uploadedUrls: string[] = [];

    // Helper: ensure bucket exists (using admin client)
    async function ensureBucket() {
      try {
        // Try to fetch a list to validate bucket; if fails, create it
        const probe = await supabase.storage
          .from(bucket)
          .list("", { limit: 1 });
        if ((probe as any)?.error) {
          // no-op, will fall through to create
        }
      } catch {
        // ignore
      }
      // Create bucket if missing
      try {
        await supabaseAdmin.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760, // 10 MB
        });
      } catch (e) {
        // If bucket already exists, ignore
      }
    }

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const path = `${filename}`;

      // Perform upload with the admin client to bypass RLS on storage
      let { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (
        uploadError &&
        String(uploadError.message || "")
          .toLowerCase()
          .includes("bucket not found")
      ) {
        await ensureBucket();
        // retry once
        const retry = await supabaseAdmin.storage
          .from(bucket)
          .upload(path, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        uploadError = retry.error as any;
      }

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      uploadedUrls.push(publicData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err: any) {
    console.error("UPLOADS ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
