export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient({ req, res: undefined as any });
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

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const path = `${filename}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      uploadedUrls.push(publicData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err: any) {
    console.error("UPLOADS ERROR:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}