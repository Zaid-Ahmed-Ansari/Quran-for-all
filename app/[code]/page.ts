import { db } from "../lib/supabase";
import { redirect } from "next/navigation";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const { data, error } = await db
    .from("short_links")
    .select("target")
    .eq("code", code)
    .maybeSingle();

  if (error || !data?.target) {
    redirect("/404");
  }

  redirect(data.target);
}
