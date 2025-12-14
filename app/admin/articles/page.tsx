"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase/client";
import { ChevronDown, ChevronRight, Search, Trash2, Edit, Filter, X } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  image_path: string | null;
  language_id: number;
  read_time_minutes: number | null;
  group_id: number | null;
}

interface GroupedArticles {
  groupId: number | null;
  articles: Article[];
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [groupedArticles, setGroupedArticles] = useState<GroupedArticles[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number | null>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "groupId">("groupId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    groupAndSortArticles();
  }, [articles, sortBy, sortOrder, searchQuery]);

  const fetchArticles = async () => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("articles")
        .select(`
          id,
          title,
          excerpt,
          image_path,
          language_id,
          read_time_minutes,
          article_group_links(group_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const articlesWithGroups: Article[] = (data || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        image_path: article.image_path,
        language_id: article.language_id,
        read_time_minutes: article.read_time_minutes,
        group_id: article.article_group_links?.[0]?.group_id || null,
      }));

      setArticles(articlesWithGroups);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const groupAndSortArticles = () => {
    let filtered = articles;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = articles.filter((article) => {
        const matchesTitle = article.title.toLowerCase().includes(query);
        const matchesGroupId = article.group_id?.toString().includes(query);
        return matchesTitle || matchesGroupId;
      });
    }

    // Group by group_id
    const grouped: Record<number | "null", Article[]> = {} as Record<number | "null", Article[]>;
    filtered.forEach((article) => {
      const key = article.group_id ?? "null";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(article);
    });

    // Convert to array
    const groupedArray: GroupedArticles[] = Object.entries(grouped).map(([key, articles]) => ({
      groupId: key === "null" ? null : Number(key),
      articles,
    }));

    // Sort groups
    groupedArray.sort((a, b) => {
      if (sortBy === "count") {
        const diff = a.articles.length - b.articles.length;
        return sortOrder === "asc" ? diff : -diff;
      } else {
        // Sort by groupId
        if (a.groupId === null && b.groupId === null) return 0;
        if (a.groupId === null) return sortOrder === "asc" ? 1 : -1;
        if (b.groupId === null) return sortOrder === "asc" ? -1 : 1;
        const diff = a.groupId - b.groupId;
        return sortOrder === "asc" ? diff : -diff;
      }
    });

    setGroupedArticles(groupedArray);

    // Auto-expand all groups on first load
    if (expandedGroups.size === 0 && groupedArray.length > 0) {
      setExpandedGroups(new Set(groupedArray.map((g) => g.groupId)));
    }
  };

  const toggleGroup = (groupId: number | null) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDelete = async (articleId: string, articleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(articleId);
    try {
      const client = getSupabaseClient();
      
      // Delete related records first (cascade should handle this, but being explicit)
      await client.from("article_group_links").delete().eq("article_id", articleId);
      await client.from("article_tags").delete().eq("article_id", articleId);
      await client.from("article_topics").delete().eq("article_id", articleId);
      await client.from("article_secondary_references").delete().eq("article_id", articleId);
      await client.from("article_content_blocks").delete().eq("article_id", articleId);
      
      // Delete the article
      const { error } = await client.from("articles").delete().eq("id", articleId);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchArticles();
    } catch (error: any) {
      console.error("Error deleting article:", error);
      alert(`Error deleting article: ${error.message}`);
    } finally {
      setDeletingId(null);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or group ID..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "count" | "groupId")}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="groupId">Sort by Group ID</option>
            <option value="count">Sort by Count</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 text-sm"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            <Filter className="h-4 w-4" />
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {groupedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 sm:py-20 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            {searchQuery ? "No articles found" : "No articles yet"}
          </h3>
          <p className="mt-1 text-slate-500">
            {searchQuery ? "Try a different search term" : "Get started by creating your first piece of content."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {groupedArticles.map((group) => (
            <div
              key={group.groupId ?? "null"}
              className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden"
            >
              {/* Group Header (Accordion) */}
              <button
                onClick={() => toggleGroup(group.groupId)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.has(group.groupId) ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Group ID: {group.groupId ?? "No Group"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {group.articles.length} article{group.articles.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </button>

              {/* Group Content */}
              {expandedGroups.has(group.groupId) && (
                <div className="border-t border-slate-100 p-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.articles.map((article) => (
                      <div
                        key={article.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
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

                        <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                          <Link
                            href={`/admin/articles/edit/${article.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group/link"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            disabled={deletingId === article.id}
                            className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === article.id ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
