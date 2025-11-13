import { db } from "../lib/supabase";
import { redirect } from "next/navigation";

export default async function RedirectPage({ params }) {
  const { code } = params;

  const result =
    await db`SELECT target FROM short_links WHERE code = ${code} LIMIT 1`;

  if (!result || result.length === 0) {
    // Show a custom 404
    redirect("/404");
  }

  redirect(result[0].target);
}
