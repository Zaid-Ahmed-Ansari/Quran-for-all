import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../../apply-quran/app/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'bug_report' | 'feature_request' | null = all
  const status = searchParams.get("status"); // 'open' | 'resolved' | null = all
  const sort = searchParams.get("sort") ?? "newest"; // 'newest' | 'oldest'

  try {
    let query = db
      .from("feedback")
      .select("id, type, message, status, created_at", { count: "exact" });

    if (type === "bug_report" || type === "feature_request") {
      query = query.eq("type", type);
    }
    if (status === "open" || status === "resolved") {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: sort === "oldest" });

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [], count: count ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
  }
  if (status !== "open" && status !== "resolved") {
    return NextResponse.json({ error: "status must be 'open' or 'resolved'" }, { status: 400 });
  }

  try {
    const { data, error } = await db
      .from("feedback")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
