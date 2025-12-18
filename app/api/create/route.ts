//api/create
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "../../lib/supabase";

type ShortLinkType = "commentary" | "article" | "articleShort";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, surah, group, ayah, articleId } = body as {
      type?: ShortLinkType;
      surah?: number | string;
      group?: number | string;
      ayah?: number | string;
      articleId?: string;
    };

    console.log("BODY RECEIVED:", body);

    const domain = "https://quran-for-all.vercel.app";

    let effectiveType: ShortLinkType | undefined = type;

    // Backward compatibility: default to commentary if classic payload is provided
    if (!effectiveType && (surah !== undefined || group !== undefined || ayah !== undefined)) {
      effectiveType = "commentary";
    }

    // Validate type
    if (!effectiveType) {
      return NextResponse.json(
        { error: "Missing or invalid type. Expected 'commentary', 'article', or 'articleShort'." },
        { status: 400 }
      );
    }

    let target: string;

    switch (effectiveType) {
      case "commentary": {
        if (surah === undefined || group === undefined || ayah === undefined) {
          return NextResponse.json(
            { error: "For type 'commentary', 'surah', 'group', and 'ayah' are required." },
            { status: 400 }
          );
        }

        target = `${domain}/commentary?surah=${encodeURIComponent(
          String(surah)
        )}&group=${encodeURIComponent(String(group))}&ayah=${encodeURIComponent(String(ayah))}`;
        break;
      }

      case "article":
      case "articleShort": {
        if (!articleId) {
          return NextResponse.json(
            { error: `For type '${effectiveType}', 'articleId' is required.` },
            { status: 400 }
          );
        }

        const basePath = effectiveType === "article" ? "/article" : "/article-short";
        const searchParams = new URLSearchParams({ articleId });
        if (group !== undefined) {
          searchParams.set("group", String(group));
        }

        target = `${domain}${basePath}?${searchParams.toString()}`;
        break;
      }

      default: {
        return NextResponse.json(
          { error: "Invalid type. Expected 'commentary', 'article', or 'articleShort'." },
          { status: 400 }
        );
      }
    }

    const code = nanoid(7).toLowerCase();

    const { error } = await db
      .from("short_links")
      .insert([{ code, target, created_at: new Date() }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      shortUrl: `${domain}/s/${code}`,
      code,
    });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
