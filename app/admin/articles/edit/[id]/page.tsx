"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArticleEditor from "../../../../components/ArticleEditor";
import ArticlePreview from "../../../../components/ArticlePreview";
import { getSupabaseClient } from "../../../../lib/supabase/client";

interface Block {
  type: "subheading" | "normalText" | "verse" | "quote";
  text_content: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string; // UUID string

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [languageId, setLanguageId] = useState(1);
  const [imagePath, setImagePath] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(0);
  const [isShort, setIsShort] = useState(false);
  const [source, setSource] = useState("");
  const [primaryReference, setPrimaryReference] = useState("");
  const [secondaryReferences, setSecondaryReferences] = useState<string[]>([]);
  const [hadithReference, setHadithReference] = useState("");
  const [propheticWisdomTerm, setPropheticWisdomTerm] = useState("");
  const [quranTerm, setQuranTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicRelevancyScores, setTopicRelevancyScores] = useState<Record<string, number>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const client = getSupabaseClient();
      // Fetch article
      const { data: article, error: articleError } = await client
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (articleError) throw articleError;

      if (article) {
        setTitle(article.title || "");
        setExcerpt(article.excerpt || "");
        setLanguageId(article.language_id || 1);
        setImagePath(article.image_path || "");
        setReadTimeMinutes(article.read_time_minutes || 0);
        setIsShort(article.is_short || false);
        setSource(article.source || "");
        setPrimaryReference(article.primary_reference || "");
        setHadithReference(article.hadith_reference || "");
        setPropheticWisdomTerm(article.prophetic_wisdom_term || "");
        setQuranTerm(article.quran_term || "");
      }

      // Fetch blocks
      const { data: contentBlocks, error: blocksError } = await client
        .from("article_content_blocks")
        .select("*")
        .eq("article_id", articleId)
        .order("block_order", { ascending: true });

      if (blocksError) throw blocksError;

      if (contentBlocks) {
        const formattedBlocks: Block[] = contentBlocks
          .filter((block) => block.type !== "intro") // Filter out any existing intro blocks
          .map((block) => ({
            type: block.type as "subheading" | "normalText" | "boldText" | "verse" | "quote",
            text_content: block.text_content || "",
          }));
        setBlocks(formattedBlocks);
      }

      // Fetch tags with names
      const { data: articleTags, error: tagsError } = await client
        .from("article_tags")
        .select("tag_id, tags(name)")
        .eq("article_id", articleId);

      if (tagsError) throw tagsError;

      if (articleTags) {
        const tagNames = articleTags
          .map((at: any) => at.tags?.name)
          .filter((name: string) => name);
        setSelectedTags(tagNames);
      }

      // Fetch topics with names
      const { data: articleTopics, error: topicsError } = await client
        .from("article_topics")
        .select("topic_id, relevancy_score, topics(name)")
        .eq("article_id", articleId);

      if (topicsError) throw topicsError;

      if (articleTopics) {
        const topicNames = articleTopics
          .map((at: any) => at.topics?.name)
          .filter((name: string) => name);
        setSelectedTopics(topicNames);
        const scores: Record<string, number> = {};
        articleTopics.forEach((at: any) => {
          if (at.topics?.name) {
            scores[at.topics.name] = at.relevancy_score;
          }
        });
        setTopicRelevancyScores(scores);
      }

      // Fetch group link
      const { data: groupLink, error: groupLinkError } = await client
        .from("article_group_links")
        .select("group_id")
        .eq("article_id", articleId)
        .maybeSingle();

      if (groupLinkError) throw groupLinkError;

      if (groupLink) {
        setSelectedGroupId(groupLink.group_id);
      }

      // Fetch secondary references
      const { data: secondaryRefs, error: secondaryRefsError } = await client
        .from("article_secondary_references")
        .select("reference")
        .eq("article_id", articleId)
        .order("id", { ascending: true });

      if (secondaryRefsError) throw secondaryRefsError;

      if (secondaryRefs) {
        setSecondaryReferences(secondaryRefs.map((sr: any) => sr.reference));
      }
    } catch (error: any) {
      console.error("Error fetching article:", error);
      alert(`Error fetching article: ${error.message}`);
      router.push("/admin/articles");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (articleData: any) => {
    try {
      const client = getSupabaseClient();

      // Update article
      const { error: articleError } = await client
        .from("articles")
        .update({
          title: articleData.title,
          excerpt: articleData.excerpt,
          language_id: articleData.language_id,
          image_path: articleData.image_path,
          read_time_minutes: articleData.read_time_minutes,
          is_short: articleData.is_short,
          relevance: articleData.relevance,
          primary_reference: articleData.primary_reference,
          hadith_reference: articleData.hadith_reference,
          prophetic_wisdom_term: articleData.prophetic_wisdom_term,
          quran_term: articleData.quran_term,
          source: articleData.source,
        })
        .eq("id", articleId);

      if (articleError) throw articleError;

      // Delete existing blocks
      const { error: deleteError } = await client
        .from("article_content_blocks")
        .delete()
        .eq("article_id", articleId);

      if (deleteError) throw deleteError;

      // Insert new blocks
      if (articleData.blocks && articleData.blocks.length > 0) {
        const blocksToInsert = articleData.blocks.map((block: any) => ({
          article_id: articleId,
          type: block.type,
          text_content: block.text_content,
          block_order: block.block_order,
        }));

        const { error: blocksError } = await client
          .from("article_content_blocks")
          .insert(blocksToInsert);

        if (blocksError) throw blocksError;
      }

      // Delete existing tags
      const { error: deleteTagsError } = await client
        .from("article_tags")
        .delete()
        .eq("article_id", articleId);

      if (deleteTagsError) throw deleteTagsError;

      // Insert new tags (find or create by name)
      if (articleData.tags && articleData.tags.length > 0) {
        const tagLinks = [];
        for (const tagName of articleData.tags) {
          // Find existing tag or create new one
          let { data: existingTag } = await client
            .from("tags")
            .select("id")
            .eq("name", tagName.trim())
            .maybeSingle();

          let tagId;
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: createError } = await client
              .from("tags")
              .insert([{ name: tagName.trim() }])
              .select("id")
              .single();
            
            if (createError) throw createError;
            tagId = newTag.id;
          }

          tagLinks.push({
            article_id: articleId,
            tag_id: tagId,
          });
        }

        if (tagLinks.length > 0) {
          const { error: tagsError } = await client
            .from("article_tags")
            .insert(tagLinks);

          if (tagsError) throw tagsError;
        }
      }

      // Delete existing topics
      const { error: deleteTopicsError } = await client
        .from("article_topics")
        .delete()
        .eq("article_id", articleId);

      if (deleteTopicsError) throw deleteTopicsError;

      // Insert new topics (find or create by name)
      if (articleData.topics && articleData.topics.length > 0) {
        const topicLinks = [];
        for (const topic of articleData.topics) {
          const topicName = topic.topic_name || topic;
          const relevancyScore = topic.relevancy_score || 5;

          // Find existing topic or create new one
          let { data: existingTopic } = await client
            .from("topics")
            .select("id")
            .eq("name", topicName.trim())
            .maybeSingle();

          let topicId;
          if (existingTopic) {
            topicId = existingTopic.id;
          } else {
            // Create new topic
            const { data: newTopic, error: createError } = await client
              .from("topics")
              .insert([{ name: topicName.trim() }])
              .select("id")
              .single();
            
            if (createError) throw createError;
            topicId = newTopic.id;
          }

          topicLinks.push({
            article_id: articleId,
            topic_id: topicId,
            relevancy_score: relevancyScore,
          });
        }

        if (topicLinks.length > 0) {
          const { error: topicsError } = await client
            .from("article_topics")
            .insert(topicLinks);

          if (topicsError) throw topicsError;
        }
      }

      // Delete existing group links
      const { error: deleteGroupLinksError } = await client
        .from("article_group_links")
        .delete()
        .eq("article_id", articleId);

      if (deleteGroupLinksError) throw deleteGroupLinksError;

      // Delete existing secondary references
      const { error: deleteSecondaryRefsError } = await client
        .from("article_secondary_references")
        .delete()
        .eq("article_id", articleId);

      if (deleteSecondaryRefsError) throw deleteSecondaryRefsError;

      // Insert new secondary references
      if (articleData.secondary_references && articleData.secondary_references.length > 0) {
        const secondaryRefsToInsert = articleData.secondary_references.map((ref: string) => ({
          article_id: articleId,
          reference: ref,
        }));

        const { error: secondaryRefsError } = await client
          .from("article_secondary_references")
          .insert(secondaryRefsToInsert);

        if (secondaryRefsError) throw secondaryRefsError;
      }

      // Insert new group link (group links were already deleted above)
      if (articleData.group_id) {
        const { error: groupLinkError } = await client
          .from("article_group_links")
          .insert([{
            article_id: articleId,
            group_id: articleData.group_id,
          }]);

        if (groupLinkError) throw groupLinkError;
      }

      // Redirect to articles list
      router.push("/admin/articles");
    } catch (error: any) {
      console.error("Error saving article:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading article...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Article</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Editor */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <ArticleEditor
            title={title}
            excerpt={excerpt}
            blocks={blocks}
            languageId={languageId}
            imagePath={imagePath}
            readTimeMinutes={readTimeMinutes}
            isShort={isShort}
            source={source}
            primaryReference={primaryReference}
            secondaryReference={secondaryReferences.length > 0 ? secondaryReferences[0] : ""}
            hadithReference={hadithReference}
            propheticWisdomTerm={propheticWisdomTerm}
            quranTerm={quranTerm}
            onTitleChange={setTitle}
            onExcerptChange={setExcerpt}
            onBlocksChange={setBlocks}
            onImagePathChange={setImagePath}
            onReadTimeChange={setReadTimeMinutes}
            onIsShortChange={setIsShort}
            onLanguageIdChange={setLanguageId}
            onSourceChange={setSource}
            onPrimaryReferenceChange={setPrimaryReference}
            onSecondaryReferenceChange={setSecondaryReference}
            onHadithReferenceChange={setHadithReference}
            onPropheticWisdomTermChange={setPropheticWisdomTerm}
            onQuranTermChange={setQuranTerm}
            initialTags={selectedTags}
            initialTopics={selectedTopics}
            initialTopicRelevancyScores={topicRelevancyScores}
            initialGroupId={selectedGroupId}
            initialSecondaryReferences={secondaryReferences}
            onSave={handleSave}
            articleId={articleId}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:sticky lg:top-8 lg:h-fit" style={{ zIndex: 0 }}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Live Preview
            </h2>
          </div>
          <ArticlePreview
            title={title || "Article Title"}
            excerpt={excerpt}
            blocks={blocks.filter((b) => b.type !== "intro")} // Filter out any intro blocks
            readTime={readTimeMinutes}
            imagePath={imagePath ? (imagePath.includes('/') ? imagePath.split('/').pop() : imagePath) : undefined}
            isShort={isShort}
          />
        </div>
      </div>
    </div>
  );
}

