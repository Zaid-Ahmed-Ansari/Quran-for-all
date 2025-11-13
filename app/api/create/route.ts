import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { surah, group, ayah } = await req.json();

    const code = nanoid(7).toLowerCase();
    const target = `https://quran-for-all.vercel.app/commentary?surah=${encodeURIComponent(
      surah
    )}&group=${encodeURIComponent(group)}&ayah=${encodeURIComponent(ayah)}`;

    const { error } = await db
      .from("short_links")
      .insert([{ code, target, created_at: new Date() }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      shortUrl: `https://quran-for-all.vercel.app/${code}`,
      code,
    });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
