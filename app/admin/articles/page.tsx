"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase/client";
import gsap from "gsap";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  image_path: string | null;
  language_id: number;
  read_time_minutes: number | null;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  // Trigger animation whenever articles are loaded
  useEffect(() => {
    if (!loading && articles.length > 0 && containerRef.current) {
      gsap.fromTo(
        ".article-card",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, [loading, articles]);

  const fetchArticles = async () => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("articles")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="text-sm font-medium text-slate-500">Loading Content...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Articles</h1>
          <p className="text-sm sm:text-base text-slate-500">Manage your written content and translations.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Article
        </Link>
      </div>

      {/* Content Area */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 sm:py-20 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">No articles yet</h3>
          <p className="mt-1 text-slate-500">Get started by creating your first piece of content.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="article-card group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Lang ID: {article.language_id}
                  </span>
                  {article.read_time_minutes && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {article.read_time_minutes} min
                    </span>
                  )}
                </div>
                
                <h2 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                
                {article.excerpt ? (
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                ) : (
                  <p className="text-sm text-slate-300 italic">No excerpt provided</p>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
                <Link
                  href={`/admin/articles/edit/${article.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group/link"
                >
                  Edit Article 
                  <span className="transition-transform group-hover/link:translate-x-1">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}